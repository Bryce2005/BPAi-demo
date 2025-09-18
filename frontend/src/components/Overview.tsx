import { useState } from 'react';
import { X, Mail, Send, Paperclip, User, HandCoins} from 'lucide-react';

  const getRiskCategoryColor = (category: string) => {
    const colors = {
      'Loss': 'text-red-600 border-red-200 bg-red-200',     // Most red
      'Doubtful': 'text-orange-600 border-orange-200 bg-orange-200', // Between red and yellow
      'Substandard': 'text-yellow-600 border-yellow-200 bg-yellow-200', // Middle (yellowish warning)
      'Especially Mentioned': 'text-lime-600 border-lime-200 bg-lime-200',  // Between yellow and green
      'Pass': 'text-green-600 border-green-200 bg-green-200 ',  // Most green
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

const OverviewPage = ({application}: any) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: application.email,
    subject: '',
    body: '',
    priority: 'normal'
  });

  const emailTemplates = [
    {
      name: 'Request Additional Documents',
      subject: 'Additional Documents Required - Application #' + application.id,
      body: `Dear ${application.fullName},\n\nWe are currently reviewing your loan application (#${application.id}) and require additional documentation to proceed with the evaluation.\n\nPlease provide the following documents at your earliest convenience:\n• Recent bank statements (last 3 months)\n• Updated income tax return\n• Employment certificate\n\nYou may submit these documents by replying to this email or visiting our office.\n\nThank you for your cooperation.\n\nBest regards,\nLoan Processing Team`
    },
    {
      name: 'Application Status Update',
      subject: 'Application Status Update - ' + application.id,
      body: `Dear ${application.fullName},\n\nThis is to update you on the status of your loan application (#${application.id}).\n\nCurrent Status: Under Review\nNext Steps: We will contact you within 3-5 business days with further instructions.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nLoan Processing Team`
    },
    {
      name: 'Schedule Appointment',
      subject: 'Loan Application Interview - ' + application.id,
      body: `Dear ${application.fullName},\n\nWe would like to schedule a brief interview regarding your loan application (#${application.id}).\n\nPlease let us know your availability for the following dates:\n• [Date 1]\n• [Date 2]\n• [Date 3]\n\nThe interview will take approximately 30 minutes and can be conducted via phone or in-person at our office.\n\nPlease reply with your preferred date and time.\n\nBest regards,\nLoan Processing Team`
    }
  ];

  const handleTemplateSelect = (template: any) => {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
  };

  const handleSendEmail = () => {
    // Here you would integrate with your email service
    console.log('Sending email:', emailData);
    alert('Email sent successfully!');
    setIsEmailModalOpen(false);
    setEmailData({
      to: application.email,
      subject: '',
      body: '',
      priority: 'normal'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Main Application Details Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Summary of Application</h2>
              <p className="text-gray-600">Application ID: {application.applicationId}</p>
            </div>
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Mail size={20} />
              Contact Client
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-gray-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{application.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{application.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{application.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Civil Status</label>
                  <p className="text-gray-900">{application.civilStatus}</p>
                </div>
              </div>
            </div>

            {/* Loan Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <HandCoins className="text-gray-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Loan Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loan Amount</label>
                  <p className="text-gray-900 text-xl font-bold">₱{application.loanAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Purpose</label>
                  <p className="text-gray-900">{application.loanPurpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tenor</label>
                  <p className="text-gray-900">{application.loanTenor} months</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Income</label>
                  <p className="text-gray-900">₱{application.monthlyIncome?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
 
          {/* Application Status */}
          <div className={`mt-8 p-4 ${getRiskCategoryColor(application.status)} rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Application Status</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskCategoryColor(application.status)}`}>
                {application.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="text-red-600" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Client</h3>
                  <p className="text-sm text-gray-600">{application.fullName} - {application.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Email Templates Sidebar */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Templates</h4>
                  <div className="space-y-2">
                    {emailTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                      >
                        <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                        <div className="text-xs text-gray-600 mt-1 truncate">{template.subject}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email Composition */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  {/* To Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData(prev => ({...prev, to: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({...prev, subject: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter email subject"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={emailData.priority}
                      onChange={(e) => setEmailData(prev => ({...prev, priority: e.target.value}))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={emailData.body}
                      onChange={(e) => setEmailData(prev => ({...prev, body: e.target.value}))}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Paperclip size={16} />
                    Attach File
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEmailModalOpen(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={!emailData.subject || !emailData.body}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;