from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, SessionLocal
from app.models import Base, User, UserRole
from app.auth import get_password_hash
from app.routers import auth, materials, plans, orders, dashboard, notices, users, tuition_info

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Portal API", version="1.2.0")

# Configure CORS
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
allow_credentials = True
if len(allowed_origins) == 1 and allowed_origins[0] == "*":
    # Wildcard origin is useful for local development, but CORS credentials
    # cannot be used with a wildcard origin.
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(materials.router)
app.include_router(plans.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
app.include_router(notices.router)
app.include_router(users.router)
app.include_router(tuition_info.router)

@app.get("/")
def read_root():
    return {
        "message": "Student Portal API",
        "version": "1.2.0",
        "payment_method": "manual_approval",
        "docs": "/docs"
    }

@app.on_event("startup")
def startup_event():
    """Create admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                phone="+919999999999",  # Default admin phone
                full_name="Admin User",
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print(f"✅ Admin user already exists: {settings.ADMIN_EMAIL}")
    finally:
        db.close()
