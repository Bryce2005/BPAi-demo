# loan_screening.py

import os
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

import pdb

from sklearn.preprocessing import LabelEncoder

# Dictionary to store fitted encoders globally (per column)
ENCODER_STORE = {}

non_features = ['application_id', 'application_date', 'first_name', 'middle_name',
       'last_name', 'contact_number', 'email_address']

# --- Step 1 & 2: Input Data and Y Variable Creation (No Changes) ---

def load_and_preprocess_data(filepath="outdir/synthetic_data.csv"):
    """
    Loads the dataset, preprocesses it, and creates the dynamic risk score and category.
    """
    df = pd.read_csv(filepath)
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if col not in non_features:
            df[col] = df[col].astype(str)
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            ENCODER_STORE[col] = le
#     df.fillna(df.median(), inplace=True) 
    feature_cols = [col for col in df.columns if col not in non_features and df[col].dtype in [float, int]]
    df[feature_cols] = df[feature_cols].fillna(df[feature_cols].median())
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

def ls_train_test_split(df):
    df = df.set_index('application_id')
    X = df.drop(columns=['risk_index_score', 'risk_category']+[col for col in non_features if col != 'application_id'])
    y = df['risk_category'] # risk_category
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    return X_train, X_test, y_train, y_test

def train_gradient_boosting(X_train, y_train):
    print("\n--- Training Standard Gradient Boosting Classifier ---")
    model = lgb.LGBMClassifier(objective='multiclass', num_class=5, random_state=42) # if yvar is risk_category

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

def generate_shap_waterfall_plot(model, X, instance_index, filename="shap_waterfall.png"): # improve
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

def clean_lime_feature_name(name, feature_list):
    """
    Extract the actual feature name from LIME bin strings.
    """
    name = name.strip()  # remove whitespace
    # Try to match one of the original feature names
    for f in feature_list:
        if f in name:
            return f
    # fallback: remove numeric characters and symbols
    return ''.join([c for c in name if not c.isdigit() and c not in '<>=. '])

def generate_lime_explanation(df, application_id, 
                              model, X_train, 
                              RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
                              filename="lime_explanation.png", outdir="outdir"):
    if outdir:
        os.makedirs(outdir, exist_ok=True)
        filepath = os.path.join(outdir, filename)
    
    # --- Select the row by application_id column ---
    row_mask = df['application_id'] == application_id
    if not row_mask.any():
        raise ValueError(f"Application ID {application_id} not found in df['application_id']")
    data_row = df.loc[row_mask, X_train.columns].iloc[0].values  # 1D array
    
    num_features = X_train.shape[1]
    explainer = lime.lime_tabular.LimeTabularExplainer(
        training_data=X_train.values, 
        feature_names=X_train.columns.tolist(),
        class_names=list(RISK_CATEGORY_MAP.values()), 
        mode='classification'
    )
    
    # --- Predict numeric class and probabilities ---
    predicted_numeric_class = model.predict(data_row.reshape(1, -1))[0]
    predicted_category_name = RISK_CATEGORY_MAP[predicted_numeric_class]

    # --- Generate explanation ---
    explanation = explainer.explain_instance(
        data_row,
        predict_fn=model.predict_proba,
        num_features=num_features,
        labels=[predicted_numeric_class]  # optional; tries to generate for predicted class
    )

    # --- Safely get the actual label LIME explained ---
    if explanation.local_exp:
        label_to_use = list(explanation.local_exp.keys())[0]  # pick first valid key
    else:
        raise ValueError("LIME explanation contains no local_exp entries")

    # --- Extract cleaned feature names and importances ---
    feature_names = [clean_lime_feature_name(name, X_train.columns) 
                     for name, _ in explanation.as_list(label=label_to_use)]
    feature_importances = [weight for _, weight in explanation.as_list(label=label_to_use)]
    
    # --- Add importance columns to df ---
    for feature_name, weight in zip(feature_names, feature_importances):
        col_name = f"{feature_name}_LIMEimportance_for_{predicted_category_name}"
        if col_name not in df.columns:
            df[col_name] = np.nan
        df.loc[row_mask, col_name] = weight

