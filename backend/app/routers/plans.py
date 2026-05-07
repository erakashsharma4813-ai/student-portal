from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Plan, PlanMaterial, Material
from app.schemas import PlanCreate, PlanUpdate, PlanResponse
from app.auth import get_current_admin_user

router = APIRouter(prefix="/plans", tags=["Plans"])

@router.get("/", response_model=List[PlanResponse])
def get_all_plans(db: Session = Depends(get_db)):
    plans = db.query(Plan).filter(Plan.is_active == True).all()

    # Manually load materials for each plan
    for plan in plans:
        plan.materials = [
            pm.material for pm in plan.plan_materials
            if pm.material.is_active
        ]

    return plans

@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Manually load materials
    plan.materials = [
        pm.material for pm in plan.plan_materials
        if pm.material.is_active
    ]

    return plan

@router.post("/", response_model=PlanResponse)
def create_plan(
    plan: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Create plan
    new_plan = Plan(
        name=plan.name,
        description=plan.description,
        price=plan.price,
        duration_days=plan.duration_days
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    # Add materials to plan
    for material_id in plan.material_ids:
        material = db.query(Material).filter(Material.id == material_id).first()
        if material:
            plan_material = PlanMaterial(plan_id=new_plan.id, material_id=material_id)
            db.add(plan_material)

    db.commit()
    db.refresh(new_plan)

    # Load materials
    new_plan.materials = [
        pm.material for pm in new_plan.plan_materials
        if pm.material.is_active
    ]

    return new_plan

@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Update basic fields
    if plan_update.name is not None:
        plan.name = plan_update.name
    if plan_update.description is not None:
        plan.description = plan_update.description
    if plan_update.price is not None:
        plan.price = plan_update.price
    if plan_update.duration_days is not None:
        plan.duration_days = plan_update.duration_days

    # Update materials if provided
    if plan_update.material_ids is not None:
        # Remove existing materials
        db.query(PlanMaterial).filter(PlanMaterial.plan_id == plan_id).delete()

        # Add new materials
        for material_id in plan_update.material_ids:
            material = db.query(Material).filter(Material.id == material_id).first()
            if material:
                plan_material = PlanMaterial(plan_id=plan_id, material_id=material_id)
                db.add(plan_material)

    db.commit()
    db.refresh(plan)

    # Load materials
    plan.materials = [
        pm.material for pm in plan.plan_materials
        if pm.material.is_active
    ]

    return plan

@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully"}
