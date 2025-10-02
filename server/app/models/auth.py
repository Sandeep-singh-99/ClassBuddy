from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime

class userRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"

group_members = Table(
    "group_members",
    Base.metadata,
    Column("group_id", String, ForeignKey("teacher_insights.id"), primary_key=True),
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    image_url = Column(String, nullable=True)
    image_url_id = Column(String, nullable=True)
    role = Column(Enum(userRole), default=userRole.STUDENT, nullable=False)
    hashed_password = Column(String)
    industry = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher_sub = relationship("TeacherInsight", back_populates="owner")
    groups = relationship("TeacherInsight", secondary=group_members, back_populates="members")
    notes = relationship("Note", back_populates="owner")

    interviewpreps = relationship("InterviewPrep", back_populates="owner")

    docsuploads = relationship("DocsUpload", back_populates="owner")

    # student_sub = relationship("StudentInsight", back_populates="owner")


