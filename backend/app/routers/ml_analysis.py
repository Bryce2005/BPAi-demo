from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from ..database import SessionLocal, get_db
from ..models import Application
from sqlalchemy.orm import Session
from ..services.loan_application import DetailedProcessor
import os

router = APIRouter(prefix="/api/ml", tags=["ml-analysis"])

class LimeFeature(BaseModel):
    feature: str
    impact: float
    description: str

class MLAnalysisRequest(BaseModel):
    application_id: str

class MLAnalysisResponse(BaseModel):
    riskCategory: str
    confidenceScore: float
    probabilities: Dict[str, float]
    limeFeatures: List[LimeFeature]
    fiveCAnalysis: Dict[str, float]
    improvements: List[str]
    aiSummary: str

class FileResponse(BaseModel):
    path: str
    filename: str
    media_type: str

@router.get("/health")
async def ml_health_check():
    """Check ML model health"""
    return {
        "status": "healthy",
        "model_type": "JSON-based loan screening"
    }


@router.post("/analysis", response_model=MLAnalysisResponse)
async def analyze_application(
    request: MLAnalysisRequest,
):    
    try:
        detailed_processor = DetailedProcessor("backend/sample_data/apps_synthetic_data_200.csv")
        analysis_result = detailed_processor.process_specific_application(request.application_id)
        # Process the application
        # analysis_result = processor.process_specific_application(request.application_id)
        
        return analysis_result
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error in ML analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


class ReportRequest(BaseModel):
    application_id: str

class ReportResponse(BaseModel):
    success: bool
    message: str
    application_id: str

@router.post("/generate-report", response_model=ReportResponse)
async def generate_report_endpoint(request: ReportRequest):
    """Generate a comprehensive ML analysis report for an application"""
    try:
        # Initialize the DetailedProcessor with your CSV path
        detailed_processor = DetailedProcessor("backend/sample_data/apps_synthetic_data_200.csv")
        
        # Generate the report
        success = detailed_processor.generate_report(request.application_id)
        
        if success:
            return ReportResponse(
                success=True,
                message="Report generated successfully",
                application_id=request.application_id
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail="Report generation failed"
            )
            
    except Exception as e:
        print(f"Report generation error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Report generation failed: {str(e)}"
        )

@router.get("/download-report/{application_id}")
async def download_report_endpoint(application_id: str):
    """Download the generated report for an application"""
    try:
        # Based on your file structure, reports are saved in 'outdir' folder
        # with filename format: report_{application_id}.pdf
        report_filename = f"report_{application_id}.pdf"
        report_path = os.path.join("outdir", report_filename)
        
        print(f"Looking for report at: {report_path}")
        
        # Check if report exists
        if not os.path.exists(report_path):
            # Try alternative locations and naming patterns
            alternative_paths = [
                os.path.join("backend", "outdir", report_filename),
                os.path.join("outdir", f"full_report_{application_id}.pdf"),
                os.path.join("outdir", f"{application_id}_report.pdf"),
                os.path.join("outputs", report_filename),
                os.path.join("reports", report_filename)
            ]
            
            found_file = None
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    found_file = alt_path
                    print(f"Found report at alternative path: {alt_path}")
                    break
            
            if not found_file:
                # List files in outdir for debugging
                outdir_path = "outdir"
                if os.path.exists(outdir_path):
                    files_in_outdir = os.listdir(outdir_path)
                    print(f"Files in outdir: {files_in_outdir}")
                    
                    # Look for any PDF with the application_id
                    matching_files = [f for f in files_in_outdir if application_id in f and f.endswith('.pdf')]
                    if matching_files:
                        found_file = os.path.join(outdir_path, matching_files[0])
                        print(f"Found matching file: {found_file}")
            
            if not found_file:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Report not found for application {application_id}. Expected at: {report_path}"
                )
            
            report_path = found_file
        
        # Return the file
        return FileResponse(
            path=report_path,
            filename=os.path.basename(report_path),
            media_type='application/pdf'
        )
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"Report file not found for application {application_id}"
        )
    except Exception as e:
        print(f"Report download error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to download report: {str(e)}"
        )

# Optional: Get report status endpoint
@router.get("/report-status/{application_id}")
async def get_report_status(application_id: str):
    """Check if a report exists for an application"""
    try:
        report_filename = f"full_report_{application_id}.pdf"
        report_paths = [
            os.path.join("reports", report_filename),
            os.path.join("outputs", report_filename)
        ]
        
        report_exists = any(os.path.exists(path) for path in report_paths)
        
        return {
            "application_id": application_id,
            "report_exists": report_exists,
            "report_filename": report_filename if report_exists else None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to check report status: {str(e)}"
        )