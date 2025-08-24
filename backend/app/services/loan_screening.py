# # loan_screening.py

# import os
# import pandas as pd
# import numpy as np
# import lightgbm as lgb
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import LabelEncoder
# from sklearn.metrics import classification_report, confusion_matrix
# import shap
# import lime
# import lime.lime_tabular
# import matplotlib.pyplot as plt
# from langgraph.graph import StateGraph, END
# from typing import TypedDict, Annotated, List
# import operator
# import re

# import pdb

# import matplotlib.pyplot as plt
# from matplotlib.colors import LinearSegmentedColormap
# import seaborn as sns
# from sklearn.preprocessing import LabelEncoder

# Dictionary to store fitted encoders globally (per column)
ENCODER_STORE = {}
non_features = ['application_id', 'application_date', 'first_name', 'middle_name',
       'last_name', 'contact_number', 'email_address']

# --- Step 1 & 2: Input Data and Y Variable Creation ---

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
    score_mean = df['risk_index_score'].mean()
    score_std = df['risk_index_score'].std()
    
    # Define bin edges based on standard deviations from the mean
    bin_edges = [
        df['risk_index_score'].min() - 0.01, # ensure the lowest value is included
        score_mean - 1.5 * score_std,       # Loss
        score_mean - 0.5 * score_std,       # Doubtful
        score_mean + 0.5 * score_std,       # Substandard
        score_mean + 1.5 * score_std,       # Especially Mentioned
        df['risk_index_score'].max() + 0.01  # ensure the highest value is included
    ]
    
    df['risk_category'] = pd.cut(df['risk_index_score'], bins=bin_edges, labels=[4, 3, 2, 1, 0], right=False)
    df['risk_category'] = df['risk_category'].astype(int)

#     print("Risk Category Distribution (Bell Curve):")
#     print(df['risk_category'].value_counts().sort_index())
    return df

# # --- Step 2: Model Training and Evaluation (No Changes) ---

def encode_df(df):
    X = df.drop(columns=['risk_index_score', 'risk_category']+[col for col in non_features if col != 'application_id'])
    return X

def ls_train_test_split(df):
    df = df.set_index('application_id')
    X = df.drop(columns=['risk_index_score', 'risk_category']+[col for col in non_features if col != 'application_id'])
    y = df['risk_category'] # risk_category
    
#     X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=proportion, random_state=42, stratify=y)
    
#     return X_train, X_test, y_train, y_test

# def train_gradient_boosting(X_train, y_train):
#     print("\n--- Training Standard Gradient Boosting Classifier ---")
#     model = lgb.LGBMClassifier(objective='multiclass', num_class=5, random_state=42) # if yvar is risk_category

#     model.fit(X_train, y_train)
#     return model

# def train_ordinal_gbm(X_train, y_train):
#     print("\n--- Training Ordinal GBM (as Multiclass) ---")
#     model = lgb.LGBMClassifier(
#         objective='multiclass', num_class=5, random_state=42,
#         n_estimators=150, learning_rate=0.05, num_leaves=31
#     )
#     model.fit(X_train, y_train)
#     return model

# # def evaluate_model(model, X_test, y_test, target_names):
# #     y_pred = model.predict(X_test)
# #     print("\nClassification Report:")
# #     print(classification_report(y_test, y_pred, target_names=target_names))
# #     print("Confusion Matrix:")
# #     print(confusion_matrix(y_test, y_pred))


def evaluate_model(model, X_test, y_test, target_names):
    y_pred = model.predict(X_test)

    # Print reports
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    cm_normalized = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis]  # row-normalized

    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm_normalized,
        annot=True,
        fmt=".2%",
        cmap=LinearSegmentedColormap.from_list("bpi", ["#7B1113", "#E6B012"]), 
        xticklabels=target_names,
        yticklabels=target_names,
        cbar=True,
        linewidths=0.5,
        linecolor="gray"
    )

#     plt.title("Confusion Matrix", fontsize=16, weight="bold", color="#7B1113")
#     plt.xlabel("Predicted", fontsize=12, weight="bold")
#     plt.ylabel("Actual", fontsize=12, weight="bold")
#     plt.xticks(rotation=45)
#     plt.yticks(rotation=0)
#     plt.tight_layout()
#     plt.show()
    
