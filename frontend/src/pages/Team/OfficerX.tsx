// import React, { useState } from 'react';
// import { X, Eye, Phone, MapPin, FileText, Users, AlertTriangle, CheckCircle } from 'lucide-react';
// import GenericDataTable from '../../components/GenericDataTable';
// import ApplicationDetailsModal from '../../components/AppDetails';

// // --- Type Definitions ---
// interface ApplicationFormat {
//   id: number;
//   application_id: string;
//   first_name: string;
//   last_name: string;
//   email_address: string;
//   contact_number: string;
//   address_city: string;
//   address_province: string;
//   civil_status: string;
//   dependents: number;
//   gross_monthly_income: number;
//   employment_type: string;
//   years_of_stay: number;
//   loan_amount_requested_php: number;
//   loan_tenor_months: number;
//   loan_purpose: string;
//   credit_limit: number;
//   bpi_loans_taken: number;
//   bpi_successful_loans: number;
//   bpi_avg_monthly_deposits: number;
//   gcash_avg_monthly_deposits: number;
//   data_usage_patterns: number;
//   risk_category: 'Pass' | 'Especially Mentioned' | 'Doubtful' | 'Substandard Review' | 'Loss';
//   score: number;
//   risk_index_score: number;
//   probabilities: number[];
//   five_cs_importance: {
//     Character: number;
//     Capacity: number;
//     Capital: number;
//     Collateral: number;
//     Conditions: number;
//   };
//   lime_explanation_available: boolean;
//   shap_explanation_available: boolean;
//   processed_at: string;
// }

