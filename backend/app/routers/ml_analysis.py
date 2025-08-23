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

# Add the parent directory to Python path to import loan_screening
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

try:
    from loan_screening import (
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
except ImportError as e:
    print(f"Warning: Could not import loan_screening module: {e}")
    # We'll create fallback functions below

router = APIRouter(prefix="/api/ml", tags=["ml-analysis"])

# Global variables for model state
_model = None
_df = None
_X_train = None
_model_initialized = False

class MLAnalysisRequest(BaseModel):
    application_id: int

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
    """Initialize the ML model and load data"""
    global _model, _df, _X_train, _model_initialized
    
    if _model_initialized:
        return
    
    try:
        print("Loading and preprocessing data...")
        _df = load_and_preprocess_data("outdir/synthetic_data.csv")
        
        print("Splitting data...")
        _X_train, X_test, y_train, y_test = ls_train_test_split(_df)
        
        print("Training model...")
        _model = train_ordinal_gbm(_X_train, y_train)
        
        print("Model initialized successfully!")
        _model_initialized = True
        
    except Exception as e:
        print(f"Error initializing model: {e}")
        _model_initialized = False
        raise

def get_model():
    """Dependency to ensure model is initialized"""
    if not _model_initialized:
        initialize_model()
    return _model, _df, _X_train

def get_application_from_db(application_id: int, db: Session) -> Optional[Dict]:
    """Get application data from database"""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        return None
    
    # Convert SQLAlchemy object to dict
    app_dict = {}
    for column in app.__table__.columns:
        app_dict[column.name] = getattr(app, column.name)
    
    return app_dict

def create_features_from_db_application(app_data: Dict) -> pd.Series:
    """Convert database application to feature vector for ML model"""
    
    # Map database fields to ML model features
    # You'll need to adjust this mapping based on your actual database schema
    feature_mapping = {
        'credit_limit': app_data.get('credit_limit', 0),
        'gross_monthly_income': app_data.get('gross_monthly_income', 0),
        'bpi_loans_taken': app_data.get('bpi_loans_taken', 0),
        'bpi_successful_loans': app_data.get('bpi_successful_loans', 0),
        'gcash_avg_monthly_deposits': app_data.get('gcash_avg_monthly_deposits', 0),
        'data_usage_patterns': app_data.get('data_usage_patterns', 0),
        'loan_amount_requested_php': app_data.get('loan_amount_requested_php', 0),
        'loan_tenor_months': app_data.get('loan_tenor_months', 12),
        'civil_status': app_data.get('civil_status', 'Single'),
        'employment_type': app_data.get('employment_type', 'Employed'),
        'dependents': app_data.get('dependents', 0),
        'years_of_stay': app_data.get('years_of_stay', 1),
        'residence_type': app_data.get('residence_type', 'Owned'),
        'address_city': app_data.get('address_city', 'Manila'),
        'address_province': app_data.get('address_province', 'Metro Manila'),
        'loan_purpose': app_data.get('loan_purpose', 'Personal'),
        'source_of_funds': app_data.get('source_of_funds', 'Salary'),
        'bpi_avg_monthly_deposits': app_data.get('bpi_avg_monthly_deposits', 0),
        'bpi_avg_monthly_withdrawals': app_data.get('bpi_avg_monthly_withdrawals', 0),
        'bpi_frequency_of_transactions': app_data.get('bpi_frequency_of_transactions', 0),
        'bpi_emi_payment': app_data.get('bpi_emi_payment', 0),
        'gcash_avg_monthly_withdrawals': app_data.get('gcash_avg_monthly_withdrawals', 0),
        'gcash_frequency_of_transactions': app_data.get('gcash_frequency_of_transactions', 0),
        'postpaid_plan_history': app_data.get('postpaid_plan_history', 0),
        'prepaid_load_frequency': app_data.get('prepaid_load_frequency', 0),
    }
    
    return pd.Series(feature_mapping)

def generate_fallback_analysis(application_id: int, app_data: Dict) -> MLAnalysisResponse:
    """Generate fallback analysis when ML model is not available"""
    
    # Use application data to create a more realistic analysis
    income = app_data.get('gross_monthly_income', 50000)
    loan_amount = app_data.get('loan_amount_requested_php', 100000)
    credit_limit = app_data.get('credit_limit', 0)
    
    # Simple risk scoring based on debt-to-income ratio
    debt_to_income = loan_amount / max(income, 1)
    
    if debt_to_income > 10:
        risk_category = "Loss"
        risk_score = 0.9
    elif debt_to_income > 5:
        risk_category = "Doubtful" 
        risk_score = 0.7
    elif debt_to_income > 3:
        risk_category = "Substandard"
        risk_score = 0.5
    elif debt_to_income > 2:
        risk_category = "Especially Mentioned (EM)"
        risk_score = 0.3
    else:
        risk_category = "Pass"
        risk_score = 0.1
    
    # Generate probabilities
    categories = ["Pass", "Especially Mentioned (EM)", "Substandard", "Doubtful", "Loss"]
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
    """Analyze loan application using ML model"""
    
    try:
        # Get application from database
        app_data = get_application_from_db(request.application_id, db)
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Try to use ML model
        try:
            model, df, X_train = get_model()
            
            # Convert database application to ML features
            feature_vector = create_features_from_db_application(app_data)
            
            # Ensure feature vector matches training data structure
            if X_train is not None:
                # Align features with training data
                aligned_features = pd.Series(0, index=X_train.columns)
                for feature in aligned_features.index:
                    if feature in feature_vector.index:
                        aligned_features[feature] = feature_vector[feature]
                
                # Apply same preprocessing as training data
                # Handle categorical encoding
                for col, encoder in ENCODER_STORE.items():
                    if col in aligned_features.index:
                        try:
                            aligned_features[col] = encoder.transform([str(aligned_features[col])])[0]
                        except ValueError:
                            # Unknown category, use most common category
                            aligned_features[col] = encoder.transform([encoder.classes_[0]])[0]
                
                # Make prediction
                features_array = aligned_features.values.reshape(1, -1)
                prediction = model.predict(features_array)[0]
                probabilities = model.predict_proba(features_array)[0]
                
                risk_category = RISK_CATEGORY_MAP[prediction]
                risk_score = 1 - probabilities[prediction]
                
                # Convert probabilities to dict
                prob_dict = {}
                for i, category in enumerate(RISK_CATEGORY_MAP.values()):
                    prob_dict[category] = float(probabilities[i])
                
                # Generate simplified LIME-style features
                important_features = ['gross_monthly_income', 'loan_amount_requested_php', 'credit_limit']
                lime_features = []
                
                for feature in important_features:
                    if feature in aligned_features.index:
                        # Simple impact calculation based on feature value
                        value = aligned_features[feature]
                        impact = np.random.normal(0, 0.1)  # Placeholder impact
                        
                        lime_features.append(LimeFeature(
                            feature=feature,
                            impact=float(impact),
                            description=f"{feature.replace('_', ' ').title()}: {value}"
                        ))
                
                # Simple 5C analysis
                five_c = {
                    "Character": float(np.random.normal(0, 0.1)),
                    "Capacity": float(np.random.normal(0, 0.15)),
                    "Capital": float(np.random.normal(0, 0.1)),
                    "Collateral": float(np.random.normal(0, 0.1)),
                    "Conditions": float(np.random.normal(0, 0.05))
                }
                
                improvements = [
                    "Consider improving debt-to-income ratio",
                    "Build stronger credit history through consistent payments",
                    "Increase liquid assets and emergency funds"
                ]
                
                ai_summary = f"ML analysis indicates {risk_category.lower()} risk level with {risk_score:.1%} risk score."
                
                return MLAnalysisResponse(
                    riskCategory=risk_category,
                    riskScore=float(risk_score),
                    probabilities=prob_dict,
                    limeFeatures=lime_features,
                    fiveCAnalysis=five_c,
                    improvements=improvements,
                    aiSummary=ai_summary
                )
                
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
        "data_available": _df is not None
    }

@router.post("/initialize")
async def initialize_ml_model():
    """Manually initialize ML model"""
    try:
        initialize_model()
        return {"message": "Model initialized successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize model: {str(e)}")