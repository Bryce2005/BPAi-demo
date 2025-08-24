from loan_screening import predict_loan_application, load_and_preprocess_data, ls_train_test_split, train_ordinal_gbm, evaluate_model,RISK_CATEGORY_MAP, generate_lime_explanation
import pandas as pd


def categorize(test_csv_path):
    train_data_path = "../../sample_data/apps_synthetic_data.csv"
    
    global predicted_categories
    # Load and preprocess both training and test datasets
    train_df = load_and_preprocess_data(train_data_path)
    test_df = load_and_preprocess_data(test_csv_path)

    # Training GBM model
    X_train, _, y_train, _ = ls_train_test_split(train_df)
    _, X_test, _, _ = ls_train_test_split(test_df) #, proportion=0.05)
    ord_model = train_ordinal_gbm(X_train, y_train)

    # # Prediction for each entry in test csv 
    predicted_categories = []
    probabilities_list = []

    for i in range(len(X_test)):
        application = X_test.iloc[[i]]
        cat, prob = predict_loan_application(ord_model, application)
        predicted_categories.append(cat)
        probabilities_list.append(prob)
    X_test["risk_category"] = predicted_categories
    X_test["probabilities"] = probabilities_list

    # Get the application IDs from X_test
    app_ids = X_test.index.to_list()
   
    # Added
    raw_df = pd.read_csv(test_csv_path)
    result_df = raw_df[raw_df['application_id'].isin(app_ids)]
    
    result_df["risk_category"] = predicted_categories
    result_df["probabilities"] = probabilities_list

    return result_df.to_dict('records')
    

    