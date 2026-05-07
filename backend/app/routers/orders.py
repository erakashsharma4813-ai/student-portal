from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Order, Plan, Purchase, OrderStatus
from app.schemas import OrderCreate, OrderResponse, PurchaseResponse
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/create", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get plan
    plan = db.query(Plan).filter(Plan.id == order_data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Check if user already has a pending order for this plan
    existing_order = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.plan_id == plan.id,
        Order.status == OrderStatus.PENDING
    ).first()

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending order for this plan. Please wait for admin approval."
        )

    # Create order with manual ID
    manual_order_id = f"MANUAL_{current_user.id}_{plan.id}_{int(datetime.utcnow().timestamp())}"

    order = Order(
        user_id=current_user.id,
        plan_id=plan.id,
        amount=plan.price,
        currency="INR",
        razorpay_order_id=manual_order_id,
        status=OrderStatus.PENDING
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order

@router.post("/{order_id}/approve", response_model=OrderResponse)
def approve_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Order is not pending")

    # Update order status
    order.status = OrderStatus.COMPLETED
    order.razorpay_payment_id = f"MANUAL_PAYMENT_{order_id}_{int(datetime.utcnow().timestamp())}"

    # Create purchase
    plan = db.query(Plan).filter(Plan.id == order.plan_id).first()
    expires_at = None
    if plan.duration_days > 0:
        expires_at = datetime.utcnow() + timedelta(days=plan.duration_days)

    purchase = Purchase(
        user_id=order.user_id,
        plan_id=order.plan_id,
        order_id=order.id,
        expires_at=expires_at,
        is_active=True
    )

    db.add(purchase)
    db.commit()
    db.refresh(order)

    return order

@router.post("/{order_id}/reject", response_model=OrderResponse)
def reject_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Order is not pending")

    # Update order status
    order.status = OrderStatus.FAILED

    db.commit()
    db.refresh(order)

    return order

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders

@router.get("/my-purchases", response_model=List[PurchaseResponse])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.is_active == True
    ).all()

    # Load plan materials
    for purchase in purchases:
        purchase.plan.materials = [
            pm.material for pm in purchase.plan.plan_materials
            if pm.material.is_active
        ]

    return purchases

@router.get("/pending", response_model=List[OrderResponse])
def get_pending_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).order_by(Order.created_at.desc()).all()

    # Load user information for each order
    for order in orders:
        order.user = db.query(User).filter(User.id == order.user_id).first()

    return orders

@router.get("/", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    orders = db.query(Order).all()
    return orders
