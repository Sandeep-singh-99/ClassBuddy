from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from fastapi.responses import StreamingResponse
import os
import shutil
import tempfile
from dotenv import load_dotenv
from app.models.auth import User
from app.mobile.router.auth import get_current_user_mobile as get_current_user
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, AsyncGenerator

router = APIRouter()
load_dotenv()


class GraphState(TypedDict):
    question: str
    context: List[str]
    answer: str


def create_graph(db: Chroma):
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash", model_kwargs={"streaming": True}
    )

    def retrieve(state: GraphState):
        docs = retriever.invoke(state["question"])
        return {"context": [doc.page_content for doc in docs]}

    def generate(state: GraphState):
        context = "\n".join(state["context"])
        prompt = f"Answer the question based on the context.\n\nContext:\n{context}\n\nQuestion: {state['question']}"
        response = llm.stream(prompt)
        return {"answer": response}

    workflow = StateGraph(GraphState)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("generate", generate)
    workflow.set_entry_point("retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", END)
    return workflow.compile()


@router.post("/chat-with-pdf")
async def chat_with_pdf(
    file: UploadFile = File(...),
    userPrompt: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        persistent_directory = os.path.join(current_dir, "db", "chroma_db")
        os.makedirs(persistent_directory, exist_ok=True)

        loader = PyMuPDFLoader(temp_file_path)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1024, chunk_overlap=20
        )
        docs = text_splitter.split_documents(documents)

        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        db = Chroma.from_documents(
            docs, embeddings, persist_directory=persistent_directory
        )
        app = create_graph(db)
    except Exception as e:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        raise HTTPException(
            status_code=500, detail=f"Document processing error: {str(e)}"
        )

    async def event_stream() -> AsyncGenerator[str, None]:
        state = {"question": userPrompt, "context": [], "answer": ""}
        try:
            async for output in app.astream(state):
                if "generate" in output:
                    # output["generate"]["answer"] is a sync generator, not async
                    for chunk in output["generate"]["answer"]:
                        yield chunk
        finally:
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

    return StreamingResponse(event_stream(), media_type="text/plain")