# def generate_shap_waterfall_plot(model, X, instance_index, filename="shap_waterfall.png"): # improve
#     explainer = shap.TreeExplainer(model)
#     shap_values = explainer.shap_values(X)
#     predicted_class = model.predict(X.iloc[[instance_index]])[0]
#     plt.figure()
#     shap.plots.waterfall(shap_values[predicted_class][instance_index], max_display=15, show=False)
#     plt.tight_layout()
#     plt.savefig(filename)
#     plt.close()
#     print(f"\nSHAP waterfall plot saved to {filename}")

# # --- Step 3: Prediction and Explanation (Minor Changes to Aggregated LIME) ---

# # RISK_CATEGORY_MAP = {
# #     0: "Pass", 1: "Especially Mentioned (EM)", 2: "Substandard",
# #     3: "Doubtful", 4: "Loss"
# # }


RISK_CATEGORY_MAP = {
    0: "Secure", 1: "Unstable", 2: "Risky",
    3: "Critical", 4: "Default"
}

# def predict_loan_application(model, application_features):
#     prediction = model.predict(application_features)[0]
#     probabilities = model.predict_proba(application_features)[0]
#     risk_category = RISK_CATEGORY_MAP[prediction]
#     return risk_category, probabilities

def clean_lime_feature_name(name, feature_list):
    """
    Extract the actual feature name from LIME bin strings.
    """
    name = name.strip()
    for f in feature_list:
        if f in name:
            return f
    return ''.join([c for c in name if not c.isdigit() and c not in '<>=. '])

# def generate_lime_explanation(df, application_id, 
#                               model, sample_application,
#                               X_train,
#                               RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
#                               filename="lime_explanation.png", outdir="outdir"):
   
#     # --- Select the row by application_id column ---
#     row_mask = df['application_id'] == application_id
# #     if not row_mask.any():
# #         raise ValueError(f"Application ID {application_id} not found in df['application_id']")
# #     data_row = df.loc[row_mask, X_train.columns].iloc[0].values  # 1D array
#     data_row = sample_application.values[0]
    
#     num_features = X_train.shape[1]
#     explainer = lime.lime_tabular.LimeTabularExplainer(
#         training_data=X_train.values, 
#         feature_names=X_train.columns.tolist(),
#         class_names=list(RISK_CATEGORY_MAP.values()), 
#         mode='classification'
#     )
    
#     # --- Predict numeric class and probabilities ---
#     predicted_numeric_class = model.predict(data_row.reshape(1, -1))[0]
#     predicted_category_name = RISK_CATEGORY_MAP[predicted_numeric_class]

#     # --- Generate explanation ---
#     explanation = explainer.explain_instance(
#         data_row,
#         predict_fn=model.predict_proba,
#         num_features=num_features,
#         labels=[predicted_numeric_class]  # optional; tries to generate for predicted class
#     )

#     # --- Safely get the actual label LIME explained ---
#     if explanation.local_exp:
#         label_to_use = list(explanation.local_exp.keys())[0]  # pick first valid key
#     else:
#         raise ValueError("LIME explanation contains no local_exp entries")

#     # --- Extract cleaned feature names and importances ---
#     feature_names = [clean_lime_feature_name(name, X_train.columns) 
#                      for name, _ in explanation.as_list(label=label_to_use)]
#     feature_importances = [weight for _, weight in explanation.as_list(label=label_to_use)]
    
#     # --- Add importance columns to df ---
#     for feature_name, weight in zip(feature_names, feature_importances):
#         col_name = f"{feature_name}_LIMEimportance_for_{predicted_category_name}"
#         if col_name not in df.columns:
#             df[col_name] = np.nan
#         df.loc[row_mask, col_name] = weight

#     # --- Export HTML ---
#     explanation.save_to_file(filepath.replace('.png', '.html'))
#     print(f"LIME explanation HTML saved to {filepath.replace('.png', '.html')}")
    
#     # --- Export PNG using the correct label ---
#     fig = explanation.as_pyplot_figure(label=label_to_use)

#     # Add descriptive title
#     fig.suptitle(
#         f"LIME Explanation for Application {application_id}\n(Predicted: {predicted_category_name})",
#         fontsize=14,
#         y=1.02  # push title a bit higher so it's not clipped
#     )

