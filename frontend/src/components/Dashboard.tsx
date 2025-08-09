import React, { useState } from 'react';

// TypeScript interfaces
interface Application {
  id: number;
  status: 'Approved' | 'Rejected' | 'For Review' | 'Pending';
  riskScore: number;
  rationale: string;
  applicationDate: string;
  clientName: string;
  contactNumber: string;
  address: string;
}

type ViewType = 'summary' | 'spreadsheet';

const BPAiDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Mock data
  const applications: Application[] = [
    {
      id: 1,
      status: 'Approved',
      riskScore: 13,
      rationale: 'Requirements Complete',
      applicationDate: 'Aug 3, 2025 6:54 PM',
      clientName: 'Arabella B. Isles',
      contactNumber: '091234567',
      address: 'Univ Dorm, QC'
    },
    {
      id: 2,
      status: 'Rejected',
      riskScore: 87,
      rationale: 'High Risk Profile',
      applicationDate: 'Aug 2, 2025 2:30 PM',
      clientName: 'Marcus Chen',
      contactNumber: '091234568',
      address: 'Makati City, MM'
    },
    {
      id: 3,
      status: 'For Review',
      riskScore: 45,
      rationale: 'Additional Documentation Required',
      applicationDate: 'Aug 1, 2025 10:15 AM',
      clientName: 'Sofia Rodriguez',
      contactNumber: '091234569',
      address: 'BGC, Taguig'
    },
    {
      id: 4,
      status: 'Pending',
      riskScore: 62,
      rationale: 'Under Assessment',
      applicationDate: 'Jul 31, 2025 4:20 PM',
      clientName: 'John Martinez',
      contactNumber: '091234570',
      address: 'Ortigas, Pasig'
    },
    {
      id: 5,
      status: 'Approved',
      riskScore: 28,
      rationale: 'Low Risk, Complete Documents',
      applicationDate: 'Jul 30, 2025 11:45 AM',
      clientName: 'Elena Vasquez',
      contactNumber: '091234571',
      address: 'Alabang, Muntinlupa'
    }
  ];

    const getStatusColor = (status: Application['status']) => {
        switch (status) {
        case 'Approved':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Rejected':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'For Review':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Pending':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600 font-semibold';
    if (score <= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const filteredApplications = applications.filter(app => 
    app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 shadow-sm">
        {/* Logo/Brand */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-xl text-gray-800">BPAi</span>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-4 mb-4">
            <div className="flex items-center p-3 text-red-600 bg-red-50 rounded-lg">
              <div className="w-5 h-5 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="font-medium">Applications</span>
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
              📖 Help Guide
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
              📋 Internal Docs
            </button>
          </div>
          <div className="mt-4 flex items-center p-2 bg-red-50 rounded-lg">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xs">LO</span>
            </div>
            <span className="text-sm text-gray-700 font-medium">Loan Officer</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20" className="text-gray-600">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Applications</h1>
            </div>
            <button
              onClick={() => setCurrentView(currentView === 'summary' ? 'spreadsheet' : 'summary')}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <div className="w-4 h-4 mr-2">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              {currentView === 'summary' ? 'Summary View' : 'Spreadsheet View'}
            </button>
          </div>
        </header>

        {/* Controls */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg">
                  Filters
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
                <div className="absolute left-3 top-2.5 w-5 h-5 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setCurrentView(currentView === 'summary' ? 'spreadsheet' : 'summary')}
                className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                <div className="w-4 h-4 mr-2">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                Spreadsheet View
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rationale</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-5 h-5 text-gray-400 mr-3">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-2xl font-bold ${getRiskScoreColor(app.riskScore)}`}>
                        {app.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {app.rationale}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.applicationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <span className="text-red-500 mr-1">📞</span>
                          {app.contactNumber}
                        </div>
                        <div className="flex items-center">
                          <span className="text-red-500 mr-1">📍</span>
                          {app.address}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPAiDashboard;