from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime


class DocsUpload(Base):
    __tablename__ = "docsuploads"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, index=True, nullable=False)
    file_url = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_url_id = Column(String, nullable=True)
    group_id = Column(String, ForeignKey("teacher_insights.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="docsuploads")
    group = relationship("TeacherInsight", back_populates="docsuploads")