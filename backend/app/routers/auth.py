from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user
)
from app.config import settings
from app.otp_service import (
    generate_otp,
    store_otp,
    verify_otp,
    is_phone_verified,
    clear_otp,
    send_otp_sms
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

@router.get("/otp-config")
def get_otp_config():
    """Get OTP configuration status"""
    return {
        "otp_enabled": settings.ENABLE_OTP_VERIFICATION,
        "otp_length": settings.OTP_LENGTH if settings.ENABLE_OTP_VERIFICATION else None,
        "otp_expiry_minutes": settings.OTP_EXPIRY_MINUTES if settings.ENABLE_OTP_VERIFICATION else None
    }

@router.post("/send-otp")
def send_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """Send OTP to phone number for verification"""
    # Check if phone already exists
    existing_user = db.query(User).filter(User.phone == request.phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Generate and store OTP
    otp = generate_otp()
    store_otp(request.phone, otp)

    # Send OTP via SMS
    success = send_otp_sms(request.phone, otp)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    return {"message": "OTP sent successfully", "phone": request.phone}

@router.post("/verify-otp")
def verify_otp_endpoint(request: VerifyOTPRequest):
    """Verify OTP for phone number"""
    is_valid = verify_otp(request.phone, request.otp)

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return {"message": "Phone number verified successfully", "phone": request.phone}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if phone exists
    db_phone = db.query(User).filter(User.phone == user.phone).first()
    if db_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Check if phone is verified (only if OTP verification is enabled)
    if settings.ENABLE_OTP_VERIFICATION and not is_phone_verified(user.phone):
        raise HTTPException(status_code=400, detail="Phone number not verified. Please verify with OTP first.")

    # Create new user
    new_user = User(
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        role="student"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Clear OTP data after successful registration (if OTP was used)
    if settings.ENABLE_OTP_VERIFICATION:
        clear_otp(user.phone)

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
