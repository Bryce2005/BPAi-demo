// import React, { useState, useRef, useEffect } from 'react';
// import { MessageCircle, X, Send, FileText, BarChart3, User, Phone, MapPin } from 'lucide-react';

// const ChatbotAssistant = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: 'bot',
//       content: "Hello! I'm your BPAi dashboard assistant. I can help you understand your risk scoring data, application statuses, and explain how our risk assessment model works. What would you like to know?",
//       timestamp: new Date()
//     }
//   ]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Updated dashboard data to match your actual interface
//   const dashboardData = [
//     {
//       id: 'APP-2024-001',
//       status: 'Risky',
//       riskScore: 65,
//       rationale: 'Education',
//       client: 'Olivia Santiago',
//       phone: '09087654321',
//       address: 'Pasig City, Metro Manila',
//       date: '8/26/2024'
//     },
//     {
//       id: 'APP-2024-002',
//       status: 'Secure',
//       riskScore: 35,
//       rationale: 'Personal Expenses',
//       client: 'Paul Reyes',
//       phone: '09076543210',
//       address: 'Makati City, Metro Manila',
//       date: '8/27/2024'
//     },
//     {
//       id: 'APP-2024-003',
//       status: 'Default',
//       riskScore: 95,
//       rationale: 'Business Start-up',
//       client: 'Quincy Domingo',
//       phone: '09065432109',
//       address: 'Tagaytay City, Cavite',
//       date: '8/28/2024'
//     },
//     {
//       id: 'APP-2024-004',
//       status: 'Risky',
//       riskScore: 68,
//       rationale: 'Debt Consolidation',
//       client: 'Rachel Garcia',
//       phone: '09054321098',
//       address: 'Cebu City, Cebu',
//       date: '8/30/2024'
//     },
//     {
//       id: 'APP-2024-005',
//       status: 'Secure',
//       riskScore: 15,
//       rationale: 'Vacation',
//       client: 'Samantha Ramos',
//       phone: '09043210987',
//       address: 'Davao City, Davao del Sur',
//       date: '8/30/2024'
//     },
//     {
//       id: 'APP-2024-006',
//       status: 'Critical',
//       riskScore: 85,
//       rationale: 'Medical Emergency',
//       client: 'Timothy Mendoza',
//       phone: '09032109876',
//       address: 'Quezon City, Metro Manila',
//       date: '8/31/2024'
//     },
//     {
//       id: 'APP-2024-007',
//       status: 'Risky',
//       riskScore: 75,
//       rationale: 'Gadget Purchase',
//       client: 'Ursula Castro',
//       phone: '09021098765',
//       address: 'Caloocan City, Metro Manila',
//       date: '9/1/2024'
//     },
//     {
//       id: 'APP-2024-008',
//       status: 'Secure',
//       riskScore: 10,
//       rationale: 'Car Purchase',
//       client: 'Victor Magno',
//       phone: '09010987654',
//       address: 'Makati City, Metro Manila',
//       date: '9/2/2024'
//     },
//     {
//       id: 'APP-2024-009',
//       status: 'Critical',
//       riskScore: 82,
//       rationale: 'Home Improvement',
//       client: 'Wendy Navarro',
//       phone: '09098765432',
//       address: 'Pasay City, Metro Manila',
//       date: '9/3/2024'
//     },
//     {
//       id: 'APP-2024-010',
//       status: 'Secure',
//       riskScore: 30,
//       rationale: 'Emergency Fund',
//       client: 'Xavier Pascual',
//       phone: '09087654321',
//       address: 'Mandaluyong City, Metro Manila',
//       date: '9/4/2024'
//     }
//   ];

// //     const scrollToBottom = () => {
// //         if (messagesEndRef.current) {
// //             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
// //         }
// //     };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages]);

//     const getStatusColor = (status: 'Critical' | 'Default' | 'Risky' | 'Secure' | string) => {
//     switch (status) {
//         case 'Critical': return 'text-red-600 bg-red-100';
//         case 'Default': return 'text-red-600 bg-red-100';
//         case 'Risky': return 'text-yellow-600 bg-yellow-100';
//         case 'Secure': return 'text-green-600 bg-green-100';
//         default: return 'text-gray-600 bg-gray-100';
//     }
//     };

//   const processMessage = (message: string) => {
//     const lowerMessage = message.toLowerCase();
    
