# backend/routers/ml_analysis.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from ..database import SessionLocal, get_db
from ..models import Application
from sqlalchemy.orm import Session
import os
import sys
import json
import tempfile

from ..services.loan_screening import (
    load_and_preprocess_data, 
    ls_train_test_split, 
    train_ordinal_gbm,
    predict_loan_application,
    generate_lime_explanation,
    generate_aggregated_lime,
    RISK_CATEGORY_MAP,
    FEATURE_TO_5C_MAP,
    decode_categoricals,
    ENCODER_STORE
)

router = APIRouter(prefix="/api/ml", tags=["ml-analysis"])

# Global variables for model state
_model = None
_df = None
_X_train = None
_model_initialized = False

class MLAnalysisRequest(BaseModel):
    application_id: str

class LimeFeature(BaseModel):
    feature: str
    impact: float
    description: str

class MLAnalysisResponse(BaseModel):
    riskCategory: str
    riskScore: float
    probabilities: Dict[str, float]
    limeFeatures: List[LimeFeature]
    fiveCAnalysis: Dict[str, float]
    improvements: List[str]
    aiSummary: str

def initialize_model():
    """Initialize the ML model and load data from JSON"""
    global _model, _df, _X_train, _model_initialized
    
    if _model_initialized:
        return
    
    json_filepath = "application_data.json"

    _df = load_and_preprocess_data(json_filepath)
        
    print("Splitting data...")
    _X_train, X_test, y_train, y_test = ls_train_test_split(_df)
    
    print("Training model...")
    _model = train_ordinal_gbm(_X_train, y_train)
    
    print("Model initialized successfully!")
    _model_initialized = True
        
def get_model():
    """Dependency to ensure model is initialized"""
    if not _model_initialized:
        initialize_model()
    return _model, _df, _X_train

import json


def get_application_from_db(application_id: str, db=None):
    # Replace this with however you're storing/reading applications
    with open("application_data.json") as f:
        data = json.load(f)

    applications = data.get("applicationDataX", [])
    for app in applications:
        if app.get("application_id") == application_id:
            return app  # returns a dict

    return None

def convert_db_to_json_format(app_data: Dict) -> Dict:
    """Convert database application format to JSON format expected by loan_screening_json"""
    
    return {
        "id": app_data.get('id', 1),
        "application_id": app_data.get('application_id', 'APP-DEFAULT'),
        "first_name": app_data.get('first_name', ''),
        "last_name": app_data.get('last_name', ''),
        "email_address": app_data.get('email_address', ''),
        "contact_number": app_data.get('contact_number', ''),
        "address_city": app_data.get('address_city', 'Manila'),
        "address_province": app_data.get('address_province', 'Metro Manila'),
        "civil_status": app_data.get('civil_status', 'Single'),
        "dependents": app_data.get('dependents', 0),
        "gross_monthly_income": app_data.get('gross_monthly_income', 50000),
        "employment_type": app_data.get('employment_type', 'Regular'),
        "years_of_stay": app_data.get('years_of_stay', 1),
        "loan_amount_requested_php": app_data.get('loan_amount_requested_php', 100000),
        "loan_tenor_months": app_data.get('loan_tenor_months', 12),
        "loan_purpose": app_data.get('loan_purpose', 'Personal'),
        "credit_limit": app_data.get('credit_limit', 0),
        "bpi_loans_taken": app_data.get('bpi_loans_taken', 0),
        "bpi_successful_loans": app_data.get('bpi_successful_loans', 0),
        "bpi_avg_monthly_deposits": app_data.get('bpi_avg_monthly_deposits', 0),
        "gcash_avg_monthly_deposits": app_data.get('gcash_avg_monthly_deposits', 0),
        "data_usage_patterns": app_data.get('data_usage_patterns', 0.5),
        "residence_type": app_data.get('residence_type', 'Owned'),
        "source_of_funds": app_data.get('source_of_funds', 'Salary'),
        "bpi_avg_monthly_withdrawals": app_data.get('bpi_avg_monthly_withdrawals', 0),
        "bpi_frequency_of_transactions": app_data.get('bpi_frequency_of_transactions', 0),
        "bpi_emi_payment": app_data.get('bpi_emi_payment', 0),
        "gcash_avg_monthly_withdrawals": app_data.get('gcash_avg_monthly_withdrawals', 0),
        "gcash_frequency_of_transactions": app_data.get('gcash_frequency_of_transactions', 0),
        "postpaid_plan_history": app_data.get('postpaid_plan_history', 0),
        "prepaid_load_frequency": app_data.get('prepaid_load_frequency', 0),
        "processed_at": app_data.get('created_at', '2024-01-01T00:00:00Z')
    }

