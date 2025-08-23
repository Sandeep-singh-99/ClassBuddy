from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.group import Group
from app.models.auth import User
from app.schemas.group import GroupCreate, GroupResponse
from app.dependencies.role import require_role
import uuid


router = APIRouter()

@router.post("/create-groups", response_model=GroupResponse)
def create_group(group: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("teacher"))):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create groups")

    new_group = Group(**group.dict(), id=str(uuid.uuid4()), created_by=current_user.id)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group