// // --- Mock Data ---
// const applicationData: ApplicationFormat[] = [
//   {
//     id: 1,
//     application_id: 'APP-2024-001',
//     first_name: 'George H.',
//     last_name: 'Tan',
//     email_address: 'george.tan@email.com',
//     contact_number: '09012345678',
//     address_city: 'Quezon City',
//     address_province: 'Metro Manila',
//     civil_status: 'Single',
//     dependents: 0,
//     gross_monthly_income: 35000,
//     employment_type: 'Regular',
//     years_of_stay: 5,
//     loan_amount_requested_php: 100000,
//     loan_tenor_months: 12,
//     loan_purpose: 'Home Improvement',
//     credit_limit: 100000,
//     bpi_loans_taken: 2,
//     bpi_successful_loans: 2,
//     bpi_avg_monthly_deposits: 25000,
//     gcash_avg_monthly_deposits: 10000,
//     data_usage_patterns: 0.7,
//     risk_category: 'Substandard Review',
//     score: 61,
//     risk_index_score: 0.61,
//     probabilities: [0.1, 0.15, 0.25, 0.3, 0.2],
//     five_cs_importance: {
//       Character: 0.8,
//       Capacity: 0.9,
//       Capital: 0.6,
//       Collateral: 0.3,
//       Conditions: 0.5,
//     },
//     lime_explanation_available: true,
//     shap_explanation_available: true,
//     processed_at: '2024-08-09T10:00:00Z',
//   },
//   {
//     id: 2,
//     application_id: 'APP-2024-002',
//     first_name: 'Hannah L.',
//     last_name: 'Villa',
//     email_address: 'hannah.villa@email.com',
//     contact_number: '09023456789',
//     address_city: 'Taguig City',
//     address_province: 'Metro Manila',
//     civil_status: 'Married',
//     dependents: 2,
//     gross_monthly_income: 75000,
//     employment_type: 'Regular',
//     years_of_stay: 8,
//     loan_amount_requested_php: 50000,
//     loan_tenor_months: 6,
//     loan_purpose: 'Emergency Fund',
//     credit_limit: 200000,
//     bpi_loans_taken: 1,
//     bpi_successful_loans: 1,
//     bpi_avg_monthly_deposits: 60000,
//     gcash_avg_monthly_deposits: 15000,
//     data_usage_patterns: 0.9,
//     risk_category: 'Pass',
//     score: 18,
//     risk_index_score: 0.18,
//     probabilities: [0.9, 0.05, 0.03, 0.01, 0.01],
//     five_cs_importance: {
//       Character: 0.9,
//       Capacity: 0.95,
//       Capital: 0.8,
//       Collateral: 0.7,
//       Conditions: 0.8,
//     },
//     lime_explanation_available: true,
//     shap_explanation_available: true,
//     processed_at: '2024-08-10T11:45:00Z',
//   },
//   {
//     id: 3,
//     application_id: 'APP-2024-003',
//     first_name: 'Ian J.',
//     last_name: 'Cruz',
//     email_address: 'ian.cruz@email.com',
//     contact_number: '09034567890',
//     address_city: 'Pasay City',
//     address_province: 'Metro Manila',
//     civil_status: 'Divorced',
//     dependents: 0,
//     gross_monthly_income: 40000,
//     employment_type: 'Freelance',
//     years_of_stay: 2,
//     loan_amount_requested_php: 500000,
//     loan_tenor_months: 60,
//     loan_purpose: 'Business Expansion',
//     credit_limit: 30000,
//     bpi_loans_taken: 3,
//     bpi_successful_loans: 0,
//     bpi_avg_monthly_deposits: 5000,
//     gcash_avg_monthly_deposits: 20000,
//     data_usage_patterns: 0.5,
//     risk_category: 'Loss',
//     score: 88,
//     risk_index_score: 0.88,
//     probabilities: [0.05, 0.05, 0.1, 0.2, 0.6],
//     five_cs_importance: {
//       Character: 0.1,
//       Capacity: 0.2,
//       Capital: 0.3,
//       Collateral: 0.1,
//       Conditions: 0.4,
//     },
//     lime_explanation_available: true,
//     shap_explanation_available: true,
//     processed_at: '2024-08-11T13:20:00Z',
//   },
//   {
//     id: 4,
//     application_id: 'APP-2024-004',
//     first_name: 'Jasmine K.',
//     last_name: 'Lim',
//     email_address: 'jasmine.lim@email.com',
//     contact_number: '09045678901',
//     address_city: 'Mandaluyong City',
//     address_province: 'Metro Manila',
//     civil_status: 'Single',
//     dependents: 1,
//     gross_monthly_income: 60000,
//     employment_type: 'Regular',
//     years_of_stay: 3,
//     loan_amount_requested_php: 350000,
//     loan_tenor_months: 36,
//     loan_purpose: 'Car Purchase',
//     credit_limit: 150000,
//     bpi_loans_taken: 1,
//     bpi_successful_loans: 1,
//     bpi_avg_monthly_deposits: 45000,
//     gcash_avg_monthly_deposits: 8000,
//     data_usage_patterns: 0.8,
//     risk_category: 'Especially Mentioned',
//     score: 72,
//     risk_index_score: 0.72,
//     probabilities: [0.2, 0.3, 0.1, 0.25, 0.15],
//     five_cs_importance: {
//       Character: 0.6,
//       Capacity: 0.7,
//       Capital: 0.5,
//       Collateral: 0.6,
//       Conditions: 0.7,
//     },
//     lime_explanation_available: true,
//     shap_explanation_available: true,
//     processed_at: '2024-08-12T15:55:00Z',
//   },
//   {
//     id: 5,
//     application_id: 'APP-2024-005',
//     first_name: 'Kyle L.',
//     last_name: 'Mercado',
//     email_address: 'kyle.mercado@email.com',
//     contact_number: '09056789012',
//     address_city: 'Paranaque City',
//     address_province: 'Metro Manila',
//     civil_status: 'Married',
//     dependents: 3,
//     gross_monthly_income: 85000,
//     employment_type: 'Regular',
//     years_of_stay: 10,
//     loan_amount_requested_php: 120000,
//     loan_tenor_months: 24,
//     loan_purpose: 'Vacation',
//     credit_limit: 250000,
//     bpi_loans_taken: 0,
//     bpi_successful_loans: 0,
//     bpi_avg_monthly_deposits: 75000,
//     gcash_avg_monthly_deposits: 12000,
//     data_usage_patterns: 0.95,
//     risk_category: 'Pass',
//     score: 25,
//     risk_index_score: 0.25,
//     probabilities: [0.85, 0.1, 0.03, 0.01, 0.01],
//     five_cs_importance: {
//       Character: 0.9,
//       Capacity: 0.9,
//       Capital: 0.85,
//       Collateral: 0.75,
//       Conditions: 0.9,
//     },
//     lime_explanation_available: true,
//     shap_explanation_available: true,
//     processed_at: '2024-08-13T09:10:00Z',
//   },
//   {
//     id: 6,
//     application_id: 'APP-2024-006',
//     first_name: 'Matthew',
//     last_name: 'Lopez',
//     email_address: 'matthew.lopez@email.com',
//     contact_number: '+63 907 890 1234',
//     address_city: 'Manila City',
//     address_province: 'Metro Manila',
//     civil_status: 'Single',
//     dependents: 1,
//     gross_monthly_income: 20000,
//     employment_type: 'Contractual',
//     years_of_stay: 1,
//     loan_amount_requested_php: 450000,
//     loan_tenor_months: 48,
//     loan_purpose: 'Debt Consolidation',
//     credit_limit: 50000,
//     bpi_loans_taken: 4,
//     bpi_successful_loans: 1,
//     bpi_avg_monthly_deposits: 15000,
//     gcash_avg_monthly_deposits: 5000,
//     data_usage_patterns: 0.3,
//     risk_category: 'Doubtful',
//     score: 92,
//     risk_index_score: 0.92,
//     probabilities: [0.01, 0.02, 0.05, 0.10, 0.82],
//     five_cs_importance: {
//       Character: -0.9,
//       Capacity: -0.7,
//       Capital: -0.4,
//       Collateral: -0.2,
//       Conditions: -0.5,
//     },
//     lime_explanation_available: true,
//     shap_explanation_available: true,
//     processed_at: '2024-08-25T14:40:00Z',
//   },
// ];

