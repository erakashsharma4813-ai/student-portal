from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Material, Plan, Order, Purchase, OrderStatus
from app.schemas import AdminDashboard, StudentDashboard
from app.auth import get_current_admin_user, get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/admin", response_model=AdminDashboard)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Get statistics
    total_users = db.query(func.count(User.id)).filter(User.role == "student").scalar()
    total_materials = db.query(func.count(Material.id)).filter(Material.is_active == True).scalar()
    total_plans = db.query(func.count(Plan.id)).filter(Plan.is_active == True).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()

    # Calculate total revenue from completed orders
    total_revenue = db.query(func.sum(Order.amount)).filter(
        Order.status == OrderStatus.COMPLETED
    ).scalar() or 0

    # Get recent orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "total_materials": total_materials,
        "total_plans": total_plans,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders
    }

@router.get("/student", response_model=StudentDashboard)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get active purchases
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.is_active == True
    ).all()

    # Load plan materials for each purchase
    for purchase in purchases:
        purchase.plan.materials = [
            pm.material for pm in purchase.plan.plan_materials
            if pm.material.is_active
        ]

    # Get free materials
    free_materials = db.query(Material).filter(
        Material.material_type == "free",
        Material.is_active == True
    ).all()

    return {
        "active_purchases": purchases,
        "free_materials": free_materials
    }
