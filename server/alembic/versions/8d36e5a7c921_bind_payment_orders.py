"""Bind payment orders and prevent reused payments.

Revision ID: 8d36e5a7c921
Revises: 2a554a765e59
"""
from alembic import op
import sqlalchemy as sa

revision = "8d36e5a7c921"
down_revision = "2a554a765e59"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "payment_orders",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("plan_id", sa.String(), sa.ForeignKey("subscription_plans.id"), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("validity_days", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    with op.batch_alter_table("student_subscriptions") as batch_op:
        batch_op.create_unique_constraint("uq_student_subscriptions_order", ["razorpay_order_id"])
        batch_op.create_unique_constraint("uq_student_subscriptions_payment", ["razorpay_payment_id"])


def downgrade() -> None:
    with op.batch_alter_table("student_subscriptions") as batch_op:
        batch_op.drop_constraint("uq_student_subscriptions_payment", type_="unique")
        batch_op.drop_constraint("uq_student_subscriptions_order", type_="unique")
    op.drop_table("payment_orders")
