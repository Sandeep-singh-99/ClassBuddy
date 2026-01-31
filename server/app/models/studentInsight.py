from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime


class StudentInsight(Base):
    __tablename__ = "student_insights"

    # This ensures a user can only have one row per industry
    __table_args__ = (
        UniqueConstraint('user_id', 'industry', name='_user_industry_uc'),
    )

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