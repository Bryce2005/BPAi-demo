import React, { useState } from 'react';
import { Mail, Send, Edit3, Loader, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactClientProps {
  clientPhone: string;
  clientEmail?: string;
  onClose?: () => void;
}

interface EmailData {
  subject: string;
  content: string;
  recipientEmail: string;
  senderName: string;
}

const ContactClient: React.FC<ContactClientProps> = ({ 
  clientPhone, 
  clientEmail = '', 
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    subject: '',
    content: '',
    recipientEmail: clientEmail,
    senderName: 'AI Assistant'
  });
  const [emailType, setEmailType] = useState('follow_up');
  const [context, setContext] = useState('');
  const [step, setStep] = useState<'compose' | 'edit' | 'sent'>('compose');
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8000/api'; // Update with your API URL

  const generateEmailContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_phone: clientPhone,
          context: context || 'General follow-up',
          email_type: emailType
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Generate subject based on email type
        const subjects = {
          follow_up: 'Following up on our recent conversation',
          reminder: 'Friendly reminder - Next steps',
          update: 'Update on your request'
        };

        setEmailData(prev => ({
          ...prev,
          subject: subjects[emailType as keyof typeof subjects] || 'Following up',
          content: data.generated_content
        }));
        setStep('edit');
      } else {
        setError('Failed to generate email content. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!emailData.recipientEmail) {
      setError('Please provide a recipient email address.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_email: emailData.recipientEmail,
          subject: emailData.subject,
          content: emailData.content,
          sender_name: emailData.senderName
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('sent');
      } else {
        setError('Failed to send email. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setStep('compose');
    setEmailData({
      subject: '',
      content: '',
      recipientEmail: clientEmail,
      senderName: 'AI Assistant'
    });
    setContext('');
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    onClose?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <Mail className="w-5 h-5" />
        <span>Contact Client</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Contact Client</h2>
              <p className="text-red-100 text-sm">Phone: {clientPhone}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-red-100 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 'compose' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="follow_up">Follow-up</option>
                  <option value="reminder">Reminder</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Provide additional context for the email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailData.recipientEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <button
                onClick={generateEmailContent}
                disabled={isGenerating}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating Email...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-5 h-5" />
                    <span>Generate Email with AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'edit' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={emailData.content}
                  onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 h-64 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetForm}
                  className="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={sendEmail}
                  disabled={isSending}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'sent' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Sent Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your message has been delivered to {emailData.recipientEmail}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetForm}
                  className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Send Another
                </button>
                <button
                  onClick={handleClose}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactClient;