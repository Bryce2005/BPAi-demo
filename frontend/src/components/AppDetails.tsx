import { useState} from 'react';
import { X, TrendingUp, Brain, FileText} from 'lucide-react';
import OverviewPage from './Overview';
import RiskAnalysisPage from './RiskAnalysis';
import AIInsights from './AIAnalysis';

// Move interface outside component
interface MLAnalysis {
  riskCategory: string;
  confidenceScore: number;
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
  const [mlAnalysis, ] = useState<MLAnalysis | null>(null);

  const [sharedAnalysis, setSharedAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleAnalysisComplete = (analysis: any) => {
    setSharedAnalysis(analysis);
  };
  
  const resetAnalysis = () => {
    setSharedAnalysis(null);
    setIsAnalyzing(false);
    // Also clear the global cache if you're using it
    if ((window as any).analysisCache) {
      delete (window as any).analysisCache[application.applicationId];
    }
  };
  
  const handleBackClick = () => {
    resetAnalysis(); // Reset the analysis state
    onClose(); // Close the modal/dialog
  };

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
              onClick={handleBackClick}
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
              onClick={handleBackClick}
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
              existingAnalysis={sharedAnalysis}
              onAnalysisComplete={handleAnalysisComplete}
              autoRunAnalysis={false}
            />
          )}

          {/* AI Insights Tab */}
          {activeTab === 'explanations' && (
            <AIInsights mlAnalysis={sharedAnalysis} isLoading={isAnalyzing} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;