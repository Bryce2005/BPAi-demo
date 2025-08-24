// import React, { useState, useEffect } from 'react';
// import {
//   RefreshCw,
//   AlertTriangle,
//   Download,
//   BarChart3,
//   Brain,
//   TrendingUp,
//   Shield,
//   AlertCircle,
//   CheckCircle,
// } from 'lucide-react';

// // Define the MLAnalysis type matching your FastAPI response
// interface MLAnalysis {
//   riskCategory: string;
//   confidenceScore: number;
//   probabilities: Record<string, number>;
//   limeFeatures: Array<{
//     feature: string;
//     impact: number;
//     description: string;
//   }>;
//   fiveCAnalysis: Record<string, number>;
//   improvements: string[];
//   aiSummary: string;
// }

// // API configuration
// const API_BASE_URL = 'http://localhost:8000';

// // API functions
// const runMLAnalysis = async (applicationId: string): Promise<MLAnalysis> => {
//   const response = await fetch(`${API_BASE_URL}/api/ml/analysis`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       application_id: applicationId
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
//     throw new Error(errorData.detail || `HTTP ${response.status}: Analysis failed`);
//   }

//   return await response.json();
// };

// const checkMLHealth = async () => {
//   const response = await fetch(`${API_BASE_URL}/api/ml/health`);
//   if (!response.ok) {
//     throw new Error('Health check failed');
//   }
//   return await response.json();
// };

// const generateReport = async (applicationId: string) => {
//   // Mock implementation - replace with actual report generation API
//   await new Promise((resolve) => setTimeout(resolve, 1500));
//   return {
//     reportUrl: `/api/reports/${applicationId}.pdf`,
//     generated: true,
//   };
// };

// interface RiskAnalysisProps {
//   application: {
//     applicationId: string;
//   };
//   // Pass existing analysis from parent to avoid re-running
//   existingAnalysis?: MLAnalysis | null;
//   onAnalysisComplete?: (analysis: MLAnalysis) => void;
//   // Add a flag to control whether to run analysis automatically
//   autoRunAnalysis?: boolean;
// }

// const RiskAnalysisPage: React.FC<RiskAnalysisProps> = ({ 
//   application, 
//   existingAnalysis = null,
//   onAnalysisComplete,
//   autoRunAnalysis = false // Changed default to false
// }) => {
//   const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(existingAnalysis);
//   const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
//   const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
//   const [reportGenerated, setReportGenerated] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [modelStatus, setModelStatus] = useState<any>(null);
//   const [hasRunInitialCheck, setHasRunInitialCheck] = useState<boolean>(false);

//   // Initialize with existing analysis if provided
//   useEffect(() => {
//     if (existingAnalysis) {
//       setMlAnalysis(existingAnalysis);
//     }
//   }, [existingAnalysis]);

//   // Only run initial setup, not analysis
//   useEffect(() => {
//     if (!hasRunInitialCheck) {
//       setTimeout(() => {
//         checkModelHealth();
//         // Only run analysis if autoRunAnalysis is true AND no existing analysis
//         if (autoRunAnalysis && !existingAnalysis) {
//           runAnalysis();
//         }
//         setHasRunInitialCheck(true);
//       }, 1000);
//     }
//   }, [autoRunAnalysis, existingAnalysis, hasRunInitialCheck]);

//   const checkModelHealth = async () => {
//     try {
//       const status = await checkMLHealth();
//       setModelStatus(status);
//     } catch (error) {
//       console.error('Model health check failed:', error);
//       setError('ML service is unavailable');
//     }
//   };

//   const runAnalysis = async () => {
//     setIsAnalyzing(true);
//     setError(null);
    
//     try {
//       const analysis = await runMLAnalysis(application.applicationId);
//       setMlAnalysis(analysis);
//       // Pass analysis back to parent for retention
//       onAnalysisComplete?.(analysis);
//     } catch (error: unknown) {
//       console.error('Analysis failed:', error);
//       setError(error instanceof Error ? error.message : 'Analysis failed');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleGenerateReport = async () => {
//     setIsGeneratingReport(true);
//     try {
//       const report = await generateReport(application.applicationId);
//       setReportGenerated(true);
//       console.log('Report generated:', report.reportUrl);
//     } catch (error) {
//       console.error('Report generation failed:', error);
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   };

