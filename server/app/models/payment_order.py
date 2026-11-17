from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.config.db import Base


class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    plan_id = Column(String, ForeignKey("subscription_plans.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # INR paise, as sent to Razorpay.
    validity_days = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
