from sqlalchemy import Boolean, Column, Enum, Integer, String, ARRAY, Table, ForeignKey, DateTime
from app.config.db import Base
import uuid
import enum
from datetime import datetime
from sqlalchemy.orm import relationship


group_members = Table(
    "group_members",
    Base.metadata,
    Column("group_id", String, ForeignKey("groups.id", ondelete="CASCADE")),
    Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE")),
)


class  Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    group_name = Column(String, index=True)
    description = Column(String, index=True)
    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    teacher = relationship("User", backref="created_groups", foreign_keys=[created_by])
    members = relationship("User", secondary=group_members, backref="joined_groups")