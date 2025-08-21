import React, { useState, useMemo } from 'react';

// Generic interfaces
export interface BaseDataItem {
  id: number;
  [key: string]: any;
}

export interface ColumnConfig<T extends BaseDataItem> {
  key: keyof T;
  label: string;
  type: 'text' | 'status' | 'score' | 'date' | 'contact' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
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
  field?: string;
  categories?: {
    label: string;
    filter: (item: any) => boolean;
    color: string;
    bgColor: string;
  }[];
}

export interface TableConfig<T extends BaseDataItem> {
  title: string;
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
      render?: (value: any) => React.ReactNode;
    }[];
  };
}

interface GenericDataTableProps<T extends BaseDataItem> {
  data: T[];
  config: TableConfig<T>;
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
}

const GenericDataTable = <T extends BaseDataItem>({
  data,
  config,
  onRowClick,
  onSelectionChange
}: GenericDataTableProps<T>) => {
  const [currentView, setCurrentView] = useState<'summary' | 'spreadsheet'>('spreadsheet');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['All']);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const getStatusColor = (status: string) => {
    return config.statusColors?.[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getScoreColor = (score: number) => {
    if (!config.scoreColorRanges) return 'text-gray-600';
    
    for (const range of config.scoreColorRanges) {
      if (score <= range.max) {
        return range.className;
      }
    }
    return config.scoreColorRanges[config.scoreColorRanges.length - 1].className;
  };

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

  const summaryStats = useMemo(() => {
    if (!config.summaryStats) return {};
    
    return config.summaryStats.reduce((acc, stat) => {
      const value = stat.value(filteredData);
      return {
        ...acc,
        [stat.label]: {
          ...stat,
          value,
          description: stat.description(filteredData, value)
        }
      };
    }, {});
  }, [filteredData, config.summaryStats]);

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
          if (config.statusOptions && updated.length === config.statusOptions.length) {
            return ['All'];
          }
          return updated;
        });
      } else {
        setStatusFilter(prev => {
          const filtered = prev.filter(s => s !== status && s !== 'All');
          return filtered.length === 0 ? [] : filtered;
        });
      }
    }
  };

  const handleRowSelection = (item: T, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedItems, item]
      : selectedItems.filter(selected => selected.id !== item.id);
    
    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  };

  const renderCellContent = (column: ColumnConfig<T>, item: T) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    switch (column.type) {
      
      case 'status':
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(String(value))}`}>
            {String(value)}
          </span>
        );
      
      case 'score':
        return (
          <span className={`text-2xl font-bold ${getScoreColor(Number(value))}`}>
            {value}
          </span>
        );
      
      case 'contact':
        return (
          <div className="text-sm text-gray-900">
            <div className="flex items-center mb-1">
              <span className="text-red-500 mr-1">📞</span>
              {item.contactNumber}
            </div>
            <div className="flex items-center">
              <span className="text-red-500 mr-1">📍</span>
              {item.address}
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`text-sm text-gray-900 ${column.className || ''}`}>
            {String(value)}
          </div>
        );
    }
  };

  const renderChart = (chart: ChartConfig) => {
    if (!chart.categories) return null;

    const chartData = chart.categories.map(category => ({
      ...category,
      count: filteredData.filter(category.filter).length
    }));

    const total = filteredData.length;

    return (
      <div key={chart.title} className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{chart.title}</h3>
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-900">{item.count}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.bgColor}`}
                    style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-10">
                  {Math.round(total > 0 ? (item.count / total) * 100 : 0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSummaryView = () => {
    return (
      <div className="p-6 space-y-8">
        {/* Statistics Cards */}
        {config.summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(summaryStats).map((stat: any, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        {config.charts && config.charts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {config.charts.map(chart => renderChart(chart))}
          </div>
        )}

        {/* Data Cards */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent {config.title}</h3>
              <span className="text-sm text-gray-500">{filteredData.length} items</span>
            </div>
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
                        <h4 className="font-semibold text-gray-900">
                          {config.cardDisplayFields?.title ? String(item[config.cardDisplayFields.title]) : String(item[config.columns[0]?.key] || item.id)}
                        </h4>
                        {config.cardDisplayFields?.subtitle && (
                          <p className="text-sm text-gray-600">{String(item[config.cardDisplayFields.subtitle])}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.some(selected => selected.id === item.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelection(item, e.target.checked);
                          }}
                          className="rounded border-gray-300"
                        />
                        {config.scoreField && (
                          <span className={`text-xl font-bold ${getScoreColor(Number(item[config.scoreField]))}`}>
                            {item[config.scoreField]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    {config.statusField && (
                      <div className="mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(String(item[config.statusField]))}`}>
                          {String(item[config.statusField])}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {config.cardDisplayFields?.description && (
                      <p className="text-sm text-gray-700 mb-3">{String(item[config.cardDisplayFields.description])}</p>
                    )}

                    {/* Additional Fields */}
                    {config.cardDisplayFields?.additionalFields && (
                      <div className="space-y-1 text-sm text-gray-600">
                        {config.cardDisplayFields.additionalFields.map((field) => (
                          <div key={String(field.key)} className="flex items-center">
                            {field.icon && <span className="mr-2">{field.icon}</span>}
                            {field.render ? field.render(item[field.key]) : String(item[field.key])}
                          </div>
                        ))}
                      </div>
                    )}
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
      <div>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {config.icon && <div className="w-6 h-6 mr-3">{config.icon}</div>}
              <h1 className="text-xl font-semibold text-gray-800">{config.title}</h1>
            </div>
            <button
              onClick={() =>
                setCurrentView(currentView === "summary" ? "spreadsheet" : "summary")
              }
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

        {/* Controls */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Status filter dropdown */}
              {config.statusOptions && (
                <div className="relative">
                  <button
                    className="flex items-center px-4 py-2 border border-red-300 text-red-600 bg-white rounded-lg hover:bg-red-50 focus:outline-none"
                    onClick={() => setShowStatusDropdown((prev) => !prev)}
                    type="button"
                  >
                    Status
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border border-red-300 rounded-lg shadow-lg p-4">
                      <div className="font-medium mb-1">Status</div>
                      <div className="flex flex-col space-y-1">
                        <label className="inline-flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={statusFilter.includes('All')}
                            onChange={(e) => handleStatusChange('All', e.target.checked)}
                            className="form-checkbox text-red-600"
                          />
                          <span>All</span>
                        </label>
                        {config.statusOptions.map((status) => (
                          <label key={status} className="inline-flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={statusFilter.includes(status)}
                              onChange={(e) => handleStatusChange(status, e.target.checked)}
                              className="form-checkbox text-red-600"
                            />
                            <span>{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Date filter */}
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
              {/* Search feature */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search...`}
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

              {/* View indicator */}
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

        {/* Main Content - Toggle between views */}
        {currentView === 'summary' ? renderSummaryView() : (
          /* Table */
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th> 
                    {config.columns.map((column) => (
                      <th key={String(column.key)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => onRowClick?.(item)}
                            className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer ml-3 focus:outline-none"
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
                      <td
                        colSpan={config.columns.length + 1}
                        className="px-6 py-6 text-center text-gray-500"
                      >
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
    </div>
  );
};

export default GenericDataTable;
// import React, { useState, useMemo } from 'react';

// // Generic interfaces
// export interface BaseDataItem {
//   id: number;
//   [key: string]: any;
// }

// export interface ColumnConfig<T extends BaseDataItem> {
//   key: keyof T;
//   label: string;
//   type: 'text' | 'status' | 'score' | 'date' | 'contact' | 'custom';
//   sortable?: boolean;
//   filterable?: boolean;
//   render?: (value: any, item: T) => React.ReactNode;
//   className?: string;
// }

// export interface FilterConfig {
//   key: string;
//   label: string;
//   type: 'dropdown' | 'date' | 'search';
//   options?: string[];
//   placeholder?: string;
// }

// export interface SummaryStatConfig {
//   label: string;
//   value: (data: any[]) => number | string;
//   description: (data: any[], value: number | string) => string;
//   icon: React.ReactNode;
//   color: string;
//   bgColor: string;
// }

// export interface ChartConfig {
//   title: string;
//   type: 'status' | 'risk' | 'custom';
//   field?: string;
//   categories?: {
//     label: string;
//     filter: (item: any) => boolean;
//     color: string;
//     bgColor: string;
//   }[];
// }

// export interface TableConfig<T extends BaseDataItem> {
//   title: string;
//   icon?: React.ReactNode;
//   columns: ColumnConfig<T>[];
//   filters: FilterConfig[];
//   searchableFields: (keyof T)[];
//   statusField?: keyof T;
//   statusOptions?: string[];
//   statusColors?: Record<string, string>;
//   scoreField?: keyof T;
//   scoreColorRanges?: { max: number; className: string }[];
//   summaryStats?: SummaryStatConfig[];
//   charts?: ChartConfig[];
//   cardDisplayFields?: {
//     title: keyof T;
//     subtitle?: keyof T;
//     description?: keyof T;
//     additionalFields?: {
//       key: keyof T;
//       icon?: string;
//       render?: (value: any) => React.ReactNode;
//     }[];
//   };
// }

// interface GenericDataTableProps<T extends BaseDataItem> {
//   data: T[];
//   config: TableConfig<T>;
//   onRowClick?: (item: T) => void;
//   onSelectionChange?: (selectedItems: T[]) => void;
// }

// const GenericDataTable = <T extends BaseDataItem>({
//   data,
//   config,
//   onRowClick,
//   onSelectionChange
// }: GenericDataTableProps<T>) => {
//   const [currentView, setCurrentView] = useState<'summary' | 'spreadsheet'>('spreadsheet');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string[]>(['All']);
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
//   const [selectedItems, setSelectedItems] = useState<T[]>([]);

//   const getStatusColor = (status: string) => {
//     return config.statusColors?.[status] || 'bg-gray-100 text-gray-800 border-gray-200';
//   };

//   const getScoreColor = (score: number) => {
//     if (!config.scoreColorRanges) return 'text-gray-600';
    
//     for (const range of config.scoreColorRanges) {
//       if (score <= range.max) {
//         return range.className;
//       }
//     }
//     return config.scoreColorRanges[config.scoreColorRanges.length - 1].className;
//   };

//   const filteredData = useMemo(() => {
//     return data.filter((item) => {
//       // Status filter
//       if (config.statusField && !statusFilter.includes('All') && !statusFilter.includes(String(item[config.statusField]))) {
//         return false;
//       }

//       // Date filter
//       if (selectedDate && item.applicationDate) {
//         const itemDate = new Date(item.applicationDate as string).toISOString().slice(0, 10);
//         if (itemDate !== selectedDate) {
//           return false;
//         }
//       }

//       // Search filter
//       if (searchTerm) {
//         const searchLower = searchTerm.toLowerCase();
//         const matches = config.searchableFields.some(field => 
//           String(item[field]).toLowerCase().includes(searchLower)
//         );
//         if (!matches) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }, [data, statusFilter, selectedDate, searchTerm, config]);

//   const summaryStats = useMemo(() => {
//     if (!config.summaryStats) return {};
    
//     return config.summaryStats.reduce((acc, stat) => {
//       const value = stat.value(filteredData);
//       return {
//         ...acc,
//         [stat.label]: {
//           ...stat,
//           value,
//           description: stat.description(filteredData, value)
//         }
//       };
//     }, {});
//   }, [filteredData, config.summaryStats]);

//   const handleStatusChange = (status: string, checked: boolean) => {
//     if (status === 'All') {
//       if (checked) {
//         setStatusFilter(['All']);
//       } else {
//         setStatusFilter([]);
//       }
//     } else {
//       if (checked) {
//         setStatusFilter(prev => {
//           const newFilter = prev.filter(s => s !== 'All');
//           const updated = [...newFilter, status];
//           if (config.statusOptions && updated.length === config.statusOptions.length) {
//             return ['All'];
//           }
//           return updated;
//         });
//       } else {
//         setStatusFilter(prev => {
//           const filtered = prev.filter(s => s !== status && s !== 'All');
//           return filtered.length === 0 ? [] : filtered;
//         });
//       }
//     }
//   };

//   const handleRowSelection = (item: T, checked: boolean) => {
//     const newSelection = checked 
//       ? [...selectedItems, item]
//       : selectedItems.filter(selected => selected.id !== item.id);
    
//     setSelectedItems(newSelection);
//     onSelectionChange?.(newSelection);
//   };

//   const renderCellContent = (column: ColumnConfig<T>, item: T) => {
//     const value = item[column.key];

//     if (column.render) {
//       return column.render(value, item);
//     }

//     switch (column.type) {
      
//       case 'status':
//         return (
//           <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(String(value))}`}>
//             {String(value)}
//           </span>
//         );
      
//       case 'score':
//         return (
//           <span className={`text-2xl font-bold ${getScoreColor(Number(value))}`}>
//             {value}
//           </span>
//         );
      
//       case 'contact':
//         return (
//           <div className="text-sm text-gray-900">
//             <div className="flex items-center mb-1">
//               <span className="text-red-500 mr-1">📞</span>
//               {item.contactNumber}
//             </div>
//             <div className="flex items-center">
//               <span className="text-red-500 mr-1">📍</span>
//               {item.address}
//             </div>
//           </div>
//         );
      
//       default:
//         return (
//           <div className={`text-sm text-gray-900 ${column.className || ''}`}>
//             {String(value)}
//           </div>
//         );
//     }
//   };

//   const renderChart = (chart: ChartConfig) => {
//     if (!chart.categories) return null;

//     const chartData = chart.categories.map(category => ({
//       ...category,
//       count: filteredData.filter(category.filter).length
//     }));

//     const total = filteredData.length;

//     return (
//       <div key={chart.title} className="bg-white rounded-lg border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-6">{chart.title}</h3>
//         <div className="space-y-4">
//           {chartData.map((item) => (
//             <div key={item.label} className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
//                 <span className="font-medium text-gray-700">{item.label}</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <span className="font-semibold text-gray-900">{item.count}</span>
//                 <div className="w-20 bg-gray-200 rounded-full h-2">
//                   <div 
//                     className={`h-2 rounded-full ${item.bgColor}`}
//                     style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
//                   ></div>
//                 </div>
//                 <span className="text-sm text-gray-500 w-10">
//                   {Math.round(total > 0 ? (item.count / total) * 100 : 0)}%
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   const renderSummaryView = () => {
//     return (
//       <div className="p-6 space-y-8">
//         {/* Statistics Cards */}
//         {config.summaryStats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {Object.values(summaryStats).map((stat: any, index) => (
//               <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
//                     <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
//                     <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
//                   </div>
//                   <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
//                     {stat.icon}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Charts Section */}
//         {config.charts && config.charts.length > 0 && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {config.charts.map(chart => renderChart(chart))}
//           </div>
//         )}

//         {/* Data Cards */}
//         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Recent {config.title}</h3>
//               <span className="text-sm text-gray-500">{filteredData.length} items</span>
//             </div>
//           </div>
//           <div className="p-6">
//             {filteredData.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {filteredData.slice(0, 9).map((item) => (
//                   <div 
//                     key={item.id} 
//                     className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
//                     onClick={() => onRowClick?.(item)}
//                   >
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <h4 className="font-semibold text-gray-900">
//                           {config.cardDisplayFields?.title ? String(item[config.cardDisplayFields.title]) : String(item[config.columns[0]?.key] || item.id)}
//                         </h4>
//                         {config.cardDisplayFields?.subtitle && (
//                           <p className="text-sm text-gray-600">{String(item[config.cardDisplayFields.subtitle])}</p>
//                         )}
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <input
//                           type="checkbox"
//                           checked={selectedItems.some(selected => selected.id === item.id)}
//                           onChange={(e) => {
//                             e.stopPropagation();
//                             handleRowSelection(item, e.target.checked);
//                           }}
//                           className="rounded border-gray-300"
//                         />
//                         {config.scoreField && (
//                           <span className={`text-xl font-bold ${getScoreColor(Number(item[config.scoreField]))}`}>
//                             {item[config.scoreField]}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Status Badge */}
//                     {config.statusField && (
//                       <div className="mb-3">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(String(item[config.statusField]))}`}>
//                           {String(item[config.statusField])}
//                         </span>
//                       </div>
//                     )}

//                     {/* Description */}
//                     {config.cardDisplayFields?.description && (
//                       <p className="text-sm text-gray-700 mb-3">{String(item[config.cardDisplayFields.description])}</p>
//                     )}

//                     {/* Additional Fields */}
//                     {config.cardDisplayFields?.additionalFields && (
//                       <div className="space-y-1 text-sm text-gray-600">
//                         {config.cardDisplayFields.additionalFields.map((field) => (
//                           <div key={String(field.key)} className="flex items-center">
//                             {field.icon && <span className="mr-2">{field.icon}</span>}
//                             {field.render ? field.render(item[field.key]) : String(item[field.key])}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
//                 <p className="text-lg font-medium text-gray-600 mb-2">No data found</p>
//                 <p className="text-gray-500">Try adjusting your filters to see more results</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div>
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               {config.icon && <div className="w-6 h-6 mr-3">{config.icon}</div>}
//               <h1 className="text-xl font-semibold text-gray-800">{config.title}</h1>
//             </div>
//             <button
//               onClick={() =>
//                 setCurrentView(currentView === "summary" ? "spreadsheet" : "summary")
//               }
//               className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//             >
//               <div className="w-4 h-4 mr-2">
//                 <svg fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
//                 </svg>
//               </div>
//               {currentView === "summary" ? "Switch to Spreadsheet" : "Switch to Summary"}
//             </button>
//           </div>
//         </header>

//         {/* Controls */}
//         <div className="p-6 bg-white border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               {/* Status filter dropdown */}
//               {config.statusOptions && (
//                 <div className="relative">
//                   <button
//                     className="flex items-center px-4 py-2 border border-red-300 text-red-600 bg-white rounded-lg hover:bg-red-50 focus:outline-none"
//                     onClick={() => setShowStatusDropdown((prev) => !prev)}
//                     type="button"
//                   >
//                     Status
//                     <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
//                   {showStatusDropdown && (
//                     <div className="absolute z-10 mt-2 w-48 bg-white border border-red-300 rounded-lg shadow-lg p-4">
//                       <div className="font-medium mb-1">Status</div>
//                       <div className="flex flex-col space-y-1">
//                         <label className="inline-flex items-center space-x-2 cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={statusFilter.includes('All')}
//                             onChange={(e) => handleStatusChange('All', e.target.checked)}
//                             className="form-checkbox text-red-600"
//                           />
//                           <span>All</span>
//                         </label>
//                         {config.statusOptions.map((status) => (
//                           <label key={status} className="inline-flex items-center space-x-2 cursor-pointer">
//                             <input
//                               type="checkbox"
//                               checked={statusFilter.includes(status)}
//                               onChange={(e) => handleStatusChange(status, e.target.checked)}
//                               className="form-checkbox text-red-600"
//                             />
//                             <span>{status}</span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
              
//               {/* Date filter */}
//               <div className="relative">
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//                 />
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               {/* Search feature */}
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder={`Search client name...`}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
//                 />
//                 <div className="absolute left-3 top-2.5 w-5 h-5 text-gray-400">
//                   <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>

//               {/* View indicator */}
//               <div className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg transition-colors">
//                 <div className="w-4 h-4 mr-2">
//                   <svg fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
//                   </svg>
//                 </div>
//                 {currentView === 'summary' ? 'Summary View' : 'Spreadsheet View'}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content - Toggle between views */}
//         {currentView === 'summary' ? renderSummaryView() : (
//           /* Table */
//           <div className="p-6">
//             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th> 
//                     {config.columns.map((column) => (
//                       <th key={String(column.key)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         {column.label}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredData.map((item) => (
//                     <tr 
//                       key={item.id} 
//                       // className="hover:bg-gray-50 cursor-pointer"
//                       // onClick={() => onRowClick?.(item)}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="w-5 h-5 text-gray-400 ml-3">
//                             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           </div>
//                         </div>
//                       </td>
//                       {config.columns.map((column) => (
//                         <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
//                           {renderCellContent(column, item)}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                   {filteredData.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan={config.columns.length + 1}
//                         className="px-6 py-6 text-center text-gray-500"
//                       >
//                         No data found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GenericDataTable;