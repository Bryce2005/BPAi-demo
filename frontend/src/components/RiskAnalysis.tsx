import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Download,
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Define the MLAnalysis type matching your FastAPI response
interface MLAnalysis {
  riskCategory: string;
  riskScore: number;
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

// API configuration
const API_BASE_URL = 'http://localhost:8000';

// API functions
const runMLAnalysis = async (applicationId: string): Promise<MLAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/api/ml/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      application_id: applicationId
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errorData.detail || `HTTP ${response.status}: Analysis failed`);
  }

  return await response.json();
};

const checkMLHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/ml/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return await response.json();
};

// const initializeMLModel = async () => {
//   const response = await fetch(`${API_BASE_URL}/api/ml/initialize`, {
//     method: 'POST',
//   });
//   if (!response.ok) {
//     throw new Error('Model initialization failed');
//   }
//   return await response.json();
// };

const generateReport = async (applicationId: string) => {
  // Mock implementation - replace with actual report generation API
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    reportUrl: `/api/reports/${applicationId}.pdf`,
    generated: true,
  };
};

interface RiskAnalysisProps {
  application: {
    applicationId: string;
  };
  onAnalysisComplete?: (analysis: MLAnalysis) => void; // Add this callback
}

const RiskAnalysisPage: React.FC<RiskAnalysisProps> = ({ application, onAnalysisComplete }) => {
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<any>(null);

  // Check model health on mount
  useEffect(() => {
    setTimeout(() => {
      checkModelHealth();
      runAnalysis();
    }, 1000);
  }, []);

  const checkModelHealth = async () => {
    try {
      const status = await checkMLHealth();
      setModelStatus(status);
      
      // // If model is not initialized, try to initialize it
      // if (!status.model_initialized) {
      //   console.log('Model not initialized, attempting to initialize...');
      //   await initializeMLModel();
      //   // Recheck status after initialization
      //   const newStatus = await checkMLHealth();
      //   setModelStatus(newStatus);
      // }
    } catch (error) {
      console.error('Model health check failed:', error);
      setError('ML service is unavailable');
    }
  };

    const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
        const analysis = await runMLAnalysis(application.applicationId);
        setMlAnalysis(analysis);
        // Add this line to pass analysis back to parent
        onAnalysisComplete?.(analysis);
    } catch (error: unknown) {
        // ... existing error handling
    } finally {
        setIsAnalyzing(false);
    }
    };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateReport(application.applicationId);
      setReportGenerated(true);
      console.log('Report generated:', report.reportUrl);
      // Optional: trigger download
      // window.open(report.reportUrl, '_blank');
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'Secure': return 'text-green-700 bg-green-100 border-green-200';
      case 'Unstable': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Risky': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'Default': return 'text-red-800 bg-red-200 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'Secure': return <CheckCircle className="w-5 h-5" />;
      case 'Unstable': return <AlertCircle className="w-5 h-5" />;
      case 'Risky': return <AlertTriangle className="w-5 h-5" />;
      case 'Critical': return <AlertTriangle className="w-5 h-5" />;
      case 'Default': return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getFiveCColor = (score: number) => {
    if (score > 0.05) return 'text-green-600 bg-green-50';
    if (score < -0.05) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getFeatureImpactColor = (impact: number) => {
    if (impact > 0) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Model Status Banner */}
      {/* {modelStatus && (
        <div className={`mb-6 p-4 rounded-lg border ${
          modelStatus.model_initialized 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <span className="font-medium">
              ML Model Status: {modelStatus.model_initialized ? 'Ready' : 'Initializing...'}
            </span>
          </div>
        </div>
      )} */}

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Running ML Risk Analysis...</p>
            <p className="text-gray-600">Analyzing application {application.applicationId}</p>
            <div className="mt-4 text-sm text-gray-500">
              Processing features, generating predictions, and creating explanations...
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600 pb-10">Begin Analysis</p>
            <div className="space-x-4">
              <button
                onClick={runAnalysis}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Analysis
              </button>
              <button
                onClick={checkModelHealth}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Check Model Status
              </button>
            </div>
          </div>
        </div>
      ) : mlAnalysis ? (
        <div className="space-y-6">
          {/* Risk Summary Header */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">ML Risk Assessment</h2>
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isGeneratingReport ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isGeneratingReport
                  ? 'Generating...'
                  : reportGenerated
                  ? 'Download Report'
                  : 'Generate Report'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-lg font-semibold border ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
                  {getRiskIcon(mlAnalysis.riskCategory)}
                  {mlAnalysis.riskCategory}
                </div>
                <p className="text-sm text-gray-600 mt-2">Risk Category</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {(mlAnalysis.riskScore * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${mlAnalysis.riskScore * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {(mlAnalysis.probabilities[mlAnalysis.riskCategory] * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Model Confidence</p>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Analysis Summary</h4>
                <p className="text-gray-700 leading-relaxed">{mlAnalysis.aiSummary}</p>
              </div>
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Risk Category Probabilities
            </h4>
            <div className="space-y-3">
              {Object.entries(mlAnalysis.probabilities)
                .sort(([,a], [,b]) => b - a) // Sort by probability descending
                .map(([category, prob]) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium">{category}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all duration-1000 ${getRiskCategoryColor(category).replace('text-', 'bg-').split(' ')[1]}`}
                      style={{ width: `${prob * 100}%` }}
                    ></div>
                    <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium text-gray-700">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5C Analysis */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Five C's of Credit Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(mlAnalysis.fiveCAnalysis).map(([category, score]) => (
                <div key={category} className={`text-center p-4 border-2 rounded-lg transition-all duration-300 hover:shadow-md ${getFiveCColor(score)}`}>
                  <div className={`text-2xl font-bold ${score > 0.05 ? 'text-green-700' : score < -0.05 ? 'text-red-700' : 'text-yellow-700'}`}>
                    {score > 0 ? '+' : ''}
                    {score.toFixed(3)}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">{category}</div>
                  <div className={`text-xs mt-1 font-medium ${score > 0.05 ? 'text-green-600' : score < -0.05 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {score > 0.05 ? 'Positive' : score < -0.05 ? 'Needs Attention' : 'Neutral'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LIME Features */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Key Factors Influencing Decision (LIME Analysis)
            </h4>
            <div className="space-y-3">
              {mlAnalysis.limeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-1 h-16 rounded-full ${getFeatureImpactColor(feature.impact)}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {feature.impact > 0 ? '+' : ''}
                      {feature.impact.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {feature.impact > 0 ? 'Reduces Risk' : 'Increases Risk'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recommended Improvements
            </h4>
            <div className="space-y-4">
              {mlAnalysis.improvements.map((improvement, index) => (
                <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div 
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: improvement.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-700">$1</strong>') 
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RiskAnalysisPage;
