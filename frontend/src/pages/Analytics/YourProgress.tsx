import { useState } from 'react';
import { TrendingUp, Clock, Target, CheckCircle, AlertCircle, Eye, CircleUser} from 'lucide-react';

const YourProgress = () => {
  const [selectedDate, setSelectedDate] = useState('08/23/2025');
  
  // Sample data based on your applications
  const applications = [
    { id: 'APP-2024-001', status: 'Approved', riskScore: 65, rationale: 'Education', client: 'Olivia Santiago', date: '8/26/2024' },
    { id: 'APP-2024-002', status: 'Approved', riskScore: 35, rationale: 'Personal Expenses', client: 'Paul Reyes', date: '8/27/2024' },
    { id: 'APP-2024-003', status: 'Rejected', riskScore: 95, rationale: 'Business Start-up', client: 'Quincy Domingo', date: '8/28/2024' },
    { id: 'APP-2024-005', status: 'Approved', riskScore: 15, rationale: 'Vacation', client: 'Samantha Ramos', date: '8/30/2024' },
    { id: 'APP-2024-006', status: 'In Review', riskScore: 85, rationale: 'Medical Emergency', client: 'Timothy Mendoza', date: '8/31/2024' },
    { id: 'APP-2024-007', status: 'In Review', riskScore: 75, rationale: 'Gadget Purchase', client: 'Ursula Castro', date: '9/1/2024' },
    { id: 'APP-2024-008', status: 'Approved', riskScore: 10, rationale: 'Car Purchase', client: 'Victor Manzo', date: '9/2/2024' }
  ];

  // Calculate metrics
  const totalApplications = applications.length;
  const todayCases = 8;
  const approvedCount = applications.filter(app => app.status === 'Approved').length;
  const inReviewCount = applications.filter(app => app.status === 'In Review').length;
  const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
  
  const weeklyProgress = Math.round((todayCases / 12) * 100);
  const accuracyRate = 94;
  const avgProcessingTime = 2.3;
  
  // Status distribution data
  const statusData = [
    { name: 'Approved', value: approvedCount, percentage: Math.round((approvedCount / totalApplications) * 100), color: '#10b981' },
    { name: 'In Review', value: inReviewCount, percentage: Math.round((inReviewCount / totalApplications) * 100), color: '#f59e0b' },
    { name: 'Rejected', value: rejectedCount, percentage: Math.round((rejectedCount / totalApplications) * 100), color: '#ef4444' }
  ];

  // Weekly performance data
  const weeklyData = [
    { day: 'Mon', cases: 12 },
    { day: 'Tue', cases: 15 },
    { day: 'Wed', cases: 18 },
    { day: 'Thu', cases: 14 },
    { day: 'Fri', cases: 16 },
    { day: 'Sat', cases: 8 },
    { day: 'Sun', cases: 5 }
  ];

  // Risk distribution data
  const riskData = [
    { category: 'Low (0-30)', count: 3, color: '#10b981' },
    { category: 'Medium (31-70)', count: 3, color: '#f59e0b' },
    { category: 'High (71-100)', count: 2, color: '#ef4444' }
  ];

  const recentActivities = [
    { action: 'Application Approved', client: 'Victor Manzo', time: '2 min ago', icon: CheckCircle, color: 'text-green-500' },
    { action: 'Started Review', client: 'Ursula Castro', time: '15 min ago', icon: Eye, color: 'text-yellow-500' },
    { action: 'Application Submitted', client: 'Timothy Mendoza', time: '1 hr ago', icon: AlertCircle, color: 'text-blue-500' },
    { action: 'Risk Assessment Complete', client: 'Samantha Ramos', time: '2 hrs ago', icon: Target, color: 'text-purple-500' },
    { action: 'Document Verified', client: 'Rachel Garcia', time: '3 hrs ago', icon: CheckCircle, color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
       <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3"><CircleUser /></div>
            <h1 className="text-xl font-semibold text-gray-800">Your Progress</h1>
          </div>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cases Today</p>
              <p className="text-2xl font-bold text-gray-800">{todayCases}</p>
              <p className="text-green-500 text-sm">+20%</p>
              <p className="text-gray-500 text-xs">Target: 12 cases</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Weekly Progress</p>
              <p className="text-2xl font-bold text-gray-800">{todayCases}/12</p>
              <p className="text-gray-500 text-sm">{weeklyProgress}% complete</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-800">{avgProcessingTime} hrs</p>
              <p className="text-gray-500 text-sm">Per application</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-800">{accuracyRate}%</p>
              <p className="text-gray-500 text-sm">vs AI predictions</p>
            </div>
            <Target className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <div className="space-y-4">
            {statusData.map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: status.color }}></div>
                  <span className="text-gray-700">{status.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ backgroundColor: status.color, width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm w-8">{status.value}</span>
                  <span className="text-gray-500 text-sm w-8">{status.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Risk Score Accuracy</span>
              <span className="text-gray-800 font-semibold">89%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{avgProcessingTime}</p>
              <p className="text-gray-600 text-sm">Avg Hours/Case</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{accuracyRate}%</p>
              <p className="text-gray-600 text-sm">Success Rate</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Streak</span>
              <span className="text-green-600 font-semibold">5 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best Day</span>
              <span className="text-blue-600 font-semibold">18 cases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Performance Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Performance Trends</h3>
        <div className="flex justify-between items-end space-x-2">
          {weeklyData.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center space-y-2 flex-1">
              <span className="text-xs text-gray-600">{day.day}</span>
              <div 
                className={`w-full rounded-t-lg flex items-end justify-center text-white text-sm font-semibold ${
                  day.day === 'Wed' ? 'bg-red-500' : 'bg-gray-300'
                }`}
                style={{ height: `${Math.max(day.cases * 3, 20)}px` }}
              >
                {day.cases}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <span className="text-gray-500 text-sm">5 activities</span>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-gray-100`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{activity.action}</p>
                <p className="text-gray-600 text-sm">{activity.client}</p>
              </div>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourProgress;