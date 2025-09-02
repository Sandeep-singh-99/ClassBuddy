from sqlalchemy import Boolean, Column, Enum, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime

class userRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    image_url = Column(String, nullable=True)
    image_url_id = Column(String, nullable=True)
    role = Column(Enum(userRole), default=userRole.STUDENT, nullable=False)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)