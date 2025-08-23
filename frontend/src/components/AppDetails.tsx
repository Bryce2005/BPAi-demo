import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, Brain, FileText, Download, RefreshCw, BarChart3 } from 'lucide-react';

// Mock API functions - you'll replace these with actual API calls
const mockMLAnalysis = async (applicationId: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    riskCategory: "Risky",
    riskScore: 0.65,
    probabilities: {
      "Secure": 0.15,
      "Unstable": 0.25,
      "Risky": 0.35,
      "Critical": 0.20,
      "Default": 0.05
    },
    limeFeatures: [
      { feature: "gross_monthly_income", impact: -0.12, description: "Monthly income below average" },
      { feature: "bpi_successful_loans", impact: 0.08, description: "Good loan repayment history" },
      { feature: "credit_limit", impact: -0.05, description: "Limited credit exposure" },
      { feature: "gcash_avg_monthly_deposits", impact: 0.03, description: "Regular digital payments" },
      { feature: "loan_amount_requested_php", impact: -0.15, description: "High loan amount relative to income" }
    ],
    fiveCAnalysis: {
      "Character": -0.05,
      "Capacity": -0.25,
      "Capital": -0.08,
      "Collateral": -0.12,
      "Conditions": 0.02
    },
    improvements: [
      "**Capacity Improvement:** To improve your ability to repay, consider actions that increase your net income. This could involve reducing existing monthly debt payments or increasing your average monthly bank deposits.",
      "**Collateral/Loan Terms Improvement:** The requested loan amount might be considered high relative to your overall financial profile. Applying for a smaller loan amount could increase your chances of approval.",
      "**Capital Improvement:** Your financial strength can be enhanced by increasing your personal savings or other liquid assets. Lenders see this as a safety net."
    ],
    aiSummary: "This application shows mixed signals with some positive indicators like good loan repayment history, but concerns around income capacity and loan amount relative to financial profile. The applicant demonstrates financial engagement through digital payment patterns but may benefit from improving their debt-to-income ratio."
  };
};

const mockGenerateReport = async (applicationId: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    reportUrl: `/api/reports/${applicationId}.pdf`,
    generated: true
  };
};

