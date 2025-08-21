import type { Application } from './types';

export const applicationDataX: Application[] = [
  {
    id: 2,
    status: 'Approved',
    riskScore: 21,
    rationale: 'Requirements Complete',
    applicationDate: 'Aug 4, 2025 9:15 AM',
    clientName: 'Benjamin S. Castro',
    contactNumber: '098765432',
    address: 'Makati Central, Makati',
    applicationId: 'APP-2025-002',
    bpiAccount: {
      accountNumber: '9876-5432-10',
      accountName: 'Benjamin S. Castro'
    },
    loanDetails: {
      purpose: 'Business Expansion',
      amount: '₱500,000'
    },
    email: 'benjamin.castro@email.com',
    aiConfidence: 'Low Risk Profile',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 3,
    status: 'Pending',
    riskScore: 55,
    rationale: 'Awaiting Document Submission',
    applicationDate: 'Aug 5, 2025 11:30 AM',
    clientName: 'Claire D. Fernandez',
    contactNumber: '095555555',
    address: 'Ortigas Center, Pasig',
    applicationId: 'APP-2025-003',
    bpiAccount: {
      accountNumber: '1122-3344-55',
      accountName: 'Claire D. Fernandez'
    },
    loanDetails: {
      purpose: 'Home Renovation',
      amount: '₱250,000'
    },
    email: 'claire.fernandez@email.com',
    aiConfidence: 'Medium Risk Profile',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 4,
    status: 'In Review',
    riskScore: 68,
    rationale: 'Additional Verification Needed',
    applicationDate: 'Aug 6, 2025 2:05 PM',
    clientName: 'Daniel P. Santos',
    contactNumber: '096666666',
    address: 'Tondo, Manila',
    applicationId: 'APP-2025-004',
    bpiAccount: {
      accountNumber: '2233-4455-66',
      accountName: 'Daniel P. Santos'
    },
    loanDetails: {
      purpose: 'Vehicle Purchase',
      amount: '₱800,000'
    },
    email: 'daniel.santos@email.com',
    aiConfidence: 'Medium Risk Profile',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 5,
    status: 'Rejected',
    riskScore: 95,
    rationale: 'Insufficient Income',
    applicationDate: 'Aug 7, 2025 4:20 PM',
    clientName: 'Evelyn G. Reyes',
    contactNumber: '097777777',
    address: 'Fairview, QC',
    applicationId: 'APP-2025-005',
    bpiAccount: {
      accountNumber: '3344-5566-77',
      accountName: 'Evelyn G. Reyes'
    },
    loanDetails: {
      purpose: 'Medical Expenses',
      amount: '₱100,000'
    },
    email: 'evelyn.reyes@email.com',
    aiConfidence: 'High Risk Profile',
    statusColor: 'bg-red-100 text-red-800'
  },
  {
    id: 6,
    status: 'Approved',
    riskScore: 15,
    rationale: 'Requirements Complete',
    applicationDate: 'Aug 8, 2025 8:45 AM',
    clientName: 'Franklin H. Lim',
    contactNumber: '099999999',
    address: 'Alabang, Muntinlupa',
    applicationId: 'APP-2025-006',
    bpiAccount: {
      accountNumber: '4455-6677-88',
      accountName: 'Franklin H. Lim'
    },
    loanDetails: {
      purpose: 'Start-up Capital',
      amount: '₱2,000,000'
    },
    email: 'franklin.lim@email.com',
    aiConfidence: 'Low Risk Profile',
    statusColor: 'bg-green-100 text-green-800'
  }
];

