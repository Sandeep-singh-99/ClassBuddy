from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.config.db import Base
import uuid
from datetime import datetime


class GroupMessage(Base):
    __tablename__ = "group_messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String, ForeignKey("teacher_insights.id"), nullable=False)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)

    message = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("TeacherInsight", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")