//     // Risk scoring model information
//     if (lowerMessage.includes('risk') && (lowerMessage.includes('model') || lowerMessage.includes('scoring') || lowerMessage.includes('calculate'))) {
//       return `Our risk scoring model evaluates applications based on multiple factors:

// **Risk Score Ranges:**
// • 0-30: Secure (Low Risk) - Green status
// • 31-70: Risky (Medium Risk) - Yellow status  
// • 71-100: Critical/Default (High Risk) - Red status

// **Key Assessment Factors:**
// • Purpose of application (Education, Personal, Business, Medical, etc.)
// • Financial stability indicators
// • Credit history and payment behavior
// • Debt-to-income ratios
// • Geographic and demographic risk factors

// The BPAi model uses weighted algorithms to compute a final risk percentage, helping prioritize applications that need immediate attention.`;
//     }

//     // Status information
//     if (lowerMessage.includes('status') || lowerMessage.includes('secure') || lowerMessage.includes('critical') || lowerMessage.includes('unstable')) {
//       const statusCounts = dashboardData.reduce((acc: { [key: string]: number }, app) => {
//         acc[app.status] = (acc[app.status] || 0) + 1;
//         return acc;
//     }, {});

//       return `**Current Status Overview:**
// • Critical: ${statusCounts.Critical || 0} applications (Immediate action required)
// • Default: ${statusCounts.Default || 0} applications (Payment issues)
// • Risky: ${statusCounts.Risky || 0} applications (Medium priority)  
// • Secure: ${statusCounts.Secure || 0} applications (Low risk)

// **Status Meanings:**
// • **Critical**: Risk score 71-100, requires immediate attention
// • **Default**: Risk score 71-100, payment/compliance issues
// • **Risky**: Risk score 31-70, needs monitoring
// • **Secure**: Risk score 0-30, standard processing`;
//     }

//     // Specific application lookup
//     const appMatch = message.match(/APP-\d{4}-\d{3}/i);
//     if (appMatch) {
//       const appId = appMatch[0].toUpperCase();
//       const app = dashboardData.find(a => a.id === appId);
//       if (app) {
//         return `**Application ${app.id} Details:**
        
// 👤 **Client:** ${app.client}
// 📊 **Risk Score:** ${app.riskScore}% (${app.status})
// 💡 **Purpose:** ${app.rationale}
// 📅 **Date:** ${app.date}
// 📞 **Phone:** ${app.phone}
// 📍 **Address:** ${app.address}

// This application is classified as **${app.status}** based on our risk assessment model.`;
//       }
//     }

//     // Client name search
//     const clientMatch = dashboardData.find(app => 
//       app.client.toLowerCase().includes(lowerMessage) || 
//       lowerMessage.includes(app.client.toLowerCase())
//     );
//     if (clientMatch) {
//       return `**Found client: ${clientMatch.client}**

// 📋 **Application:** ${clientMatch.id}
// 📊 **Risk Score:** ${clientMatch.riskScore}% (${clientMatch.status})
// 💡 **Purpose:** ${clientMatch.rationale}
// 📞 **Contact:** ${clientMatch.phone}
// 📍 **Location:** ${clientMatch.address}`;
//     }

//     // High risk applications
//     if (lowerMessage.includes('high risk') || lowerMessage.includes('critical') || lowerMessage.includes('default')) {
//       const highRiskApps = dashboardData.filter(app => app.status === 'Critical' || app.status === 'Default');
//       if (highRiskApps.length > 0) {
//         return `**High Risk Applications (${highRiskApps.length} found):**

// ${highRiskApps.map(app => 
//   `• ${app.id} - ${app.client} (Score: ${app.riskScore}% - ${app.status})\n  Purpose: ${app.rationale}`
// ).join('\n\n')}

// These applications require immediate attention due to high risk scores or payment issues.`;
//       }
//     }

//     // Statistics
//     if (lowerMessage.includes('stats') || lowerMessage.includes('summary') || lowerMessage.includes('overview')) {
//       const totalApps = dashboardData.length;
//       const avgRisk = Math.round(dashboardData.reduce((sum, app) => sum + app.riskScore, 0) / totalApps);
//       const statusCounts = dashboardData.reduce((acc: { [key: string]: number }, app) => {
//         acc[app.status] = (acc[app.status] || 0) + 1;
//       return acc;
//     }, {});

//       return `**Dashboard Statistics:**

// 📊 **Total Applications:** ${totalApps}
// 📈 **Average Risk Score:** ${avgRisk}%