#     # Layout adjustments to avoid cutoff
#     fig.savefig(filepath, bbox_inches="tight")
#     plt.close(fig)

#     print(f"LIME plot saved to {filepath}")
#     return explanation, df

# def generate_shap_explanation(df, application_id, 
#                               model, sample_application,
#                               X_train, 
#                               RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
#                               filename="shap_explanation.png", outdir="outdir",
#                               use_tree_explainer=True):
#     if outdir:
#         os.makedirs(outdir, exist_ok=True)
#         filepath = os.path.join(outdir, filename)
    
    # --- Select the row by application_id column ---
    row_mask = df['application_id'] == application_id
    data_row = sample_application.values[0]
    
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
    
# #     for feature_name, weight in zip(feature_names, feature_importances):
# #         col_name = f"{feature_name}_LIMEimportance_for_{predicted_category_name}"
# #         if col_name not in df.columns:
# #             df[col_name] = np.nan
# #         df.loc[row_mask, col_name] = weight

# #     explanation.save_to_file(filepath.replace('.png', '.html'))
# #     print(f"LIME explanation HTML saved to {filepath.replace('.png', '.html')}")
    
    # --- Export PNG using the correct label ---
    fig = explanation.as_pyplot_figure(label=label_to_use)
    fig.suptitle(
        f"LIME Explanation for Application {application_id}\n(Predicted: {predicted_category_name})",
        fontsize=14,
        y=1.02
    )
    fig.savefig(filepath, bbox_inches="tight")
    plt.close(fig)

    print(f"LIME plot saved to {filepath}")
    return explanation, df

# # def generate_shap_explanation(df, application_id, 
# #                               model, sample_application,
# #                               X_train, 
# #                               RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
# #                               filename="shap_explanation.png", outdir="outdir",
# #                               use_tree_explainer=True):
# #     if outdir:
# #         os.makedirs(outdir, exist_ok=True)
# #         filepath = os.path.join(outdir, filename)
    
# #     row_mask = df['application_id'] == application_id
# #     if not row_mask.any():
# #         raise ValueError(f"Application ID {application_id} not found in df['application_id']")
# #     data_row = sample_application.values[0]
    
# #     predicted_numeric_class = model.predict(data_row.reshape(1, -1))[0]
# #     predicted_category_name = RISK_CATEGORY_MAP[predicted_numeric_class]
    
# #     if use_tree_explainer:
# #         explainer = shap.TreeExplainer(model)
# #     else:
# #         explainer = shap.KernelExplainer(model.predict_proba, X_train.sample(50, random_state=42))
    
    # --- Compute SHAP values ---
    shap_values = explainer.shap_values(data_row.reshape(1, -1))  # make 2D for LightGBM
    
    if isinstance(shap_values, list):  # multiclass
        shap_values_for_class = shap_values[predicted_numeric_class][0]
    else:  # binary
        shap_values_for_class = shap_values[0]
    
# #     shap_values_for_class = np.ravel(shap_values_for_class).astype(float)
# #     feature_names = X_train.columns.tolist()
    
# #     if len(shap_values_for_class) != len(feature_names):
# #         min_len = min(len(shap_values_for_class), len(feature_names))
# #         shap_values_for_class = shap_values_for_class[:min_len]
# #         feature_names = feature_names[:min_len]
    
# #     nonzero_mask = shap_values_for_class != 0
# #     shap_values_nonzero = shap_values_for_class[nonzero_mask]
# #     feature_names_nonzero = [f for f, keep in zip(feature_names, nonzero_mask) if keep]
    
# #     for feature_name, shap_val in zip(feature_names, shap_values_for_class):
# #         col_name = f"{feature_name}_SHAPvalue_for_{predicted_category_name}"
# #         if col_name not in df.columns:
# #             df[col_name] = np.nan
# #         df.loc[row_mask, col_name] = shap_val
    
