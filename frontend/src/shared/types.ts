// Define your Application interface
export interface ApplicationFormat {
  id: number;
  application_id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  contact_number: string;
  address_city: string;
  address_province: string;
  civil_status: string;
  dependents: number;
  gross_monthly_income: number;
  employment_type: string;
  years_of_stay: number;
  loan_amount_requested_php: number;
  loan_tenor_months: number;
  loan_purpose: string;
  credit_limit: number;
  bpi_loans_taken: number;
  bpi_successful_loans: number;
  bpi_avg_monthly_deposits: number;
  gcash_avg_monthly_deposits: number;
  data_usage_patterns: number;
  risk_category: 'Secure' | 'Unstable' | 'Critical' | 'Risky' | 'Default';
  score: number;
  risk_index_score: number;
  probabilities: number[];
  five_cs_importance: {
    Character: number;
    Capacity: number;
    Capital: number;
    Collateral: number;
    Conditions: number;
  };
  lime_explanation_available: boolean;
  shap_explanation_available: boolean;
  processed_at: string;
}

export interface ApplicationDetailsModalProps {
  application: ApplicationFormat | null;
  isOpen: boolean;
  onClose: () => void;
}