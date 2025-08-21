# loan_screening.py

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import shap
import lime
import lime.lime_tabular
import matplotlib.pyplot as plt
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

# --- Step 1 & 2: Input Data and Y Variable Creation (No Changes) ---

def load_and_preprocess_data(filepath="synthetic_data.csv"):
    """
    Loads the dataset, preprocesses it, and creates the dynamic risk score and category.
    """
    df = pd.read_csv(filepath)
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        df[col] = df[col].astype(str)
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
    df.fillna(df.median(), inplace=True)
    weights = {
        'credit_limit': 0.1, 'gross_monthly_income': 0.2, 'bpi_loans_taken': 0.3,
        'bpi_successful_loans': 0.2, 'gcash_avg_monthly_deposits': 0.1, 'data_usage_patterns': 0.1
    }
    for col in weights.keys():
        if col in df.columns:
            df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())
    alternative_data_boost = (df['bpi_loans_taken'] <= df['bpi_loans_taken'].quantile(0.25)).astype(int) * 0.15
    df['risk_index_score'] = (
        df['credit_limit'] * (weights['credit_limit'] - alternative_data_boost/2) +
        df['gross_monthly_income'] * weights['gross_monthly_income'] +
        df['bpi_loans_taken'] * (weights['bpi_loans_taken'] - alternative_data_boost) +
        df['bpi_successful_loans'] * weights['bpi_successful_loans'] +
        df['gcash_avg_monthly_deposits'] * (weights['gcash_avg_monthly_deposits'] + alternative_data_boost) +
        df['data_usage_patterns'] * (weights['data_usage_patterns'] + alternative_data_boost/2)
    )
    df['risk_index_score'] = 1 - df['risk_index_score']
    
    # --- MODIFICATION FOR BELL CURVE DISTRIBUTION ---
    # Original line using qcut for equal distribution:
    # bins = pd.qcut(df['risk_index_score'], 5, labels=False, duplicates='drop')
    
    # New method using cut for bell-curve distribution
    score_mean = df['risk_index_score'].mean()
    score_std = df['risk_index_score'].std()
    
    # Define bin edges based on standard deviations from the mean
    # This creates narrower bins in the middle and wider bins at the extremes
    bin_edges = [
        df['risk_index_score'].min() - 0.01, # ensure the lowest value is included
        score_mean - 1.5 * score_std,       # Loss
        score_mean - 0.5 * score_std,       # Doubtful
        score_mean + 0.5 * score_std,       # Substandard
        score_mean + 1.5 * score_std,       # Especially Mentioned
        df['risk_index_score'].max() + 0.01  # ensure the highest value is included
    ]
    
    # Use pd.cut with the defined edges
    # Note: We reverse the labels because a lower score is better (Pass)
    df['risk_category'] = pd.cut(df['risk_index_score'], bins=bin_edges, labels=[4, 3, 2, 1, 0], right=False)
    df['risk_category'] = df['risk_category'].astype(int)

    print("Risk Category Distribution (Bell Curve):")
    print(df['risk_category'].value_counts().sort_index())
    return df

# --- Step 2: Model Training and Evaluation (No Changes) ---

def train_gradient_boosting(X_train, y_train):
    print("\n--- Training Standard Gradient Boosting Classifier ---")
    model = lgb.LGBMClassifier(objective='multiclass', num_class=5, random_state=42)
    model.fit(X_train, y_train)
    return model

def train_ordinal_gbm(X_train, y_train):
    print("\n--- Training Ordinal GBM (as Multiclass) ---")
    model = lgb.LGBMClassifier(
        objective='multiclass', num_class=5, random_state=42,
        n_estimators=150, learning_rate=0.05, num_leaves=31
    )
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test, target_names):
    y_pred = model.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

def generate_shap_waterfall_plot(model, X, instance_index, filename="shap_waterfall.png"):
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    predicted_class = model.predict(X.iloc[[instance_index]])[0]
    plt.figure()
    shap.plots.waterfall(shap_values[predicted_class][instance_index], max_display=15, show=False)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()
    print(f"\nSHAP waterfall plot saved to {filename}")

# --- Step 3: Prediction and Explanation (Minor Changes to Aggregated LIME) ---

RISK_CATEGORY_MAP = {
    0: "Pass", 1: "Especially Mentioned (EM)", 2: "Substandard",
    3: "Doubtful", 4: "Loss"
}

def predict_loan_application(model, application_features):
    prediction = model.predict(application_features)[0]
    probabilities = model.predict_proba(application_features)[0]
    risk_category = RISK_CATEGORY_MAP[prediction]
    return risk_category, probabilities

