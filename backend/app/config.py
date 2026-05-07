from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Admin
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,https://6c1b-2409-40d7-5d-8dcb-24cb-c5f7-db3c-8195.ngrok-free.app"

    # OTP Configuration
    ENABLE_OTP_VERIFICATION: bool = False
    OTP_EXPIRY_MINUTES: int = 10
    OTP_LENGTH: int = 6

    # SMS Provider (MSG91)
    MSG91_AUTH_KEY: str = ""
    MSG91_SENDER_ID: str = ""
    MSG91_TEMPLATE_ID: str = ""
    MSG91_ROUTE: str = "4"

    class Config:
        env_file = ".env"

settings = Settings()
