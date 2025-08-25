import React from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Activity,
  Crown,
  Clock,
  UsersRound
} from 'lucide-react';

interface TeamProgressProps {}

const TeamProgress: React.FC<TeamProgressProps> = () => {
  // Mock data - replace with real data
  const teamData = {
    totalOfficers: 8,
    teamCompletion: 76,
    todayProcessed: 89,
    todayNew: 102,
    avgRiskScore: 52,
    topPerformer: 'Officer X',
    escalationRate: 12,
    activeOfficers: 6
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
    color: string;
    percentage: number;
  }> = ({ label, value, color, percentage }) => (
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3"><UsersRound /></div>
            <h1 className="text-xl font-semibold text-gray-900">Team Progress</h1>
          </div>
        </div>
      </div>


          {/* Team Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Team Completion"
              value={`${teamData.teamCompletion}%`}
              subtitle="Weekly target progress"
              icon={<Users className="w-5 h-5" />}
              color="green"
              trend="5%"
            />
            <StatCard
              title="Today's Activity"
              value={`${teamData.todayProcessed}/${teamData.todayNew}`}
              subtitle="Processed vs New"
              icon={<Activity className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Avg Risk Score"
              value={teamData.avgRiskScore}
              subtitle="Team assessment"
              icon={<TrendingUp className="w-5 h-5" />}
              color="yellow"
            />
            <StatCard
              title="Escalation Rate"
              value={`${teamData.escalationRate}%`}
              subtitle="Requires supervisor"
              icon={<AlertTriangle className="w-5 h-5" />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Officer Performance */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Officer Performance</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{teamData.activeOfficers} active</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'Officer X', cases: 45, accuracy: 96, status: 'top', online: true },
                    { name: 'Officer Y', cases: 38, accuracy: 94, status: 'good', online: true },
                    { name: 'Officer Z', cases: 38, accuracy: 94, status: 'current', online: true },
                  ].map((officer, index) => (
                    <div key={officer.name} className={`flex items-center justify-between p-3 rounded-lg ${
                      officer.status === 'current' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold relative ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                          {index === 0 && <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-600" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{officer.name}</span>
                          <div className={`w-2 h-2 rounded-full ${officer.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{officer.cases} cases</span>
                        <span className={`text-gray-600 ${
                          officer.accuracy >= 95 ? 'text-green-600' : 
                          officer.accuracy >= 90 ? 'text-blue-600' : 
                          officer.accuracy >= 85 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {officer.accuracy}% accuracy
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Regional Distribution */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Regional Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-1">
                  <ProgressBar 
                    label="Makati Central" 
                    value={25}
                    color="bg-blue-500" 
                    percentage={35} 
                  />
                  <ProgressBar 
                    label="Ortigas Center, Pasig" 
                    value={18}
                    color="bg-green-500" 
                    percentage={25} 
                  />
                  <ProgressBar 
                    label="Tondo, Manila" 
                    value={15}
                    color="bg-yellow-500" 
                    percentage={21} 
                  />
                  <ProgressBar 
                    label="Fairview, QC" 
                    value={10}
                    color="bg-purple-500" 
                    percentage={14} 
                  />
                  <ProgressBar 
                    label="Alabang, Muntinlupa" 
                    value={4}
                    color="bg-red-500" 
                    percentage={5} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance Trends */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Team Performance Trends</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4 mb-6">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const values = [78, 82, 85, 79, 88, 45, 32];
                  const isToday = index === 2; // Wednesday
                  return (
                    <div key={day} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{day}</div>
                      <div 
                        className={`rounded-lg flex items-end justify-center text-white text-sm font-medium ${
                          isToday ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        style={{ 
                          height: `${Math.max(values[index] * 1.5, 30)}px`
                        }}
                      >
                        {values[index]}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">cases</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">453</div>
                  <div className="text-sm text-gray-600">Total This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">91%</div>
                  <div className="text-sm text-gray-600">Team Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">2.8hrs</div>
                  <div className="text-sm text-gray-600">Avg Processing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Activity Timeline & Workload Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Activity Timeline */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Team Activity Timeline</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Last 6 hours</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { time: '15:30', officer: 'Officer X', action: 'Completed low-risk case #4521', status: 'success' },
                    { time: '15:20', officer: 'Officer Z', action: 'Processing case #4518', status: 'active' },
                    { time: '15:10', officer: 'Officer X', action: 'Completed high-risk case #4521', status: 'success' },
                    { time: '14:50', officer: 'Officer Y', action: 'Processing case #4518', status: 'active' },
                    { time: '14:30', officer: 'Officer X', action: 'Completed high-risk case #4521', status: 'success' },
                    { time: '14:02', officer: 'Officer Y', action: 'Processing case #4518', status: 'active' },
                    { time: '13:45', officer: 'Officer Z', action: 'Completed medium-risk case', status: 'active' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 text-xs text-gray-500 font-medium mt-1">
                        {activity.time}
                      </div>
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                        activity.status === 'active' ? 'bg-blue-500 animate-pulse' :
                        activity.status === 'break' ? 'bg-orange-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{activity.officer}</span> {activity.action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workload Distribution */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Current Workload Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Workload by Priority */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Cases by Priority</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-red-600">23</span>
                        </div>
                        <div className="text-xs font-medium text-gray-900">High Priority</div>
                        <div className="text-xs text-gray-500">Urgent review</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-yellow-600">45</span>
                        </div>
                        <div className="text-xs font-medium text-gray-900">Medium Priority</div>
                        <div className="text-xs text-gray-500">Standard flow</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-green-600">67</span>
                        </div>
                        <div className="text-xs font-medium text-gray-900">Low Priority</div>
                        <div className="text-xs text-gray-500">Routine check</div>
                      </div>
                    </div>
                  </div>

                  {/* Officer Availability */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Officer Availability</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Officer X', status: 'available', load: 85, cases: 5 },
                        { name: 'Officer Y', status: 'available', load: 70, cases: 3 },
                        { name: 'Officer Z', status: 'break', load: 45, cases: 2 },
                      ].map((officer, ) => (
                        <div key={officer.name} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              officer.status === 'available' ? 'bg-green-500' :
                              officer.status === 'busy' ? 'bg-red-500' :
                              officer.status === 'break' ? 'bg-orange-500' :
                              'bg-gray-300'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900">{officer.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500">
                              {officer.cases} active
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  officer.load > 80 ? 'bg-red-500' :
                                  officer.load > 60 ? 'bg-yellow-500' :
                                  officer.load > 0 ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                                style={{ width: `${officer.load}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">
                              {officer.load}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

  );
};

export default TeamProgress;