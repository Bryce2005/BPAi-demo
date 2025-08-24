import { useState} from 'react';
import { X, TrendingUp, CheckCircle, Brain, FileText} from 'lucide-react';
import OverviewPage from './Overview';
import RiskAnalysisPage from './RiskAnalysis';

// Move interface outside component
interface MLAnalysis {
  riskCategory: string;
  riskScore: number;
  probabilities: Record<string, number>;
  limeFeatures: Array<{ feature: string; impact: number; description: string }>;
  fiveCAnalysis: Record<string, number>;
  improvements: string[];
  aiSummary: string;
}

interface ApplicationDetailsModalProps {
  application: any; // Replace 'any' with specific type
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationDetailsModal = ({ application, isOpen, onClose }: ApplicationDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  // Add mlAnalysis state if you need it for the modal header
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'Secure': return 'text-green-700 bg-green-100';
      case 'Unstable': return 'text-yellow-700 bg-yellow-100';
      case 'Risky': return 'text-orange-700 bg-orange-100';
      case 'Critical': return 'text-red-700 bg-red-100';
      case 'Default': return 'text-red-800 bg-red-200';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (!isOpen || !application) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: TrendingUp },
    { id: 'explanations', label: 'AI Insights', icon: Brain }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
              <p className="text-gray-600">Application ID: {application.applicationId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mlAnalysis && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
                {mlAnalysis.riskCategory}
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewPage application={application} />
          )}

          {/* Risk Analysis Tab */}
          {activeTab === 'risk-analysis' && (
            <RiskAnalysisPage 
              application={application}
              onAnalysisComplete={setMlAnalysis}
            />
          )}

          {/* AI Insights Tab */}
          {activeTab === 'explanations' && (
            <div className="p-6">
              {mlAnalysis ? (
                <div className="space-y-6">
                  {/* AI Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Analysis Summary
                    </h4>
                    <p className="text-blue-700 leading-relaxed">{mlAnalysis.aiSummary}</p>
                  </div>

                  {/* Improvement Suggestions */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Recommended Improvements
                    </h4>
                    <div className="space-y-4">
                      {mlAnalysis.improvements.map((improvement, index) => {
                        const [title, ...content] = improvement.split(':');
                        return (
                          <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                            <div className="font-medium text-green-700">{title.replace(/\*/g, '')}</div>
                            <div className="text-gray-700 mt-1">{content.join(':')}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-semibold text-yellow-800 mb-4">Recommended Next Steps</h4>
                    <ul className="space-y-2 text-yellow-700">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                        Schedule a follow-up call to discuss income improvement strategies
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                        Request additional documentation for alternative data verification
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                        Consider offering a smaller loan amount as an initial step
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600">Run risk analysis first to see AI insights</p>
                    <p className="text-sm text-gray-500 mt-2">Switch to the Risk Analysis tab to generate insights</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;