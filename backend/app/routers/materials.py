import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Material, Purchase
from app.schemas import MaterialResponse
from app.auth import get_current_admin_user, get_optional_current_user
from app.config import settings

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.get("/", response_model=List[MaterialResponse])
def get_all_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).filter(Material.is_active == True).all()
    return materials

@router.get("/free", response_model=List[MaterialResponse])
def get_free_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).filter(
        Material.material_type == "free",
        Material.is_active == True
    ).all()
    return materials

@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@router.get("/{material_id}/download")
async def download_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Check if material is free or user has purchased it
    if material.material_type == "paid":
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required for paid materials")
        # Check if user has an active purchase for this material
        has_access = db.query(Purchase).join(Purchase.plan).join(
            Material, Material.id == material_id
        ).filter(
            Purchase.user_id == current_user.id,
            Purchase.is_active == True
        ).first()

        if not has_access and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="You don't have access to this material")

    file_path = material.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=material.file_name,
        media_type='application/octet-stream'
    )

@router.post("/", response_model=MaterialResponse)
async def upload_material(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    material_type: str = Form(...),
    category: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Validate file size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(contents)

    # Create material record
    material = Material(
        title=title,
        description=description,
        material_type=material_type,
        category=category,
        file_path=file_path,
        file_name=file.filename,
        file_size=file_size
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Delete file
    if os.path.exists(material.file_path):
        os.remove(material.file_path)

    # Delete from database
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
