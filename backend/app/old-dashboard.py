# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# from .database import get_db
# import models
# import pandas as pd
# from typing import List, Dict, Any

# router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# @router.get("/")
# async def get_dashboard():
#     return {"message": "Welcome to the dashboard"}

# # @router.get("/session/{session_id}/summary")
# # def get_session_summary(session_id: str, db: Session = Depends(get_db)):
# #     """Get analysis summary for a session"""
# #     session = db.query(models.AnalysisSession).filter(
# #         models.AnalysisSession.session_id == session_id
# #     ).first()
    
# #     if not session:
# #         raise HTTPException(status_code=404, detail="Session not found")
    
# #     return {
# #         "session_id": session_id,
# #         "status": session.status,
# #         "csv_filename": session.csv_filename,
# #         "zip_filename": session.zip_filename,
# #         "created_at": session.created_at,
# #         "analysis_results": session.analysis_results
# #     }

# # @router.get("/session/{session_id}/data")
# # def get_dashboard_data(session_id: str, db: Session = Depends(get_db)):
# #     """Get all valid application data for dashboard visualization"""
# #     data_rows = db.query(models.DashboardData).filter(
# #         models.DashboardData.session_id == session_id
# #     ).all()
    
# #     if not data_rows:
# #         raise HTTPException(status_code=404, detail="No data found for session")
    
# #     # Convert to list of dictionaries for easy frontend consumption
# #     dashboard_data = [row.row_data for row in data_rows]
    
# #     return {
# #         "session_id": session_id,
# #         "total_records": len(dashboard_data),
# #         "data": dashboard_data
# #     }

# # @router.get("/session/{session_id}/statistics")
# # def get_statistics(session_id: str, db: Session = Depends(get_db)):
# #     """Get statistical insights about the data"""
# #     data_rows = db.query(models.DashboardData).filter(
# #         models.DashboardData.session_id == session_id
# #     ).all()
    
# #     if not data_rows:
# #         raise HTTPException(status_code=404, detail="No data found for session")
    
# #     # Convert to DataFrame for analysis
# #     df = pd.DataFrame([row.row_data for row in data_rows])
    
# #     statistics = {
# #         "total_applications": len(df),
# #         "columns": list(df.columns),
# #     }
    
# #     # Add column-specific statistics
# #     for col in df.columns:
# #         if df[col].dtype in ['int64', 'float64']:
# #             statistics[f"{col}_stats"] = {
# #                 "mean": float(df[col].mean()) if pd.notna(df[col].mean()) else None,
# #                 "median": float(df[col].median()) if pd.notna(df[col].median()) else None,
# #                 "min": float(df[col].min()) if pd.notna(df[col].min()) else None,
# #                 "max": float(df[col].max()) if pd.notna(df[col].max()) else None,
# #                 "std": float(df[col].std()) if pd.notna(df[col].std()) else None
# #             }
# #         elif df[col].dtype == 'object':
# #             value_counts = df[col].value_counts().head(10)
# #             statistics[f"{col}_top_values"] = value_counts.to_dict()
    
# #     # If net_pay exists, add salary analysis
# #     if 'net_pay' in df.columns and df['net_pay'].notna().any():
# #         # Clean net_pay data (remove commas, convert to float)
# #         net_pay_clean = df['net_pay'].dropna().astype(str).str.replace(',', '').astype(float)
# #         statistics["salary_analysis"] = {
# #             "average_salary": float(net_pay_clean.mean()),
# #             "median_salary": float(net_pay_clean.median()),
# #             "min_salary": float(net_pay_clean.min()),
# #             "max_salary": float(net_pay_clean.max()),
# #             "salary_count": len(net_pay_clean)
# #         }
    
# #     return statistics

# # @router.get("/session/{session_id}/charts/age-distribution")
# # def get_age_distribution(session_id: str, db: Session = Depends(get_db)):
# #     """Get age distribution data for charts"""
# #     data_rows = db.query(models.DashboardData).filter(
# #         models.DashboardData.session_id == session_id
# #     ).all()
    
# #     if not data_rows:
# #         raise HTTPException(status_code=404, detail="No data found for session")
    
# #     df = pd.DataFrame([row.row_data for row in data_rows])
    
# #     if 'age' not in df.columns:
# #         return {"error": "No age column found"}
    
# #     # Create age groups
# #     df['age_group'] = pd.cut(df['age'], 
# #                             bins=[0, 25, 35, 45, 55, 100], 
# #                             labels=['18-25', '26-35', '36-45', '46-55', '55+'])
    
# #     age_distribution = df['age_group'].value_counts().to_dict()
    
# #     return {
# #         "chart_data": [
# #             {"age_group": str(group), "count": int(count)} 
# #             for group, count in age_distribution.items()
# #         ]
# #     }

# # @router.get("/session/{session_id}/charts/salary-distribution")
# # def get_salary_distribution(session_id: str, db: Session = Depends(get_db)):
# #     """Get salary distribution data for charts"""
# #     data_rows = db.query(models.DashboardData).filter(
# #         models.DashboardData.session_id == session_id
# #     ).all()
    
# #     if not data_rows:
# #         raise HTTPException(status_code=404, detail="No data found for session")
    
# #     df = pd.DataFrame([row.row_data for row in data_rows])
    
# #     if 'net_pay' not in df.columns:
# #         return {"error": "No salary data found"}
    
# #     # Clean and convert salary data
# #     salary_data = df['net_pay'].dropna().astype(str).str.replace(',', '').astype(float)
    
# #     # Create salary ranges
# #     salary_ranges = pd.cut(salary_data, 
# #                           bins=[0, 30000, 50000, 75000, 100000, float('inf')],
# #                           labels=['0-30k', '30k-50k', '50k-75k', '75k-100k', '100k+'])
    
# #     salary_distribution = salary_ranges.value_counts().to_dict()
    
# #     return {
# #         "chart_data": [
# #             {"salary_range": str(range_), "count": int(count)} 
# #             for range_, count in salary_distribution.items()
# #         ]
# #     }

# # @router.get("/sessions")
# # def list_sessions(db: Session = Depends(get_db)):
# #     """List all analysis sessions"""
# #     sessions = db.query(models.AnalysisSession).order_by(
# #         models.AnalysisSession.created_at.desc()
# #     ).all()
    
# #     return {
# #         "sessions": [
# #             {
# #                 "session_id": session.session_id,
# #                 "csv_filename": session.csv_filename,
# #                 "status": session.status,
# #                 "created_at": session.created_at,
# #                 "total_applications": session.analysis_results.get("total_applications", 0) if session.analysis_results else 0,
# #                 "valid_applications": session.analysis_results.get("valid_applications", 0) if session.analysis_results else 0
# #             }
# #             for session in sessions
# #         ]
# #     }