// // --- Main Component ---
// const OfficerX: React.FC = () => {
//   const [selectedApplication, setSelectedApplication] = useState<ApplicationFormat | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleViewDetails = (application: ApplicationFormat) => {
//     setSelectedApplication(application);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedApplication(null);
//   };

//   // Transform application data to match OfficerY's expected format
//   const transformedData = applicationData.map(app => ({
//     ...app,
//     status: app.risk_category,
//     riskScore: app.score,
//     rationale: app.loan_purpose,
//     applicationDate: new Date(app.processed_at).toLocaleDateString(),
//     clientName: `${app.first_name} ${app.last_name}`,
//     contactNumber: app.contact_number,
//     address: `${app.address_city}, ${app.address_province}`
//   }));

//   // Configuration matching OfficerY exactly
//   const tableConfig: any = {
//     title: 'Applications',
//     icon: (
//       <svg fill="currentColor" viewBox="0 0 20 20" className="text-gray-600 w-5 h-5">
//         <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
//       </svg>
//     ),
//     columns: [
//       {
//         key: 'status',
//         label: 'Status',
//         type: 'status'
//       },
//       {
//         key: 'riskScore',
//         label: 'Risk Score',
//         type: 'score'
//       },
//       {
//         key: 'rationale',
//         label: 'Rationale',
//         type: 'text',
//         className: 'max-w-xs truncate'
//       },
//       {
//         key: 'applicationDate',
//         label: 'Application Date',
//         type: 'text'
//       },
//       {
//         key: 'clientName',
//         label: 'Client Name',
//         type: 'text',
//         className: 'font-medium'
//       },
//       {
//         key: 'contactNumber',
//         label: 'Contact & Address',
//         type: 'text',
//         render: (value: string, item: any) => (
//           <div className="flex flex-col space-y-1">
//             <div className="flex items-center text-sm">
//               <Phone className="w-3 h-3 mr-1 text-gray-500" />
//               {value}
//             </div>
//             <div className="flex items-center text-sm">
//               <MapPin className="w-3 h-3 mr-1 text-gray-500" />
//               {item.address}
//             </div>
//           </div>
//         )
//       },
//       // {
//       //   key: 'actions',
//       //   label: 'Actions',
//       //   type: 'action',
//       //   action: (item: any) => (
//       //     <Eye
//       //       className="w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-500 transition-colors"
//       //       onClick={(e) => {
//       //         e.stopPropagation();
//       //         handleViewDetails(item);
//       //       }}
//       //     />
//       //   )
//       // }
//     ],
//     filters: [
//       {
//         key: 'status',
//         label: 'Status',
//         type: 'dropdown'
//       },
//       {
//         key: 'date',
//         label: 'Date',
//         type: 'date'
//       },
//       {
//         key: 'search',
//         label: 'Search',
//         type: 'search',
//         placeholder: 'Search...'
//       }
//     ],
//     searchableFields: ['clientName', 'contactNumber', 'address', 'rationale'],
//     statusField: 'status',
//     statusOptions: ['Pass', 'Especially Mentioned', 'Doubtful', 'Substandard Review', 'Loss'],
//     statusColors: {
//       'Pass': 'bg-green-100 text-green-800 border-green-200',
//       'Loss': 'bg-red-100 text-red-800 border-red-200',
//       'Substandard Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       'Especially Mentioned': 'bg-blue-100 text-blue-800 border-blue-200',
//       'Doubtful': 'bg-purple-100 text-purple-800 border-purple-200',
//     },
//     scoreField: 'riskScore',
//     scoreColorRanges: [
//       { max: 30, className: 'text-green-600 font-semibold' },
//       { max: 60, className: 'text-yellow-600 font-semibold' },
//       { max: 100, className: 'text-red-600 font-semibold' }
//     ],
//     summaryStats: [
//       {
//         label: 'Total Applications',
//         value: (data: any[]) => data.length,
//         description: (data: any[], value: number) => 'All time',
//         icon: <FileText className="w-6 h-6 text-gray-600" />,
//         color: 'text-gray-900',
//         bgColor: 'bg-gray-100'
//       },
//       {
//         label: 'Approved',
//         value: (data: any[]) => data.filter(app => app.status === 'Pass').length,
//         description: (data: any[], value: number) => {
//           const total = data.length;
//           const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
//           return `${percentage}% approval rate`;
//         },
//         icon: <CheckCircle className="w-6 h-6 text-green-600" />,
//         color: 'text-green-600',
//         bgColor: 'bg-green-100'
//       },
//       {
//         label: 'Needs Attention',
//         value: (data: any[]) => {
//           const especiallyMentioned = data.filter(app => app.status === 'Especially Mentioned').length;
//           const substandard = data.filter(app => app.status === 'Substandard Review').length;
//           const doubtful = data.filter(app => app.status === 'Doubtful').length;
//           return especiallyMentioned + substandard + doubtful;
//         },
//         description: (data: any[], value: number) => 'Require review',
//         icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
//         color: 'text-yellow-600',
//         bgColor: 'bg-yellow-100'
//       },
//       {
//         label: 'Rejected',
//         value: (data: any[]) => {
//           const loss = data.filter(app => app.status === 'Loss').length;
//           return loss;
//         },
//          description: (data: any[], value: number) => {
//           const total = data.length;
//           const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
//           return `${percentage}% rejection rate`;
//         },
//         icon: <X className="w-6 h-6 text-red-600" />,
//         color: 'text-red-600',
//         bgColor: 'bg-red-100'
//       },
//       {
//         label: 'Avg Risk Score',
//         value: (data: any[]) => {
//           const total = data.length;
//           if (total === 0) return 0;
//           const sum = data.reduce((acc, app) => acc + app.riskScore, 0);
//           return Math.round(sum / total);
//         },
//         description: (data: any[], value: number) => 'Risk assessment',
//         icon: <Users className="w-6 h-6 text-red-600" />,
//         color: 'text-red-600',
//         bgColor: 'bg-red-100'
//       }
//     ],
//     charts: [
//       {
//         title: 'Status Distribution',
//         type: 'status',
//         categories: [
//           {
//             label: 'Pass',
//             filter: (item: any) => item.status === 'Pass',
//             color: 'green',
//             bgColor: 'bg-green-500'
//           },
//           {
//             label: 'Especially Mentioned',
//             filter: (item: any) => item.status === 'Especially Mentioned',
//             color: 'blue',
//             bgColor: 'bg-blue-500'
//           },
//           {
//             label: 'Doubtful',
//             filter: (item: any) => item.status === 'Doubtful',
//             color: 'purple',
//             bgColor: 'bg-purple-500'
//           },
//           {
//             label: 'Substandard Review',
//             filter: (item: any) => item.status === 'Substandard Review',
//             color: 'yellow',
//             bgColor: 'bg-yellow-500'
//           },
//           {
//             label: 'Loss',
//             filter: (item: any) => item.status === 'Loss',
//             color: 'red',
//             bgColor: 'bg-red-500'
//           }
//         ]
//       },
//       {
//         title: 'Risk Analysis',
//         type: 'risk',
//         categories: [
//           {
//             label: 'Low Risk (≤30)',
//             filter: (item: any) => item.riskScore <= 30,
//             color: 'green',
//             bgColor: 'bg-green-500'
//           },
//           {
//             label: 'Medium Risk (31-60)',
//             filter: (item: any) => item.riskScore > 30 && item.riskScore <= 60,
//             color: 'yellow',
//             bgColor: 'bg-yellow-500'
//           },
//           {
//             label: 'High Risk (>60)',
//             filter: (item: any) => item.riskScore > 60,
//             color: 'red',
//             bgColor: 'bg-red-500'
//           }
//         ]
//       }
//     ],
//     cardDisplayFields: {
//       title: 'clientName',
//       subtitle: 'applicationDate',
//       description: 'rationale',
//       additionalFields: [
//         {
//           key: 'contactNumber',
//           icon: <Phone className="w-3 h-3 text-Red-500" />,
//           render: (value: string) => value
//         },
//         {
//           key: 'address',
//           icon: <MapPin className="w-3 h-3 text-gray-500" />,
//           render: (value: string) => value
//         }
//       ]
//     }
//   };

