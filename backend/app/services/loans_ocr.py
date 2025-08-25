import os
import re
import zipfile
import tempfile
from difflib import SequenceMatcher
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from .. import models
import google.generativeai as genai

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


def clean_dict_for_json(data):
    """
    Clean a dictionary to make it JSON-safe by replacing NaN values with None
    """
    if isinstance(data, dict):
        return {k: clean_dict_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_dict_for_json(v) for v in data]
    elif pd.isna(data) or (isinstance(data, float) and np.isnan(data)):
        return None
    elif isinstance(data, (np.integer, np.floating)):
        if np.isnan(data):
            return None
        return data.item()  # Convert numpy types to Python types
    else:
        return data


def analyze_id(file_path: str):
    """
    Extract all possible names from the ID document using Gemini 1.5 Flash.
    
    Args:
        file_path (str): Path to the ID image file
        
    Returns:
        list: List of extracted names from the document
    """
    try:
        if not os.path.exists(file_path):
            return []

        # Create a proper image blob for Gemini
        import mimetypes
        
        # Determine MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type or not mime_type.startswith('image/'):
            mime_type = 'image/jpeg'  # Default fallback
        
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # Create the proper blob format for Gemini
        image_blob = {
            'mime_type': mime_type,
            'data': file_bytes
        }

        # Prompt Gemini to extract names from ID
        response = model.generate_content([
            "Extract all possible names from this ID document. Return as a JSON list of names only. "
            "Focus on the main name fields and ignore headers, labels, or administrative text.",
            image_blob
        ])

        text_output = response.text.strip()

        # Try to parse as JSON first
        try:
            import json
            names = json.loads(text_output)
            if isinstance(names, list):
                return names
        except json.JSONDecodeError:
            pass

        # Fallback: extract names using regex if JSON parsing fails
        names = re.findall(r"[A-Z][a-z]+(?: [A-Z][a-z]+)+", text_output)
        return names if names else [text_output.strip()]

    except Exception as e:
        print(f"Error analyzing ID {file_path}: {str(e)}")
        return []


