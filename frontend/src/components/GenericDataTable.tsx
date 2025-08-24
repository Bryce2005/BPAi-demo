import React, { useState, useMemo } from 'react';
import { Eye, Phone, MapPin, FileText, Users, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Interfaces ---
export interface BaseDataItem {
  id: number;
  [key: string]: any;
}

export interface ColumnConfig<T extends BaseDataItem> {
  key: keyof T;
  label: string;
  type: 'text' | 'status' | 'score' | 'date' | 'contact' | 'custom';
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'dropdown' | 'date' | 'search';
  options?: string[];
  placeholder?: string;
}

export interface SummaryStatConfig {
  label: string;
  value: (data: any[]) => number | string;
  description: (data: any[], value: number | string) => string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export interface ChartConfig {
  title: string;
  type: 'status' | 'risk' | 'custom';
  categories?: {
    label: string;
    filter: (item: any) => boolean;
    color: string;
    bgColor: string;
  }[];
}

export interface TableConfig<T extends BaseDataItem> {
  title: string;
  officer: string;
  icon?: React.ReactNode;
  columns: ColumnConfig<T>[];
  filters: FilterConfig[];
  searchableFields: (keyof T)[];
  statusField?: keyof T;
  statusOptions?: string[];
  statusColors?: Record<string, string>;
  scoreField?: keyof T;
  scoreColorRanges?: { max: number; className: string }[];
  summaryStats?: SummaryStatConfig[];
  charts?: ChartConfig[];
  cardDisplayFields?: {
    title: keyof T;
    subtitle?: keyof T;
    description?: keyof T;
    additionalFields?: {
      key: keyof T;
      icon?: string;
      render?: (value: any, item?: any) => React.ReactNode;
    }[];
  };
}

interface GenericDataTableProps<T extends BaseDataItem> {
  data: T[];
  config: TableConfig<T>;
  onRowClick?: (item: T) => void;
}

// --- Main Component ---
const GenericDataTable = <T extends BaseDataItem>({
  data,
  config,
  onRowClick,
}: GenericDataTableProps<T>) => {
  const [currentView, setCurrentView] = useState<'summary' | 'spreadsheet'>('spreadsheet');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['All']);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Helper functions
  const getRiskCategoryColor = (category: string) => {
    const colors = {
      'Secure': 'bg-green-100 text-green-800 border-green-200',
      'Unstable': 'bg-blue-100 text-blue-800 border-blue-200',
      'Risky': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Critical': 'bg-purple-100 text-purple-800 border-purple-200',
      'Default': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    if (score >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (config.statusField && !statusFilter.includes('All') && !statusFilter.includes(String(item[config.statusField]))) {
        return false;
      }
      // Date filter
      if (selectedDate && item.applicationDate) {
        const itemDate = new Date(item.applicationDate as string).toISOString().slice(0, 10);
        if (itemDate !== selectedDate) {
          return false;
        }
      }
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = config.searchableFields.some(field =>
          String(item[field]).toLowerCase().includes(searchLower)
        );
        if (!matches) {
          return false;
        }
      }
      return true;
    });
  }, [data, statusFilter, selectedDate, searchTerm, config]);

  // Handle status filter change
  const handleStatusChange = (status: string, checked: boolean) => {
    if (status === 'All') {
      if (checked) {
        setStatusFilter(['All']);
      } else {
        setStatusFilter([]);
      }
    } else {
      if (checked) {
        setStatusFilter(prev => {
          const newFilter = prev.filter(s => s !== 'All');
          const updated = [...newFilter, status];
          return updated;
        });
      } else {
        setStatusFilter(prev => {
          const filtered = prev.filter(s => s !== status && s !== 'All');
          return filtered;
        });
      }
    }
  };

  // Render cell content
  const renderCellContent = (column: ColumnConfig<T>, item: T) => {
    const value = item[column.key];
    if (column.render) {
      return column.render(value, item);
    }
    switch (column.type) {
      case 'status':
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskCategoryColor(String(value))}`}>
            {String(value)}
          </span>
        );
      case 'score':
        return (
          <div className="flex flex-col">
            <span className={`text-2xl font-bold ${getScoreColor(Number(value) * 100)}`}>
              {(Number(value) * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500">Confidence: {(Number(value) / 100 * 100).toFixed(2)}</span>
          </div>
        );
      case 'contact':
        return (
          <div className="text-sm text-gray-900">
            <div className="flex items-center mb-1">
              <Phone className="w-4 h-4 mr-1 text-gray-500" />
              {item.contact_number}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-500" />
              {item.address_city}, {item.address_province}
            </div>
          </div>
        );
      default:
        return <div className="text-sm text-gray-900">{String(value)}</div>;
    }
  };

  // Render summary view
  const renderSummaryView = () => {
    return (
      <div className="p-6 space-y-8">
        {/* Statistics Cards */}
        {config.summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {config.summaryStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value(filteredData)}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description(filteredData, stat.value(filteredData))}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Data Cards */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
          </div>
          <div className="p-6">
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredData.slice(0, 9).map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onRowClick?.(item)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.first_name} {item.last_name}</h4>
                        <h5 className="font-semibold text-gray-900">{item.application_id}</h5>
                        <p className="text-sm text-gray-600">{new Date(item.processed_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-l font-bold ${getScoreColor(Number(Math.max(...item.probabilities)) * 100)}`}>
                          Confidence: {Number(Math.max(...item.probabilities)) * 100}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskCategoryColor(item.risk_category)}`}>
                        {item.risk_category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{item.loan_purpose}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" /> {item.contact_number}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {item.address_city}, {item.address_province}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-600 mb-2">No data found</p>
                <p className="text-gray-500">Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {config.icon && <div className="w-6 h-6 mr-3">{config.icon}</div>}
            <h1 className="text-xl font-semibold text-grey-800">{config.title} for {config.officer}</h1>
          </div>

          <button
            onClick={() => setCurrentView(currentView === "summary" ? "spreadsheet" : "summary")}
            className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 mr-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            {currentView === "summary" ? "Switch to Spreadsheet" : "Switch to Summary"}
          </button>
        </div>
      </header>

      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Risk Category Dropdown */}
            <div className="relative">
              <button
                className="flex items-center px-4 py-2 border border-red-300 text-red-600 bg-white rounded-lg hover:bg-red-50 focus:outline-none"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                Risk Category
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showStatusDropdown && (
                <div className="absolute z-10 mt-2 w-56 bg-white border border-red-300 rounded-lg shadow-lg p-4">
                  <div className="font-medium mb-2">Risk Category</div>
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statusFilter.includes('All')}
                        onChange={(e) => handleStatusChange('All', e.target.checked)}
                        className="form-checkbox text-red-600"
                      />
                      <span>All Categories</span>
                    </label>
                    {config.statusOptions?.map((status) => (
                      <label key={status} className="inline-flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={statusFilter.includes(status)}
                          onChange={(e) => handleStatusChange(status, e.target.checked)}
                          className="form-checkbox text-red-600"
                        />
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getRiskCategoryColor(status)}`}>
                            {status}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Filter */}
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
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search applications..."
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

            {/* View Indicator */}
            <div className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg transition-colors">
              <div className="w-4 h-4 mr-2">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              {currentView === 'summary' ? 'Summary View' : 'Spreadsheet View'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'summary' ? renderSummaryView() : (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  {config.columns.map((column) => (
                    <th key={String(column.key)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onRowClick?.(item)}
                          className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          title="View details"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    {config.columns.map((column) => (
                      <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                        {renderCellContent(column, item)}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="px-6 py-6 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericDataTable;