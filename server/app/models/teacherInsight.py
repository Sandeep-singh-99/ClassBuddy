from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.db import Base
from app.models.auth import group_members
import uuid
from datetime import datetime


class TeacherInsight(Base):
    __tablename__ = "teacher_insights"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    group_name = Column(String, nullable=False)
    group_des = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    image_url_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    owner = relationship("User", back_populates="teacher_sub")
    members = relationship("User", secondary=group_members, back_populates="groups") 

    notes = relationship("Note", back_populates="group", cascade="all, delete-orphan")
    docsuploads = relationship("DocsUpload", back_populates="group", cascade="all, delete-orphan")

    assignments = relationship("Assignment", back_populates="group", cascade="all, delete-orphan")



