from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import TuitionInfo
from app.schemas import TuitionInfoCreate, TuitionInfoResponse, TuitionInfoUpdate
from app.auth import get_current_admin_user

router = APIRouter(prefix="/tuition-info", tags=["Tuition Info"])

@router.get("/", response_model=List[TuitionInfoResponse])
def get_public_tuition_info(db: Session = Depends(get_db)):
    return db.query(TuitionInfo).filter(TuitionInfo.is_active == True).order_by(TuitionInfo.created_at.desc()).all()

@router.get("/admin", response_model=List[TuitionInfoResponse])
def get_admin_tuition_info(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    return db.query(TuitionInfo).order_by(TuitionInfo.created_at.desc()).all()

@router.post("/", response_model=TuitionInfoResponse)
def create_tuition_info(
    info_data: TuitionInfoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    info = TuitionInfo(**info_data.model_dump())
    db.add(info)
    db.commit()
    db.refresh(info)
    return info

@router.put("/{info_id}", response_model=TuitionInfoResponse)
def update_tuition_info(
    info_id: int,
    info_data: TuitionInfoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    info = db.query(TuitionInfo).filter(TuitionInfo.id == info_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Tuition info not found")

    for field, value in info_data.model_dump(exclude_unset=True).items():
        setattr(info, field, value)

    db.commit()
    db.refresh(info)
    return info

@router.delete("/{info_id}")
def delete_tuition_info(
    info_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    info = db.query(TuitionInfo).filter(TuitionInfo.id == info_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Tuition info not found")

    db.delete(info)
    db.commit()
    return {"message": "Tuition info deleted successfully"}
