import React, { useState } from 'react';
import { Eye, Phone, MapPin, FileText, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import ApplicationDetailsModal from '../../components/AppDetails';
import GenericDataTable, { type TableConfig, type BaseDataItem } from '../../components/GenericDataTable';
import type { Application } from '../../shared/types';
import { applicationDataX } from '../../shared/data';


const OfficerX: React.FC = () => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };
  // Your application data
  //   const applications: Application[] = [
  //   {
  //     id: 1,
  //     status: 'Rejected',
  //     riskScore: 89,
  //     rationale: 'Requirements Complete',
  //     applicationDate: 'Aug 3, 2025 6:54 PM',
  //     clientName: 'Arabella B. Isles',
  //     contactNumber: '091234567',
  //     address: 'Univ Dorm, QC'
  //   },
  //   {
  //     id: 2,
  //     status: 'Rejected',
  //     riskScore: 87,
  //     rationale: 'High Risk Profile',
  //     applicationDate: 'Aug 2, 2025 2:30 PM',
  //     clientName: 'Marcus Chen',
  //     contactNumber: '091234568',
  //     address: 'Makati City, MM'
  //   },
  //   {
  //     id: 3,
  //     status: 'For Review',
  //     riskScore: 45,
  //     rationale: 'Additional Documentation Required',
  //     applicationDate: 'Aug 1, 2025 10:15 AM',
  //     clientName: 'Sofia Rodriguez',
  //     contactNumber: '091234569',
  //     address: 'BGC, Taguig'
  //   },
  //   {
  //     id: 4,
  //     status: 'Pending',
  //     riskScore: 62,
  //     rationale: 'Under Assessment',
  //     applicationDate: 'Jul 31, 2025 4:20 PM',
  //     clientName: 'John Martinez',
  //     contactNumber: '091234570',
  //     address: 'Ortigas, Pasig'
  //   },
  //   {
  //     id: 5,
  //     status: 'Approved',
  //     riskScore: 28,
  //     rationale: 'Low Risk, Complete Documents',
  //     applicationDate: 'Jul 30, 2025 11:45 AM',
  //     clientName: 'Elena Vasquez',
  //     contactNumber: '091234571',
  //     address: 'Alabang, Muntinlupa'
  //   }
  // ];
  // Configuration for the table
  const tableConfig: TableConfig<Application> = {
    title: 'Applications',
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20" className="text-gray-600">
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
        className: 'max-w-xs'
      },
      {
        key: 'applicationDate',
        label: 'Application Date',
        type: 'text'
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
        type: 'contact'
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
        placeholder: 'Search client name...'
      }
    ],
    searchableFields: ['clientName', 'contactNumber', 'address', 'rationale'],
    statusField: 'status',
    statusOptions: ['Approved', 'Rejected', 'For Review', 'Pending'],
    statusColors: {
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'For Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pending': 'bg-blue-100 text-blue-800 border-blue-200'
    },
    scoreField: 'riskScore',
    scoreColorRanges: [
      { max: 30, className: 'text-green-600 font-semibold' },
      { max: 60, className: 'text-yellow-600 font-semibold' },
      { max: 100, className: 'text-red-600 font-semibold' }
    ],
    // Summary view configuration
    summaryStats: [
      {
        label: 'Total Applications',
        value: (data: Application[]) => data.length,
        description: (data: Application[], value: number | string) => 'All time',
        icon: (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'text-gray-900',
        bgColor: 'bg-gray-100'
      },
      {
        label: 'Approved',
        value: (data: Application[]) => data.filter(app => app.status === 'Approved').length,
        description: (data: Application[], value: number | string) => {
          const total = data.length;
          const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
          return `+${percentage}% success rate`;
        },
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        label: 'Needs Attention',
        value: (data: Application[]) => {
          const forReview = data.filter(app => app.status === 'For Review').length;
          const pending = data.filter(app => app.status === 'Pending').length;
          return forReview + pending;
        },
        description: (data: Application[], value: number | string) => 'Require review',
        icon: (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        label: 'Avg Risk Score',
        value: (data: Application[]) => {
          const total = data.length;
          if (total === 0) return 0;
          const sum = data.reduce((acc, app) => acc + app.riskScore, 0);
          return Math.round(sum / total);
        },
        description: (data: Application[], value: number | string) => 'Risk assessment',
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
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
            label: 'Approved',
            filter: (item: Application) => item.status === 'Approved',
            color: 'green',
            bgColor: 'bg-green-500'
          },
          {
            label: 'For Review',
            filter: (item: Application) => item.status === 'For Review',
            color: 'yellow',
            bgColor: 'bg-yellow-500'
          },
          {
            label: 'Pending',
            filter: (item: Application) => item.status === 'Pending',
            color: 'blue',
            bgColor: 'bg-blue-500'
          },
          {
            label: 'Rejected',
            filter: (item: Application) => item.status === 'Rejected',
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
            filter: (item: Application) => item.riskScore <= 30,
            color: 'green',
            bgColor: 'bg-green-500'
          },
          {
            label: 'Medium Risk (31-60)',
            filter: (item: Application) => item.riskScore > 30 && item.riskScore <= 60,
            color: 'yellow',
            bgColor: 'bg-yellow-500'
          },
          {
            label: 'High Risk (>60)',
            filter: (item: Application) => item.riskScore > 60,
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
          icon: '📞',
          render: (value: any) => value
        },
        {
          key: 'address',
          icon: '📍',
          render: (value: any) => value
        }
      ]
    }
  };

  const handleRowClick = (application: Application) => {
    console.log('Clicked application:', application)
    handleViewDetails(application);
    // Navigate to application details or open modal
  };

  const handleSelectionChange = (selectedApplications: Application[]) => {
    console.log('Selected applications:', selectedApplications);
    // Handle bulk operations
  };
  // Add eye icon to the first column for viewing details
  const configWithViewAction = {
    ...tableConfig,
    columns: [
      ...tableConfig.columns
    ]
  };

  return (
    <div>
      <GenericDataTable
        data={applicationDataX}
        config={configWithViewAction}
        onRowClick={handleRowClick}
        onSelectionChange={(selectedItems) => {
          console.log('Selected items:', selectedItems);
          // Handle selection change if needed
        }}
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