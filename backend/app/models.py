from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, DateTime, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STUDENT = "student"
    GUEST = "guest"

class MaterialType(str, enum.Enum):
    FREE = "free"
    PAID = "paid"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class NoticeType(str, enum.Enum):
    INFO = "info"
    ACTIVITY = "activity"
    ANNOUNCEMENT = "announcement"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="user")
    purchases = relationship("Purchase", back_populates="user")

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    material_type = Column(SQLEnum(MaterialType), default=MaterialType.FREE)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer)
    category = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    plan_materials = relationship("PlanMaterial", back_populates="material")

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration_days = Column(Integer, default=30)  # 0 for lifetime
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    plan_materials = relationship("PlanMaterial", back_populates="plan")
    orders = relationship("Order", back_populates="plan")
    purchases = relationship("Purchase", back_populates="plan")

class PlanMaterial(Base):
    __tablename__ = "plan_materials"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"))
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"))

    # Relationships
    plan = relationship("Plan", back_populates="plan_materials")
    material = relationship("Material", back_populates="plan_materials")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    razorpay_order_id = Column(String, unique=True)
    razorpay_payment_id = Column(String)
    razorpay_signature = Column(String)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="orders")
    plan = relationship("Plan", back_populates="orders")
    purchase = relationship("Purchase", back_populates="order", uselist=False)

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="purchases")
    plan = relationship("Plan", back_populates="purchases")
    order = relationship("Order", back_populates="purchase")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notice_type = Column(SQLEnum(NoticeType), default=NoticeType.INFO)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TuitionInfo(Base):
    __tablename__ = "tuition_info"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    info_type = Column(String, default="class_info")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
