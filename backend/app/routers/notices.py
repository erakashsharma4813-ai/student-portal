from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Notice
from app.schemas import NoticeCreate, NoticeResponse, NoticeUpdate
from app.auth import get_current_admin_user

router = APIRouter(prefix="/notices", tags=["Notices"])

@router.get("/", response_model=List[NoticeResponse])
def get_public_notices(db: Session = Depends(get_db)):
    return db.query(Notice).filter(Notice.is_active == True).order_by(Notice.created_at.desc()).all()

@router.get("/admin", response_model=List[NoticeResponse])
def get_admin_notices(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()

@router.post("/", response_model=NoticeResponse)
def create_notice(
    notice_data: NoticeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    notice = Notice(**notice_data.model_dump())
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

@router.put("/{notice_id}", response_model=NoticeResponse)
def update_notice(
    notice_id: int,
    notice_data: NoticeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    for field, value in notice_data.model_dump(exclude_unset=True).items():
        setattr(notice, field, value)

    db.commit()
    db.refresh(notice)
    return notice

@router.delete("/{notice_id}")
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully"}
