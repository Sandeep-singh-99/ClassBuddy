from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
import hashlib, hmac

from app.config.db import get_db
from app.models.subscription import SubscriptionPlan
from app.models.teacherInsight import TeacherInsight
from app.models.student_subscription import StudentSubscription
from app.schemas.subscription import (
    CreatePlanSchema,
    CreateOrderSchema,
    VerifyPaymentSchema,
    PlanOut,
    StudentSubscriptionOut,
)
from app.schemas.plan import TeacherPlanResponse, UpdatePlanSchema
from app.schemas.auth import userRole
from app.services.razorpay_services import client

# Changed import for mobile auth
from app.mobile.router.auth import get_current_user_mobile as get_current_user
from app.models.auth import User
from app.config.config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from app.services.plan import get_teacher_plans, get_plan_owned_by_teacher, delete_plan

router = APIRouter()


@router.post("/plan", status_code=status.HTTP_201_CREATED)
def create_plan(
    data: CreatePlanSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.user_id == current_user.id)
        .first()
    )
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found for this teacher",
        )

    group_id = group.id

    plan_count = (
        db.query(SubscriptionPlan).filter(SubscriptionPlan.group_id == group_id).count()
    )

    if plan_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only 3 subscription plans are allowed per group",
        )

    plan = SubscriptionPlan(
        group_id=group_id,
        plan_name=data.plan_name,
        amount=data.amount,
        validity_days=data.validity_days,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {"message": "Plan created successfully"}


@router.get("/me")
def get_my_created_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can access plans")

    rows = get_teacher_plans(db, current_user.id)

    result = []
    for plan, group in rows:
        result.append(
            TeacherPlanResponse(
                id=plan.id,
                group_id=group.id,
                group_name=group.group_name,
                plan_name=plan.plan_name,
                amount=plan.amount,
                validity_days=plan.validity_days,
                created_at=plan.created_at,
            )
        )

    return result


@router.put("/{plan_id}")
def update_plan(
    plan_id: str,
    data: UpdatePlanSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can update plans")

    plan = get_plan_owned_by_teacher(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or not yours")

    if data.plan_name is not None:
        plan.plan_name = data.plan_name
    if data.amount is not None:
        plan.amount = data.amount
    if data.validity_days is not None:
        plan.validity_days = data.validity_days

    db.commit()
    db.refresh(plan)

    return {"message": "Plan updated successfully"}


@router.delete("/{plan_id}")
def delete_subscription_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can delete plans")

    plan = get_plan_owned_by_teacher(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or not yours")

    if plan.student_subscriptions:
        raise HTTPException(
            status_code=400, detail="Cannot delete plan with active subscriptions"
        )

    delete_plan(db, plan)

    return {"message": "Plan deleted successfully"}


@router.get("/student/plans")
def get_all_plans(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can access plans")

    groups = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.members.any(id=current_user.id))
        .all()
    )

    if not groups:
        return []

    result = []
    for group in groups:
        teacher = db.query(User).filter(User.id == group.user_id).first()
        if not teacher:
            continue

        plans = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.group_id == group.id)
            .all()
        )

        subscription = (
            db.query(StudentSubscription)
            .filter(
                StudentSubscription.group_id == group.id,
                StudentSubscription.user_id == current_user.id,
                StudentSubscription.is_active == True,
            )
            .first()
        )

        result.append(
            {
                "teacher": {
                    "id": teacher.id,
                    "name": teacher.full_name,
                    "email": teacher.email,
                    "image_url": teacher.image_url,
                },
                "group": {
                    "id": group.id,
                    "name": group.group_name,
                    "image_url": group.image_url,
                },
                "plans": plans,
                "subscription": (
                    StudentSubscriptionOut.model_validate(subscription)
                    if subscription
                    else None
                ),
            }
        )

    return result


@router.post("/create-order")
def create_order(
    data: CreateOrderSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.get(SubscriptionPlan, data.plan_id)
    if not plan:
        raise HTTPException(404, "Plan not found")

    order = client.order.create(
        {
            "amount": plan.amount * 100,
            "currency": "INR",
            "receipt": f"sub_{plan.id}",
        }
    )

    return {
        "key": RAZORPAY_KEY_ID,
        "amount": order["amount"],
        "order_id": order["id"],
    }


@router.post("/verify-payment")
def verify_payment(
    data: VerifyPaymentSchema,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"

    expected_sig = hmac.new(
        RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256
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
        razorpay_payment_id=data.razorpay_payment_id,
    )

    db.add(sub)
    db.commit()

    return {"message": "Subscription activated"}


@router.get("/teacher/stats")
def get_teacher_subscription_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=403, detail="Only teachers can access subscription stats"
        )

    # 1. Get Teacher's Group
    group = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.user_id == current_user.id)
        .first()
    )

    if not group:
        return {"total_students": 0, "paid_students": 0, "total_earnings": 0}

    # 2. Total Students
    total_students = len(group.members)

    # 3. Paid Students
    paid_students_count = (
        db.query(StudentSubscription)
        .filter(
            StudentSubscription.group_id == group.id,
            StudentSubscription.is_active == True,
        )
        .count()
    )

    # 4. Total Earnings
    total_earnings_result = (
        db.query(func.sum(StudentSubscription.amount))
        .filter(StudentSubscription.group_id == group.id)
        .scalar()
    )
    total_earnings = total_earnings_result if total_earnings_result else 0

    return {
        "total_students": total_students,
        "paid_students": paid_students_count,
        "total_earnings": total_earnings,
    }