def generate_lime_explanation(model, X_train, application_features, filename="lime_explanation.png"):
    explainer = lime.lime_tabular.LimeTabularExplainer(
        training_data=X_train.values, feature_names=X_train.columns.tolist(),
        class_names=list(RISK_CATEGORY_MAP.values()), mode='classification'
    )
    explanation = explainer.explain_instance(
        data_row=application_features.iloc[0].values,
        predict_fn=model.predict_proba, num_features=10
    )
    explanation.save_to_file(filename.replace('.png', '.html'))
    print(f"LIME explanation HTML saved to {filename.replace('.png', '.html')}")
    fig = explanation.as_pyplot_figure()
    fig.tight_layout()
    fig.savefig(filename)
    plt.close()
    print(f"LIME plot saved to {filename}")
    return explanation

FEATURE_TO_5C_MAP = {
    'Character': ['civil_status', 'dependents', 'years_of_stay', 'residence_type', 'employment_type', 'bpi_successful_loans', 'postpaid_plan_history'],
    'Capacity': ['gross_monthly_income', 'source_of_funds', 'bpi_avg_monthly_deposits', 'bpi_avg_monthly_withdrawals', 'bpi_frequency_of_transactions', 'gcash_avg_monthly_deposits', 'gcash_avg_monthly_withdrawals', 'gcash_frequency_of_transactions'],
    'Capital': ['credit_limit', 'bpi_emi_payment'],
    'Collateral': ['loan_amount_requested_php', 'loan_tenor_months'],
    'Conditions': ['address_city', 'address_province', 'loan_purpose', 'data_usage_patterns', 'prepaid_load_frequency']
}

def generate_aggregated_lime(lime_explanation, predicted_category, filename="lime_aggregated.png"):
    """
    MODIFIED: Aggregates LIME features into 5 Cs and frames the plot
    in the context of improving the application outcome.
    """
    lime_list = lime_explanation.as_list()
    aggregated_scores = {c: 0 for c in FEATURE_TO_5C_MAP.keys()}
    
    for feature_str, weight in lime_list:
        feature_name = feature_str.split(' ')[0]
        for category, features in FEATURE_TO_5C_MAP.items():
            if feature_name in features:
                aggregated_scores[category] += weight
                break
    
    sorted_scores = sorted(aggregated_scores.items(), key=lambda item: item[1])
    categories = [item[0] for item in sorted_scores]
    scores = [item[1] for item in sorted_scores]
    colors = ['red' if s < 0 else 'green' for s in scores]
    
    plt.figure(figsize=(10, 7))
    plt.barh(categories, scores, color=colors)
    plt.xlabel('Negative Impact <--- | ---> Positive Impact')
    plt.title(f'Key Factors for Your "{predicted_category}" Rating\n(How to Improve for a "Pass" Rating)')
    plt.axvline(x=0, color='grey', linestyle='--')
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()
    print(f"Aggregated LIME plot saved to {filename}")
    return aggregated_scores

# --- Step 4: Dynamic Suggestion with LangGraph (Heavily Modified) ---

class GraphState(TypedDict):
    """Represents the state of our graph."""
    application_data: pd.Series
    lime_5c_scores: dict
    prediction: str
    weaknesses: List[str]
    suggestions: List[str]

def analyze_weaknesses(state):
    """
    Identifies the key areas (5 Cs) that are negatively impacting the loan application
    based on the aggregated LIME scores.
    """
    print("--- Node: Analyzing Weaknesses for Improvement ---")
    lime_scores = state['lime_5c_scores']
    prediction = state['prediction']
    
    if prediction == "Pass":
        print("Application is already in 'Pass' category. No improvement suggestions needed.")
        state['weaknesses'] = []
        state['suggestions'] = ["Your application profile is strong and meets the criteria for the 'Pass' category."]
        return state

    # Identify categories with a negative LIME score, indicating they are hurting the application.
    # We set a small threshold to ignore negligible negative values.
    weaknesses = [cat for cat, score in lime_scores.items() if score < -0.01]
    print(f"Identified weaknesses pushing the application towards '{prediction}': {weaknesses}")
    
    state['weaknesses'] = weaknesses
    state['suggestions'] = [] # Initialize suggestions list
    return state

