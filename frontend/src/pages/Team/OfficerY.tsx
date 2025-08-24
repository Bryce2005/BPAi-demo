import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { X, Eye, Phone, MapPin, FileText, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import GenericDataTable from '../../components/GenericDataTable';
import ApplicationDetailsModal from '../../components/AppDetails';
import type { LoanApplication } from '../../shared/types.ts';
import { applicationDataY } from '../../shared/data.ts';

const OfficerY: React.FC = () => {
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (item: any) => {
    navigate(`/application/${item.id}?tab=overview`);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  // Transform application data to match table expected format
  const transformedData = applicationDataY.map(app => ({
    ...app,
    status: app.risk_category,
    confidenceScore: Math.max(...app.probabilities),
    rationale: app.loan_purpose,
    applicationDate: new Date(app.application_date).toLocaleDateString(),
    clientName: `${app.first_name} ${app.last_name}`,
    contactNumber: app.contact_number,
    address: `${app.address_city}, ${app.address_province}`
  }));

  // Transform data for modal to match expected structure
  const transformForModal = (app: LoanApplication) => {
    return {
      applicationId: app.application_id,
      status: app.risk_category as 'Approved' | 'Rejected' | 'For Review' | 'Pending',
      confidenceScore: Math.max(...app.probabilities),
      rationale: app.loan_purpose,
      submissionDate: new Date(app.application_date).toLocaleDateString(),
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
    officer: 'Camille Reyes',
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
        key: 'confidenceScore',
        label: 'Confidence Score',
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
    scoreField: 'confidenceScore',
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
        label: 'Avg Confidence Score',
        value: (data: any[]) => {
          const total = data.length;
          if (total === 0) return 0;
          const sum = data.reduce((acc, app) => acc + Number(Math.max(...app.probabilities)) * 100, 2);
          return Math.round(sum / total);
        },
        description: (data: any[], value: number) => 'Confidence level',
        icon: <Users className="w-6 h-6 text-blue-600" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
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
    const originalApp = applicationDataY.find(app => app.application_id === item.application_id);
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
        // onViewDetails={handleViewDetails}
      />
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default OfficerY;