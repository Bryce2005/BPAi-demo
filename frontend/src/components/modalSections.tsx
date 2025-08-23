// import { Building, DollarSign, User, FileText, Calendar, AlertCircle } from 'lucide-react';
// import type { ApplicationFormat } from '../shared/types';

// export interface ModalSection {
//   id: string;
//   title: string;
//   icon: React.ComponentType<any>;
//   iconColor: string;
//   iconBg?: string;
//   fields: Array<{
//     label: string;
//     getValue: (app: ApplicationFormat) => string;
//     className?: string;
//   }>;
// }

// export const modalSections: ModalSection[] = [
//   {
//     id: 'identifiers',
//     title: 'Identifiers',
//     icon: () => <span className="text-sm font-medium">#</span>,
//     iconColor: 'text-gray-600',
//     iconBg: 'bg-gray-100',
//     fields: [
//       {
//         label: 'Application ID',
//         getValue: (app) => app.applicationId
//       },
//       {
//         label: 'Application Date',
//         getValue: (app) => app.applicationDate
//       }
//     ]
//   },
//   {
//     id: 'bpiAccount',
//     title: 'BPI Account',
//     icon: Building,
//     iconColor: 'text-blue-600',
//     fields: [
//       {
//         label: 'Account Number',
//         getValue: (app) => app.bpiAccount.accountNumber
//       },
//       {
//         label: 'Account Name',
//         getValue: (app) => app.bpiAccount.accountName
//       }
//     ]
//   },
//   {
//     id: 'loanDetails',
//     title: 'Loan Details',
//     icon: DollarSign,
//     iconColor: 'text-green-600',
//     fields: [
//       {
//         label: 'Purpose',
//         getValue: (app) => app.loanDetails.purpose
//       },
//       {
//         label: 'Amount',
//         getValue: (app) => app.loanDetails.amount,
//         className: 'font-medium text-lg'
//       }
//     ]
//   },
//   {
//     id: 'client',
//     title: 'Client',
//     icon: User,
//     iconColor: 'text-purple-600',
//     fields: [
//       {
//         label: 'Name',
//         getValue: (app) => app.clientName
//       },
//       {
//         label: 'Email Address',
//         getValue: (app) => app.email
//       },
//       {
//         label: 'Contact Number',
//         getValue: (app) => app.contactNumber
//       }
//     ]
//   }
// ];

// export interface RightPanelSection {
//   id: string;
//   title: string;
//   icon: React.ComponentType<any>;
//   iconColor: string;
//   iconBg?: string;
//   renderContent: (app: Application) => React.ReactNode;
// }

// export const rightPanelSections: RightPanelSection[] = [
//   {
//     id: 'status',
//     title: 'Status',
//     icon: () => <span className="text-green-600">✓</span>,
//     iconColor: 'text-green-600',
//     iconBg: 'bg-green-100',
//     renderContent: (app) => (
//       <div className={`px-3 py-2 rounded-lg text-center font-medium ${app.statusColor}`}>
//         {app.status.toUpperCase()}
//       </div>
//     )
//   },
//   {
//     id: 'aiScore',
//     title: 'AI Confidence Score',
//     icon: AlertCircle,
//     iconColor: 'text-orange-600',
//     renderContent: (app) => {
//       const getRiskScoreColor = (score: number) => {
//         if (score >= 80) return 'text-red-600 bg-red-50';
//         if (score >= 60) return 'text-orange-600 bg-orange-50';
//         if (score >= 40) return 'text-yellow-600 bg-yellow-50';
//         return 'text-green-600 bg-green-50';
//       };
      
//       return (
//         <div className={`px-4 py-8 rounded-lg text-center ${getRiskScoreColor(app.riskScore)}`}>
//           <div className="text-3xl font-bold mb-2">{app.riskScore}</div>
//           <div className="text-sm font-medium">{app.aiConfidence}</div>
//         </div>
//       );
//     }
//   },
//   {
//     id: 'rationale',
//     title: 'Rationale',
//     icon: FileText,
//     iconColor: 'text-gray-600',
//     renderContent: (app) => (
//       <p className="text-gray-700">{app.rationale}</p>
//     )
//   }
// ];

// export const expandableSections = [
//   {
//     id: 'metadata',
//     title: 'Application Metadata',
//     icon: FileText
//   },
//   {
//     id: 'timeline',
//     title: 'Activity Timeline',
//     icon: Calendar
//   }
// ];