//   const handleRowClick = (item: any) => {
//     const originalApp = applicationData.find(app => app.application_id === item.application_id);
//     if (originalApp) handleViewDetails(originalApp);
//   };

//   return (
//     <div>
//       <GenericDataTable
//         data={transformedData}
//         config={tableConfig}
//         onRowClick={handleRowClick}
//       />
//       <ApplicationDetailsModal
//         application={selectedApplication}
//         isOpen={isModalOpen}
//         onClose={closeModal}
//       />
//     </div>
//   );
// };

// export default OfficerX;

import React, { useState } from 'react';
import { X, Eye, Phone, MapPin, FileText, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import GenericDataTable from '../../components/GenericDataTable';
import ApplicationDetailsModal from '../../components/AppDetails';
import type { ApplicationFormat } from '../../shared/types.ts';
import { applicationDataX } from '../../shared/data.ts';

const OfficerX: React.FC = () => {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationFormat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (application: ApplicationFormat) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  // Transform application data to match table expected format
  const transformedData = applicationDataX.map(app => ({
    ...app,
    status: app.risk_category,
    riskScore: app.score,
    rationale: app.loan_purpose,
    applicationDate: new Date(app.processed_at).toLocaleDateString(),
    clientName: `${app.first_name} ${app.last_name}`,
    contactNumber: app.contact_number,
    address: `${app.address_city}, ${app.address_province}`
  }));

  // Transform data for modal to match expected structure
  const transformForModal = (app: ApplicationFormat) => {
    return {
      applicationId: app.application_id,
      status: app.risk_category as 'Approved' | 'Rejected' | 'For Review' | 'Pending',
      riskScore: app.score,
      rationale: app.loan_purpose,
      submissionDate: new Date(app.processed_at).toLocaleDateString(),
      fullName: `${app.first_name} ${app.last_name}`,
      email: app.email_address,
      phoneNumber: app.contact_number,
      civilStatus: app.civil_status,
      loanAmount: app.loan_amount_requested_php,
      loanPurpose: app.loan_purpose,
      loanTenor: app.loan_tenor_months,
      monthlyIncome: app.gross_monthly_income
    };
  };

  // Table configuration
  const tableConfig: any = {
    title: 'Applications',
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20" className="text-gray-600 w-5 h-5">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
    columns: [
      {
        key: 'status',
        label: 'Status',
        type: 'status'
      },
      {
        key: 'riskScore',
        label: 'Risk Score',
        type: 'score'
      },
      {
        key: 'rationale',
        label: 'Rationale',
        type: 'text',
        className: 'max-w-xs truncate'
      },
      {
        key: 'applicationDate',
        label: 'Application Details',
        type: 'text',
        render: (value: string, item: any) => (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm">
              {item.application_id}
            </div>
            <div className="flex items-center text-sm">
              {value}
            </div>
          </div>
        )
      },
      {
        key: 'clientName',
        label: 'Client Name',
        type: 'text',
        className: 'font-medium'
      },
      {
        key: 'contactNumber',
        label: 'Contact & Address',
        type: 'text',
        render: (value: string, item: any) => (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="w-3 h-3 mr-1 text-gray-500" />
              {value}
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-3 h-3 mr-1 text-gray-500" />
              {item.address}
            </div>
          </div>
        )
      }
    ],
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'dropdown'
      },
      {
        key: 'date',
        label: 'Date',
        type: 'date'
      },
      {
        key: 'search',
        label: 'Search',
        type: 'search',
        placeholder: 'Search...'
      }
    ],
    searchableFields: ['clientName', 'contactNumber', 'address', 'rationale'],
    statusField: 'status',
    statusOptions: ['Secure', 'Unstable', 'Risky', 'Critical', 'Default'],
    statusColors: {
      'Secure': 'bg-green-100 text-green-800 border-green-200',
      'Unstable': 'bg-red-100 text-red-800 border-red-200',
      'Risky': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Critical': 'bg-blue-100 text-blue-800 border-blue-200',
      'Default': 'bg-purple-100 text-purple-800 border-purple-200',
    },
    scoreField: 'riskScore',
    scoreColorRanges: [
      { max: 30, className: 'text-green-600 font-semibold' },
      { max: 60, className: 'text-yellow-600 font-semibold' },
      { max: 100, className: 'text-red-600 font-semibold' }
    ],
    summaryStats: [
      {
        label: 'Total Applications',
        value: (data: any[]) => data.length,
        description: (data: any[], value: number) => 'All time',
        icon: <FileText className="w-6 h-6 text-gray-600" />,
        color: 'text-gray-900',
        bgColor: 'bg-gray-100'
      },
      {
        label: 'Approved',
        value: (data: any[]) => data.filter(app => app.status === 'Secure').length,
        description: (data: any[], value: number) => {
          const total = data.length;
          const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
          return `${percentage}% approval rate`;
        },
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        label: 'Needs Attention',
        value: (data: any[]) => {
          const unstable = data.filter(app => app.status === 'Unstable').length;
          const risky = data.filter(app => app.status === 'Risky').length;
          const critical = data.filter(app => app.status === 'Critical').length;
          return unstable + risky + critical;
        },
        description: (data: any[], value: number) => 'Require review',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        label: 'Rejected',
        value: (data: any[]) => {
          const loss = data.filter(app => app.status === 'Default').length;
          return loss;
        },
         description: (data: any[], value: number) => {
          const total = data.length;
          const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
          return `${percentage}% rejection rate`;
        },
        icon: <X className="w-6 h-6 text-red-600" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      {
        label: 'Avg Risk Score',
        value: (data: any[]) => {
          const total = data.length;
          if (total === 0) return 0;
          const sum = data.reduce((acc, app) => acc + app.riskScore, 0);
          return Math.round(sum / total);
        },
        description: (data: any[], value: number) => 'Risk assessment',
        icon: <Users className="w-6 h-6 text-red-600" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ],
    charts: [
      {
        title: 'Status Distribution',
        type: 'status',
        categories: [
          {
            label: 'Pass',
            filter: (item: any) => item.status === 'Pass',
            color: 'green',
            bgColor: 'bg-green-500'
          },
          {
            label: 'Especially Mentioned',
            filter: (item: any) => item.status === 'Especially Mentioned',
            color: 'blue',
            bgColor: 'bg-blue-500'
          },
          {
            label: 'Doubtful',
            filter: (item: any) => item.status === 'Doubtful',
            color: 'purple',
            bgColor: 'bg-purple-500'
          },
          {
            label: 'Substandard Review',
            filter: (item: any) => item.status === 'Substandard Review',
            color: 'yellow',
            bgColor: 'bg-yellow-500'
          },
          {
            label: 'Loss',
            filter: (item: any) => item.status === 'Loss',
            color: 'red',
            bgColor: 'bg-red-500'
          }
        ]
      },
      {
        title: 'Risk Analysis',
        type: 'risk',
        categories: [
          {
            label: 'Low Risk (≤30)',
            filter: (item: any) => item.riskScore <= 30,
            color: 'green',
            bgColor: 'bg-green-500'
          },
          {
            label: 'Medium Risk (31-60)',
            filter: (item: any) => item.riskScore > 30 && item.riskScore <= 60,
            color: 'yellow',
            bgColor: 'bg-yellow-500'
          },
          {
            label: 'High Risk (>60)',
            filter: (item: any) => item.riskScore > 60,
            color: 'red',
            bgColor: 'bg-red-500'
          }
        ]
      }
    ],
    cardDisplayFields: {
      title: 'clientName',
      subtitle: 'applicationDate',
      description: 'rationale',
      additionalFields: [
        {
          key: 'contactNumber',
          icon: <Phone className="w-3 h-3 text-gray-500" />,
          render: (value: string) => value
        },
        {
          key: 'address',
          icon: <MapPin className="w-3 h-3 text-gray-500" />,
          render: (value: string) => value
        }
      ]
    }
  };

  const handleRowClick = (item: any) => {
    // Find the original application data using application_id
    const originalApp = applicationDataX.find(app => app.application_id === item.application_id);
    if (originalApp) {
      // Transform the data to match what the modal expects
      const modalData = transformForModal(originalApp);
      console.log('Modal data:', modalData); // Debug log
      setSelectedApplication(modalData as any);
      setIsModalOpen(true);
    }
  };

  return (
    <div>
      <GenericDataTable
        data={transformedData}
        config={tableConfig}
        onRowClick={handleRowClick}
      />
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default OfficerX;