interface ApplicationDetailsModalProps {
  application: any; // Replace 'any' with a more specific type if available
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationDetailsModal = ({ application, isOpen, onClose }: ApplicationDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  interface MLAnalysis {
    riskCategory: string;
    riskScore: number;
    probabilities: Record<string, number>;
    limeFeatures: Array<{ feature: string; impact: number; description: string }>;
    fiveCAnalysis: Record<string, number>;
    improvements: string[];
    aiSummary: string;
  }
  
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && application && activeTab === 'risk-analysis' && !mlAnalysis) {
      runMLAnalysis();
    }
  }, [isOpen, application, activeTab]);

  const runMLAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await mockMLAnalysis(application.applicationId);
      setMlAnalysis(analysis);
    } catch (error) {
      console.error('ML Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await mockGenerateReport(application.applicationId);
      setReportGenerated(true);
      // You can trigger download here
      console.log('Report generated:', report.reportUrl);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGeneratingReport(false);
    }
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

  const getFiveCColor = (score: number) => {
    if (score > 0) return 'text-green-600';
    if (score < -0.1) return 'text-red-600';
    return 'text-yellow-600';
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
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <span className="w-4 h-4 text-blue-600">👤</span>
                      </div>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium">{application.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{application.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{application.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Civil Status</p>
                        <p className="font-medium">{application.civilStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <span className="w-4 h-4 text-green-600">💰</span>
                      </div>
                      Loan Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Loan Amount</p>
                        <p className="font-medium text-lg">₱{application.loanAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Purpose</p>
                        <p className="font-medium">{application.loanPurpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tenor</p>
                        <p className="font-medium">{application.loanTenor} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly Income</p>
                        <p className="font-medium">₱{application.monthlyIncome?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Application Status</h3>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'approved' ? 'text-green-700 bg-green-100' :
                      application.status === 'rejected' ? 'text-red-700 bg-red-100' :
                      'text-yellow-700 bg-yellow-100'
                    }`}>
                      {application.status}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium">{application.submissionDate}</p>
                    </div>
                  </div>

                  <button className="w-full bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors">
                    📧 Contact Client
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Risk Analysis Tab */}
          {activeTab === 'risk-analysis' && (
            <div className="p-6">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Running ML Risk Analysis...</p>
                    <p className="text-gray-600">This may take a few moments</p>
                  </div>
                </div>
              ) : mlAnalysis ? (
                <div className="space-y-6">
                  {/* Risk Summary */}
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Risk Assessment Summary</h3>
                      <button
                        onClick={generateReport}
                        disabled={isGeneratingReport}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isGeneratingReport ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isGeneratingReport ? 'Generating...' : reportGenerated ? 'Download Report' : 'Generate Report'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
                          {mlAnalysis.riskCategory}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Risk Category</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800">
                          {(mlAnalysis.riskScore * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Risk Score</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {(mlAnalysis.probabilities[mlAnalysis.riskCategory] * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Confidence</p>
                      </div>
                    </div>
                  </div>

                  {/* Probability Distribution */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Risk Category Probabilities</h4>
                    <div className="space-y-3">
                      {Object.entries(mlAnalysis.probabilities).map(([category, prob]) => (
                        <div key={category} className="flex items-center gap-3">
                          <div className="w-32 text-sm">{category}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className={`h-6 rounded-full transition-all duration-500 ${getRiskCategoryColor(category).replace('text-', 'bg-').split(' ')[1]}`}
                              style={{ width: `${prob * 100}%` }}
                            ></div>
                            <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium">
                              {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5C Analysis */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Five C's of Credit Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(mlAnalysis.fiveCAnalysis).map(([category, score]) => (
                        <div key={category} className="text-center p-4 border rounded-lg">
                          <div className={`text-2xl font-bold ${getFiveCColor(score)}`}>
                            {score > 0 ? '+' : ''}{score.toFixed(2)}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">{category}</div>
                          <div className={`text-xs mt-1 ${getFiveCColor(score)}`}>
                            {score > 0 ? 'Positive' : score < -0.1 ? 'Needs Attention' : 'Neutral'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Features Impact */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Key Factors Influencing Decision</h4>
                    <div className="space-y-3">
                      {mlAnalysis.limeFeatures.map((feature: { impact: number; feature: string; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: React.Key | null | undefined) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-12 rounded ${feature.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className="flex-1">
                            <div className="font-medium">{feature.feature.replace(/_/g, ' ').toUpperCase()}</div>
                            <div className="text-sm text-gray-600">{feature.description}</div>
                          </div>
                          <div className={`font-bold ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {feature.impact > 0 ? '+' : ''}{feature.impact.toFixed(3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600">ML Analysis not available</p>
                    <button 
                      onClick={runMLAnalysis}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Run Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
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

// import React, { useState, useEffect } from 'react';
// import { X, TrendingUp, AlertTriangle, CheckCircle, Brain, FileText, Download, RefreshCw, BarChart3 } from 'lucide-react';

// const runMLAnalysis = async (applicationId: any) => {
//   try {
//     const response = await fetch('/api/ml/analysis', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ application_id: applicationId }),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//     }
    
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('ML Analysis API error:', error);
//     // Fallback to mock data if API fails
//     return getMockAnalysisForApplication(applicationId);
//   }
// };

// // Enhanced mock function that generates different data per application
// const getMockAnalysisForApplication = (applicationId: any) => {
//   // Use application ID as seed for consistent but different results
//   const seed = typeof applicationId === 'string' ? applicationId.length : applicationId;
//   const random = (min: number, max: number) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);
  
//   const categories = ["Pass", "Especially Mentioned (EM)", "Substandard", "Doubtful", "Loss"];
//   const categoryIndex = Math.floor(random(0, categories.length));
//   const riskCategory = categories[categoryIndex];
  
//   // Generate probabilities that sum to 1
//   const baseProbs = [0.2, 0.25, 0.3, 0.2, 0.05];
//   const probabilities: Record<string, number> = {};
//   let total = 0;
  
//   categories.forEach((cat, idx) => {
//     const variance = random(-0.1, 0.1);
//     probabilities[cat] = Math.max(0.01, baseProbs[idx] + variance);
//     total += probabilities[cat];
//   });
  
//   // Normalize to sum to 1
//   Object.keys(probabilities).forEach(key => {
//     probabilities[key] = probabilities[key] / total;
//   });
  
//   // Boost the selected category probability
//   probabilities[riskCategory] = Math.max(probabilities[riskCategory], 0.3);
  
//   const riskScore = random(0.1, 0.9);
  
//   // Generate LIME features with realistic variations
//   const featureTemplates = [
//     { feature: "gross_monthly_income", baseImpact: -0.12, desc: "Monthly income analysis" },
//     { feature: "bpi_successful_loans", baseImpact: 0.08, desc: "Loan repayment history" },
//     { feature: "credit_limit", baseImpact: -0.05, desc: "Credit exposure assessment" },
//     { feature: "gcash_avg_monthly_deposits", baseImpact: 0.03, desc: "Digital payment patterns" },
//     { feature: "loan_amount_requested_php", baseImpact: -0.15, desc: "Requested amount analysis" },
//     { feature: "employment_type", baseImpact: random(-0.1, 0.1), desc: "Employment stability" },
//     { feature: "civil_status", baseImpact: random(-0.05, 0.05), desc: "Marital status impact" }
//   ];
  
//   const limeFeatures = featureTemplates.map(template => ({
//     feature: template.feature,
//     impact: template.baseImpact + random(-0.05, 0.05),
//     description: template.desc
//   }));
  
//   // 5C Analysis with variations
//   const fiveCAnalysis = {
//     "Character": random(-0.3, 0.2),
//     "Capacity": random(-0.4, 0.1),
//     "Capital": random(-0.2, 0.15),
//     "Collateral": random(-0.25, 0.1),
//     "Conditions": random(-0.1, 0.15)
//   };
  
//   // Generate context-aware improvements
//   const improvementTemplates = [
//     "**Capacity Improvement:** Consider strategies to increase your net income or reduce existing debt obligations.",
//     "**Capital Improvement:** Building emergency savings and liquid assets strengthens your financial profile.",
//     "**Character Improvement:** Maintaining consistent payment history across all financial obligations is crucial.",
//     "**Collateral Improvement:** Consider adjusting loan amount or providing additional security if possible.",
//     "**Conditions Improvement:** Economic factors and loan purpose alignment affect approval likelihood."
//   ];
  
//   const selectedImprovements = improvementTemplates
//     .sort(() => random(0, 1) - 0.5)
//     .slice(0, 3);
  
//   // Generate contextual AI summary
//   const summaryTemplates = [
//     `This application shows ${riskCategory === "Pass" ? "strong" : "mixed"} financial indicators with ${riskScore > 0.6 ? "elevated" : "moderate"} risk factors.`,
//     `The analysis reveals ${Object.values(fiveCAnalysis).filter(v => v > 0).length} positive and ${Object.values(fiveCAnalysis).filter(v => v < 0).length} concerning areas across the 5 C's of credit.`,
//     `Key strengths include ${limeFeatures.filter(f => f.impact > 0).map(f => f.feature).join(", ")} while areas needing attention are ${limeFeatures.filter(f => f.impact < 0).slice(0, 2).map(f => f.feature).join(", ")}.`
//   ];
  
//   const aiSummary = summaryTemplates.join(" ");
  
//   return {
//     riskCategory,
//     riskScore,
//     probabilities,
//     limeFeatures,
//     fiveCAnalysis,
//     improvements: selectedImprovements,
//     aiSummary
//   };
// };

// // // Mock API functions - replace these with actual API calls
// // const mockMLAnalysis = async (applicationId: any) => {
// //   // Simulate API delay
// //   await new Promise(resolve => setTimeout(resolve, 2000));
  
// //   return {
// //     riskCategory: "Substandard",
// //     riskScore: 0.65,
// //     probabilities: {
// //       "Pass": 0.15,
// //       "Especially Mentioned (EM)": 0.25,
// //       "Substandard": 0.35,
// //       "Doubtful": 0.20,
// //       "Loss": 0.05
// //     },
// //     limeFeatures: [
// //       { feature: "gross_monthly_income", impact: -0.12, description: "Monthly income below average" },
// //       { feature: "bpi_successful_loans", impact: 0.08, description: "Good loan repayment history" },
// //       { feature: "credit_limit", impact: -0.05, description: "Limited credit exposure" },
// //       { feature: "gcash_avg_monthly_deposits", impact: 0.03, description: "Regular digital payments" },
// //       { feature: "loan_amount_requested_php", impact: -0.15, description: "High loan amount relative to income" }
// //     ],
// //     fiveCAnalysis: {
// //       "Character": -0.05,
// //       "Capacity": -0.25,
// //       "Capital": -0.08,
// //       "Collateral": -0.12,
// //       "Conditions": 0.02
// //     },
// //     improvements: [
// //       "**Capacity Improvement:** To improve your ability to repay, consider actions that increase your net income. This could involve reducing existing monthly debt payments or increasing your average monthly bank deposits.",
// //       "**Collateral/Loan Terms Improvement:** The requested loan amount might be considered high relative to your overall financial profile. Applying for a smaller loan amount could increase your chances of approval.",
// //       "**Capital Improvement:** Your financial strength can be enhanced by increasing your personal savings or other liquid assets. Lenders see this as a safety net."
// //     ],
// //     aiSummary: "This application shows mixed signals with some positive indicators like good loan repayment history, but concerns around income capacity and loan amount relative to financial profile. The applicant demonstrates financial engagement through digital payment patterns but may benefit from improving their debt-to-income ratio."
// //   };
// // };

// const mockGenerateReport = async (applicationId: any) => {
//   await new Promise(resolve => setTimeout(resolve, 1500));
//   return {
//     reportUrl: `/api/reports/${applicationId}.pdf`,
//     generated: true
//   };
// };

// // Type definitions
// interface Application {
//   applicationId: number;
//   status: 'Approved' | 'Rejected' | 'For Review' | 'Pending';
//   riskScore?: number;
//   rationale?: string;
//   submissionDate: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   civilStatus: string;
//   loanAmount: number;
//   loanPurpose: string;
//   loanTenor: number;
//   monthlyIncome: number;
// }

// interface MLAnalysis {
//   riskCategory: string;
//   riskScore: number;
//   probabilities: Record<string, number>;
//   limeFeatures: Array<{ feature: string; impact: number; description: string }>;
//   fiveCAnalysis: Record<string, number>;
//   improvements: string[];
//   aiSummary: string;
// }

// interface ApplicationDetailsModalProps {
//   application: Application | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ application, isOpen, onClose }) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);
//   const [reportGenerated, setReportGenerated] = useState(false);

//   useEffect(() => {
//     if (isOpen && application && activeTab === 'risk-analysis' && !mlAnalysis) {
//       runMLAnalysis();
//     }
//   }, [isOpen, application, activeTab, mlAnalysis]);

//   const runMLAnalysis = async () => {
//     if (!application) return;
    
//     setIsAnalyzing(true);
//     try {
//       const analysis = await runMLAnalysis(application.applicationId);
//       setMlAnalysis(analysis);
//     } catch (error) {
//       console.error('ML Analysis failed:', error);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const generateReport = async () => {
//     if (!application) return;
    
//     setIsGeneratingReport(true);
//     try {
//       const report = await mockGenerateReport(application.applicationId);
//       setReportGenerated(true);
//       // You can trigger download here
//       console.log('Report generated:', report.reportUrl);
//     } catch (error) {
//       console.error('Report generation failed:', error);
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   };

//   const getRiskCategoryColor = (category: string) => {
//     switch (category) {
//       case 'Pass': 
//         return 'text-green-700 bg-green-100';
//       case 'Especially Mentioned (EM)': 
//         return 'text-yellow-700 bg-yellow-100';
//       case 'Substandard': 
//         return 'text-orange-700 bg-orange-100';
//       case 'Doubtful': 
//         return 'text-red-700 bg-red-100';
//       case 'Loss': 
//         return 'text-red-800 bg-red-200';
//       default: 
//         return 'text-gray-700 bg-gray-100';
//     }
//   };

//   const getFiveCColor = (score: number) => {
//     if (score > 0) return 'text-green-600';
//     if (score < -0.1) return 'text-red-600';
//     return 'text-yellow-600';
//   };

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setActiveTab('overview');
//       setMlAnalysis(null);
//       setIsAnalyzing(false);
//       setIsGeneratingReport(false);
//       setReportGenerated(false);
//     }
//   }, [isOpen]);

//   if (!isOpen || !application) return null;

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: FileText },
//     { id: 'risk-analysis', label: 'Risk Analysis', icon: TrendingUp },
//     { id: 'explanations', label: 'AI Insights', icon: Brain }
//   ];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b bg-gray-50">
//           <div className="flex items-center gap-3">
//             <button 
//               onClick={onClose}
//               className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
//             >
//               ← Back
//             </button>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
//               <p className="text-gray-600">Application ID: {application.applicationId}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {mlAnalysis && (
//               <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
//                 {mlAnalysis.riskCategory}
//               </div>
//             )}
//             <button 
//               onClick={onClose}
//               className="p-2 hover:bg-gray-200 rounded-full"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex border-b bg-gray-50">
//           {tabs.map((tab) => {
//             const IconComponent = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
//                   activeTab === tab.id
//                     ? 'text-red-600 border-b-2 border-red-600 bg-white'
//                     : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
//                 }`}
//               >
//                 <IconComponent className="w-4 h-4" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Tab Content */}
//         <div className="flex-1 overflow-y-auto">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="p-6">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Personal Information */}
//                 <div className="lg:col-span-2 space-y-6">
//                   <div className="bg-white border rounded-lg p-4">
//                     <h3 className="font-medium mb-4 flex items-center gap-2">
//                       <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
//                         <span className="w-4 h-4 text-blue-600">👤</span>
//                       </div>
//                       Personal Information
//                     </h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-sm text-gray-600">Full Name</p>
//                         <p className="font-medium">{application.fullName}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Email</p>
//                         <p className="font-medium">{application.email}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Phone</p>
//                         <p className="font-medium">{application.phoneNumber}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Civil Status</p>
//                         <p className="font-medium">{application.civilStatus}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Loan Details */}
//                   <div className="bg-white border rounded-lg p-4">
//                     <h3 className="font-medium mb-4 flex items-center gap-2">
//                       <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
//                         <span className="w-4 h-4 text-green-600">💰</span>
//                       </div>
//                       Loan Information
//                     </h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-sm text-gray-600">Loan Amount</p>
//                         <p className="font-medium text-lg">₱{application.loanAmount?.toLocaleString()}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Purpose</p>
//                         <p className="font-medium">{application.loanPurpose}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Tenor</p>
//                         <p className="font-medium">{application.loanTenor} months</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Monthly Income</p>
//                         <p className="font-medium">₱{application.monthlyIncome?.toLocaleString()}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Panel */}
//                 <div className="space-y-6">
//                   <div className="bg-white border rounded-lg p-4">
//                     <h3 className="font-medium mb-4">Application Status</h3>
//                     <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
//                       application.status === 'Approved' ? 'text-green-700 bg-green-100' :
//                       application.status === 'Rejected' ? 'text-red-700 bg-red-100' :
//                       'text-yellow-700 bg-yellow-100'
//                     }`}>
//                       {application.status}
//                     </div>
//                     <div className="mt-4">
//                       <p className="text-sm text-gray-600">Submitted</p>
//                       <p className="font-medium">{application.submissionDate}</p>
//                     </div>
//                   </div>

//                   <button className="w-full bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors">
//                     📧 Contact Client
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Risk Analysis Tab */}
//           {activeTab === 'risk-analysis' && (
//             <div className="p-6">
//               {isAnalyzing ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="text-center">
//                     <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
//                     <p className="text-lg font-medium">Running ML Risk Analysis...</p>
//                     <p className="text-gray-600">This may take a few moments</p>
//                   </div>
//                 </div>
//               ) : mlAnalysis ? (
//                 <div className="space-y-6">
//                   {/* Risk Summary */}
//                   <div className="bg-white border rounded-lg p-6">
//                     <div className="flex items-center justify-between mb-6">
//                       <h3 className="text-xl font-semibold">Risk Assessment Summary</h3>
//                       <button
//                         onClick={generateReport}
//                         disabled={isGeneratingReport}
//                         className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                       >
//                         {isGeneratingReport ? (
//                           <RefreshCw className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Download className="w-4 h-4" />
//                         )}
//                         {isGeneratingReport ? 'Generating...' : reportGenerated ? 'Download Report' : 'Generate Report'}
//                       </button>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div className="text-center">
//                         <div className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
//                           {mlAnalysis.riskCategory}
//                         </div>
//                         <p className="text-sm text-gray-600 mt-2">Risk Category</p>
//                       </div>
                      
//                       <div className="text-center">
//                         <div className="text-3xl font-bold text-gray-800">
//                           {(mlAnalysis.riskScore * 100).toFixed(1)}%
//                         </div>
//                         <p className="text-sm text-gray-600">Risk Score</p>
//                       </div>
                      
//                       <div className="text-center">
//                         <div className="text-3xl font-bold text-blue-600">
//                           {(mlAnalysis.probabilities[mlAnalysis.riskCategory] * 100).toFixed(1)}%
//                         </div>
//                         <p className="text-sm text-gray-600">Confidence</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Probability Distribution */}
//                   <div className="bg-white border rounded-lg p-6">
//                     <h4 className="font-semibold mb-4">Risk Category Probabilities</h4>
//                     <div className="space-y-3">
//                       {Object.entries(mlAnalysis.probabilities).map(([category, prob]) => (
//                         <div key={category} className="flex items-center gap-3">
//                           <div className="w-32 text-sm">{category}</div>
//                           <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
//                             <div 
//                               className={`h-6 rounded-full transition-all duration-500 ${getRiskCategoryColor(category).replace('text-', 'bg-').split(' ')[1]}`}
//                               style={{ width: `${prob * 100}%` }}
//                             ></div>
//                             <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium">
//                               {(prob * 100).toFixed(1)}%
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* 5C Analysis */}
//                   <div className="bg-white border rounded-lg p-6">
//                     <h4 className="font-semibold mb-4 flex items-center gap-2">
//                       <BarChart3 className="w-5 h-5" />
//                       Five C's of Credit Analysis
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                       {Object.entries(mlAnalysis.fiveCAnalysis).map(([category, score]) => (
//                         <div key={category} className="text-center p-4 border rounded-lg">
//                           <div className={`text-2xl font-bold ${getFiveCColor(score)}`}>
//                             {score > 0 ? '+' : ''}{score.toFixed(2)}
//                           </div>
//                           <div className="text-sm font-medium text-gray-700 mt-1">{category}</div>
//                           <div className={`text-xs mt-1 ${getFiveCColor(score)}`}>
//                             {score > 0 ? 'Positive' : score < -0.1 ? 'Needs Attention' : 'Neutral'}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Key Features Impact */}
//                   <div className="bg-white border rounded-lg p-6">
//                     <h4 className="font-semibold mb-4">Key Factors Influencing Decision</h4>
//                     <div className="space-y-3">
//                       {mlAnalysis.limeFeatures.map((feature, index) => (
//                         <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
//                           <div className={`w-2 h-12 rounded ${feature.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                           <div className="flex-1">
//                             <div className="font-medium">{feature.feature.replace(/_/g, ' ').toUpperCase()}</div>
//                             <div className="text-sm text-gray-600">{feature.description}</div>
//                           </div>
//                           <div className={`font-bold ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                             {feature.impact > 0 ? '+' : ''}{feature.impact.toFixed(3)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="text-center">
//                     <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-lg font-medium text-gray-600">ML Analysis not available</p>
//                     <button 
//                       onClick={runMLAnalysis}
//                       className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//                     >
//                       Run Analysis
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* AI Insights Tab */}
//           {activeTab === 'explanations' && (
//             <div className="p-6">
//               {mlAnalysis ? (
//                 <div className="space-y-6">
//                   {/* AI Summary */}
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//                     <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
//                       <Brain className="w-5 h-5" />
//                       AI Analysis Summary
//                     </h4>
//                     <p className="text-blue-700 leading-relaxed">{mlAnalysis.aiSummary}</p>
//                   </div>

//                   {/* Improvement Suggestions */}
//                   <div className="bg-white border rounded-lg p-6">
//                     <h4 className="font-semibold mb-4 flex items-center gap-2">
//                       <CheckCircle className="w-5 h-5 text-green-600" />
//                       Recommended Improvements
//                     </h4>
//                     <div className="space-y-4">
//                       {mlAnalysis.improvements.map((improvement, index) => {
//                         const [title, ...content] = improvement.split(':');
//                         return (
//                           <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
//                             <div className="font-medium text-green-700">{title.replace(/\*/g, '')}</div>
//                             <div className="text-gray-700 mt-1">{content.join(':')}</div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* Action Items */}
//                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//                     <h4 className="font-semibold text-yellow-800 mb-4">Recommended Next Steps</h4>
//                     <ul className="space-y-2 text-yellow-700">
//                       <li className="flex items-start gap-2">
//                         <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
//                         Schedule a follow-up call to discuss income improvement strategies
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
//                         Request additional documentation for alternative data verification
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
//                         Consider offering a smaller loan amount as an initial step
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="text-center">
//                     <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-lg font-medium text-gray-600">Run risk analysis first to see AI insights</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplicationDetailsModal;

{/* WITH LATEST CODE - REAL API CALL*/}

// import React, { useState, useEffect, useCallback } from 'react';
// import { X, TrendingUp, AlertTriangle, CheckCircle, Brain, FileText, Download, RefreshCw, BarChart3 } from 'lucide-react';

// // --- API & Mock Functions ---

// // Main API call function for ML analysis
// const runMLAnalysis = async (applicationId: number) => {
//   try {
//     const response = await fetch('/api/ml/analysis', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ application_id: applicationId }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('ML Analysis API error:', error);
//     // Fallback to mock data if API fails
//     return getMockAnalysisForApplication(applicationId);
//   }
// };

// // Mock function that generates consistent but different data per application
// const getMockAnalysisForApplication = (applicationId: number) => {
//   const seed = applicationId;
//   const random = (min: number, max: number) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);

//   const categories = ["Pass", "Especially Mentioned (EM)", "Substandard", "Doubtful", "Loss"];
//   const categoryIndex = Math.floor(random(0, categories.length));
//   const riskCategory = categories[categoryIndex];

//   // Generate probabilities that sum to 1, with a boost to the selected category
//   const baseProbs = [0.2, 0.25, 0.3, 0.2, 0.05];
//   const probabilities: Record<string, number> = {};
//   let total = 0;
//   categories.forEach((cat, idx) => {
//     const variance = random(-0.1, 0.1);
//     probabilities[cat] = Math.max(0.01, baseProbs[idx] + variance);
//     total += probabilities[cat];
//   });
//   Object.keys(probabilities).forEach(key => {
//     probabilities[key] = probabilities[key] / total;
//   });
//   probabilities[riskCategory] = Math.max(probabilities[riskCategory], 0.3);

//   const riskScore = random(0.1, 0.9);

//   const featureTemplates = [
//     { feature: "gross_monthly_income", baseImpact: -0.12, desc: "Monthly income analysis" },
//     { feature: "bpi_successful_loans", baseImpact: 0.08, desc: "Loan repayment history" },
//     { feature: "credit_limit", baseImpact: -0.05, desc: "Credit exposure assessment" },
//     { feature: "gcash_avg_monthly_deposits", baseImpact: 0.03, desc: "Digital payment patterns" },
//     { feature: "loan_amount_requested_php", baseImpact: -0.15, desc: "Requested amount analysis" },
//     { feature: "employment_type", baseImpact: random(-0.1, 0.1), desc: "Employment stability" },
//     { feature: "civil_status", baseImpact: random(-0.05, 0.05), desc: "Marital status impact" }
//   ];

//   const limeFeatures = featureTemplates.map(template => ({
//     feature: template.feature,
//     impact: template.baseImpact + random(-0.05, 0.05),
//     description: template.desc
//   }));

//   const fiveCAnalysis = {
//     "Character": random(-0.3, 0.2),
//     "Capacity": random(-0.4, 0.1),
//     "Capital": random(-0.2, 0.15),
//     "Collateral": random(-0.25, 0.1),
//     "Conditions": random(-0.1, 0.15)
//   };

//   const improvementTemplates = [
//     "**Capacity Improvement:** Consider strategies to increase your net income or reduce existing debt obligations.",
//     "**Capital Improvement:** Building emergency savings and liquid assets strengthens your financial profile.",
//     "**Character Improvement:** Maintaining consistent payment history across all financial obligations is crucial.",
//     "**Collateral Improvement:** Consider adjusting loan amount or providing additional security if possible.",
//     "**Conditions Improvement:** Economic factors and loan purpose alignment affect approval likelihood."
//   ];
//   const selectedImprovements = improvementTemplates.sort(() => random(0, 1) - 0.5).slice(0, 3);

//   const summaryTemplates = [
//     `This application shows ${riskCategory === "Pass" ? "strong" : "mixed"} financial indicators with ${riskScore > 0.6 ? "elevated" : "moderate"} risk factors.`,
//     `The analysis reveals ${Object.values(fiveCAnalysis).filter(v => v > 0).length} positive and ${Object.values(fiveCAnalysis).filter(v => v < 0).length} concerning areas across the 5 C's of credit.`,
//     `Key strengths include ${limeFeatures.filter(f => f.impact > 0).map(f => f.feature).join(", ")} while areas needing attention are ${limeFeatures.filter(f => f.impact < 0).slice(0, 2).map(f => f.feature).join(", ")}.`
//   ];
//   const aiSummary = summaryTemplates.join(" ");

//   return {
//     riskCategory,
//     riskScore,
//     probabilities,
//     limeFeatures,
//     fiveCAnalysis,
//     improvements: selectedImprovements,
//     aiSummary
//   };
// };

// // Mock report generation API call
// const mockGenerateReport = async (applicationId: number) => {
//   await new Promise(resolve => setTimeout(resolve, 1500));
//   return {
//     reportUrl: `/api/reports/${applicationId}.pdf`,
//     generated: true
//   };
// };

// // --- Type Definitions ---
// interface Application {
//   applicationId: number;
//   status: 'Approved' | 'Rejected' | 'For Review' | 'Pending';
//   riskScore?: number;
//   rationale?: string;
//   submissionDate: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   civilStatus: string;
//   loanAmount: number;
//   loanPurpose: string;
//   loanTenor: number;
//   monthlyIncome: number;
// }

// interface MLAnalysis {
//   riskCategory: string;
//   riskScore: number;
//   probabilities: Record<string, number>;
//   limeFeatures: Array<{ feature: string; impact: number; description: string }>;
//   fiveCAnalysis: Record<string, number>;
//   improvements: string[];
//   aiSummary: string;
// }

// interface ApplicationDetailsModalProps {
//   application: Application | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// // --- React Component ---
// const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ application, isOpen, onClose }) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);
//   const [reportGenerated, setReportGenerated] = useState(false);
//   const [reportError, setReportError] = useState(false);

//   // Memoize the function to prevent unnecessary re-creations
//   const handleRunMLAnalysis = useCallback(async () => {
//     if (!application || isAnalyzing) return;
//     setMlAnalysis(null); // Clear previous analysis
//     setIsAnalyzing(true);
//     setReportGenerated(false); // Reset report status
//     setReportError(false);

//     try {
//       const analysis = await runMLAnalysis(application.applicationId);
//       setMlAnalysis(analysis);
//     } catch (error) {
//       console.error('ML Analysis failed:', error);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   }, [application, isAnalyzing]);

//   const handleGenerateReport = useCallback(async () => {
//     if (!application || isGeneratingReport) return;
//     setIsGeneratingReport(true);
//     setReportError(false);

//     try {
//       const report = await mockGenerateReport(application.applicationId);
//       setReportGenerated(true);
//       window.open(report.reportUrl, '_blank');
//     } catch (error) {
//       console.error('Report generation failed:', error);
//       setReportError(true);
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   }, [application, isGeneratingReport]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setActiveTab('overview');
//       setMlAnalysis(null);
//       setIsAnalyzing(false);
//       setIsGeneratingReport(false);
//       setReportGenerated(false);
//       setReportError(false);
//     }
//   }, [isOpen]);

//   const getRiskCategoryColor = (category: string) => {
//     switch (category) {
//       case 'Pass': return 'text-green-700 bg-green-100';
//       case 'Especially Mentioned (EM)': return 'text-yellow-700 bg-yellow-100';
//       case 'Substandard': return 'text-orange-700 bg-orange-100';
//       case 'Doubtful': return 'text-red-700 bg-red-100';
//       case 'Loss': return 'text-red-800 bg-red-200';
//       default: return 'text-gray-700 bg-gray-100';
//     }
//   };

//   const getFiveCColor = (score: number) => {
//     if (score > 0) return 'text-green-600';
//     if (score < -0.1) return 'text-red-600';
//     return 'text-yellow-600';
//   };

//   if (!isOpen || !application) return null;

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: FileText },
//     { id: 'risk-analysis', label: 'Risk Analysis', icon: TrendingUp },
//     { id: 'explanations', label: 'AI Insights', icon: Brain }
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="p-6">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 space-y-6">
//                 <div className="bg-white border rounded-lg p-4">
//                   <h3 className="font-medium mb-4 flex items-center gap-2">
//                     <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
//                       <span className="w-4 h-4 text-blue-600">👤</span>
//                     </div>
//                     Personal Information
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-gray-600">Full Name</p>
//                       <p className="font-medium">{application.fullName}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Email</p>
//                       <p className="font-medium">{application.email}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Phone</p>
//                       <p className="font-medium">{application.phoneNumber}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Civil Status</p>
//                       <p className="font-medium">{application.civilStatus}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-white border rounded-lg p-4">
//                   <h3 className="font-medium mb-4 flex items-center gap-2">
//                     <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
//                       <span className="w-4 h-4 text-green-600">💰</span>
//                     </div>
//                     Loan Information
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-gray-600">Loan Amount</p>
//                       <p className="font-medium text-lg">₱{application.loanAmount?.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Purpose</p>
//                       <p className="font-medium">{application.loanPurpose}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Tenor</p>
//                       <p className="font-medium">{application.loanTenor} months</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Monthly Income</p>
//                       <p className="font-medium">₱{application.monthlyIncome?.toLocaleString()}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-6">
//                 <div className="bg-white border rounded-lg p-4">
//                   <h3 className="font-medium mb-4">Application Status</h3>
//                   <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${application.status === 'Approved' ? 'text-green-700 bg-green-100' : application.status === 'Rejected' ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100'}`}>
//                     {application.status}
//                   </div>
//                   <div className="mt-4">
//                     <p className="text-sm text-gray-600">Submitted</p>
//                     <p className="font-medium">{application.submissionDate}</p>
//                   </div>
//                 </div>
//                 <button className="w-full bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors">
//                   📧 Contact Client
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       case 'risk-analysis':
//         return (
//           <div className="p-6">
//             {isAnalyzing ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="text-center">
//                   <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
//                   <p className="text-lg font-medium">Running ML Risk Analysis...</p>
//                   <p className="text-gray-600">This may take a few moments</p>
//                 </div>
//               </div>
//             ) : mlAnalysis ? (
//               <div className="space-y-6">
//                 <div className="bg-white border rounded-lg p-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-xl font-semibold">Risk Assessment Summary</h3>
//                     <button
//                       onClick={handleGenerateReport}
//                       disabled={isGeneratingReport}
//                       className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                     >
//                       {isGeneratingReport ? (<RefreshCw className="w-4 h-4 animate-spin" />) : (<Download className="w-4 h-4" />)}
//                       {isGeneratingReport ? 'Generating...' : 'Download Report'}
//                     </button>
//                   </div>
//                   {reportError && <p className="text-red-500 text-center mb-4">Failed to generate report. Please try again.</p>}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="text-center">
//                       <div className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
//                         {mlAnalysis.riskCategory}
//                       </div>
//                       <p className="text-sm text-gray-600 mt-2">Risk Category</p>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-3xl font-bold text-gray-800">
//                         {(mlAnalysis.riskScore * 100).toFixed(1)}%
//                       </div>
//                       <p className="text-sm text-gray-600">Risk Score</p>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-3xl font-bold text-blue-600">
//                         {(mlAnalysis.probabilities[mlAnalysis.riskCategory] * 100).toFixed(1)}%
//                       </div>
//                       <p className="text-sm text-gray-600">Confidence</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-white border rounded-lg p-6">
//                   <h4 className="font-semibold mb-4">Risk Category Probabilities</h4>
//                   <div className="space-y-3">
//                     {Object.entries(mlAnalysis.probabilities).map(([category, prob]) => (
//                       <div key={category} className="flex items-center gap-3">
//                         <div className="w-32 text-sm">{category}</div>
//                         <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
//                           <div
//                             className={`h-6 rounded-full transition-all duration-500 ${getRiskCategoryColor(category).replace('text-', 'bg-').split(' ')[1]}`}
//                             style={{ width: `${prob * 100}%` }}
//                           ></div>
//                           <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium">
//                             {(prob * 100).toFixed(1)}%
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-white border rounded-lg p-6">
//                   <h4 className="font-semibold mb-4 flex items-center gap-2">
//                     <BarChart3 className="w-5 h-5" />
//                     Five C's of Credit Analysis
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                     {Object.entries(mlAnalysis.fiveCAnalysis).map(([category, score]) => (
//                       <div key={category} className="text-center p-4 border rounded-lg">
//                         <div className={`text-2xl font-bold ${getFiveCColor(score)}`}>
//                           {score > 0 ? '+' : ''}{score.toFixed(2)}
//                         </div>
//                         <div className="text-sm font-medium text-gray-700 mt-1">{category}</div>
//                         <div className={`text-xs mt-1 ${getFiveCColor(score)}`}>
//                           {score > 0 ? 'Positive' : score < -0.1 ? 'Needs Attention' : 'Neutral'}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-white border rounded-lg p-6">
//                   <h4 className="font-semibold mb-4">Key Factors Influencing Decision</h4>
//                   <div className="space-y-3">
//                     {mlAnalysis.limeFeatures.map((feature, index) => (
//                       <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
//                         <div className={`w-2 h-12 rounded ${feature.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                         <div className="flex-1">
//                           <div className="font-medium">{feature.feature.replace(/_/g, ' ').toUpperCase()}</div>
//                           <div className="text-sm text-gray-600">{feature.description}</div>
//                         </div>
//                         <div className={`font-bold ${feature.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                           {feature.impact > 0 ? '+' : ''}{feature.impact.toFixed(3)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center py-12">
//                 <div className="text-center">
//                   <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-lg font-medium text-gray-600">ML Analysis not available</p>
//                   <button onClick={handleRunMLAnalysis} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
//                     Run Analysis
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       case 'explanations':
//         return (
//           <div className="p-6">
//             {mlAnalysis ? (
//               <div className="space-y-6">
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//                   <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
//                     <Brain className="w-5 h-5" />
//                     AI Analysis Summary
//                   </h4>
//                   <p className="text-blue-700 leading-relaxed">{mlAnalysis.aiSummary}</p>
//                 </div>
//                 <div className="bg-white border rounded-lg p-6">
//                   <h4 className="font-semibold mb-4 flex items-center gap-2">
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                     Recommended Improvements
//                   </h4>
//                   <div className="space-y-4">
//                     {mlAnalysis.improvements.map((improvement, index) => {
//                       const [title, ...content] = improvement.split(':');
//                       return (
//                         <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
//                           <div className="font-medium text-green-700">{title.replace(/\*/g, '')}</div>
//                           <div className="text-gray-700 mt-1">{content.join(':')}</div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//                   <h4 className="font-semibold text-yellow-800 mb-4">Recommended Next Steps</h4>
//                   <ul className="space-y-2 text-yellow-700">
//                     <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>Schedule a follow-up call to discuss income improvement strategies</li>
//                     <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>Request additional documentation for alternative data verification</li>
//                     <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>Consider offering a smaller loan amount as an initial step</li>
//                   </ul>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center py-12">
//                 <div className="text-center">
//                   <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-lg font-medium text-gray-600">Run risk analysis first to see AI insights</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       default: return null;
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b bg-gray-50">
//           <div className="flex items-center gap-3">
//             <button onClick={onClose} className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium">
//               ← Back
//             </button>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
//               <p className="text-gray-600">Application ID: {application.applicationId}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {mlAnalysis && (
//               <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskCategoryColor(mlAnalysis.riskCategory)}`}>
//                 {mlAnalysis.riskCategory}
//               </div>
//             )}
//             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//         {/* Tab Navigation */}
//         <div className="flex border-b bg-gray-50">
//           {tabs.map((tab) => {
//             const IconComponent = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === tab.id ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
//               >
//                 <IconComponent className="w-4 h-4" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//         {/* Tab Content */}
//         <div className="flex-1 overflow-y-auto">
//           {renderContent()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplicationDetailsModal;