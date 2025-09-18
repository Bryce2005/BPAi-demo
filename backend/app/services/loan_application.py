from .loan_screening import (
    predict_loan_application,
    load_and_preprocess_data,
    ls_train_test_split,
    train_ordinal_gbm,
    generate_lime_explanation,
    encode_df,
    generate_shap_explanation,
    generate_aggregated_lime,
    clean_lime_feature_name,
    RISK_CATEGORY_MAP)

from . import explanation
import pandas as pd
import numpy as np
from pydantic import BaseModel
from typing import Dict, List
import numpy as np
import math

class LimeFeature(BaseModel):
    feature: str
    impact: float
    description: str

class MLAnalysisResponse(BaseModel):
    riskCategory: str
    confidenceScore: float
    probabilities: Dict[str, float]
    limeFeatures: List[LimeFeature]
    fiveCAnalysis: Dict[str, float]
    improvements: List[str]
    aiSummary: str


class BaseLoanProcessor:
    """Base class to ensure consistent processing across batch and individual operations"""
    
    def __init__(self, train_csv_path="../../sample_data/apps_synthetic_data.csv"):
        self.train_csv_path = train_csv_path
        self._setup_model()
    
    def _setup_model(self):
        """Setup and train the model using training data"""
        # Load and preprocess training data
        self.train_df = load_and_preprocess_data(self.train_csv_path)
        
        # Train model
        X_train, X_test, y_train, y_test = ls_train_test_split(self.train_df)
        self.trained_model = train_ordinal_gbm(X_train, y_train)
        self.X_train = X_train
    
    def _preprocess_application_data(self, csv_path, application_id=None):
        """Consistent preprocessing for both batch and individual processing"""
        # Load and preprocess test data
        processed_df = load_and_preprocess_data(csv_path)
        
        # Set index and encode
        indexed_df = processed_df.set_index('application_id')
        encoded_df = encode_df(indexed_df)
        
        if application_id:
            # Return specific application
            return encoded_df.loc[[application_id]]
        else:
            # Return all applications
            return encoded_df
    
    def predict_single_application(self, application_data):
        """Consistent prediction method"""
        return predict_loan_application(self.trained_model, application_data)

class BatchProcessor(BaseLoanProcessor):
    """Handles batch processing of multiple applications"""
    
    def categorize(self, test_csv_path):
        # Get encoded test data
        encoded_test_df = self._preprocess_application_data(test_csv_path)
        
        # Load raw data for final results
        raw_test_df = pd.read_csv(test_csv_path)
        
        # Process all applications
        predicted_categories = []
        probabilities_list = []
        
        for app_id in encoded_test_df.index:
            application_data = encoded_test_df.loc[[app_id]]
            cat, prob = self.predict_single_application(application_data)
            predicted_categories.append(cat)
            probabilities_list.append(prob)
        
        # Create result dataframe
        app_ids = encoded_test_df.index.to_list()
        result_df = raw_test_df[raw_test_df['application_id'].isin(app_ids)].copy()
        result_df = result_df.set_index('application_id').loc[app_ids].reset_index()
        
        result_df["risk_category"] = predicted_categories
        result_df["probabilities"] = [prob.tolist() for prob in probabilities_list]    

        # Apply serialization to the entire result
        for record in result_df.to_dict('records'):
            for key, value in record.items():
                record[key] = make_serializable(value)
                            
        return result_df.to_dict('records')
    
class DetailedProcessor(BaseLoanProcessor):
    """Handles detailed processing of individual applications (your existing process_application class logic)"""
    
    def __init__(self, csv_path, train_csv_path="backend/sample_data/apps_synthetic_data.csv"):
        super().__init__(train_csv_path)
        self.csv_path = csv_path
        self.results_df = pd.read_csv(csv_path)
        # Add the missing attributes from your original process_application class
        self.processed_df = load_and_preprocess_data(csv_path)
        # Cache for reused values
        self._cached_results = {}
    
    def _get_application_analysis(self, application_id):
        """Get or cache the core analysis for an application"""
        if application_id in self._cached_results:
            return self._cached_results[application_id]
        
        # Prepare data (same as in process_specific_application)
        indexed_df = self.processed_df.set_index('application_id')
        self.encoded_df = encode_df(indexed_df)
        
        # get application data
        application_data = self.encoded_df.loc[[application_id]]
        data_row = self.results_df.set_index('application_id').loc[application_id].to_dict()
        data_row["application_id"] = application_id
        
        # predict and append
        predicted_category, probabilities = predict_loan_application(self.trained_model, application_data)
        data_row["predicted_category"] = predicted_category
        data_row["probabilities"] = probabilities
        
        # get LIME explanation
        lime_explanation, _ = generate_lime_explanation(self.results_df, application_id,
                                                        self.trained_model, application_data,
                                                        X_train=self.X_train)
        
        # Cache the results
        self._cached_results[application_id] = {
            'application_data': application_data,
            'data_row': data_row,
            'predicted_category': predicted_category,
            'probabilities': probabilities,
            'lime_explanation': lime_explanation
        }
        
        return self._cached_results[application_id]
    
    def process_specific_application(self, application_id):
        # Get cached analysis
        analysis = self._get_application_analysis(application_id)
        
        application_data = analysis['application_data']
        predicted_category = analysis['predicted_category']
        probabilities = analysis['probabilities']
        lime_explanation = analysis['lime_explanation']
        
        prob_dict = {}
        for i, category in enumerate(RISK_CATEGORY_MAP.values()):
            prob_dict[category] = float(probabilities[i])

        # Extract LIME features
        predicted_numeric_class = [k for k, v in RISK_CATEGORY_MAP.items() if v == predicted_category][0]
        lime_list = lime_explanation.as_list(label=predicted_numeric_class)

        lime_features = []
        for name, weight in lime_list[:5]:  # Top 5 features
            cleaned_name = clean_lime_feature_name(name, self.results_df)
            description = f"{'Reduces' if weight > 0 else 'Increases'} risk by {abs(weight):.3f}"
        
            lime_features.append(LimeFeature(
                feature=cleaned_name,
                impact=float(weight),
                description=description
            ))

        five_c_scores, _ = generate_aggregated_lime(
            self.results_df, application_id, lime_explanation, predicted_category
        )

        # Generate improvements - FIX THE AMBIGUOUS SERIES ISSUE
        improvements = []
        
        # Safe way to extract scalar values from potentially Series objects
        def safe_get_value(data_dict, key, default_value):
            """Safely extract scalar value from dictionary that might contain Series"""
            value = data_dict.get(key, default_value)
            if isinstance(value, pd.Series):
                return value.iloc[0] if len(value) > 0 else default_value
            return value
        
        # Get scalar values safely
        income = safe_get_value(application_data, 'gross_monthly_income', 50000)
        loan_amount = safe_get_value(application_data, 'loan_amount_requested_php', 100000)
        
        # Calculate DTI safely
        dti = loan_amount / (income * 12) if income > 0 else 1
        
        if dti > 0.4:
            improvements.append("**Capacity:** High debt-to-income ratio detected. Consider reducing loan amount or increasing income sources.")
        
        bpi_loans = safe_get_value(application_data, 'bpi_successful_loans', 0)
        if bpi_loans < 2:
            improvements.append("**Character:** Building a stronger repayment history will improve your credit profile.")
        
        credit_limit = safe_get_value(application_data, 'credit_limit', 0)
        if credit_limit < loan_amount * 0.5:
            improvements.append("**Capital:** Increasing your credit limit through consistent banking relationships may help.")
        
        if not improvements:
            improvements.append("Your application shows a strong financial profile. Continue maintaining good financial habits.")
        
        # Generate AI summary
        ai_summary = (
            f"ML analysis classifies this application as '{predicted_category}' with a confidence score of {round(np.max(probabilities),2)}. "
            f"Key factors include income stability (₱{income:,.2f}/month), loan amount (₱{loan_amount:,.2f}), "
            f"and digital financial behavior patterns. The model considers both traditional and alternative data sources."
        )

        # convert to json
        return MLAnalysisResponse(
            riskCategory=predicted_category,
            confidenceScore=np.max(probabilities),
            probabilities=prob_dict,
            limeFeatures=lime_features,
            fiveCAnalysis={k: round(float(v), 3) for k, v in five_c_scores.items()},
            improvements=improvements,
            aiSummary=ai_summary
        )
    
    def generate_report(self, application_id):
        """Generate full report using the same analysis as process_specific_application"""
        # Get cached analysis (reuses same values as process_specific_application)
        analysis = self._get_application_analysis(application_id)
        
        application_data = analysis['application_data']
        predicted_category = analysis['predicted_category']
        probabilities = analysis['probabilities']
        lime_explanation = analysis['lime_explanation']
        
        # Generate SHAP explanation (only needed for report)
        shap_explanation, _ = generate_shap_explanation(self.results_df, application_id,
                                                       self.trained_model, application_data,
                                                       X_train=self.X_train, 
                                                       filename=f"shap_explanation_{application_id}.png")
        
        # Generate aggregated LIME with visualization (only needed for report)
        aggregated_lime_scores, results_df = generate_aggregated_lime(
                                                    df=self.results_df,
                                                    application_id=application_id,
                                                    lime_explanation=lime_explanation,
                                                    predicted_category=predicted_category,
                                                    filename=f"lime_aggregated_plot_{application_id}.png"
        )
        
        # Generate LIME visualization (only needed for report)
        _, _ = generate_lime_explanation(self.results_df, application_id,
                                        self.trained_model, application_data,
                                        X_train=self.X_train,
                                        filename=f"lime_explanation_{application_id}.png")
        
        # Generate full report using the same values
        text = explanation.explain_ai(gen_type='full_report',
                                    df=self.results_df,
                                    application_id=application_id, 
                                    lime_explanation=lime_explanation, 
                                    aggregated_lime_scores=aggregated_lime_scores, 
                                    X_train=self.X_train, 
                                    probabilities=probabilities,
                                    additional_instructions='')
        
        return True

def make_serializable(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.floating, float)) and math.isnan(obj):
        return None
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    return obj

def categorize(test_csv_path):
    processor = BatchProcessor()
    return processor.categorize(test_csv_path)