from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.config.db import Base
from uuid import uuid4
from datetime import datetime, timedelta

class StudentSubscription(Base):
    __tablename__ = "student_subscriptions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))

    user_id = Column(String, ForeignKey("users.id"))
    group_id = Column(String, ForeignKey("teacher_insights.id"))
    plan_id = Column(String, ForeignKey("subscription_plans.id"))

    amount = Column(Integer, nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    valid_till = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student_subscriptions")
    group = relationship("TeacherInsight", back_populates="student_subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="student_subscriptions")
    