def create_temp_json_for_analysis(app_data: Dict) -> str:
    """Create a temporary JSON file for single application analysis"""
    json_data = {
        "applicationDataX": [convert_db_to_json_format(app_data)]
    }
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(json_data, f, indent=2)
        return f.name

def generate_fallback_analysis(application_id: str, app_data: Dict) -> MLAnalysisResponse:
    """Generate fallback analysis when ML model is not available"""
    
    # Use application data to create a more realistic analysis
    income = app_data.get('gross_monthly_income', 50000)
    loan_amount = app_data.get('loan_amount_requested_php', 100000)
    credit_limit = app_data.get('credit_limit', 0)
    
    # Simple risk scoring based on debt-to-income ratio
    debt_to_income = loan_amount / max(income, 1)
    
    if debt_to_income > 10:
        risk_category = "Default"
        risk_score = 0.9
    elif debt_to_income > 5:
        risk_category = "Critical" 
        risk_score = 0.7
    elif debt_to_income > 3:
        risk_category = "Risky"
        risk_score = 0.5
    elif debt_to_income > 2:
        risk_category = "Unstable"
        risk_score = 0.3
    else:
        risk_category = "Secure"
        risk_score = 0.1
    
    # Generate probabilities
    categories = ["Secure", "Unstable", "Risky", "Critical", "Default"]
    probabilities = {cat: 0.1 for cat in categories}
    probabilities[risk_category] = 0.6
    
    # Normalize
    total = sum(probabilities.values())
    probabilities = {k: v/total for k, v in probabilities.items()}
    
    # Generate LIME features based on actual data
    lime_features = [
        LimeFeature(
            feature="gross_monthly_income",
            impact=-0.15 if income < 30000 else 0.1,
            description=f"Monthly income: ₱{income:,.2f}"
        ),
        LimeFeature(
            feature="loan_amount_requested_php", 
            impact=-0.2 if debt_to_income > 3 else 0.05,
            description=f"Requested amount: ₱{loan_amount:,.2f}"
        ),
        LimeFeature(
            feature="credit_limit",
            impact=0.1 if credit_limit > 50000 else -0.05,
            description=f"Credit limit: ₱{credit_limit:,.2f}"
        ),
    ]
    
    # 5C Analysis
    five_c = {
        "Character": 0.05 if app_data.get('bpi_successful_loans', 0) > 0 else -0.1,
        "Capacity": 0.1 if debt_to_income < 2 else -0.2,
        "Capital": 0.05 if credit_limit > 100000 else -0.1,
        "Collateral": -0.1 if debt_to_income > 5 else 0.05,
        "Conditions": 0.02
    }
    
    improvements = [
        f"**Income Enhancement:** Current monthly income is ₱{income:,.2f}. Consider additional income sources to improve capacity.",
        f"**Debt Management:** Debt-to-income ratio is {debt_to_income:.1f}x. Ideal ratio should be below 2x monthly income.",
        "**Credit Building:** Establish stronger credit history through consistent payment behavior."
    ]
    
    ai_summary = (f"Application shows {risk_category.lower()} risk profile with "
                 f"debt-to-income ratio of {debt_to_income:.1f}x. "
                 f"Monthly income of ₱{income:,.2f} against requested ₱{loan_amount:,.2f} "
                 f"indicates {'favorable' if debt_to_income < 3 else 'challenging'} repayment capacity.")
    
    return MLAnalysisResponse(
        riskCategory=risk_category,
        riskScore=risk_score,
        probabilities=probabilities,
        limeFeatures=lime_features,
        fiveCAnalysis=five_c,
        improvements=improvements,
        aiSummary=ai_summary
    )

