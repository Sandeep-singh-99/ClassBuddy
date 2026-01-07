from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.db import Base
import uuid
from datetime import datetime

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String, ForeignKey("teacher_insights.id"), nullable=False)
    plan_name = Column(String, nullable=False) 
    amount = Column(Integer, nullable=False) 
    validity_days = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.now) 
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now) 

    group = relationship("TeacherInsight", back_populates="plans")

    student_subscriptions = relationship("StudentSubscription", back_populates="plan", cascade="all, delete-orphan")