# #     if len(shap_values_nonzero) > 0:
# #         plt.figure(figsize=(8, max(4, len(feature_names_nonzero) * 0.3)))
# #         shap.bar_plot(
# #             shap_values_nonzero,
# #             feature_names=feature_names_nonzero,
# #             max_display=len(feature_names_nonzero),
# #             show=False
# #         )
# #         plt.title(f"SHAP Explanation for Application {application_id}\n(Predicted: {predicted_category_name})",
# #                   fontsize=14, pad=20)
# #         plt.tight_layout(rect=[0, 0, 1, 0.95])
# #         plt.savefig(filepath, bbox_inches="tight")
# #         plt.close()
# #         print(f"SHAP bar plot saved to {filepath}")
# #     else:
# #         print("All SHAP values are zero — skipping bar plot export.")
    
# #     force_filepath = filepath.replace('.png', '.html')
# #     shap_html = shap.force_plot(
# #         explainer.expected_value[predicted_numeric_class] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value,
# #         shap_values_for_class,
# #         data_row,
# #         feature_names=feature_names
# #     )
# #     shap.save_html(force_filepath, shap_html)
# #     print(f"SHAP force plot HTML saved to {force_filepath}")
    
# #     return shap_values_for_class, df

# # FEATURE_TO_5C_MAP = {
# #     'Character': ['civil_status', 'dependents', 'years_of_stay', 'residence_type', 'employment_type', 'bpi_successful_loans', 'postpaid_plan_history'],
# #     'Capacity': ['gross_monthly_income', 'source_of_funds', 'bpi_avg_monthly_deposits', 'bpi_avg_monthly_withdrawals', 'bpi_frequency_of_transactions', 'gcash_avg_monthly_deposits', 'gcash_avg_monthly_withdrawals', 'gcash_frequency_of_transactions'],
# #     'Capital': ['credit_limit', 'bpi_emi_payment'],
# #     'Collateral': ['loan_amount_requested_php', 'loan_tenor_months'],
# #     'Conditions': ['address_city', 'address_province', 'loan_purpose', 'data_usage_patterns', 'prepaid_load_frequency']
# # }

# # def generate_aggregated_lime(df, application_id, lime_explanation, predicted_category, 
# #                               FEATURE_TO_5C_MAP=FEATURE_TO_5C_MAP, 
# #                               filename="lime_aggregated.png", outdir="outdir"):
# #     """
# #     Aggregates LIME features into 5 Cs for a specific application_id and predicted category.
# #     """
# #     if outdir:
# #         os.makedirs(outdir, exist_ok=True)
# #         filepath = os.path.join(outdir, filename)
# #     else:
# #         filepath = filename

# #     aggregated_scores = {c: 0 for c in FEATURE_TO_5C_MAP.keys()}
# #     predicted_numeric_class = [k for k, v in RISK_CATEGORY_MAP.items() if v == predicted_category][0]
# #     lime_list = lime_explanation.as_list(label=predicted_numeric_class)
# #     cleaned_features = [name.split(' ')[0] for name, _ in lime_list]
# #     weights = [weight for _, weight in lime_list]

# #     for feature_name, weight in zip(cleaned_features, weights):
# #         for category, features in FEATURE_TO_5C_MAP.items():
# #             if feature_name in features:
# #                 aggregated_scores[category] += weight
# #                 break

    # --- Add importance columns to df ---
    row_mask = df['application_id'] == application_id
    if not row_mask.any():
        raise ValueError(f"Application ID {application_id} not found in df")
    for category, score in aggregated_scores.items():
        col_name = f"{category}_importance_for_{predicted_category}"
        if col_name not in df.columns:
            df[col_name] = np.nan
        df.loc[row_mask, col_name] = float(score) 

    # --- Plot ---
    sorted_scores = sorted(aggregated_scores.items(), key=lambda item: item[1])
    categories = [item[0] for item in sorted_scores]
    scores = [item[1] for item in sorted_scores]
    colors = ['red' if s < 0 else 'green' for s in scores]

# #     plt.figure(figsize=(10, 7))
# #     plt.barh(categories, scores, color=colors)
# #     plt.xlabel('Negative Impact <--- | ---> Positive Impact')
# #     plt.title(f'Key Factors for Your "{predicted_category}" Rating')
# #     plt.axvline(x=0, color='grey', linestyle='--')
# #     plt.tight_layout()
# #     plt.savefig(filepath)
# #     plt.close()
# #     print(f"Aggregated LIME plot saved to {filepath}")

    return aggregated_scores, df
