import React, { useState, useRef } from 'react';
import { Upload, BrainCircuit, FileText, Package, AlertCircle, CheckCircle, XCircle, FileCheck, FileX, Download, Send, Settings } from 'lucide-react';
import './DataProcess.css';

// Interface to define the structure for file information
interface FileInfo {
  file: File;
  name: string;
  size: string;
}

// Interface for the detailed breakdown of a single application
interface ApplicationDetails {
  application_id: string;
  found_id: boolean;
  valid_id: boolean;
  found_payslip: boolean;
  valid_payslip: boolean;
  email?: string; // Add email field for notifications
  applicant_name?: string; // Add name field
}

// Interface for the expected API response
interface AnalysisResponse {
  session_id: string;
  status: string;
  analysis: {
    total_applications: number;
    validation_rate: number;
    valid_app_ids: string[];
    rejected_app_ids: string[];
    per_application_details: {
      [key: string]: ApplicationDetails;
    };
  };
}

// Custom modal/message box interface
interface MessageInfo {
  message: string;
  type: 'error' | 'success' | 'info';
}

// Email settings interface
interface EmailSettings {
  enabled: boolean;
  subject: string;
  template: string;
  service: 'emailjs' | 'backend';
  emailjsConfig?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

const DataProcess: React.FC = () => {
  // State for the uploaded files
  const [csvFile, setCsvFile] = useState<FileInfo | null>(null);
  const [zipFile, setZipFile] = useState<FileInfo | null>(null);

  // State to track processing status
  const [isProcessing, setIsProcessing] = useState(false);

  // State for drag-and-drop visual feedback
  const [dragOver, setDragOver] = useState<string | null>(null);

  // State for displaying results
  const [validIds, setValidIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  
  // State to store the full breakdown of all applications
  const [applicationDetails, setApplicationDetails] = useState<{[key: string]: ApplicationDetails} | null>(null);
  
  // State to store the original CSV data
  const [originalCsvData, setOriginalCsvData] = useState<any[] | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[] | null>(null);

  // State for displaying messages (success, error, etc.)
  const [message, setMessage] = useState<MessageInfo | null>(null);

  // State for email functionality
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    enabled: true,
    service: 'backend',
    subject: 'Application Document Issue - Action Required',
    template: `Dear Applicant,

We have reviewed your application (ID: {application_id}) and found an issue with one or more of your submitted documents.

Document Status:
{document_issues}

Please review and resubmit the correct documents at your earliest convenience. If you have any questions, please don't hesitate to contact our support team.

Best regards,
Application Review Team`,
    emailjsConfig: {
      serviceId: '',
      templateId: '',
      publicKey: ''
    }
  });

  // References to file input elements for programmatic clicks
  const csvInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Utility function to format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handles file selection from the file input or drop
  const handleFileSelect = (file: File, type: 'csv' | 'zip') => {
    setMessage(null);
    const fileInfo: FileInfo = {
      file,
      name: file.name,
      size: formatFileSize(file.size)
    };

    if (type === 'csv') {
      if (file.name.split('.').pop()?.toLowerCase() !== 'csv') {
        setMessage({ message: 'Please select a valid CSV file.', type: 'error' });
        return;
      }
      setCsvFile(fileInfo);
    } else {
      if (file.name.split('.').pop()?.toLowerCase() !== 'zip') {
        setMessage({ message: 'Please select a valid ZIP file.', type: 'error' });
        return;
      }
      setZipFile(fileInfo);
    }
  };

