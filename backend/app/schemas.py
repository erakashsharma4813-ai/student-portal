from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str

class UserCreate(UserBase):
    password: str

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        # Remove spaces and dashes
        phone = v.replace(' ', '').replace('-', '')

        # Indian mobile: 10 digits starting with 6-9
        indian_pattern = r'^[6-9]\d{9}$'
        # Indian with country code: +91 followed by 10 digits
        indian_intl_pattern = r'^\+91[6-9]\d{9}$'
        # International: country code + number (10-15 digits total)
        intl_pattern = r'^\+\d{10,15}$'

        if not (re.match(indian_pattern, phone) or
                re.match(indian_intl_pattern, phone) or
                re.match(intl_pattern, phone)):
            raise ValueError(
                'Phone number must be a valid Indian mobile (10 digits starting with 6-9) '
                'or international format (e.g., +919876543210 or +1234567890)'
            )
        return phone

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Material Schemas
class MaterialBase(BaseModel):
    title: str
    description: Optional[str] = None
    material_type: str
    category: Optional[str] = None

class MaterialCreate(MaterialBase):
    pass

class MaterialResponse(MaterialBase):
    id: int
    file_name: str
    file_size: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Notice Schemas
class NoticeBase(BaseModel):
    title: str
    message: str
    notice_type: str = "info"
    is_active: bool = True

class NoticeCreate(NoticeBase):
    pass

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    notice_type: Optional[str] = None
    is_active: Optional[bool] = None

class NoticeResponse(NoticeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Tuition Info Schemas
class TuitionInfoBase(BaseModel):
    title: str
    description: str
    info_type: str = "class_info"
    is_active: bool = True

class TuitionInfoCreate(TuitionInfoBase):
    pass

class TuitionInfoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    info_type: Optional[str] = None
    is_active: Optional[bool] = None

class TuitionInfoResponse(TuitionInfoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Plan Schemas
class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_days: int = 30

class PlanCreate(PlanBase):
    material_ids: List[int] = []

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    material_ids: Optional[List[int]] = None

class PlanResponse(PlanBase):
    id: int
    is_active: bool
    created_at: datetime
    materials: List[MaterialResponse] = []

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    plan_id: int

class OrderResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    amount: float
    currency: str
    razorpay_order_id: str
    status: str
    created_at: datetime
    user: Optional['UserResponse'] = None

    class Config:
        from_attributes = True

# Purchase Schemas
class PurchaseResponse(BaseModel):
    id: int
    plan: PlanResponse
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class AdminDashboard(BaseModel):
    total_users: int
    total_materials: int
    total_plans: int
    total_orders: int
    total_revenue: float
    recent_orders: List[OrderResponse]

class StudentDashboard(BaseModel):
    active_purchases: List[PurchaseResponse]
    free_materials: List[MaterialResponse]
