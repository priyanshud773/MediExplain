from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import authorize, report, chat

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediExplain AI",
    description="AI Powered Medical Report Explanation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authorize.router)
app.include_router(report.router)
app.include_router(chat.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to MediExplain AI"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "online",
        "service": "MediExplain AI API",
        "version": "1.0.0"
    }