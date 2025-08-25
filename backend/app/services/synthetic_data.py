import random
import pandas as pd
import numpy as np
from faker import Faker
import os
from datetime import datetime

fake = Faker('en_PH')
Faker.seed(42) 
random.seed(42)

def generate_synthetic_data(num_rows, file_name='synthetic_data.csv', outdir='outdir'):
    if outdir:
        os.makedirs(outdir, exist_ok = True)
        
    data = []
    civil_status_choices = ["Single", "Married", "Separated", "Widowed"]
    residence_type_choices = ["Owned", "Rented", "Living with Relatives", "Others"]
    employment_type_choices = ["Salaried", "Self-Employed", "Freelancer", "Unemployed"]
    source_of_funds_choices = ["Salary", "Business Income", "Remittances", "Investments"]
    loan_purpose_choices = ["Business Expansion", "Education", "Home Renovation", "Medical", "Personal"]
    loan_tenor_choices = [4, 6, 8, 12]
    postpaid_plan_choices = ["None", "Basic Plan", "Premium Plan"]
    data_usage_choices = ["Low", "Medium", "High"]
    
    start_date = datetime(2025,1,1)
    end_date = datetime(2025, 8, 20)

    for i in range(1, num_rows+1):
        # Application form details (not used in ML)
        application_date = fake.date_between(start_date=start_date, end_date=end_date)
        date_str = application_date.strftime("%Y%m%d")
        application_id = f"APP-{date_str}-{random.randint(1000,9999)}"
        first_name = fake.first_name()
        middle_name = fake.first_name()[0] + "."
        last_name = fake.last_name()
        contact_number = "09" + "".join([str(random.randint(0, 9)) for _ in range(9)])
        email_address = fake.email()
        
        # Personal Information
        civil_status = random.choice(civil_status_choices)
        dependents = random.randint(0, 5)
        address_city = fake.city()
        address_province = fake.province()
        years_of_stay = random.randint(0, 30)
        residence_type = random.choice(residence_type_choices)
        employment_type = random.choice(employment_type_choices)

        # Financial Information (Trad)
        has_card = random.choice([True, False])
#         card_number = fake.credit_card_number() if has_card else None
        credit_limit = random.randint(5000, 50000) if has_card else None
        gross_monthly_income = round(random.uniform(10000, 200000), 2)
        source_of_funds = random.choice(source_of_funds_choices)

        # Financial Information (Alt)
        has_bpi_account = random.choice([True, False])
        bpi_account_number = (
            f"{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(10,99)}"
            if has_bpi_account else None
        )
        bpi_loans_taken = np.random.poisson(lam=2, size=1)[0] if has_bpi_account else None
        bpi_emi_payment = round(random.uniform(0, 50000), 2) if has_bpi_account else None
        bpi_avg_monthly_deposits = round(random.uniform(0, 50000), 2) if has_bpi_account else None
        bpi_avg_monthly_withdrawals = round(random.uniform(0, 50000), 2) if has_bpi_account else None
        bpi_frequency_of_transactions = random.randint(0, 50) if has_bpi_account else None
        bpi_successful_loans = random.randint(0, bpi_loans_taken) if has_bpi_account else None

        has_globe_number = random.choice([True, False])
#         globe_number = fake.phone_number() if has_globe_number else None
        prepaid_load_frequency = random.randint(0, 30) if has_globe_number else None
        postpaid_plan_history = random.choice(postpaid_plan_choices) if has_globe_number else None
        data_usage_patterns = random.choice(data_usage_choices) if has_globe_number else None

        has_gcash = random.choice([True, False])
#         gcash_number = fake.phone_number() if has_gcash else None
        gcash_avg_monthly_deposits = round(random.uniform(0, 30000), 2) if has_gcash else None
        gcash_avg_monthly_withdrawals = round(random.uniform(0, 30000), 2) if has_gcash else None
        gcash_frequency_of_transactions = random.randint(0, 50) if has_gcash else None

        # Loan Application Details
        loan_purpose = random.choice(loan_purpose_choices)
        loan_amount_requested_php = round(random.uniform(5000, 1000000), 2)
        loan_tenor_months = random.choice(loan_tenor_choices)

        data.append([
            application_id, application_date, first_name, middle_name, last_name, contact_number, email_address,
            civil_status, dependents, address_city, address_province, years_of_stay, residence_type, employment_type,
            credit_limit, gross_monthly_income, source_of_funds,
            bpi_avg_monthly_deposits, bpi_avg_monthly_withdrawals, bpi_frequency_of_transactions,
            bpi_loans_taken, bpi_emi_payment, bpi_successful_loans,
            prepaid_load_frequency, postpaid_plan_history, data_usage_patterns,
            gcash_avg_monthly_deposits, gcash_avg_monthly_withdrawals, gcash_frequency_of_transactions,
            # card_number, bpi_account_number, globe_number, gcash_number,
            loan_purpose, loan_amount_requested_php, loan_tenor_months
        ])
        
    columns = [
        "application_id", "application_date", "first_name", "middle_name", "last_name", "contact_number", "email_address",
        "civil_status", "dependents", "address_city", "address_province", "years_of_stay", "residence_type", "employment_type",
        "credit_limit", "gross_monthly_income", "source_of_funds",
        "bpi_avg_monthly_deposits", "bpi_avg_monthly_withdrawals", "bpi_frequency_of_transactions",
        "bpi_loans_taken", "bpi_emi_payment", "bpi_successful_loans",
        "prepaid_load_frequency", "postpaid_plan_history", "data_usage_patterns",
        "gcash_avg_monthly_deposits", "gcash_avg_monthly_withdrawals", "gcash_frequency_of_transactions",
        # "card_number", "globe_number", "gcash_number", "bpi_account_number",
        "loan_purpose", "loan_amount_requested_php", "loan_tenor_months"
    ]

    filepath = os.path.join(outdir, file_name)
    synthetic_df = pd.DataFrame(data, columns=columns)
    synthetic_df.to_csv(filepath, index=False)
    
    print(f'Synthetic dataset saved to {filepath}')
    return synthetic_df