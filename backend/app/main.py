# backend/app/main.py
# ## Run using uvicorn backend.app.main:app --reload

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from typing import List
from io import StringIO
import os
from .database import engine
from . import models
from .routers import upload, dashboard, email, ml_analysis, chatbot
from .models import Application
import numpy as np

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

@app.post("/parse-csv/", response_model=List[Application])
async def parse_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(StringIO(contents.decode("utf-8")))

    # Replace NaN with None
    df = df.replace({np.nan: None})

    # Convert contact_number and other numeric-but-string fields to str
    df["contact_number"] = df["contact_number"].astype(str)
    df["middle_name"] = df["middle_name"].astype(str)
    df["postpaid_plan_history"] = df["postpaid_plan_history"].astype(str)
    df["data_usage_patterns"] = df["data_usage_patterns"].astype(str)

    applications = []
    for row in df.to_dict(orient="records"):
        try:
            app_data = Application(**row)
            applications.append(app_data)
        except Exception as e:
            print(f"Validation error: {e}")
    return applications