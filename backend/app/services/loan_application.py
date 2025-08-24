import loan_screening
import explanation
import pandas as pd
import json
import numpy as np
import pdb

class process_application():
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.target_names = ['Secure', 'Unstable', 'Risky', 'Critical', 'Default']

        # prep datasets
        self.processed_df = loan_screening.load_and_preprocess_data(csv_path)
        self.results_df = pd.read_csv(csv_path)
        
        # train model
        X_train, X_test, y_train, y_test = loan_screening.ls_train_test_split(self.processed_df)
        self.trained_model = loan_screening.train_gradient_boosting(X_train, y_train)
        self.X_train = X_train
        
        print('Done')
        
    def process_specific_application(self, application_id):
        indexed_df = self.processed_df.set_index('application_id')
        self.encoded_df = loan_screening.encode_df(indexed_df)
        
        # get application data
        application_data = self.encoded_df.loc[[application_id]]
        data_row = self.results_df.set_index('application_id').loc[application_id].to_dict()
        data_row["application_id"] = application_id
        
        # predict and append
        predicted_category, probabilities = loan_screening.predict_loan_application(self.trained_model, application_data)
        data_row["predicted_category"] = predicted_category
        data_row["probabilities"] = probabilities
    
        # convert to json
        json_data = row_to_json(data_row, indent=4)
        
        return json_data
        
    def generate_report(self, application_id):
        indexed_df = self.processed_df.set_index('application_id')
        self.encoded_df = loan_screening.encode_df(indexed_df)
        
        # get application data
        application_data = self.encoded_df.loc[[application_id]]
        data_row = self.processed_df.set_index('application_id').loc[application_id].to_dict()
        
        # predict and append
        predicted_category, probabilities = loan_screening.predict_loan_application(self.trained_model, application_data)
    
        # get LIME explanation
        lime_explanation, _ = loan_screening.generate_lime_explanation(self.results_df, application_id,
                                                                        self.trained_model, application_data,
                                                                        X_train=self.X_train,
                                                            filename=f"lime_explanation_{application_id}.png")
        
        # get SHAP explanation
        shap_explanation, _ = loan_screening.generate_shap_explanation(self.results_df, application_id,
                                                            self.trained_model, application_data,
                                                            X_train=self.X_train, 
                                                            filename=f"shap_explanation_{application_id}.png")
        
        # get aggregated LIME
        aggregated_lime_scores, results_df = loan_screening.generate_aggregated_lime(
                                                            df=self.results_df,
                                                            application_id=application_id,
                                                            lime_explanation=lime_explanation,
                                                            predicted_category=predicted_category,
                                                            filename=f"lime_aggregated_plot_{application_id}.png"
        )
        
        # generate full report
        text = explanation.explain_ai(gen_type = 'full_report',
                              df = self.results_df,
                              application_id = application_id, 
                              lime_explanation = lime_explanation, 
                              aggregated_lime_scores  = aggregated_lime_scores, 
                              X_train = self.X_train, 
                              probabilities=probabilities,
                              additional_instructions='')
        
        return True

def row_to_json(data_row, filepath=None, indent=2):
    """
    Convert a data_row dictionary (possibly containing numpy arrays) into JSON.
    
    Args:
        data_row (dict): The dictionary containing application data.
        filepath (str, optional): If provided, save the JSON to this file.
        indent (int, optional): Indentation level for pretty-printing JSON.
    
    Returns:
        str: JSON-formatted string.
    """
    
    def convert(obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        return obj
    
    json_str = json.dumps(data_row, default=convert, indent=indent)
    
    if filepath:
        with open(filepath, "w") as f:
            f.write(json_str)
    
    return json_str