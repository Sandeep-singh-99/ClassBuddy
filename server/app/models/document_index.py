from sqlalchemy import Column, ForeignKey, Integer, LargeBinary, String, Text
from sqlalchemy.orm import deferred, relationship

from app.config.db import Base


class DocumentIndex(Base):
    __tablename__ = "document_indexes"

    document_id = Column(String, ForeignKey("docsuploads.id", ondelete="CASCADE"), primary_key=True)
    status = Column(String, nullable=False, default="pending")
    error = Column(String, nullable=True)
    page_count = Column(Integer, nullable=False, default=0)
    source_pdf = deferred(Column(LargeBinary, nullable=True))

    document = relationship("DocsUpload", back_populates="qa_index")
    chunks = relationship("DocumentChunk", cascade="all, delete-orphan", back_populates="index")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String, ForeignKey("document_indexes.document_id", ondelete="CASCADE"), nullable=False, index=True)
    page = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)

    index = relationship("DocumentIndex", back_populates="chunks")
