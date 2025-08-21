export type Application = {
  id: number;
  status: string;
  riskScore: number;
  rationale: string;
  applicationDate: string;
  clientName: string;
  contactNumber: string;
  address: string;
  applicationId: string;
  bpiAccount: {
    accountNumber: string;
    accountName: string;
  };
  loanDetails: {
    purpose: string;
    amount: string;
  };
  email: string;
  aiConfidence: string;
  statusColor: string;
};

export interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}