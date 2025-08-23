from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pathlib import Path
import uuid
import shutil
import os
import json
import numpy as np
import pandas as pd

from ..database import get_db
from .. import models
from ..services import loans_ocr

router = APIRouter(prefix="/upload", tags=["upload"])

# Response model
class AnalysisResponse(BaseModel):
    session_id: str
    status: str
    analysis: dict  # You can replace this with a more specific model if needed

# Helper to sanitize NaN values from JSON
def clean_json(data):
    try:
        # If it's a pandas DataFrame, replace NaN and convert to dict
        if isinstance(data, pd.DataFrame):
            data = data.replace({np.nan: None}).to_dict(orient="records")
        # If it's a dict, ensure it's JSON-safe
        json_str = json.dumps(data, allow_nan=False)
        return json.loads(json_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid data format: {str(e)}")

@router.post("/analyze", response_model=AnalysisResponse)
async def upload_and_analyze(
    csv_file: UploadFile = File(...),
    zip_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file types
    if not csv_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid CSV file.")
    if not zip_file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Invalid ZIP file.")

    # Generate unique session ID
    session_id = str(uuid.uuid4())

    # Define upload paths
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    csv_path = upload_dir / f"{session_id}_{csv_file.filename}"
    zip_path = upload_dir / f"{session_id}_{zip_file.filename}"

    try:
        # Save uploaded files
        with csv_path.open("wb") as buffer:
            shutil.copyfileobj(csv_file.file, buffer)
        with zip_path.open("wb") as buffer:
            shutil.copyfileobj(zip_file.file, buffer)

        # Create analysis session in database
        session = models.AnalysisSession(
            session_id=session_id,
            csv_filename=csv_file.filename,
            zip_filename=zip_file.filename,
            status="processing"
        )
        db.add(session)
        db.commit()

        # Process files
        raw_results = await loans_ocr.process_files(
            csv_path=csv_path,
            zip_path=zip_path,
            session_id=session_id,
            db=db
        )

        # Sanitize results before saving
        analysis_results = clean_json(raw_results)

        # Update session with results
        session.analysis_results = analysis_results
        session.status = "completed"
        db.commit()

        # Clean up temporary files
        csv_path.unlink(missing_ok=True)
        zip_path.unlink(missing_ok=True)

        return AnalysisResponse(
            session_id=session_id,
            status="completed",
            analysis=analysis_results
        )

    except Exception as e:
        # Clean up on error
        for path in [csv_path, zip_path]:
            if path.exists():
                path.unlink()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
