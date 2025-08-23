from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON
from sqlalchemy.sql import func
from .database import Base
from pydantic import BaseModel
from typing import Optional

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    csv_filename = Column(String)
    zip_filename = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    analysis_results = Column(JSON)  # Store AI analysis results
    status = Column(String, default="processing")  # processing, completed, failed

class DashboardData(Base):
    __tablename__ = "dashboard_data"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    row_data = Column(JSON)  # Store CSV row as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())


from pydantic import BaseModel
from typing import Optional

class Application(BaseModel):
    application_id: str
    application_date: str
    first_name: str
    middle_name: Optional[str]
    last_name: str
    contact_number: str
    email_address: str
    civil_status: str
    dependents: int
    address_city: str
    address_province: str
    years_of_stay: int
    residence_type: str
    employment_type: str
    credit_limit: Optional[float]
    gross_monthly_income: float
    source_of_funds: str
    bpi_avg_monthly_deposits: Optional[float]
    bpi_avg_monthly_withdrawals: Optional[float]
    bpi_frequency_of_transactions: Optional[int]
    bpi_loans_taken: Optional[int]
    bpi_emi_payment: Optional[float]
    bpi_successful_loans: Optional[int]
    prepaid_load_frequency: Optional[int]
    postpaid_plan_history: Optional[str]
    data_usage_patterns: Optional[str]
    gcash_avg_monthly_deposits: Optional[float]
    gcash_avg_monthly_withdrawals: Optional[float]
    gcash_frequency_of_transactions: Optional[int]
    loan_purpose: str
    loan_amount_requested_php: float
    loan_tenor_months: int


# This is what test_db.py was looking for
# You can add more models here later