//   const getRiskCategoryColor = (category: string) => {
//     switch (category) {
//       case 'Secure': return 'text-green-700 bg-green-100 border-green-200';
//       case 'Unstable': return 'text-blue-700 bg-blue-100 border-blue-200';
//       case 'Risky': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
//       case 'Critical': return 'text-purple-700 bg-purple-100 border-purple-200';
//       case 'Default': return 'text-red-800 bg-red-200 border-red-300';
//       default: return 'text-gray-700 bg-gray-100 border-gray-200';
//     }
//   };

//   const getRiskIcon = (category: string) => {
//     switch (category) {
//       case 'Secure': return <CheckCircle className="w-5 h-5" />;
//       case 'Unstable': return <AlertCircle className="w-5 h-5" />;
//       case 'Risky': return <AlertTriangle className="w-5 h-5" />;
//       case 'Critical': return <AlertTriangle className="w-5 h-5" />;
//       case 'Default': return <AlertTriangle className="w-5 h-5" />;
//       default: return <Shield className="w-5 h-5" />;
//     }
//   };

//   const getFiveCColor = (score: number) => {
//     if (score > 0.05) return 'text-green-600 bg-green-50';
//     if (score < -0.05) return 'text-red-600 bg-red-50';
//     return 'text-yellow-600 bg-yellow-50';
//   };

