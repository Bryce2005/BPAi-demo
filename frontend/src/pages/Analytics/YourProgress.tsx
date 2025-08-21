import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  Target,
  Award,
  Activity
} from 'lucide-react';

interface YourProgressProps {}

const YourProgress: React.FC<YourProgressProps> = () => {
  const [dateRange, setDateRange] = useState('mm/dd/yyyy');

  // Mock data - replace with real data
  const progressData = {
    todayCases: 12,
    weeklyTarget: 50,
    weeklyCompleted: 38,
    avgProcessingTime: '2.3 hrs',
    accuracyRate: 94,
    statusDistribution: {
      approved: 45,
      pending: 25,
      inReview: 20,
      rejected: 10
    },
    riskScoreAccuracy: 89
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'yellow' | 'red';
    trend?: string;
  }> = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
      green: 'bg-green-50 text-green-600 border-green-100',
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      red: 'bg-red-50 text-red-600 border-red-100'
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              {trend && (
                <span className="text-sm text-green-600 font-medium">+{trend}</span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    total: number;
    color: string;
    percentage: number;
  }> = ({ label, value, total, color, percentage }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-900">{value}</span>
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
      </div>
    </div>
  );

  const RecentActivity: React.FC<{
    activities: Array<{
      id: string;
      action: string;
      client: string;
      time: string;
      status: 'approved' | 'pending' | 'rejected' | 'review';
    }>;
  }> = ({ activities }) => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <span className="text-sm text-gray-500">{activities.length} activities</span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {activity.status === 'approved' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {activity.status === 'pending' && (
                  <Clock className="w-5 h-5 text-blue-600" />
                )}
                {activity.status === 'rejected' && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {activity.status === 'review' && (
                  <Eye className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.client}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const mockActivities = [
    { id: '1', action: 'Application Approved', client: 'Benjamin S. Castro', time: '2 min ago', status: 'approved' as const },
    { id: '2', action: 'Started Review', client: 'Claire D. Fernandez', time: '15 min ago', status: 'review' as const },
    { id: '3', action: 'Document Requested', client: 'Daniel P. Santos', time: '1 hour ago', status: 'pending' as const },
    { id: '4', action: 'Application Rejected', client: 'Evelyn G. Reyes', time: '2 hours ago', status: 'rejected' as const },
    { id: '5', action: 'Verification Complete', client: 'Franklin H. Lim', time: '3 hours ago', status: 'approved' as const },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Your Progress</h1>
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              defaultValue="status"
            >
              <option value="status">Status</option>
              <option value="risk">Risk Level</option>
              <option value="date">Date Range</option>
            </select>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
            <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Switch to Applications
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Cases Today"
              value={progressData.todayCases}
              subtitle="Target: 15 cases"
              icon={<Activity className="w-5 h-5" />}
              color="blue"
              trend="20%"
            />
            <StatCard
              title="Weekly Progress"
              value={`${progressData.weeklyCompleted}/${progressData.weeklyTarget}`}
              subtitle={`${Math.round((progressData.weeklyCompleted / progressData.weeklyTarget) * 100)}% complete`}
              icon={<Target className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Avg Processing Time"
              value={progressData.avgProcessingTime}
              subtitle="Per application"
              icon={<Clock className="w-5 h-5" />}
              color="yellow"
            />
            <StatCard
              title="Accuracy Rate"
              value={`${progressData.accuracyRate}%`}
              subtitle="vs AI predictions"
              icon={<Award className="w-5 h-5" />}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-1">
                  <ProgressBar 
                    label="Approved" 
                    value={progressData.statusDistribution.approved}
                    total={100}
                    color="bg-green-500" 
                    percentage={progressData.statusDistribution.approved} 
                  />
                  <ProgressBar 
                    label="Pending" 
                    value={progressData.statusDistribution.pending}
                    total={100}
                    color="bg-blue-500" 
                    percentage={progressData.statusDistribution.pending} 
                  />
                  <ProgressBar 
                    label="In Review" 
                    value={progressData.statusDistribution.inReview}
                    total={100}
                    color="bg-yellow-500" 
                    percentage={progressData.statusDistribution.inReview} 
                  />
                  <ProgressBar 
                    label="Rejected" 
                    value={progressData.statusDistribution.rejected}
                    total={100}
                    color="bg-red-500" 
                    percentage={progressData.statusDistribution.rejected} 
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Risk Score Accuracy</span>
                    <span className="text-sm font-bold text-gray-900">{progressData.riskScoreAccuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${progressData.riskScoreAccuracy}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">2.3</div>
                    <div className="text-sm text-gray-600">Avg Hours/Case</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Streak</span>
                    <span className="text-sm text-green-600 font-medium">5 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Best Day</span>
                    <span className="text-sm text-blue-600 font-medium">18 cases</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Performance Trends</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const values = [12, 15, 18, 14, 16, 8, 5];
                  const isToday = index === 2; // Wednesday
                  return (
                    <div key={day} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{day}</div>
                      <div 
                        className={`h-20 rounded-lg flex items-end justify-center text-white text-sm font-medium ${
                          isToday ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        style={{ 
                          height: `${Math.max(values[index] * 4, 20)}px`
                        }}
                      >
                        {values[index]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={mockActivities} />
        </div>
      </div>
    </div>
  );
};

export default YourProgress;