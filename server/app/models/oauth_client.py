from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
import enum
from datetime import datetime

class ClientType(str, enum.Enum):
    CONFIDENTIAL = "confidential"
    PUBLIC = "public"

class OAuthClient(Base):
    __tablename__ = "oauth_clients"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, unique=True, index=True, nullable=False)
    client_name = Column(String, nullable=False)
    client_type = Column(SQLEnum(ClientType), default=ClientType.PUBLIC, nullable=False)
    client_secret_hash = Column(String, nullable=True)
    redirect_uris = Column(String, nullable=False)  # Stored as JSON or comma/newline separated string
    allowed_scopes = Column(String, default="openid profile email", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