// **Status Distribution:**
// 🔴 Critical: ${statusCounts.Critical || 0} (${Math.round((statusCounts.Critical || 0) / totalApps * 100)}%)
// 🔴 Default: ${statusCounts.Default || 0} (${Math.round((statusCounts.Default || 0) / totalApps * 100)}%)
// 🟡 Risky: ${statusCounts.Risky || 0} (${Math.round((statusCounts.Risky || 0) / totalApps * 100)}%)
// 🟢 Secure: ${statusCounts.Secure || 0} (${Math.round((statusCounts.Secure || 0) / totalApps * 100)}%)`;
//     }

//     // Help/commands
//     if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
//       return `**I can help you with:**

// 🔍 **Search Applications**: Enter an application ID (e.g., "APP-2024-101")
// 👤 **Find Clients**: Search by client name (e.g., "David Mercado")  
// 📊 **Risk Analysis**: Ask about "risk scoring model" or "risk calculation"
// 📈 **Status Info**: Ask about "status meanings" or specific statuses
// 🚨 **Critical Cases**: Ask for "high risk" or "critical applications"
// 📋 **Statistics**: Ask for "stats", "summary", or "overview"

// Just type your question naturally - I'll understand!`;
//     }

//     // Default response
//     return `I can help you with information about your dashboard data and risk scoring model. Try asking about:

// • Specific applications (e.g., "APP-2024-101")
// • Client information (e.g., "David Mercado")  
// • Risk scoring details
// • Application statistics
// • Critical or high-risk cases

// Type "help" to see all available commands.`;
//   };

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim()) return;

//     const userMessage = {
//       id: messages.length + 1,
//       type: 'user',
//       content: inputMessage,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputMessage('');
//     setIsTyping(true);

//     // Simulate AI processing delay
//     setTimeout(() => {
//       const response = processMessage(inputMessage);
//       const botMessage = {
//         id: messages.length + 2,
//         type: 'bot',
//         content: response,
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, botMessage]);
//       setIsTyping(false);
//     }, 1000);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const formatMessageContent = (content: any) => {
//     // Convert markdown-style formatting to HTML
//     return content
//       .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//       .replace(/^• (.+)$/gm, '<div class="ml-4">• $1</div>')
//       .replace(/^(🔴|🔵|🟢|👤|📊|💡|📅|📞|📍|📋|📈|🚨|🔍|📋) (.+)$/gm, '<div class="flex items-start gap-2"><span>$1</span><span>$2</span></div>')
//       .replace(/\n/g, '<br>');
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       {/* Chat Window */}
//       {isOpen && (
//         <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
//           {/* Header */}
//           <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                 <BarChart3 size={16} />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-sm">Dashboard Assistant</h3>
//                 <p className="text-xs opacity-90">Risk Analysis Helper</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[85%] p-3 rounded-lg text-sm ${
//                     message.type === 'user'
//                       ? 'bg-red-600 text-white rounded-br-none'
//                       : 'bg-white text-gray-800 rounded-bl-none shadow-sm border'
//                   }`}
//                 >
//                   <div 
//                     dangerouslySetInnerHTML={{ 
//                       __html: formatMessageContent(message.content) 
//                     }}
//                   />
//                   <div className={`text-xs mt-1 ${
//                     message.type === 'user' ? 'text-red-100' : 'text-gray-500'
//                   }`}>
//                     {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {/* Typing indicator */}
//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border max-w-[85%]">
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div className="p-4 border-t bg-white rounded-b-lg">
//             <div className="flex gap-2">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask about applications, risk scores, or clients..."
//                 className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                 rows={1}
//               />
//               <button
//                 onClick={handleSendMessage}
//                 disabled={!inputMessage.trim() || isTyping}
//                 className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Send size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center relative"
//       >
//         {isOpen ? (
//           <X size={24} />
//         ) : (
//           <>
//             <MessageCircle size={24} />
//             <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
//           </>
//         )}
//       </button>
//     </div>
//   );
// };