//   const getFeatureImpactColor = (impact: number) => {
//     if (impact > 0) return 'bg-green-500';
//     return 'bg-red-500';
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {isAnalyzing ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="text-center">
//             <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
//             <p className="text-lg font-medium">Running ML Risk Analysis...</p>
//             <p className="text-gray-600">Analyzing application {application.applicationId}</p>
//             <div className="mt-4 text-sm text-gray-500">
//               Processing features, generating predictions, and creating explanations...
//             </div>
//           </div>
//         </div>
//       ) : !mlAnalysis ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="text-center">
//             <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
//             <p className="text-lg font-medium text-gray-600 mb-2">ML Risk Analysis</p>
//             <p className="text-sm text-gray-500 mb-8">
//               {error ? `Error: ${error}` : 'Ready to analyze application risk factors'}
//             </p>
//             <div className="space-x-4">
//               <button
//                 onClick={runAnalysis}
//                 disabled={isAnalyzing}
//                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//               >
//                 {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
//               </button>
//             </div>
//             {error && (
//               <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Risk Summary Header */}
//           <div className="bg-white border rounded-xl shadow-sm p-6">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <Brain className="w-6 h-6 text-blue-600" />
//                 <h2 className="text-2xl font-bold text-gray-900">ML Risk Assessment</h2>
//               </div>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={runAnalysis}
//                   disabled={isAnalyzing}
//                   className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
//                 >
//                   <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
//                   {isAnalyzing ? 'Re-analyzing...' : 'Re-run Analysis'}
//                 </button>
//                 <button
//                   onClick={handleGenerateReport}
//                   disabled={isGeneratingReport}
//                   className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                 >
//                   {isGeneratingReport ? (
//                     <RefreshCw className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Download className="w-4 h-4" />
//                   )}
//                   {isGeneratingReport
//                     ? 'Generating...'
//                     : reportGenerated
//                     ? 'Download Report'
//                     : 'Generate Report'}
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="text-center">
//                 <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-lg font-semibold border ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
//                   {getRiskIcon(mlAnalysis.riskCategory)}
//                   {mlAnalysis.riskCategory}
//                 </div>
//                 <p className="text-sm text-gray-600 mt-2">Risk Category</p>
//               </div>

//               <div className="text-center">
//                 <div className="text-3xl font-bold text-gray-800">
//                   {(mlAnalysis.confidenceScore * 100).toFixed(1)}%
//                 </div>
//                 <p className="text-sm text-gray-600">Model Confidence Score</p>
//                 <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-1000"
//                     style={{ width: `${mlAnalysis.confidenceScore * 100}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Probability Distribution */}
//           <div className="bg-white border rounded-xl shadow-sm p-6">
//             <h4 className="font-semibold mb-4 flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-blue-600" />
//               Risk Category Probabilities
//             </h4>
//             <div className="space-y-3">
//               {Object.entries(mlAnalysis.probabilities)
//                 .map(([category, prob]) => (
//                 <div key={category} className="flex items-center gap-3">
//                   <div className="w-20 text-sm font-medium">{category}</div>
//                   <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
//                     <div
//                       className={`h-6 rounded-full transition-all duration-1000 ${getRiskCategoryColor(category).replace('text-', 'bg-').split(' ')[1]}`}
//                       style={{ width: `${prob * 100}%` }}
//                     ></div>
//                     <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium text-gray-700">
//                       {(prob * 100).toFixed(1)}%
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 5C Analysis */}
//           <div className="bg-white border rounded-xl shadow-sm p-6">
//             <h4 className="font-semibold mb-4 flex items-center gap-2">
//               <BarChart3 className="w-5 h-5 text-blue-600" />
//               Five C's of Credit Analysis
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//               {Object.entries(mlAnalysis.fiveCAnalysis).map(([category, score]) => (
//                 <div key={category} className={`text-center p-4 border-2 rounded-lg transition-all duration-300 hover:shadow-md ${getFiveCColor(score)}`}>
//                   <div className={`text-2xl font-bold ${score > 0.05 ? 'text-green-700' : score < -0.05 ? 'text-red-700' : 'text-yellow-700'}`}>
//                     {score > 0 ? '+' : ''}
//                     {score.toFixed(3)}
//                   </div>
//                   <div className="text-sm font-semibold text-gray-700 mt-1">{category}</div>
//                   <div className={`text-xs mt-1 font-medium ${score > 0.05 ? 'text-green-600' : score < -0.05 ? 'text-red-600' : 'text-yellow-600'}`}>
//                     {score > 0.05 ? 'Positive' : score < -0.05 ? 'Needs Attention' : 'Neutral'}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* LIME Features */}
//           <div className="bg-white border rounded-xl shadow-sm p-6">
//             <h4 className="font-semibold mb-4 flex items-center gap-2">
//               <AlertCircle className="w-5 h-5 text-blue-600" />
//               Key Factors Influencing Decision (LIME Analysis)
//             </h4>
//             <div className="space-y-3">
//               {mlAnalysis.limeFeatures.map((feature, index) => (
//                 <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                   <div className={`w-1 h-16 rounded-full ${getFeatureImpactColor(feature.impact)}`}></div>
//                   <div className="flex-1 min-w-0">
//                     <div className="font-medium text-gray-900 truncate">
//                       {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                     </div>
//                     <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
//                   </div>
//                   <div className="text-right">
//                     <div className={`font-bold text-lg ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                       {feature.impact > 0 ? '+' : ''}
//                       {feature.impact.toFixed(3)}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {feature.impact > 0 ? 'Reduces Risk' : 'Increases Risk'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RiskAnalysisPage;

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

// Updated generateReport function to call your backend
const generateReport = async (applicationId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/ml/generate-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      application_id: applicationId
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Report generation failed' }));
    throw new Error(errorData.detail || `HTTP ${response.status}: Report generation failed`);
  }

  const data = await response.json();
  return {
    reportUrl: `${API_BASE_URL}/api/ml/download-report/${applicationId}`, // Adjust URL as needed
    generated: data.success || true,
    message: data.message || 'Report generated successfully'
  };
};

