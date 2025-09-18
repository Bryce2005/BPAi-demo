import pandas as pd
import json
from typing import List, Dict, Any

# Assuming your module is imported as shown in the document
from .loan_application import BatchProcessor, DetailedProcessor

def process_csv_basic(test_csv_path: str, train_csv_path: str = "sample_data/apps_synthetic_data.csv") -> List[Dict[str, Any]]:
    """
    Process a CSV file and return loan application data with risk categories and probabilities.
    
    Args:
        test_csv_path: Path to the CSV file containing loan applications to process
        train_csv_path: Path to the training data CSV file
    
    Returns:
        List of dictionaries containing application data with risk predictions
    """
    try:
        # Initialize the batch processor
        processor = BatchProcessor(train_csv_path=train_csv_path)
        
        # Process the CSV file
        results = processor.categorize(test_csv_path)
        
        return results
        
    except Exception as e:
        print(f"Error processing CSV: {str(e)}")
        return []

def process_csv_detailed(csv_path: str, application_id: str, train_csv_path: str = "sample_data/apps_synthetic_data.csv"):
    """
    Process a specific application from CSV file with detailed analysis.
    
    Args:
        csv_path: Path to the CSV file containing loan applications
        application_id: Specific application ID to process
        train_csv_path: Path to the training data CSV file
    
    Returns:
        Detailed ML analysis response
    """
    try:
        # Initialize the detailed processor
        processor = DetailedProcessor(csv_path=csv_path, train_csv_path=train_csv_path)
        
        # Process specific application
        result = processor.process_specific_application(application_id)
        
        return result
        
    except Exception as e:
        print(f"Error processing application {application_id}: {str(e)}")
        return None

def save_results_to_json(results: List[Dict], output_path: str = "processed_results.json"):
    """
    Save processing results to a JSON file.
    
    Args:
        results: List of processed application results
        output_path: Path where to save the JSON file
    """
    try:
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"Results saved to {output_path}")
    except Exception as e:
        print(f"Error saving results: {str(e)}")

# Example usage
def main():
    # Example 1: Basic batch processing (like your desired output)
    test_csv_path = "sample_data/apps_synthetic_data_200.csv"  # From backend/ to backend/sample_data/
    train_csv_path = "sample_data/apps_synthetic_data.csv"     # From backend/ to backend/sample_data/
    
    print("Processing CSV file...")
    results = process_csv_basic(test_csv_path, train_csv_path)
    
    if results:
        print(f"Processed {len(results)} applications")
        
        # Display first result as example
        if results:
            print("\nExample result:")
            print(json.dumps(results[0], indent=2, default=str))
        
        # Save to JSON file
        save_results_to_json(results, "loan_processing_results.json")
    else:
        print("No results to process")
    
    # Example 2: Detailed processing of specific application
    # Uncomment if you want detailed analysis
    """
    application_id = "APP-20250702-6759"  # Replace with actual ID
    detailed_result = process_csv_detailed(test_csv_path, application_id)
    
    if detailed_result:
        print(f"\nDetailed analysis for {application_id}:")
        print(f"Risk Category: {detailed_result.riskCategory}")
        print(f"Confidence Score: {detailed_result.confidenceScore}")
        print(f"Top LIME Features: {[f.feature for f in detailed_result.limeFeatures[:3]]}")
    """

if __name__ == "__main__":
    main()