// export default ChatbotAssistant;
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, FileText, BarChart3, User, Phone, MapPin } from 'lucide-react';

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your BPAi dashboard assistant. I can help you understand your risk scoring data, application statuses, and explain how our risk assessment model works. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Updated dashboard data to match your actual interface
  const dashboardData = [
    {
      id: 'APP-2024-001',
      status: 'Risky',
      riskScore: 65,
      rationale: 'Education',
      client: 'Olivia Santiago',
      phone: '09087654321',
      address: 'Pasig City, Metro Manila',
      date: '8/26/2024'
    },
    {
      id: 'APP-2024-002',
      status: 'Secure',
      riskScore: 35,
      rationale: 'Personal Expenses',
      client: 'Paul Reyes',
      phone: '09076543210',
      address: 'Makati City, Metro Manila',
      date: '8/27/2024'
    },
    {
      id: 'APP-2024-003',
      status: 'Default',
      riskScore: 95,
      rationale: 'Business Start-up',
      client: 'Quincy Domingo',
      phone: '09065432109',
      address: 'Tagaytay City, Cavite',
      date: '8/28/2024'
    },
    {
      id: 'APP-2024-004',
      status: 'Risky',
      riskScore: 68,
      rationale: 'Debt Consolidation',
      client: 'Rachel Garcia',
      phone: '09054321098',
      address: 'Cebu City, Cebu',
      date: '8/30/2024'
    },
    {
      id: 'APP-2024-005',
      status: 'Secure',
      riskScore: 15,
      rationale: 'Vacation',
      client: 'Samantha Ramos',
      phone: '09043210987',
      address: 'Davao City, Davao del Sur',
      date: '8/30/2024'
    },
    {
      id: 'APP-2024-006',
      status: 'Critical',
      riskScore: 85,
      rationale: 'Medical Emergency',
      client: 'Timothy Mendoza',
      phone: '09032109876',
      address: 'Quezon City, Metro Manila',
      date: '8/31/2024'
    },
    {
      id: 'APP-2024-007',
      status: 'Risky',
      riskScore: 75,
      rationale: 'Gadget Purchase',
      client: 'Ursula Castro',
      phone: '09021098765',
      address: 'Caloocan City, Metro Manila',
      date: '9/1/2024'
    },
    {
      id: 'APP-2024-008',
      status: 'Secure',
      riskScore: 10,
      rationale: 'Car Purchase',
      client: 'Victor Magno',
      phone: '09010987654',
      address: 'Makati City, Metro Manila',
      date: '9/2/2024'
    },
    {
      id: 'APP-2024-009',
      status: 'Critical',
      riskScore: 82,
      rationale: 'Home Improvement',
      client: 'Wendy Navarro',
      phone: '09098765432',
      address: 'Pasay City, Metro Manila',
      date: '9/3/2024'
    },
    {
      id: 'APP-2024-010',
      status: 'Secure',
      riskScore: 30,
      rationale: 'Emergency Fund',
      client: 'Xavier Pascual',
      phone: '09087654321',
      address: 'Mandaluyong City, Metro Manila',
      date: '9/4/2024'
    }
  ];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'Default': return 'text-red-600 bg-red-100';
      case 'Risky': return 'text-yellow-600 bg-yellow-100';
      case 'Secure': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const processMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Risk scoring model information
    if (lowerMessage.includes('risk') && (lowerMessage.includes('model') || lowerMessage.includes('scoring') || lowerMessage.includes('calculate'))) {
      return `Our risk scoring model evaluates applications based on multiple factors:

**Risk Score Ranges:**
• 0-30: Secure (Low Risk) - Green status
• 31-70: Risky (Medium Risk) - Yellow status  
• 71-100: Critical/Default (High Risk) - Red status

**Key Assessment Factors:**
• Purpose of application (Education, Personal, Business, Medical, etc.)
• Financial stability indicators
• Credit history and payment behavior
• Debt-to-income ratios
• Geographic and demographic risk factors

The BPAi model uses weighted algorithms to compute a final risk percentage, helping prioritize applications that need immediate attention.`;
    }

    // Status information
    if (lowerMessage.includes('status') || lowerMessage.includes('secure') || lowerMessage.includes('critical') || lowerMessage.includes('unstable')) {
      const statusCounts = dashboardData.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      return `**Current Status Overview:**
• Critical: ${statusCounts.Critical || 0} applications (Immediate action required)
• Default: ${statusCounts.Default || 0} applications (Payment issues)
• Risky: ${statusCounts.Risky || 0} applications (Medium priority)  
• Secure: ${statusCounts.Secure || 0} applications (Low risk)

**Status Meanings:**
• **Critical**: Risk score 71-100, requires immediate attention
• **Default**: Risk score 71-100, payment/compliance issues
• **Risky**: Risk score 31-70, needs monitoring
• **Secure**: Risk score 0-30, standard processing`;
    }

    // Specific application lookup
    const appMatch = message.match(/APP-\d{4}-\d{3}/i);
    if (appMatch) {
      const appId = appMatch[0].toUpperCase();
      const app = dashboardData.find(a => a.id === appId);
      if (app) {
        return `**Application ${app.id} Details:**
        
👤 **Client:** ${app.client}
📊 **Risk Score:** ${app.riskScore}% (${app.status})
💡 **Purpose:** ${app.rationale}
📅 **Date:** ${app.date}
📞 **Phone:** ${app.phone}
📍 **Address:** ${app.address}

This application is classified as **${app.status}** based on our risk assessment model.`;
      }
    }

    // Client name search
    const clientMatch = dashboardData.find(app => 
      app.client.toLowerCase().includes(lowerMessage) || 
      lowerMessage.includes(app.client.toLowerCase())
    );
    if (clientMatch) {
      return `**Found client: ${clientMatch.client}**

📋 **Application:** ${clientMatch.id}
📊 **Risk Score:** ${clientMatch.riskScore}% (${clientMatch.status})
💡 **Purpose:** ${clientMatch.rationale}
📞 **Contact:** ${clientMatch.phone}
📍 **Location:** ${clientMatch.address}`;
    }

    // High risk applications
    if (lowerMessage.includes('high risk') || lowerMessage.includes('critical') || lowerMessage.includes('default')) {
      const highRiskApps = dashboardData.filter(app => app.status === 'Critical' || app.status === 'Default');
      if (highRiskApps.length > 0) {
        return `**High Risk Applications (${highRiskApps.length} found):**

${highRiskApps.map(app => 
  `• ${app.id} - ${app.client} (Score: ${app.riskScore}% - ${app.status})\n  Purpose: ${app.rationale}`
).join('\n\n')}

These applications require immediate attention due to high risk scores or payment issues.`;
      }
    }

    // Statistics
    if (lowerMessage.includes('stats') || lowerMessage.includes('summary') || lowerMessage.includes('overview')) {
      const totalApps = dashboardData.length;
      const avgRisk = Math.round(dashboardData.reduce((sum, app) => sum + app.riskScore, 0) / totalApps);
      const statusCounts = dashboardData.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      return `**Dashboard Statistics:**

📊 **Total Applications:** ${totalApps}
📈 **Average Risk Score:** ${avgRisk}%

**Status Distribution:**
🔴 Critical: ${statusCounts.Critical || 0} (${Math.round((statusCounts.Critical || 0) / totalApps * 100)}%)
🔴 Default: ${statusCounts.Default || 0} (${Math.round((statusCounts.Default || 0) / totalApps * 100)}%)
🟡 Risky: ${statusCounts.Risky || 0} (${Math.round((statusCounts.Risky || 0) / totalApps * 100)}%)
🟢 Secure: ${statusCounts.Secure || 0} (${Math.round((statusCounts.Secure || 0) / totalApps * 100)}%)`;
    }

    // Help/commands
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `**I can help you with:**

🔍 **Search Applications**: Enter an application ID (e.g., "APP-2024-101")
👤 **Find Clients**: Search by client name (e.g., "David Mercado")  
📊 **Risk Analysis**: Ask about "risk scoring model" or "risk calculation"
📈 **Status Info**: Ask about "status meanings" or specific statuses
🚨 **Critical Cases**: Ask for "high risk" or "critical applications"
📋 **Statistics**: Ask for "stats", "summary", or "overview"

Just type your question naturally - I'll understand!`;
    }

    // Default response
    return `I can help you with information about your dashboard data and risk scoring model. Try asking about:

• Specific applications (e.g., "APP-2024-101")
• Client information (e.g., "David Mercado")  
• Risk scoring details
• Application statistics
• Critical or high-risk cases

Type "help" to see all available commands.`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = processMessage(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• (.+)$/gm, '<div class="ml-4">• $1</div>')
      .replace(/^(🔴|🔵|🟢|👤|📊|💡|📅|📞|📍|📋|📈|🚨|🔍|📋) (.+)$/gm, '<div class="flex items-start gap-2"><span>$1</span><span>$2</span></div>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Dashboard Assistant</h3>
                <p className="text-xs opacity-90">Risk Analysis Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border'
                  }`}
                >
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }}
                  />
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border max-w-[85%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about applications, risk scores, or clients..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center relative"
        >
          <MessageCircle size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </button>
      )}
    </div>
  );
};

export default ChatbotAssistant;