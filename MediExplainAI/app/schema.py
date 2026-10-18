from pydantic import BaseModel, EmailStr


# ==========================
# User
# ==========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# ==========================
# Login
# ==========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ==========================
# Reports
# ==========================

class ReportResponse(BaseModel):
    id: int
    filename: str
    report_type: str
    language: str
    explanation: str | None

    class Config:
        from_attributes = True


class ReportSearchResponse(BaseModel):
    id: int
    filename: str
    report_type: str
    language: str

    class Config:
        from_attributes = True


# ==========================
# Dashboard
# ==========================

class DashboardResponse(BaseModel):
    total_reports: int
    latest_report: str | None
    recent_reports: list[ReportSearchResponse]

    class Config:
        from_attributes = True


# ==========================
# AI Chat
# ==========================

class ChatRequest(BaseModel):
    report_id: int
    question: str


class ChatResponse(BaseModel):
    answer: str
    

# ==========================
# Forgot Password
# ==========================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str    