from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
from datetime import datetime

class OAuthRefreshToken(Base):
    __tablename__ = "oauth_refresh_tokens"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    token_hash = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    client_id = Column(String, ForeignKey("oauth_clients.client_id"), nullable=False)
    scope = Column(String, nullable=False)
    family_id = Column(String, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    replaced_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("OAuthClient")
    user = relationship("User")
