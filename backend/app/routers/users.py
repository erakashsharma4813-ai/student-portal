from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserResponse
from app.auth import get_current_active_user
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

def get_current_admin(current_user: User = Depends(get_current_active_user)):
    """Verify current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all users (admin only)"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@router.post("/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Toggle user active/inactive status (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from deactivating themselves
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    # Prevent deactivating other admins
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot modify admin users")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
