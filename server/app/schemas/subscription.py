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