#     # --- Print feature importances ---
#     importance_dict = dict(zip(feature_names, feature_importances))
#     print(f"Feature importances for application_id {application_id} ({predicted_category_name}):")
#     print(importance_dict)

    # --- Export HTML ---
    explanation.save_to_file(filepath.replace('.png', '.html'))
    print(f"LIME explanation HTML saved to {filepath.replace('.png', '.html')}")
    
    # --- Export PNG using the correct label ---
    fig = explanation.as_pyplot_figure(label=label_to_use)
    fig.tight_layout()
    fig.savefig(filepath)
    plt.close()
    print(f"LIME plot saved to {filepath}")
    return explanation, df

# def generate_shap_explanation(df, application_ids, model, X_train, 
#                               RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
#                               filename="shap_explanation", outdir="outdir"):
#     """
#     Generate SHAP explanations for one or multiple application_ids.

#     Parameters:
#     -----------
#     df : pd.DataFrame
#         DataFrame containing 'application_id' column.
#     application_ids : str, int, or list
#         Single application_id or a list of application_ids to explain.
#     model : trained LightGBM multiclass model
#     X_train : pd.DataFrame
#         Feature DataFrame used for training the model.
#     RISK_CATEGORY_MAP : dict
#         Mapping from numeric class to category name.
#     filename_prefix : str
#         Base filename for exported plots.
#     outdir : str
#         Folder to save plots.

#     Returns:
#     --------
#     df : pd.DataFrame
#         Original DataFrame with added SHAP importance columns.
#     """

#     if isinstance(application_ids, (int, str)):
#         application_ids = [application_ids]

#     if outdir:
#         os.makedirs(outdir, exist_ok=True)

#     # Initialize SHAP TreeExplainer once
#     explainer = shap.TreeExplainer(model)

#     for app_id in application_ids:
#         row_mask = df['application_id'] == app_id
#         if not row_mask.any():
#             print(f"Application ID {app_id} not found, skipping.")
#             continue

#         # Get the feature row as 2D array
#         data_row = df.loc[row_mask, X_train.columns].iloc[0].values.reshape(1, -1)

#         # Predict numeric class and map to category
#         predicted_numeric_class = model.predict(data_row)[0]
#         predicted_category_name = RISK_CATEGORY_MAP[predicted_numeric_class]

#         # Compute SHAP values
#         shap_values = explainer.shap_values(data_row)
#         if isinstance(shap_values, list):  # multiclass
#             shap_class_values = shap_values[predicted_numeric_class]
#         else:  # regression/binary
#             shap_class_values = shap_values

#         # --- Add SHAP importance columns as scalars ---
#         for col, val in zip(X_train.columns, shap_class_values[0]):
#             col_name = f"{col}_SHAPimportance_for_{predicted_category_name}"
#             if col_name not in df.columns:
#                 df[col_name] = np.nan
#             df.loc[row_mask, col_name] = float(val)  # ensure scalar

#         # --- Print feature importance dictionary ---
#         importance_dict = dict(zip(X_train.columns, shap_class_values[0]))
#         print(f"\nSHAP feature importances for application_id {app_id} ({predicted_category_name}):")
#         print(importance_dict)

#         # --- Export waterfall plot ---
#         filepath = os.path.join(outdir, f"{filename_prefix}_{app_id}.png")
#         plt.figure(figsize=(10, 6))
#         shap.plots._waterfall.waterfall_legacy(
#             explainer.expected_value[predicted_numeric_class],
#             shap_class_values[0],
#             feature_names=X_train.columns,
#             max_display=len(X_train.columns),
#             show=False
#         )
#         plt.tight_layout()
#         plt.savefig(filepath)
#         plt.close()
#         print(f"SHAP waterfall plot saved to {filepath}")

#     return df
