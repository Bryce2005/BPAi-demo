import React from 'react';
import {
  Brain,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  BarChart3,
} from 'lucide-react';

// Define the MLAnalysis type
interface MLAnalysis {
  riskCategory: string;
  riskScore?: number;
  confidenceScore: number;
  probabilities: Record<string, number>;
  limeFeatures: Array<{
    feature: string;
    impact: number;
    description: string;
  }>;
  fiveCAnalysis: Record<string, number>;
  improvements: string[];
  aiSummary: string;
}

interface AIInsightsProps {
  mlAnalysis: MLAnalysis | null;
  isLoading?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ mlAnalysis, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">Loading AI Insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mlAnalysis) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500 mb-2">No Analysis Available</p>
            <p className="text-sm text-gray-400">
              Run the ML Risk Analysis first to see AI-powered insights and recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'Secure': return 'text-green-700 bg-green-100 border-green-200';
      case 'Unstable': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'Risky': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Critical': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'Default': return 'text-red-800 bg-red-200 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return { level: 'Very High', color: 'text-green-600' };
    if (score >= 0.7) return { level: 'High', color: 'text-blue-600' };
    if (score >= 0.5) return { level: 'Moderate', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const confidenceInfo = getConfidenceLevel(mlAnalysis.confidenceScore);

  const getTopFactors = () => {
    return mlAnalysis.limeFeatures
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 3);
  };

  const getWorstPerformingCs = () => {
    return Object.entries(mlAnalysis.fiveCAnalysis)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      {/* AI Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 mb-3">AI Analysis Summary</h4>
            <p className="text-blue-700 leading-relaxed mb-4">{mlAnalysis.aiSummary}</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className={`p-3 rounded-lg border ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
                <div className="text-sm font-medium">Risk Classification</div>
                <div className="text-lg font-bold">{mlAnalysis.riskCategory}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Model Confidence</div>
                <div className={`text-lg font-bold ${confidenceInfo.color}`}>
                  {confidenceInfo.level} ({(mlAnalysis.confidenceScore * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Key Insights
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Influencing Factors */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-800 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Top Influencing Factors
            </h5>
            {getTopFactors().map((factor, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${factor.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {factor.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-600">{factor.description}</div>
                </div>
                <div className={`text-sm font-bold ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(3)}
                </div>
              </div>
            ))}
          </div>

          {/* Areas Needing Attention */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Areas Needing Attention
            </h5>
            {getWorstPerformingCs().map(([category, score], index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">{category}</div>
                  <div className="text-xs text-red-600">
                    Score: {score.toFixed(3)} - Below average performance
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Probability Breakdown */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Risk Probability Analysis
        </h4>
        <div className="space-y-3">
          {Object.entries(mlAnalysis.probabilities)
            .sort(([,a], [,b]) => b - a)
            .map(([category, prob]) => (
            <div key={category} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-700">{category}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ${getRiskCategoryColor(category).replace('text-', 'bg-').split(' ')[1]}`}
                  style={{ width: `${prob * 100}%` }}
                ></div>
                <span className="absolute right-2 top-0 h-4 flex items-center text-xs font-medium text-gray-700">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              {prob === Math.max(...Object.values(mlAnalysis.probabilities)) && (
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Predicted
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Improvements */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          AI-Recommended Improvements
        </h4>
        <div className="space-y-4">
          {mlAnalysis.improvements.map((improvement, index) => (
            <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide">
                    Recommendation #{index + 1}
                  </div>
                  <div className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                    High Priority
                  </div>
                </div>
                <div 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: improvement.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-700">$1</strong>') 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800">
          <Target className="w-5 h-5" />
          Next Steps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-purple-700">Immediate Actions:</h5>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• Review and address the top risk factors</li>
              <li>• Focus on improving {getWorstPerformingCs()[0]?.[0]} metrics</li>
              <li>• Implement high-priority recommendations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-purple-700">Monitor:</h5>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• Changes in risk category over time</li>
              <li>• Model confidence improvements</li>
              <li>• Implementation of suggested improvements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;