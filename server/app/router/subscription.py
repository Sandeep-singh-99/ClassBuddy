from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib, hmac

from app.config.db import get_db
from app.models.subscription import SubscriptionPlan
from app.models.teacherInsight import TeacherInsight
from app.models.student_subscription import StudentSubscription
from app.schemas.subscription import (
    CreatePlanSchema, CreateOrderSchema, VerifyPaymentSchema, PlanOut
)

from app.services.razorpay_services import client
from app.dependencies.dependencies import get_current_user
from app.models.auth import User
from app.config.config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

router = APIRouter()

@router.post("/group/{group_id}/plan")
def create_plan(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), data: CreatePlanSchema = Depends(CreatePlanSchema)):
    plan = SubscriptionPlan(
        group_id=group_id,
        plan_name=data.plan_name,
        amount=data.amount,
        validity_days=data.validity_days,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan
    

@router.post("/create-order")
def create_order(db: Session = Depends(get_db),  current_user: User = Depends(get_current_user), data: CreateOrderSchema = Depends(CreateOrderSchema)):
    plan = db.get(SubscriptionPlan, data.plan_id)
    if not plan:
        raise HTTPException(404, "Plan not found")

    order = client.order.create({
        "amount": plan.amount * 100,
        "currency": "INR",
        "receipt": f"sub_{plan.id}",
    })

    return {"order": order}


@router.post("/verify-payment")
def verify_payment(
    data: VerifyPaymentSchema,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"

    expected_sig = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()

    if expected_sig != data.razorpay_signature:
        raise HTTPException(400, "Invalid payment signature")

    plan = db.get(SubscriptionPlan, data.plan_id)

    valid_till = datetime.utcnow() + timedelta(days=plan.validity_days)

    sub = StudentSubscription(
        user_id=user.id,
        group_id=plan.group_id,
        plan_id=plan.id,
        amount=plan.amount,
        valid_till=valid_till,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id
    )

    db.add(sub)
    db.commit()

    return {"message": "Subscription activated"}