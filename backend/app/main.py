## Run using uvicorn backend.app.main:app --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from .database import engine
from . import models
from .routers import upload, dashboard, email, ml_analysis, chatbot


# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BPAi Loan Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(email.router)
app.include_router(ml_analysis.router)
app.include_router(chatbot.router)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "BPAi Loan Dashboard API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
