from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# ==========================
# User Model
# ==========================

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    reset_otp = Column(String, nullable=True)
    reset_otp_expiry = Column(DateTime, nullable=True)

    reports = relationship("Report", back_populates="owner")


# ==========================
# Report Model
# ==========================

class Report(Base):

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String)
    filepath = Column(String)
    report_type = Column(String)

    extracted_text = Column(Text)      # Original PDF Text
    explanation = Column(Text)         # Gemini Explanation
    language = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="reports")