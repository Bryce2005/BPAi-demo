export interface LoanApplication {
  application_id: string;
  application_date: string; // ISO or MM/DD/YYYY
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  contact_number: string | number;
  email_address: string;

  // Personal Info
  civil_status: string;
  dependents: number;
  address_city: string;
  address_province: string;
  years_of_stay: number;
  residence_type: string;

  // Employment & Income
  employment_type: string;
  credit_limit?: number | null;
  gross_monthly_income: number;
  source_of_funds: string;

  // Bank Data (BPI)
  bpi_avg_monthly_deposits?: number | null;
  bpi_avg_monthly_withdrawals?: number | null;
  bpi_frequency_of_transactions?: number | null;
  bpi_loans_taken?: number | null;
  bpi_emi_payment?: number | null;
  bpi_successful_loans?: number | null;

  // E-wallet / Telecom
  prepaid_load_frequency?: number | null;
  postpaid_plan_history?: string | null;
  data_usage_patterns?: string | null;
  gcash_avg_monthly_deposits?: number | null;
  gcash_avg_monthly_withdrawals?: number | null;
  gcash_frequency_of_transactions?: number | null;

  // Loan Request
  loan_purpose: string;
  loan_amount_requested_php: number;
  loan_tenor_months: number;

  // Risk Model
  risk_category: "Pass" | "Especially Mentioned" | "Substandard" | "Doubtful" | "Loss";
  probabilities: number[]; 
}


export interface ApplicationDetailsModalProps {
  application: LoanApplication | null;
  isOpen: boolean;
  onClose: () => void;
}