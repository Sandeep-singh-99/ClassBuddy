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
    group = db.query(TeacherInsight).filter(TeacherInsight.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    