def character_suggester(state):
    """Provides actionable advice if 'Character' is a weakness."""
    if 'Character' in state['weaknesses']:
        print("--- Node: Generating 'Character' Suggestions ---")
        state['suggestions'].extend([
            "**Character Improvement:** To demonstrate a stronger willingness to repay, focus on building a more robust credit history. Consistently paying any existing bills or loans on time is crucial.",
            "A longer history of stable employment and residence can also significantly improve this aspect of your profile."
        ])
    return state

def capacity_suggester(state):
    """Provides actionable advice if 'Capacity' is a weakness."""
    if 'Capacity' in state['weaknesses']:
        print("--- Node: Generating 'Capacity' Suggestions ---")
        state['suggestions'].extend([
            "**Capacity Improvement:** To improve your ability to repay, consider actions that increase your net income. This could involve reducing existing monthly debt payments or increasing your average monthly bank deposits.",
            "A higher and more consistent cash flow demonstrates greater financial stability."
        ])
    return state
    
def capital_suggester(state):
    """Provides actionable advice if 'Capital' is a weakness."""
    if 'Capital' in state['weaknesses']:
        print("--- Node: Generating 'Capital' Suggestions ---")
        state['suggestions'].extend([
            "**Capital Improvement:** Your financial strength can be enhanced by increasing your personal savings or other liquid assets. Lenders see this as a safety net.",
            "If you have other credit lines, managing them well to potentially increase your credit limit over time can also be a positive signal."
        ])
    return state

def collateral_suggester(state):
    """Provides actionable advice if 'Collateral' is a weakness."""
    if 'Collateral' in state['weaknesses']:
        print("--- Node: Generating 'Collateral' Suggestions ---")
        loan_amount = state['application_data'].get('loan_amount_requested_php', 'the requested amount')
        state['suggestions'].extend([
            f"**Collateral/Loan Terms Improvement:** The requested loan amount of PHP {loan_amount:,.2f} or the tenor might be considered high relative to your overall financial profile. Applying for a smaller loan amount could increase your chances of approval."
        ])
    return state

def conditions_suggester(state):
    """Explains how external 'Conditions' are a factor."""
    if 'Conditions' in state['weaknesses']:
        print("--- Node: Generating 'Conditions' Suggestions ---")
        # Note: We can't get the original text for loan_purpose without the LabelEncoder mapping.
        # We'll provide a general suggestion.
        state['suggestions'].extend([
            "**Conditions Factor:** The model indicates that factors related to the loan's purpose or the broader economic environment may be influencing this decision. While often outside your direct control, sometimes framing the loan for a purpose seen as lower-risk (e.g., 'Debt Consolidation' vs. 'Business Expansion') can be beneficial."
        ])
    return state

def compile_improvement_plan(state):
    """Compiles all suggestions into a final, user-friendly improvement plan."""
    print("--- Node: Compiling Improvement Plan ---")
    print("\n\n" + "="*50)
    print(" LOAN APPLICATION IMPROVEMENT PLAN")
    print("="*50)
    print(f"\nYour application was categorized as: **{state['prediction']}**")
    
    if not state['weaknesses']:
        print("\n" + state['suggestions'][0])
    else:
        print("\nTo improve your chances of approval and reach the **'Pass'** category, we recommend focusing on the following areas:\n")
        for i, sug in enumerate(state['suggestions'], 1):
            print(f"• {sug}\n")
    
    print("="*50)
    print(" END OF REPORT")
    print("="*50)
    return state

def build_suggestion_graph():
    """Builds the LangGraph for generating a dynamic improvement plan."""
    workflow = StateGraph(GraphState)

    # Define the nodes
    workflow.add_node("analyze_weaknesses", analyze_weaknesses)
    workflow.add_node("suggest_character", character_suggester)
    workflow.add_node("suggest_capacity", capacity_suggester)
    workflow.add_node("suggest_capital", capital_suggester)
    workflow.add_node("suggest_collateral", collateral_suggester)
    workflow.add_node("suggest_conditions", conditions_suggester)
    workflow.add_node("compile_plan", compile_improvement_plan)

    # Build the graph as a sequence
    workflow.set_entry_point("analyze_weaknesses")
    workflow.add_edge("analyze_weaknesses", "suggest_character")
    workflow.add_edge("suggest_character", "suggest_capacity")
    workflow.add_edge("suggest_capacity", "suggest_capital")
    workflow.add_edge("suggest_capital", "suggest_collateral")
    workflow.add_edge("suggest_collateral", "suggest_conditions")
    workflow.add_edge("suggest_conditions", "compile_plan")
    workflow.add_edge("compile_plan", END)

    return workflow.compile()