  // Handles drag-over event for visual feedback
  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(type);
  };

  // Handles drag-leave event
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  // Handles drop event to get the file
  const handleDrop = (e: React.DragEvent, type: 'csv' | 'zip') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!csvFile) {
      setMessage({ message: 'Please select a CSV file to begin.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setValidIds([]);
    setRejectedIds([]);
    setApplicationDetails(null);
    setOriginalCsvData(null);
    setCsvHeaders(null);

    const connectionOk = await testConnection();
    if (!connectionOk) {
      setMessage({ 
        message: 'Cannot connect to backend server. Please check if the server is running on http://localhost:8000', 
        type: 'error' 
      });
      setIsProcessing(false);
      return;
    }

    // Parse the CSV file to store original data
    try {
      const csvText = await csvFile.file.text();
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        return rowData;
      });
      
      setCsvHeaders(headers);
      setOriginalCsvData(rows);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setMessage({ message: 'Error parsing CSV file. Please check the file format.', type: 'error' });
      setIsProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append('csv_file', csvFile.file);
    if (zipFile) {
      formData.append('zip_file', zipFile.file);
    }

    try {
      const response = await fetch('http://localhost:8000/upload/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result: AnalysisResponse = await response.json();

      if (result.status === 'completed') {
        setValidIds(result.analysis.valid_app_ids || []);
        setRejectedIds(result.analysis.rejected_app_ids || []);
        setApplicationDetails(result.analysis.per_application_details);
        setMessage({ 
          message: `Processing completed successfully! Found ${(result.analysis.valid_app_ids || []).length} valid and ${(result.analysis.rejected_app_ids || []).length} rejected applications.`, 
          type: 'success' 
        });
      } else {
        setMessage({ message: 'Processing failed or incomplete. Please try again.', type: 'error' });
      }
    } catch (err: any) {
      console.error('Full error:', err);
      setMessage({ 
        message: `Processing failed: ${err.message || 'An unexpected error occurred.'}`, 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocumentStatus = (found: boolean, valid: boolean) => {
    if (!found) {
        return 'Not Found';
    }
    return valid ? 'Valid' : 'Invalid';
  };

  // Function to download CSV files with original data
  const downloadCSV = (type: 'valid' | 'invalid') => {
    if (!originalCsvData || !csvHeaders) {
      setMessage({ message: 'No CSV data available for download.', type: 'error' });
      return;
    }
    
    const ids = type === 'valid' ? validIds : rejectedIds;
    
    // Find the application ID column (could be various names)
    const idColumn = csvHeaders.find(header => 
      header.toLowerCase().includes('application') || 
      header.toLowerCase().includes('app') || 
      header.toLowerCase().includes('id')
    );
    
    if (!idColumn) {
      setMessage({ message: 'Could not find application ID column in CSV.', type: 'error' });
      return;
    }
    
    // Filter original CSV data based on valid/invalid IDs
    const filteredData = originalCsvData.filter(row => {
      const rowId = row[idColumn];
      return ids.includes(rowId);
    });
    
    if (filteredData.length === 0) {
      setMessage({ message: `No ${type} applications found to download.`, type: 'error' });
      return;
    }
    
    // Create CSV content with original headers and filtered data
    const csvContent = [
      csvHeaders.map(header => `"${header}"`).join(','),
      ...filteredData.map(row => 
        csvHeaders.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');
    
    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}-applications-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setMessage({ 
      message: `Successfully downloaded ${filteredData.length} ${type} applications.`, 
      type: 'success' 
    });
  };

  // Function to generate email content for a specific application
  const generateEmailContent = (applicationId: string) => {
    if (!applicationDetails) return '';
    
    const details = applicationDetails[applicationId];
    if (!details) return '';
    
    const issues = [];
    if (!details.valid_id) {
      if (!details.found_id) {
        issues.push('- ID Document: Not found or missing');
      } else {
        issues.push('- ID Document: Invalid or unclear image');
      }
    }
    if (!details.valid_payslip) {
      if (!details.found_payslip) {
        issues.push('- Payslip Document: Not found or missing');
      } else {
        issues.push('- Payslip Document: Invalid or unclear image');
      }
    }
    
    return emailSettings.template
      .replace('{application_id}', applicationId)
      .replace('{document_issues}', issues.join('\n'));
  };

  // Function to send emails via backend API
  const sendEmailViaBackend = async (emailData: Array<{applicationId: string, email: string, subject: string, content: string}>) => {
    try {
      const response = await fetch('http://localhost:8000/api/email/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Backend email error:', error);
      throw error;
    }
  };

  // Function to send emails via EmailJS
  // const sendEmailViaEmailJS = async (emailData: Array<{applicationId: string, email: string, subject: string, content: string}>) => {
  //   const { serviceId, templateId, publicKey } = emailSettings.emailjsConfig || {};
    
  //   if (!serviceId || !templateId || !publicKey) {
  //     throw new Error('EmailJS configuration is incomplete. Please check your service ID, template ID, and public key.');
  //   }

  //   // Note: EmailJS would need to be imported as a script tag or installed as a package
  //   // For demonstration, we'll show how it would work:
    
  //   const results = [];
  //   for (const email of emailData) {
  //     try {
  //       // This would be the actual EmailJS call:
  //       // const result = await emailjs.send(serviceId, templateId, {
  //       //   to_email: email.email,
  //       //   subject: email.subject,
  //       //   message: email.content,
  //       //   application_id: email.applicationId
  //       // }, publicKey);
        
  //       // Simulating EmailJS response for now
  //       await new Promise(resolve => setTimeout(resolve, 500));
  //       results.push({ success: true, applicationId: email.applicationId });
  //       console.log(`EmailJS: Email sent to ${email.email} for application ${email.applicationId}`);
  //     } catch (error) {
  //       results.push({ success: false, applicationId: email.applicationId, error });
  //       console.error(`EmailJS: Failed to send email for application ${email.applicationId}:`, error);
  //     }
  //   }
    
  //   return results;
  // };

  // Function to send automated emails
  // Function to send automated emails
const sendAutomatedEmails = async () => {
  console.log('🔴 Send emails button clicked!'); // Add this line
  console.log('Rejected IDs:', rejectedIds); // Add this line
  console.log('Application details:', applicationDetails); // Add this line
  
  if (!applicationDetails || rejectedIds.length === 0) {
    console.log('❌ No application details or rejected IDs'); // Add this line
    return;
  }
  
  setIsSendingEmails(true);
  
  try {
    // Prepare email data
    const emailData = rejectedIds
      .map(applicationId => {
        const details = applicationDetails[applicationId];
        if (!details?.email) return null;
        
        return {
          applicationId,
          email: details.email,
          subject: emailSettings.subject,
          content: generateEmailContent(applicationId)
        };
      })
      .filter(email => email !== null);

    console.log('📧 Email data prepared:', emailData); // Add this line

    if (emailData.length === 0) {
      setMessage({
        message: 'No email addresses found for rejected applications. Please ensure your CSV contains email addresses.',
        type: 'error'
      });
      return;
    }

    let result;
    if (emailSettings.service === 'backend') {
      console.log('🚀 Calling backend API...'); // Add this line
      result = await sendEmailViaBackend(emailData);
      console.log('✅ Backend response:', result); // Add this line
      // ... rest of the code
    }
    // ... rest of the function
  } catch (error) {
    console.error('❌ Error in sendAutomatedEmails:', error); // Add this line
    // ... rest of error handling
  } finally {
    setIsSendingEmails(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-3"><BrainCircuit /></div>
              <h1 className="text-xl font-semibold text-gray-900">OCR Document Checking</h1>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!csvFile || isProcessing}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {isProcessing ? 'Processing...' : 'Start Process'}
            </button>
        </div>
      </header>


      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Processing Setup</h1>
          <p className="text-xl text-gray-600">Upload your CSV file and Image files to begin processing</p>
        </div>

        {isProcessing && (
          <div className="mb-8">
            <div className="text-center text-gray-600 mb-2">Processing applications... Please wait.</div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/4 bg-red-500 rounded-full animate-progress-bar"></div>
            </div>
          </div>
        )}
        
        {message && (
          <div className={`mb-8 p-4 rounded-lg flex items-center space-x-3
            ${message.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' : ''}
            ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : ''}
          `}>
            {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="font-medium">{message.message}</span>
          </div>
        )}

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Upload CSV File</h3>
                  <p className="text-gray-600">Select your data file to process</p>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver === 'csv'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'csv')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'csv')}
                onClick={() => csvInputRef.current?.click()}
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here</p>
                <p className="text-gray-500">or click to browse</p>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'csv')}
                />
              </div>

              {csvFile && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{csvFile.name}</span>
                    <span className="text-blue-600">({csvFile.size})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Upload Image Files</h3>
                  <p className="text-gray-600">ZIP file containing ID and payslip images</p>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver === 'zip'
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'zip')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'zip')}
                onClick={() => zipInputRef.current?.click()}
              >
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Drop your ZIP file here</p>
                <p className="text-gray-500">or click to browse</p>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'zip')}
                />
              </div>

              {zipFile && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-800">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{zipFile.name}</span>
                    <span className="text-purple-600">({zipFile.size})</span>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-2">ZIP File Structure:</p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• The .zip file should contain the ID and Payslip of each application form:</li>
                      <li className="ml-4">- <code className="bg-yellow-100 px-1 rounded">[app_id]_id.jpg</code> (ID image)</li>
                      <li className="ml-4">- <code className="bg-yellow-100 px-1 rounded">[app_id]_payslip.png</code> (payslip image)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings Modal */}
          {showEmailSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
                    <button
                      onClick={() => setShowEmailSettings(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={emailSettings.subject}
                        onChange={(e) => setEmailSettings({...emailSettings, subject: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Template
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Use placeholders: {'{application_id}'}, {'{document_issues}'}
                      </p>
                      <textarea
                        value={emailSettings.template}
                        onChange={(e) => setEmailSettings({...emailSettings, template: e.target.value})}
                        rows={10}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowEmailSettings(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowEmailSettings(false)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(validIds.length > 0 || rejectedIds.length > 0) && applicationDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Valid Applications */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Valid Applications</h3>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                      {validIds.length}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadCSV('valid')}
                    className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    disabled={validIds.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <ul className="space-y-4">
                    {validIds.length > 0 ? (
                      validIds.map((id) => {
                        const details = applicationDetails[id];
                        if (!details) return null;
                        const idStatus = getDocumentStatus(details.found_id, details.valid_id);
                        const payslipStatus = getDocumentStatus(details.found_payslip, details.valid_payslip);
                        return (
                          <li key={id} className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-green-800">{id}</span>
                            </div>
                            <div className="text-sm text-green-700 space-y-1">
                              <div className="flex items-center">
                                {details.valid_id ? <FileCheck className="w-4 h-4 mr-2" /> : <FileX className="w-4 h-4 mr-2" />}
                                <span>ID: {idStatus}</span>
                              </div>
                              <div className="flex items-center">
                                {details.valid_payslip ? <FileCheck className="w-4 h-4 mr-2" /> : <FileX className="w-4 h-4 mr-2" />}
                                <span>Payslip: {payslipStatus}.</span>
                              </div>
                              <div className="flex items-center">
                                {details.valid_payslip ? <FileCheck className="w-4 h-4 mr-2" /> : <FileX className="w-4 h-4 mr-2" />}
                                <span>Payslip: Information added to database.</span>
                              </div>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">No valid applications found.</p>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Rejected Applications */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Rejected Applications</h3>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                      {rejectedIds.length}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowEmailSettings(true)}
                      className="flex items-center px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={() => downloadCSV('invalid')}
                      className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      disabled={rejectedIds.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <button
                    onClick={sendAutomatedEmails}
                    disabled={rejectedIds.length === 0 || isSendingEmails}
                    className="flex items-center w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                  >
                    {isSendingEmails ? (
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isSendingEmails ? 'Sending Emails...' : `Send Automated Emails (${rejectedIds.length} recipients)`}
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <ul className="space-y-4">
                    {rejectedIds.length > 0 ? (
                      rejectedIds.map((id) => {
                        const details = applicationDetails[id];
                        if (!details) return null;
                        const idStatus = getDocumentStatus(details.found_id, details.valid_id);
                        const payslipStatus = getDocumentStatus(details.found_payslip, details.valid_payslip);
                        return (
                          <li key={id} className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-red-800">{id}</span>
                            </div>
                            <div className="text-sm text-red-700 space-y-1 mt-2">
                                <div className="flex items-center">
                                    {details.valid_id ? <FileCheck className="w-4 h-4 mr-2" /> : <FileX className="w-4 h-4 mr-2" />}
                                    <span>ID: {idStatus}</span>
                                </div>
                                <div className="flex items-center">
                                    {details.valid_payslip ? <FileCheck className="w-4 h-4 mr-2" /> : <FileX className="w-4 h-4 mr-2" />}
                                    <span>Payslip: {payslipStatus}</span>
                                </div>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">No rejected applications found.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DataProcess;