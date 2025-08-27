from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.config.db import Base
import uuid
from datetime import datetime


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    content = Column(String, nullable=False)

    # Relation with User
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="comments")

    # Optional: relation with Note (if comments are on notes)
    note_id = Column(String, ForeignKey("notes.id"), nullable=True)
    note = relationship("Note", back_populates="comments")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
