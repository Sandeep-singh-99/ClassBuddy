"""Add PDF indexes and page-aware document chunks.

Revision ID: b4e2c9a1037f
Revises: 8d36e5a7c921
"""
from alembic import op
import sqlalchemy as sa

revision = "b4e2c9a1037f"
down_revision = "8d36e5a7c921"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "document_indexes",
        sa.Column("document_id", sa.String(), sa.ForeignKey("docsuploads.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("error", sa.String(), nullable=True),
        sa.Column("page_count", sa.Integer(), nullable=False),
        sa.Column("source_pdf", sa.LargeBinary(), nullable=True),
    )
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("document_id", sa.String(), sa.ForeignKey("document_indexes.document_id", ondelete="CASCADE"), nullable=False),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
    )
    op.create_index("ix_document_chunks_document_id", "document_chunks", ["document_id"])


def downgrade() -> None:
    op.drop_index("ix_document_chunks_document_id", table_name="document_chunks")
    op.drop_table("document_chunks")
    op.drop_table("document_indexes")
