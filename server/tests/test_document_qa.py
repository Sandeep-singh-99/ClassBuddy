from datetime import datetime, timedelta
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import HTTPException, Request, UploadFile
from pydantic import ValidationError
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
from sqlalchemy.orm import sessionmaker

from app.api.v1.endpoints.document_qa import ask_question, list_classrooms, list_documents, retry_index
from app.api.v1.endpoints.docsupload import upload_doc
from app.models import DocsUpload, DocumentChunk, DocumentIndex, StudentSubscription, SubscriptionPlan, TeacherInsight
from app.schemas.document_qa import AnswerOut, QuestionRequest
from app.services.document_qa import MAX_PDF_BYTES, extract_chunks, generate_answer, index_document, require_classroom, retrieve_chunks


def pdf_bytes(texts):
    writer = PdfWriter()
    for text in texts:
        page = writer.add_blank_page(width=612, height=792)
        font = DictionaryObject({NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type1"), NameObject("/BaseFont"): NameObject("/Helvetica")})
        page[NameObject("/Resources")] = DictionaryObject({NameObject("/Font"): DictionaryObject({NameObject("/F1"): font})})
        stream = DecodedStreamObject()
        stream.set_data(f"BT /F1 12 Tf 40 700 Td ({text}) Tj ET".encode())
        page[NameObject("/Contents")] = writer._add_object(stream)
    output = BytesIO()
    writer.write(output)
    return output.getvalue()


@pytest.fixture
def classroom(db_session, teacher_user, student_user):
    group = TeacherInsight(user_id=teacher_user.id, group_name="Databases", group_des="Course", members=[student_user])
    db_session.add(group)
    db_session.flush()
    plan = SubscriptionPlan(group_id=group.id, plan_name="Course", amount=10, validity_days=30)
    db_session.add(plan)
    db_session.flush()
    db_session.add(StudentSubscription(user_id=student_user.id, group_id=group.id, plan_id=plan.id, amount=10, valid_till=datetime.utcnow() + timedelta(days=30)))
    doc = DocsUpload(filename="Database notes", file_url="https://example.com/notes.pdf", owner_id=teacher_user.id, group_id=group.id)
    doc.qa_index = DocumentIndex(source_pdf=pdf_bytes(["Transactions ensure atomicity.", "Indexes speed up database queries."]))
    db_session.add(doc)
    db_session.commit()
    return group, doc


def test_pdf_extraction_preserves_pages_and_rejects_non_text():
    pages, chunks = extract_chunks(pdf_bytes(["Transactions ensure atomicity.", "Indexes speed up queries."]))
    assert pages == 2
    assert chunks == [(1, "Transactions ensure atomicity."), (2, "Indexes speed up queries.")]
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    empty = BytesIO()
    writer.write(empty)
    with pytest.raises(ValueError, match="No selectable text"):
        extract_chunks(empty.getvalue())
    with pytest.raises(ValueError, match="valid PDF"):
        extract_chunks(b"fake PDF")


def test_pdf_limits_and_encryption_are_rejected():
    with pytest.raises(ValueError, match="10 MB"):
        extract_chunks(b"%PDF-" + b" " * MAX_PDF_BYTES)
    writer = PdfWriter()
    for _ in range(101):
        writer.add_blank_page(width=100, height=100)
    large = BytesIO()
    writer.write(large)
    with pytest.raises(ValueError, match="100 pages"):
        extract_chunks(large.getvalue())
    writer.encrypt("test-password")
    encrypted = BytesIO()
    writer.write(encrypted)
    with pytest.raises(ValueError, match="Password-protected"):
        extract_chunks(encrypted.getvalue())


def test_indexing_is_idempotent_and_clears_staged_pdf(db_session, classroom):
    group, doc = classroom
    with patch("app.services.document_qa.SessionLocal", sessionmaker(bind=db_session.get_bind())):
        assert index_document(doc.id) == {"status": "ready"}
        assert index_document(doc.id) == {"status": "skipped"}
    db_session.expire_all()
    assert doc.qa_index.source_pdf is None
    assert doc.qa_index.page_count == 2
    assert db_session.query(DocumentChunk).count() == 2
    results = retrieve_chunks(db_session, group.id, "How do indexes speed queries?")
    assert results[0]["page"] == 2
    assert retrieve_chunks(db_session, "another-group", "indexes") == []
    fallback = retrieve_chunks(db_session, group.id, "volcanoes")
    assert len(fallback) == 1
    assert fallback[0]["page"] == 1


@pytest.mark.asyncio
async def test_resume_identity_question_uses_header_without_keyword(db_session, classroom):
    group, doc = classroom
    doc.qa_index.status = "ready"
    doc.qa_index.chunks = [
        DocumentChunk(page=1, text="Alex Morgan Software Engineer alex@example.com"),
        DocumentChunk(page=2, text="Projects: Python, FastAPI, PostgreSQL."),
    ]
    db_session.commit()
    chunks = retrieve_chunks(db_session, group.id, "what is the name")
    assert len(chunks) == 1
    assert chunks[0]["page"] == 1
    assert "Alex Morgan" in chunks[0]["text"]
    model = Mock()
    model.with_structured_output.return_value.ainvoke = AsyncMock(return_value={
        "found": True, "answer": "The person's name is Alex Morgan.",
        "evidence": [{"chunk_id": chunks[0]["id"], "quote": "Alex Morgan"}],
    })
    with patch("app.services.document_qa.ChatGoogleGenerativeAI", return_value=model):
        answer = await generate_answer("what is the name", chunks)
    assert answer.found is True
    assert answer.citations[0].document_id == doc.id
    assert answer.citations[0].page == 1
    model.with_structured_output.return_value.ainvoke.return_value = {
        "found": False, "answer": "", "evidence": [],
    }
    with patch("app.services.document_qa.ChatGoogleGenerativeAI", return_value=model):
        unsupported = await generate_answer("What causes volcanoes?", chunks)
    assert unsupported.found is False
    assert unsupported.citations == []


def test_fallback_is_bounded_and_excludes_unready_and_other_classrooms(db_session, classroom, teacher_user):
    group, _ = classroom
    for index in range(8):
        doc = DocsUpload(filename=f"Resume {index}", file_url="https://example.com/resume.pdf", owner_id=teacher_user.id, group_id=group.id)
        doc.qa_index = DocumentIndex(status="ready", page_count=2, chunks=[
            DocumentChunk(page=1, text="Alex Morgan Software Engineer"),
            DocumentChunk(page=2, text="Python projects"),
        ])
        db_session.add(doc)
    db_session.commit()
    chunks = retrieve_chunks(db_session, group.id, "what is the name")
    assert len(chunks) == 6
    assert len({chunk["document_id"] for chunk in chunks}) == 6
    assert all(chunk["page"] == 1 for chunk in chunks)
    assert retrieve_chunks(db_session, "other-classroom", "what is the name") == []


def test_index_failure_can_be_retried_and_deletion_removes_chunks(db_session, teacher_user, classroom):
    _, doc = classroom
    doc.qa_index.source_pdf = b"invalid"
    db_session.commit()
    with patch("app.services.document_qa.SessionLocal", sessionmaker(bind=db_session.get_bind())):
        assert index_document(doc.id) == {"status": "error"}
    db_session.expire_all()
    assert doc.qa_index.status == "error"
    with patch("app.services.document_qa.inngest_client.send_sync", side_effect=RuntimeError("offline")):
        result = retry_index.__wrapped__(Request({"type": "http"}), doc.id, db_session, teacher_user)
    assert result.status == "error"
    assert "queued" in result.error
    doc.qa_index.chunks = [DocumentChunk(page=1, text="Old text")]
    db_session.commit()
    db_session.delete(doc)
    db_session.commit()
    assert db_session.query(DocumentChunk).count() == 0
    assert db_session.query(DocumentIndex).count() == 0


def test_classroom_access_requires_membership_and_its_own_subscription(db_session, student_user, teacher_user, classroom):
    group, doc = classroom
    assert require_classroom(db_session, group.id, teacher_user, True).id == group.id
    assert require_classroom(db_session, group.id, student_user, True).id == group.id
    other = TeacherInsight(user_id=teacher_user.id, group_name="Other", group_des="Other")
    db_session.add(other)
    db_session.commit()
    with pytest.raises(HTTPException) as error:
        require_classroom(db_session, other.id, student_user, True)
    assert error.value.status_code == 403
    other.members.append(student_user)
    db_session.commit()
    with pytest.raises(HTTPException) as error:
        require_classroom(db_session, other.id, student_user, True)
    assert error.value.status_code == 403
    db_session.query(StudentSubscription).update({"is_active": False})
    db_session.commit()
    with pytest.raises(HTTPException, match="403"):
        require_classroom(db_session, group.id, student_user, True)
    assert list_classrooms(db_session, student_user)[0].can_ask is False
    with pytest.raises(HTTPException) as error:
        list_documents(group.id, db_session, student_user)
    assert error.value.status_code == 403
    assert list_documents(group.id, db_session, teacher_user)[0].title == doc.filename


@pytest.mark.asyncio
@pytest.mark.parametrize("evidence, found", [
    ([{"chunk_id": 7, "quote": "ensure atomicity"}], True),
    ([{"chunk_id": 99, "quote": "ensure atomicity"}], False),
    ([{"chunk_id": 7, "quote": "Invented quote"}], False),
    ([], False),
])
async def test_answers_require_verifiable_page_citations(evidence, found):
    chunks = [dict(id=7, document_id="doc", title="Course", page=2, text="Transactions ensure atomicity.")]
    model = Mock()
    model.with_structured_output.return_value.ainvoke = AsyncMock(return_value={"found": True, "answer": "Transactions are atomic.", "evidence": evidence})
    with patch("app.services.document_qa.ChatGoogleGenerativeAI", return_value=model):
        result = await generate_answer("What are transactions?", chunks)
    assert result.found is found
    if found:
        assert result.citations[0].page == 2
        assert result.citations[0].document_id == "doc"
    else:
        assert result.citations == []


@pytest.mark.asyncio
async def test_no_evidence_avoids_llm_and_question_is_validated():
    with patch("app.services.document_qa.ChatGoogleGenerativeAI") as model:
        result = await generate_answer("Unknown topic", [])
    assert result.found is False
    model.assert_not_called()
    with pytest.raises(ValidationError):
        QuestionRequest(question="   ")


@pytest.mark.asyncio
async def test_question_route_rejects_unpaid_requests_before_model(db_session, student_user, classroom):
    group, _ = classroom
    db_session.query(StudentSubscription).update({"is_active": False})
    db_session.commit()
    with patch("app.api.v1.endpoints.document_qa.generate_answer", new_callable=AsyncMock) as generate:
        with pytest.raises(HTTPException) as error:
            await ask_question.__wrapped__(Request({"type": "http"}), group.id, QuestionRequest(question="What are indexes?"), db_session, student_user)
    assert error.value.status_code == 403
    generate.assert_not_called()


@pytest.mark.asyncio
async def test_question_route_releases_database_before_llm(db_session, student_user, classroom):
    group, _ = classroom
    group_id = group.id

    async def answer(question, chunks):
        assert not db_session.in_transaction()
        return AnswerOut(answer="No evidence", found=False, citations=[])

    with patch("app.api.v1.endpoints.document_qa.generate_answer", side_effect=answer):
        result = await ask_question.__wrapped__(Request({"type": "http"}), group_id, QuestionRequest(question="What are indexes?"), db_session, student_user)
    assert result.found is False


@pytest.mark.asyncio
async def test_provider_errors_are_safe_to_return(db_session, student_user, classroom):
    group, _ = classroom
    with patch("app.api.v1.endpoints.document_qa.generate_answer", side_effect=RuntimeError("private provider details")):
        with pytest.raises(HTTPException) as error:
            await ask_question.__wrapped__(Request({"type": "http"}), group.id, QuestionRequest(question="What are indexes?"), db_session, student_user)
    assert error.value.status_code == 503
    assert "private" not in error.value.detail


def test_pdf_upload_persists_source_and_queues_only_metadata(db_session, teacher_user, classroom):
    source = pdf_bytes(["Indexes speed up queries."])
    file = UploadFile(filename="lecture.pdf", file=BytesIO(source))
    with (
        patch("app.api.v1.endpoints.docsupload.upload_image", return_value={"url": "https://example.com/lecture.pdf", "public_id": "lecture"}),
        patch("app.services.document_qa.inngest_client.send_sync") as send,
    ):
        doc = upload_doc.__wrapped__(Request({"type": "http"}), "Lecture", file, db_session, teacher_user)
    assert doc.qa_index.status == "pending"
    assert doc.qa_index.source_pdf == source
    assert send.call_args.args[0].data == {"document_id": doc.id}
