from sqlalchemy.orm import Session
from app.models.subscription import SubscriptionPlan
from app.models.teacherInsight import TeacherInsight


def get_teacher_plans(db: Session, teacher_id: str):
    return (
        db.query(SubscriptionPlan, TeacherInsight)
        .join(TeacherInsight, SubscriptionPlan.group_id == TeacherInsight.id)
        .filter(TeacherInsight.user_id == teacher_id)
        .order_by(SubscriptionPlan.created_at.desc())
        .all()
    )


def get_plan_owned_by_teacher(db: Session, plan_id: str, teacher_id: str):
    return (
        db.query(SubscriptionPlan)
        .join(TeacherInsight, SubscriptionPlan.group_id == TeacherInsight.id)
        .filter(
            SubscriptionPlan.id == plan_id,
            TeacherInsight.user_id == teacher_id,
        )
        .first()
    )


def delete_plan(db: Session, plan):
    db.delete(plan)
    db.commit()