export const applicationDataY: Application[] = [
  {
    id: 1,
    status: 'Pending',
    riskScore: 61,
    rationale: 'Awaiting Document Submission',
    applicationDate: 'Aug 9, 2025 10:00 AM',
    clientName: 'George H. Tan',
    contactNumber: '090123456',
    address: 'Quezon City, Metro Manila',
    applicationId: 'APP-2025-007',
    bpiAccount: {
      accountNumber: '5566-7788-99',
      accountName: 'George H. Tan'
    },
    loanDetails: {
      purpose: 'Education Expenses',
      amount: '₱120,000'
    },
    email: 'george.tan@email.com',
    aiConfidence: 'Medium Risk Profile',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 2,
    status: 'Approved',
    riskScore: 18,
    rationale: 'Requirements Complete',
    applicationDate: 'Aug 10, 2025 11:45 AM',
    clientName: 'Hannah I. Villa',
    contactNumber: '090234567',
    address: 'Taguig City, Metro Manila',
    applicationId: 'APP-2025-008',
    bpiAccount: {
      accountNumber: '6677-8899-00',
      accountName: 'Hannah I. Villa'
    },
    loanDetails: {
      purpose: 'Home Purchase',
      amount: '₱1,500,000'
    },
    email: 'hannah.villa@email.com',
    aiConfidence: 'Low Risk Profile',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 3,
    status: 'Rejected',
    riskScore: 88,
    rationale: 'Inconsistent Information',
    applicationDate: 'Aug 11, 2025 1:20 PM',
    clientName: 'Ian J. Cruz',
    contactNumber: '090345678',
    address: 'Pasay City, Metro Manila',
    applicationId: 'APP-2025-009',
    bpiAccount: {
      accountNumber: '7788-9900-11',
      accountName: 'Ian J. Cruz'
    },
    loanDetails: {
      purpose: 'Medical Expenses',
      amount: '₱200,000'
    },
    email: 'ian.cruz@email.com',
    aiConfidence: 'High Risk Profile',
    statusColor: 'bg-red-100 text-red-800'
  },
  {
    id: 4,
    status: 'In Review',
    riskScore: 72,
    rationale: 'Additional Verification Needed',
    applicationDate: 'Aug 12, 2025 3:55 PM',
    clientName: 'Jasmine K. Lim',
    contactNumber: '090456789',
    address: 'Mandaluyong City, Metro Manila',
    applicationId: 'APP-2025-010',
    bpiAccount: {
      accountNumber: '8899-0011-22',
      accountName: 'Jasmine K. Lim'
    },
    loanDetails: {
      purpose: 'Business Start-up',
      amount: '₱350,000'
    },
    email: 'jasmine.lim@email.com',
    aiConfidence: 'Medium Risk Profile',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 5,
    status: 'Approved',
    riskScore: 25,
    rationale: 'Requirements Complete',
    applicationDate: 'Aug 13, 2025 9:10 AM',
    clientName: 'Kyle L. Mercado',
    contactNumber: '090567890',
    address: 'Paranaque City, Metro Manila',
    applicationId: 'APP-2025-011',
    bpiAccount: {
      accountNumber: '9900-1122-33',
      accountName: 'Kyle L. Mercado'
    },
    loanDetails: {
      purpose: 'Vehicle Purchase',
      amount: '₱900,000'
    },
    email: 'kyle.mercado@email.com',
    aiConfidence: 'Low Risk Profile',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 6,
    status: 'Pending',
    riskScore: 49,
    rationale: 'Awaiting Bank Statement',
    applicationDate: 'Aug 14, 2025 1:05 PM',
    clientName: 'Lianna M. Reyes',
    contactNumber: '090678901',
    address: 'San Juan City, Metro Manila',
    applicationId: 'APP-2025-012',
    bpiAccount: {
      accountNumber: '0011-2233-44',
      accountName: 'Lianna M. Reyes'
    },
    loanDetails: {
      purpose: 'Home Renovation',
      amount: '₱300,000'
    },
    email: 'lianna.reyes@email.com',
    aiConfidence: 'Medium Risk Profile',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 7,
    status: 'Rejected',
    riskScore: 92,
    rationale: 'Poor Credit History',
    applicationDate: 'Aug 15, 2025 2:40 PM',
    clientName: 'Matthew N. Lopez',
    contactNumber: '090789012',
    address: 'Manila City, Metro Manila',
    applicationId: 'APP-2025-013',
    bpiAccount: {
      accountNumber: '1122-3344-55',
      accountName: 'Matthew N. Lopez'
    },
    loanDetails: {
      purpose: 'Debt Consolidation',
      amount: '₱450,000'
    },
    email: 'matthew.lopez@email.com',
    aiConfidence: 'High Risk Profile',
    statusColor: 'bg-red-100 text-red-800'
  },
  {
    id: 8,
    status: 'Approved',
    riskScore: 31,
    rationale: 'Requirements Complete',
    applicationDate: 'Aug 16, 2025 4:15 PM',
    clientName: 'Natalia O. Garcia',
    contactNumber: '090890123',
    address: 'Pasig City, Metro Manila',
    applicationId: 'APP-2025-014',
    bpiAccount: {
      accountNumber: '2233-4455-66',
      accountName: 'Natalia O. Garcia'
    },
    loanDetails: {
      purpose: 'Wedding Expenses',
      amount: '₱280,000'
    },
    email: 'natalia.garcia@email.com',
    aiConfidence: 'Low Risk Profile',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 9,
    status: 'In Review',
    riskScore: 58,
    rationale: 'Additional Information Required',
    applicationDate: 'Aug 17, 2025 9:30 AM',
    clientName: 'Olivia P. Santos',
    contactNumber: '090901234',
    address: 'Taguig City, Metro Manila',
    applicationId: 'APP-2025-015',
    bpiAccount: {
      accountNumber: '3344-5566-77',
      accountName: 'Olivia P. Santos'
    },
    loanDetails: {
      purpose: 'Small Business Loan',
      amount: '₱600,000'
    },
    email: 'olivia.santos@email.com',
    aiConfidence: 'Medium Risk Profile',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 10,
    status: 'Pending',
    riskScore: 75,
    rationale: 'Awaiting Guarantor Signature',
    applicationDate: 'Aug 18, 2025 11:00 AM',
    clientName: 'Paul Q. Torres',
    contactNumber: '091012345',
    address: 'Quezon City, Metro Manila',
    applicationId: 'APP-2025-016',
    bpiAccount: {
      accountNumber: '4455-6677-88',
      accountName: 'Paul Q. Torres'
    },
    loanDetails: {
      purpose: 'Car Repair',
      amount: '₱50,000'
    },
    email: 'paul.torres@email.com',
    aiConfidence: 'High Risk Profile',
    statusColor: 'bg-yellow-100 text-yellow-800'
  }
];