// Alternative: If you want to download the report directly
const downloadReport = async (applicationId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/ml/download-report/${applicationId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Report download failed');
  }

  // Create blob and download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loan_analysis_report_${applicationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

interface RiskAnalysisProps {
  application: {
    applicationId: string;
  };
  // Pass existing analysis from parent to avoid re-running
  existingAnalysis?: MLAnalysis | null;
  onAnalysisComplete?: (analysis: MLAnalysis) => void;
  // Add a flag to control whether to run analysis automatically
  autoRunAnalysis?: boolean;
}

const RiskAnalysisPage: React.FC<RiskAnalysisProps> = ({ 
  application, 
  existingAnalysis = null,
  onAnalysisComplete,
  autoRunAnalysis = false // Changed default to false
}) => {
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(existingAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [hasRunInitialCheck, setHasRunInitialCheck] = useState<boolean>(false);

  // Initialize with existing analysis if provided
  useEffect(() => {
    if (existingAnalysis) {
      setMlAnalysis(existingAnalysis);
    }
  }, [existingAnalysis]);

  // Only run initial setup, not analysis
  useEffect(() => {
    if (!hasRunInitialCheck) {
      setTimeout(() => {
        checkModelHealth();
        // Only run analysis if autoRunAnalysis is true AND no existing analysis
        if (autoRunAnalysis && !existingAnalysis) {
          runAnalysis();
        }
        setHasRunInitialCheck(true);
      }, 1000);
    }
  }, [autoRunAnalysis, existingAnalysis, hasRunInitialCheck]);

  const checkModelHealth = async () => {
    try {
      const status = await checkMLHealth();
      setModelStatus(status);
    } catch (error) {
      console.error('Model health check failed:', error);
      setError('ML service is unavailable');
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    // Reset report state when running new analysis
    setReportGenerated(false);
    setReportUrl(null);
    setReportError(null);
    
    try {
      const analysis = await runMLAnalysis(application.applicationId);
      setMlAnalysis(analysis);
      // Pass analysis back to parent for retention
      onAnalysisComplete?.(analysis);
    } catch (error: unknown) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!mlAnalysis) {
      setReportError('Please run analysis first before generating report');
      return;
    }

    setIsGeneratingReport(true);
    setReportError(null);
    
    try {
      const report = await generateReport(application.applicationId);
      setReportGenerated(true);
      setReportUrl(report.reportUrl);
      console.log('Report generated:', report.reportUrl);
    } catch (error: unknown) {
      console.error('Report generation failed:', error);
      setReportError(error instanceof Error ? error.message : 'Report generation failed');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async () => {
    if (reportUrl) {
      // Option 1: Open in new tab
      window.open(reportUrl, '_blank');
      
      // Option 2: Direct download (uncomment if you prefer this)
      // try {
      //   await downloadReport(application.applicationId);
      // } catch (error) {
      //   console.error('Download failed:', error);
      //   setReportError(error instanceof Error ? error.message : 'Download failed');
      // }
    }
  };

  const handleReportButtonClick = () => {
    if (reportGenerated && reportUrl) {
      handleDownloadReport();
    } else {
      handleGenerateReport();
    }
  };

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
      ) : !mlAnalysis ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">ML Risk Analysis</p>
            <p className="text-sm text-gray-500 mb-8">
              {error ? `Error: ${error}` : 'Ready to analyze application risk factors'}
            </p>
            <div className="space-x-4">
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Risk Summary Header */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">ML Risk Assessment</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Re-analyzing...' : 'Re-run Analysis'}
                </button>
                <button
                  onClick={handleReportButtonClick}
                  disabled={isGeneratingReport || !mlAnalysis}
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
            </div>

            {/* Report Error Display */}
            {reportError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Report Error: {reportError}
              </div>
            )}

            {/* Report Success Message */}
            {reportGenerated && !reportError && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Report generated successfully! Click "Download Report" to access it.
              </div>
            )}

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
                  {(mlAnalysis.confidenceScore * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Model Confidence Score</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${mlAnalysis.confidenceScore * 100}%` }}
                  ></div>
                </div>
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
        </div>
      )}
    </div>
  );
};

export default RiskAnalysisPage;