def analyze_payslip(image_path: str):
    """
    Extract payslip information, specifically Net Pay, using Gemini 1.5 Flash.
    
    Args:
        image_path (str): Path to the payslip image file
        
    Returns:
        str or None: Net pay amount if found, None otherwise
    """
    try:
        if not os.path.exists(image_path):
            return None

        # Create a proper image blob for Gemini
        import mimetypes
        
        # Determine MIME type
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type or not mime_type.startswith('image/'):
            mime_type = 'image/jpeg'  # Default fallback

        with open(image_path, "rb") as f:
            file_bytes = f.read()

        # Create the proper blob format for Gemini
        image_blob = {
            'mime_type': mime_type,
            'data': file_bytes
        }

        # Ask Gemini to extract structured payslip information
        response = model.generate_content([
            "Extract key payslip information from this image. Return JSON with fields: "
            "Employer, Employee Name, Gross Pay, Deductions, Net Pay. "
            "Focus on numerical values for pay amounts.",
            image_blob
        ])

        text_output = response.text.strip()

        # Try to parse as JSON first
        try:
            import json
            data = json.loads(text_output)
            if isinstance(data, dict) and "Net Pay" in data:
                return str(data["Net Pay"]).strip()
        except json.JSONDecodeError:
            pass

        # Fallback: Extract Net Pay using regex patterns
        net_pay_patterns = [
            r"Net Pay\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
            r"Net Salary\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
            r"Take Home\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
            r"Net\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
            r"Total\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)"
        ]

        for pattern in net_pay_patterns:
            match = re.search(pattern, text_output, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        # Return raw output if no patterns match
        return text_output if text_output else None

    except Exception as e:
        print(f"Error analyzing payslip {image_path}: {str(e)}")
        return None


def match_names(expected_variants, candidates, threshold=0.90):
    """
    Match extracted names against expected name variants using similarity scoring.
    
    Args:
        expected_variants (list): List of expected name variants
        candidates (list): List of extracted name candidates
        threshold (float): Minimum similarity threshold (0.0 to 1.0)
        
    Returns:
        tuple: (is_valid, best_match, best_score)
    """
    best_match = None
    best_score = 0
    
    for candidate in candidates:
        for variant in expected_variants:
            score = SequenceMatcher(None, variant.lower(), candidate.lower()).ratio()
            if score > best_score:
                best_match = candidate
                best_score = score

    is_valid = best_score > threshold
    return is_valid, best_match, best_score


def generate_name_variants(first_name, middle_name, last_name):
    """
    Generate different possible name variants for matching.
    
    Args:
        first_name (str): First name
        middle_name (str): Middle name (can be empty)
        last_name (str): Last name
        
    Returns:
        list: List of name variants
    """
    variants = [
        f"{first_name} {middle_name} {last_name}".strip(),
        f"{first_name} {last_name}".strip(),
        f"{last_name} {first_name}".strip(),
        f"{last_name}, {first_name}".strip(),
    ]
    
    # Add middle initial variant if middle name exists
    if middle_name:
        variants.append(f"{first_name} {middle_name[0]}. {last_name}".strip())
    
    # Clean up extra spaces
    return [v.replace("  ", " ").strip() for v in variants]


def find_document_file(images_dir, application_id, doc_type, extensions=['.jpg', '.png', '.jpeg', '.JPG', '.PNG', '.JPEG']):
    """
    Find document file with various possible extensions.
    
    Args:
        images_dir (str): Directory containing images
        application_id (str): Application ID
        doc_type (str): Document type ('id' or 'payslip')
        extensions (list): List of file extensions to try
        
    Returns:
        str or None: Path to found file, None if not found
    """
    # Try primary extension first
    primary_ext = '.jpg' if doc_type == 'id' else '.png'
    primary_path = os.path.join(images_dir, f"{application_id}_{doc_type}{primary_ext}")
    
    if os.path.exists(primary_path):
        return primary_path
    
    # Try alternative extensions
    for ext in extensions:
        alt_path = os.path.join(images_dir, f"{application_id}_{doc_type}{ext}")
        if os.path.exists(alt_path):
            return alt_path
    
    return None


def process_single_application(df, application_id, images_dir):
    """
    Process a single application's documents and validate them.
    
    Args:
        df (DataFrame): DataFrame containing application data
        application_id (str): Application ID to process
        images_dir (str): Directory containing document images
        
    Returns:
        tuple: (success, result_dict)
    """
    # Initialize document status flags
    found_id = False
    valid_id = False
    found_payslip = False
    valid_payslip = False
    
    # Get application data
    row = df.loc[df["application_id"] == application_id]
    if row.empty:
        print(f"⚠️ No record found for Application ID: {application_id}")
        return False, None

    # Extract name components
    first_name = str(row['first_name'].values[0])
    middle_name = str(row['middle_name'].values[0]) if pd.notna(row['middle_name'].values[0]) else ""
    last_name = str(row['last_name'].values[0])

    # Generate expected name variants
    expected_variants = generate_name_variants(first_name, middle_name, last_name)

    # Process ID document
    id_path = find_document_file(images_dir, application_id, 'id')
    if id_path:
        found_id = True
        candidates = analyze_id(id_path)
        
        if candidates:
            is_valid, best_match, best_score = match_names(expected_variants, candidates)
            if is_valid:
                valid_id = True
                print(f"✅ ID validated for {application_id}: {best_match} (score={best_score:.2f})")
            else:
                print(f"❌ ID name mismatch for {application_id}")
        else:
            print(f"❌ No names extracted from ID for {application_id}")
    else:
        print(f"❌ No ID document found for {application_id}")
        
    # Process payslip document
    payslip_path = find_document_file(images_dir, application_id, 'payslip')
    if payslip_path:
        found_payslip = True
        payslip_candidates = analyze_id(payslip_path)  # Extract names from payslip
        
        if payslip_candidates:
            is_payslip_name_valid, _, _ = match_names(expected_variants, payslip_candidates)
            
            if is_payslip_name_valid:
                net_pay = analyze_payslip(payslip_path)
                if net_pay:
                    valid_payslip = True
                    print(f"💰 Payslip validated for {application_id}: Net Pay = {net_pay}")
                else:
                    print(f"⚠️ No payslip data extracted for {application_id}")
            else:
                print(f"⚠️ Payslip name mismatch for {application_id}")
        else:
            print(f"⚠️ No names extracted from payslip for {application_id}")
    else:
        print(f"❌ No payslip document found for {application_id}")

    # Build result dictionary
    result = {
        "application_id": application_id,
        "found_id": found_id,
        "valid_id": valid_id,
        "found_payslip": found_payslip,
        "valid_payslip": valid_payslip,
    }

    return True, result


async def process_files(csv_path: str, zip_path: str, session_id: str, db: Session):
    """
    Main function to process CSV and ZIP files containing application data and documents.
    
    Args:
        csv_path (str): Path to CSV file containing application data
        zip_path (str): Path to ZIP file containing document images
        session_id (str): Session ID for database storage
        db (Session): Database session
        
    Returns:
        dict: Analysis results with validation statistics and details
    """
    try:
        # Load application data
        df = pd.read_csv(csv_path)
        print(f"📊 Loaded CSV with {len(df)} records")

        # Process documents in temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Extract document images
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            valid_applications = []
            rejected_applications = []
            processed_results = []
            detailed_results = {}

            # Process each application
            for _, row in df.iterrows():
                application_id = row["application_id"]
                
                success, result = process_single_application(df, application_id, temp_dir)
                
                if result:
                    processed_results.append(result)
                    detailed_results[application_id] = result
                
                # Apply validation criteria: must have ID and payslip documents with valid ID
                is_valid_application = (
                    result and 
                    result.get('found_id', False) and 
                    result.get('found_payslip', False) and 
                    result.get('valid_id', False)
                )

                if is_valid_application:
                    # Prepare data for database storage
                    row_dict = row.to_dict()
                    row_dict = clean_dict_for_json(row_dict)
                    
                    # Add net pay if available
                    if result and "net_pay" in result:
                        row_dict["net_pay"] = result["net_pay"]
                    
                    # Store in database
                    dashboard_row = models.DashboardData(
                        session_id=session_id,
                        row_data=row_dict
                    )
                    db.add(dashboard_row)
                    valid_applications.append(application_id)
                else:
                    rejected_applications.append(application_id)

            # Commit database changes
            db.commit()

            # Generate analysis summary
            analysis_results = {
                "total_applications": len(df),
                "validation_rate": len(valid_applications) / len(df) * 100 if len(df) > 0 else 0,
                "valid_app_ids": valid_applications,
                "rejected_app_ids": rejected_applications,
                "per_application_details": detailed_results
            }

            print(f"\n📌 Analysis Summary:")
            print(f"✅ Valid applications: {len(valid_applications)}")
            print(f"❌ Rejected applications: {len(rejected_applications)}")
            print(f"📈 Validation rate: {analysis_results['validation_rate']:.1f}%")

            return analysis_results

    except Exception as e:
        print(f"Error processing files: {str(e)}")
        db.rollback()
        raise e