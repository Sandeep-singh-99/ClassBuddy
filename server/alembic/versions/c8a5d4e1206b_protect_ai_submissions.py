"""Protect single submissions and assignment question generation.

Revision ID: c8a5d4e1206b
Revises: b4e2c9a1037f
"""
from alembic import op
import sqlalchemy as sa

revision = "c8a5d4e1206b"
down_revision = "b4e2c9a1037f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("interviewpreps", sa.Column("submitted_at", sa.DateTime(), nullable=True))
    with op.batch_alter_table("submissions") as batch:
        batch.add_column(sa.Column("status", sa.String(), nullable=False, server_default="completed"))
        batch.create_unique_constraint("uq_submissions_student_assignment", ["student_id", "assignment_id"])
    with op.batch_alter_table("assignment_questions") as batch:
        batch.create_unique_constraint("uq_assignment_questions_assignment", ["assignment_id"])


def downgrade() -> None:
    op.drop_column("interviewpreps", "submitted_at")
    with op.batch_alter_table("assignment_questions") as batch:
        batch.drop_constraint("uq_assignment_questions_assignment", type_="unique")
    with op.batch_alter_table("submissions") as batch:
        batch.drop_constraint("uq_submissions_student_assignment", type_="unique")
        batch.drop_column("status")