@router.post("/analysis", response_model=MLAnalysisResponse)
async def analyze_application(
    request: MLAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Analyze loan application using JSON-based ML model"""
    
    try:
        # Get application from database
        app_data = get_application_from_db(request.application_id, db)
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Try to use ML model
        try:
            model, df, X_train = get_model()
            
            # Create temporary JSON file for this application
            temp_json_file = create_temp_json_for_analysis(app_data)
            
            try:
                # Load and preprocess the single application
                temp_df = load_and_preprocess_data(temp_json_file)
                
                # Extract features for the application
                app_features = temp_df.drop(columns=['risk_index_score', 'risk_category'] + 
                                          [col for col in temp_df.columns if col.startswith(('id', 'application_id', 'first_name', 'last_name', 'email', 'contact', 'processed_at'))])
                
                # Align features with training data
                aligned_features = pd.DataFrame(0, index=[0], columns=X_train.columns)
                for col in aligned_features.columns:
                    if col in app_features.columns:
                        aligned_features[col] = app_features[col].iloc[0]
                
                # Make prediction
                risk_category, probabilities = predict_loan_application(model, aligned_features)
                risk_score = 1 - max(probabilities)  # Convert to risk score
                
                # Convert probabilities to dict
                prob_dict = {}
                for i, category in enumerate(RISK_CATEGORY_MAP.values()):
                    prob_dict[category] = float(probabilities[i])
                
                # Generate LIME explanation
                lime_explanation, updated_df = generate_lime_explanation(
                    temp_df, request.application_id, model, aligned_features, X_train
                )
                
                # Extract LIME features
                predicted_numeric_class = [k for k, v in RISK_CATEGORY_MAP.items() if v == risk_category][0]
                lime_list = lime_explanation.as_list(label=predicted_numeric_class)
                
                lime_features = []
                for name, weight in lime_list[:10]:  # Top 10 features
                    cleaned_name = name.split(' ')[0] if ' ' in name else name
                    description = f"{'Reduces' if weight > 0 else 'Increases'} risk by {abs(weight):.3f}"
                    
                    lime_features.append(LimeFeature(
                        feature=cleaned_name,
                        impact=float(weight),
                        description=description
                    ))
                
                # Generate 5C analysis
                five_c_scores, _ = generate_aggregated_lime(
                    temp_df, request.application_id, lime_explanation, risk_category
                )
                
                # Generate improvements
                improvements = []
                income = app_data.get('gross_monthly_income', 50000)
                loan_amount = app_data.get('loan_amount_requested_php', 100000)
                dti = loan_amount / (income * 12) if income else 1
                
                if dti > 0.4:
                    improvements.append("**Capacity:** High debt-to-income ratio detected. Consider reducing loan amount or increasing income sources.")
                
                if app_data.get('bpi_successful_loans', 0) < 2:
                    improvements.append("**Character:** Building a stronger repayment history will improve your credit profile.")
                
                if app_data.get('credit_limit', 0) < loan_amount * 0.5:
                    improvements.append("**Capital:** Increasing your credit limit through consistent banking relationships may help.")
                
                if not improvements:
                    improvements.append("Your application shows a strong financial profile. Continue maintaining good financial habits.")
                
                # Generate AI summary
                ai_summary = (
                    f"ML analysis classifies this application as '{risk_category}' with a risk score of {risk_score:.1%}. "
                    f"Key factors include income stability (₱{income:,.2f}/month), loan amount (₱{loan_amount:,.2f}), "
                    f"and digital financial behavior patterns. The model considers both traditional and alternative data sources."
                )
                
                return MLAnalysisResponse(
                    riskCategory=risk_category,
                    riskScore=float(risk_score),
                    probabilities=prob_dict,
                    limeFeatures=lime_features,
                    fiveCAnalysis={k: round(float(v), 3) for k, v in five_c_scores.items()},
                    improvements=improvements,
                    aiSummary=ai_summary
                )
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_json_file):
                    os.unlink(temp_json_file)
                
        except Exception as e:
            print(f"ML model error: {e}")
            # Fall back to rule-based analysis
            pass
        
        # Fallback analysis
        return generate_fallback_analysis(request.application_id, app_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in ML analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def ml_health_check():
    """Check ML model health"""
    return {
        "status": "healthy",
        "model_initialized": _model_initialized,
        "model_available": _model is not None,
        "data_available": _df is not None,
        "model_type": "JSON-based loan screening"
    }

@router.post("/initialize")
async def initialize_ml_model():
    """Manually initialize ML model"""
    try:
        initialize_model()
        return {"message": "JSON-based model initialized successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize model: {str(e)}")

@router.post("/retrain")
async def retrain_model():
    """Retrain the model with latest data"""
    global _model_initialized
    try:
        _model_initialized = False  # Reset state
        initialize_model()
        return {"message": "Model retrained successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrain model: {str(e)}")

# Additional endpoint for bulk analysis
@router.post("/bulk-analysis")
async def bulk_analyze_applications(
    application_ids: List[str],
    db: Session = Depends(get_db)
):
    """Analyze multiple applications at once"""
    results = []
    
    for app_id in application_ids:
        try:
            request = MLAnalysisRequest(application_id=app_id)
            result = await analyze_application(request, db)
            results.append({
                "application_id": app_id,
                "analysis": result,
                "status": "success"
            })
        except Exception as e:
            results.append({
                "application_id": app_id,
                "error": str(e),
                "status": "failed"
            })
    
    return {"results": results}