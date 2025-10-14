from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="assignments")
    questions = relationship("AssignmentQuestion", back_populates="assignment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    group_id = Column(String, ForeignKey("teacher_insights.id"), nullable=False)
    group = relationship("TeacherInsight", back_populates="assignments")



class AssignmentQuestion(Base):
    __tablename__ ="assignment_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(JSON, nullable=False, default=dict)

    assignment = relationship("Assignment", back_populates="questions")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    answers = Column(JSON, nullable=False, default=dict)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    grade = Column(Integer)
    feedback = Column(String)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")