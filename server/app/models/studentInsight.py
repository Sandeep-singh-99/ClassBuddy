from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float, Integer
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime


class StudentInsight(Base):
    __tablename__ = "student_insights"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    industry = Column(String, nullable=False)
    salary_range = Column(JSON, nullable=False)
    growth_rate = Column(Float, nullable=False)
    demand_level = Column(String, nullable=False)
    top_skills = Column(JSON, nullable=False)
    market_outlook = Column(String, nullable=False)
    key_trends = Column(JSON, nullable=False)
    recommend_skills = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="student_sub")