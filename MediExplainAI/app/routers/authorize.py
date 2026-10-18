from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from .. import database, models, schema, token
from ..hashing import Hash
from ..utils.current_user import get_current_user


load_dotenv()


mail_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=schema.UserResponse)
def register(
    request: schema.UserCreate,
    db: Session = Depends(database.get_db)
):
    email_clean = request.email.strip().lower()
    name_clean = request.name.strip()

    existing_user = db.query(models.User).filter(
        (models.User.email == email_clean) | (models.User.email == request.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered. Please sign in instead."
        )

    new_user = models.User(
        name=name_clean,
        email=email_clean,
        password=Hash.bcrypt(request.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(
    request: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    username_clean = request.username.strip().lower()
    user = db.query(models.User).filter(
        (models.User.email == username_clean) | (models.User.email == request.username)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid Email"
        )

    if not Hash.verify(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Password"
        )

    access_token = token.create_access_token(
        data={"sub": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/test")
def test(
    current_user: str = Depends(get_current_user)
):
    return {
        "message": "Authentication Successful",
        "user": current_user
    }


# ==========================
# Forgot Password
# ==========================

@router.post("/forgot-password")
async def forgot_password(
    request: schema.ForgotPasswordRequest,
    db: Session = Depends(database.get_db)
):
    email_clean = request.email.strip().lower()
    user = db.query(models.User).filter(
        (models.User.email == email_clean) | (models.User.email == request.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )

    otp = str(random.randint(100000, 999999))

    user.reset_otp = otp
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=5)

    db.commit()

    message = MessageSchema(
        subject="MediExplain AI - Password Reset OTP",
        recipients=[request.email],
        body=f"Your MediExplain AI password reset OTP is: {otp}\n\nThis OTP is valid for 5 minutes.",
        subtype="plain"
    )

    try:
        fm = FastMail(mail_config)
        await fm.send_message(message)
    except Exception as exc:
        print(f"[AUTH WARNING] SMTP delivery failed: {exc}")
        print(f"[AUTH DEV INFO] Reset OTP for {request.email}: {otp}")

    return {
        "message": "OTP sent successfully"
    }


@router.post("/verify-otp")
def verify_otp(
    request: schema.VerifyOTPRequest,
    db: Session = Depends(database.get_db)
):
    email_clean = request.email.strip().lower()
    user = db.query(models.User).filter(
        (models.User.email == email_clean) | (models.User.email == request.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )

    if user.reset_otp != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    if (
        not user.reset_otp_expiry
        or user.reset_otp_expiry < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    return {
        "message": "OTP verified successfully"
    }


@router.post("/reset-password")
def reset_password(
    request: schema.ResetPasswordRequest,
    db: Session = Depends(database.get_db)
):
    email_clean = request.email.strip().lower()
    user = db.query(models.User).filter(
        (models.User.email == email_clean) | (models.User.email == request.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )

    if user.reset_otp != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    if (
        not user.reset_otp_expiry
        or user.reset_otp_expiry < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    user.password = Hash.bcrypt(request.new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None

    db.commit()

    return {
        "message": "Password reset successfully"
    }