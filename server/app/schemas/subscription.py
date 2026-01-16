from pydantic import BaseModel
from datetime import datetime


class CreatePlanSchema(BaseModel):
    plan_name: str
    amount: int
    validity_days: int


class PlanOut(BaseModel):
    id: str
    plan_name: str
    amount: int
    validity_days: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreateOrderSchema(BaseModel):
    plan_id: str


class VerifyPaymentSchema(BaseModel):
    plan_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class StudentSubscriptionOut(BaseModel):
    id: str
    user_id: str
    group_id: str
    plan_id: str
    amount: int
    start_date: datetime
    valid_till: datetime
    is_active: bool
    razorpay_order_id: str | None
    razorpay_payment_id: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
