from sqlalchemy import Column, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.config.db import Base
import uuid
from datetime import datetime
import enum


class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)

    # For Rich Text content
    content = Column(String, nullable=True)

    # For PDF option (Cloudinary URL & public_id)
    pdf_url = Column(String, nullable=True)
    pdf_url_id = Column(String, nullable=True)


    # Relation with User (only teachers can create notes)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="notes")

    # Comments under the note
    comments = relationship("Comment", back_populates="note", cascade="all, delete")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
