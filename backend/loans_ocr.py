import os
import re
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest
from difflib import SequenceMatcher
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

import pdb

# set your endpoint and key from Azure portal
endpoint = os.getenv("AZURE_ENDPOINT")
key = os.getenv("AZURE_API_KEY")

# --- Initialize client ---
client = DocumentIntelligenceClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)

def extract_name_with_regex(text):
    """
    Simple heuristic to find names:
    - Lines with 2+ capitalized words
    - Excludes lines with ID, Address, Date, etc.
    """
    possible_names = []
    for line in text.split("\n"):
        line = line.strip()
        if len(line.split()) >= 2 and all(word[0].isupper() for word in line.split() if word.isalpha()):
            if not any(bad in line.lower() for bad in ["id", "address", "date", "birth", "sex"]):
                possible_names.append(line)
    return possible_names

def analyze_id(file_path):
    """
    Extract all possible (detected) names from the ID for validation
    """
    try:
        client = DocumentIntelligenceClient(endpoint=endpoint, credential=AzureKeyCredential(api_key))

        if not os.path.exists(file_path):
            print(f"❌ File '{file_path}' not found.")
            return None

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # Use OCR only
        poller = client.begin_analyze_document(
            model_id="prebuilt-read",
            body=file_bytes
        )
        ocr_result = poller.result()

        all_text = "\n".join([line.content for page in ocr_result.pages for line in page.lines])

        # Extract possible names
        names = extract_name_with_regex(all_text)
        if names:
            return names
        else:
            return []
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return []
    
def analyze_payslip(image_path: str):
    # --- Run OCR ---
    with open(image_path, "rb") as f:
        poller = client.begin_analyze_document(
            model_id="prebuilt-read",
            body=f
        )
    result = poller.result()

    # --- Gather extracted text ---
    extracted_text = []
    for page in result.pages:
        for line in page.lines:
            extracted_text.append(line.content)

    full_text = "\n".join(extracted_text)

    # --- Simple verification: check for common payslip keywords ---
    keywords = ["salary", "net pay", "gross", "earnings", "deductions"]
    found = [kw for kw in keywords if kw.lower() in full_text.lower()]

    if not found:
        print("❌ Could not verify this is a payslip.")
        return None

    # --- Extraction of Basic Salary and Net Pay ---
    def extract_value(patterns, text):
        """Try multiple regex patterns until one matches."""
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    # Patterns look for a label followed by a number (with commas/decimals)
    net_pay_patterns = [
        r"Net Pay\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
        r"Net Salary\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
        r"Take Home\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
        r"Net\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)",
        r"Total\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)"
    ]

    net_pay = extract_value(net_pay_patterns, full_text)
    
    return net_pay if net_pay else None

def match(expected_variants, candidates, threshold = 0.8):
    """
    Match read values through OCR to actual values (expected_variants)
    """
    best_match = None
    best_score = 0
    for cand in candidates:
        for variant in expected_variants:
            score = SequenceMatcher(None, variant.lower(), cand.lower()).ratio()
            if score > best_score:
                best_match = cand
                best_score = score

    is_valid = best_score > threshold
    return is_valid, best_match, best_score

def process_imgs(df, application_id, image_path, payslip_path=None):
    # get official name from df
    row = df.loc[df["application_id"] == application_id]
    first_name = str(row['first_name'].values[0])
    middle_name = str(row['middle_name'].values[0]) if pd.notna(row['middle_name'].values[0]) else ""
    last_name = str(row['last_name'].values[0])

    # generate possible expected name formats
    expected_variants = [
        f"{first_name} {middle_name} {last_name}".strip(),
        f"{first_name} {last_name}".strip(),
        f"{last_name} {first_name}".strip(),
        f"{last_name}, {first_name}".strip(),
        f"{first_name} {middle_name[0]}. {last_name}".strip() if middle_name else f"{first_name} {last_name}"
    ]
    expected_variants = [v.replace("  ", " ").strip() for v in expected_variants]  # clean double spaces

    # get OCR candidate names
    candidates = analyze_id(image_path)

    is_valid, best_match, best_score = match(expected_variants, candidates)
    if not is_valid:
        print(f"❌ ID '{image_path}' does not match with recorded name. Application removed.")
        df = df.drop(index = row.index) # drop row
        return False, df
    else:
        print(f"✅ Best match: {best_match} (score={best_score:.2f})")

    # process payslip
    if payslip_path:
        # verify if payslip is a match
        candidates_employeename = analyze_id(payslip_path)
        is_payslipvalid = match(expected_variants, candidates_employeename)
        if is_payslipvalid[0]:
            # check if there is a net pay
            net_pay = analyze_payslip(payslip_path)
            if net_pay:
                if "net_pay" not in df.columns:
                    df["net_pay"] = None
                df.loc[df["application_id"] == application_id, "net_pay"] = net_pay
                print(f"Payslip data added!")
            else:
                print(f"No relevant payslip data detected.")
        else:
            print(f"Name in payslip does not match recorded name. No payslip info added.")

    return is_valid, df