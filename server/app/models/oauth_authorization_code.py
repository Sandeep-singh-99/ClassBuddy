from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..config.db import Base
import uuid
from datetime import datetime

class OAuthAuthorizationCode(Base):
    __tablename__ = "oauth_authorization_codes"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    code_hash = Column(String, unique=True, index=True, nullable=False)
    client_id = Column(String, ForeignKey("oauth_clients.client_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    redirect_uri = Column(String, nullable=False)
    scope = Column(String, nullable=False)
    code_challenge = Column(String, nullable=False)
    code_challenge_method = Column(String, default="S256", nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("OAuthClient")
    user = relationship("User")
