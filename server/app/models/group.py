from sqlalchemy import Column, String, DateTime
from app.config.db import Base
from sqlalchemy.orm import relationship
import uuid

class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    group_name = Column(String, index=True)
    group_description = Column(String, index=True)
    owner_id = Column(String, index=True, relationship="User", back_populates="groups")
    members = relationship("User", secondary="group_members", back_populates="groups")