from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime, Table, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime


class InterviewPrep(Base):
    __tablename__ = "interviewpreps"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=True)
    description = Column(String, nullable=True)
    questions = Column(JSON, nullable=False)
    score = Column(Integer, nullable=False, default=0)
    user_answers = Column(JSON, nullable=False, default=dict)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="interviewpreps")