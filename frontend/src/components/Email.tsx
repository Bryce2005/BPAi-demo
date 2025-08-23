// import React, { useState, useRef, useEffect } from 'react';
// import { Upload, FileText, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// // Interface to define the structure for file information
// interface FileInfo {
//   file: File;
//   name: string;
//   size: string;
// }

// // Interface for the expected API response
// interface AnalysisResponse {
//   session_id: string;
//   status: string;
//   analysis: {
//     valid_app_ids: string[];
//     rejected_app_ids: string[];
//   };
// }

// // Custom modal/message box interface
// interface MessageInfo {
//   message: string;
//   type: 'error' | 'success' | 'info';
// }

// const DataProcess: React.FC = () => {
//   // State for the uploaded files
//   const [csvFile, setCsvFile] = useState<FileInfo | null>(null);
//   const [zipFile, setZipFile] = useState<FileInfo | null>(null);
  
//   // State to track processing status
//   const [isProcessing, setIsProcessing] = useState(false);
  
//   // State for drag-and-drop visual feedback
//   const [dragOver, setDragOver] = useState<string | null>(null);
  
//   // State for displaying results
//   const [validIds, setValidIds] = useState<string[]>([]);
//   const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  
//   // State for displaying messages (success, error, etc.)
//   const [message, setMessage] = useState<MessageInfo | null>(null);

//   // References to file input elements for programmatic clicks
//   const csvInputRef = useRef<HTMLInputElement>(null);
//   const zipInputRef = useRef<HTMLInputElement>(null);

//   // Utility function to format file size for display
//   const formatFileSize = (bytes: number): string => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   // Handles file selection from the file input or drop
//   const handleFileSelect = (file: File, type: 'csv' | 'zip') => {
//     // Clear any existing messages
//     setMessage(null);
//     const fileInfo: FileInfo = {
//       file,
//       name: file.name,
//       size: formatFileSize(file.size)
//     };

//     if (type === 'csv') {
//       // Check if the file is a CSV
//       if (file.name.split('.').pop()?.toLowerCase() !== 'csv') {
//         setMessage({ message: 'Please select a valid CSV file.', type: 'error' });
//         return;
//       }
//       setCsvFile(fileInfo);
//     } else {
//       // Check if the file is a ZIP
//       if (file.name.split('.').pop()?.toLowerCase() !== 'zip') {
//         setMessage({ message: 'Please select a valid ZIP file.', type: 'error' });
//         return;
//       }
//       setZipFile(fileInfo);
//     }
//   };

//   // Handles drag-over event for visual feedback
//   const handleDragOver = (e: React.DragEvent, type: string) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragOver(type);
//   };

//   // Handles drag-leave event
//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragOver(null);
//   };

//   // Handles drop event to get the file
//   const handleDrop = (e: React.DragEvent, type: 'csv' | 'zip') => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragOver(null);

//     const files = e.dataTransfer.files;
//     if (files.length > 0) {
//       handleFileSelect(files[0], type);
//     }
//   };

//   // Main function to handle the form submission. This version simulates the API call.
//   const handleSubmit = async () => {
//     // Basic validation
//     if (!csvFile) {
//       setMessage({ message: 'Please select a CSV file to begin.', type: 'error' });
//       return;
//     }

//     // Reset results and messages, and start processing
//     setIsProcessing(true);
//     setMessage(null);
//     setValidIds([]);
//     setRejectedIds([]);

//     // --- Start of Simulated API Call ---
//     // Simulate a network delay with a Promise and setTimeout
//     const mockResponse: AnalysisResponse = {
//       session_id: 'mock-session-12345',
//       status: 'completed',
//       analysis: {
//         valid_app_ids: ['app_001', 'app_003', 'app_005', 'app_008', 'app_011'],
//         rejected_app_ids: ['app_002', 'app_004', 'app_006', 'app_007', 'app_009', 'app_010'],
//       },
//     };

//     try {
//       await new Promise(resolve => setTimeout(resolve, 2000)); // Simulates a 2-second network request

//       // Use the mock data to update the state as if the API call was successful
//       setValidIds(mockResponse.analysis.valid_app_ids);
//       setRejectedIds(mockResponse.analysis.rejected_app_ids);
//       setMessage({ 
//         message: `Processing completed successfully! Found ${mockResponse.analysis.valid_app_ids.length} valid and ${mockResponse.analysis.rejected_app_ids.length} rejected applications.`, 
//         type: 'success' 
//       });
//     } catch (err: any) {
//       // This catch block would handle errors in a real application
//       setMessage({ message: `Processing failed: ${err.message || 'An unexpected error occurred.'}`, type: 'error' });
//     } finally {
//       setIsProcessing(false);
//     }
//     // --- End of Simulated API Call ---
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-sm">AI</span>
//               </div>
//               <span className="text-xl font-semibold text-gray-900">AI Process</span>
//             </div>
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={!csvFile || isProcessing}
//               className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
//             >
//               {isProcessing ? 'Processing...' : 'Start Process'}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Processing Setup</h1>
//           <p className="text-xl text-gray-600">Upload your CSV file and OCR files to begin processing</p>
//         </div>

//         {/* Message Box for success or error */}
//         {message && (
//           <div className={`mb-8 p-4 rounded-lg flex items-center space-x-3 
//             ${message.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' : ''}
//             ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : ''}
//           `}>
//             {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
//             {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
//             <span className="font-medium">{message.message}</span>
//           </div>
//         )}

//         <div>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//             {/* CSV Upload Card */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
//               <div className="flex items-center space-x-4 mb-6">
//                 <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
//                   <Upload className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">Upload CSV File</h3>
//                   <p className="text-gray-600">Select your data file to process</p>
//                 </div>
//               </div>

//               <div
//                 className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
//                   dragOver === 'csv'
//                     ? 'border-blue-400 bg-blue-50'
//                     : 'border-gray-300 hover:border-gray-400 bg-gray-50'
//                 }`}
//                 onDragOver={(e) => handleDragOver(e, 'csv')}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, 'csv')}
//                 onClick={() => csvInputRef.current?.click()}
//               >
//                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here</p>
//                 <p className="text-gray-500">or click to browse</p>
//                 <input
//                   ref={csvInputRef}
//                   type="file"
//                   accept=".csv"
//                   className="hidden"
//                   onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'csv')}
//                 />
//               </div>

//               {csvFile && (
//                 <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                   <div className="flex items-center space-x-2 text-blue-800">
//                     <FileText className="w-4 h-4" />
//                     <span className="font-medium">{csvFile.name}</span>
//                     <span className="text-blue-600">({csvFile.size})</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* ZIP Upload Card */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
//               <div className="flex items-center space-x-4 mb-6">
//                 <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
//                   <Package className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">Upload OCR Files</h3>
//                   <p className="text-gray-600">ZIP file containing ID and payslip images</p>
//                 </div>
//               </div>

//               <div
//                 className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
//                   dragOver === 'zip'
//                     ? 'border-purple-400 bg-purple-50'
//                     : 'border-gray-300 hover:border-gray-400 bg-gray-50'
//                 }`}
//                 onDragOver={(e) => handleDragOver(e, 'zip')}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, 'zip')}
//                 onClick={() => zipInputRef.current?.click()}
//               >
//                 <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-lg font-medium text-gray-700 mb-2">Drop your ZIP file here</p>
//                 <p className="text-gray-500">or click to browse</p>
//                 <input
//                   ref={zipInputRef}
//                   type="file"
//                   accept=".zip"
//                   className="hidden"
//                   onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'zip')}
//                 />
//               </div>

//               {zipFile && (
//                 <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
//                   <div className="flex items-center space-x-2 text-purple-800">
//                     <Package className="w-4 h-4" />
//                     <span className="font-medium">{zipFile.name}</span>
//                     <span className="text-purple-600">({zipFile.size})</span>
//                   </div>
//                 </div>
//               )}

//               {/* Help Text */}
//               <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <div className="flex items-start space-x-2">
//                   <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
//                   <div className="text-sm">
//                     <p className="font-medium text-yellow-800 mb-2">ZIP File Structure:</p>
//                     <ul className="text-yellow-700 space-y-1">
//                       <li>• Create folders named with application IDs</li>
//                       <li>• Each folder should contain:</li>
//                       <li className="ml-4">- <code className="bg-yellow-100 px-1 rounded">[app_id]_id.jpg</code> (ID image)</li>
//                       <li className="ml-4">- <code className="bg-yellow-100 px-1 rounded">[app_id]_payslip.png</code> (payslip image)</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Results Display */}
//           {(validIds.length > 0 || rejectedIds.length > 0) && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Valid Applications */}
//               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center space-x-2 mb-4">
//                   <CheckCircle className="w-5 h-5 text-green-600" />
//                   <h3 className="text-xl font-semibold text-gray-900">Valid Applications</h3>
//                 </div>
//                 <div className="max-h-64 overflow-y-auto">
//                   <ul className="list-disc list-inside space-y-2 text-gray-600">
//                     {validIds.length > 0 ? (
//                       validIds.map((id) => (
//                         <li key={id} className="bg-green-50 rounded-md p-2 flex items-center space-x-2 text-green-800 font-medium">
//                            {id}
//                         </li>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-sm">No valid applications found.</p>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//               {/* Rejected Applications */}
//               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center space-x-2 mb-4">
//                   <XCircle className="w-5 h-5 text-red-600" />
//                   <h3 className="text-xl font-semibold text-gray-900">Rejected Applications</h3>
//                 </div>
//                 <div className="max-h-64 overflow-y-auto">
//                   <ul className="list-disc list-inside space-y-2 text-gray-600">
//                     {rejectedIds.length > 0 ? (
//                       rejectedIds.map((id) => (
//                         <li key={id} className="bg-red-50 rounded-md p-2 flex items-center space-x-2 text-red-800 font-medium">
//                            {id}
//                         </li>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-sm">No rejected applications found.</p>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DataProcess;

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Interface to define the structure for file information
interface FileInfo {
  file: File;
  name: string;
  size: string;
}

// Interface for the expected API response
interface AnalysisResponse {
  session_id: string;
  status: string;
  analysis: {
    valid_app_ids: string[];
    rejected_app_ids: string[];
  };
}

// Custom modal/message box interface
interface MessageInfo {
  message: string;
  type: 'error' | 'success' | 'info';
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
  
  // State for displaying messages (success, error, etc.)
  const [message, setMessage] = useState<MessageInfo | null>(null);

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
    // Clear any existing messages
    setMessage(null);
    const fileInfo: FileInfo = {
      file,
      name: file.name,
      size: formatFileSize(file.size)
    };

    if (type === 'csv') {
      // Check if the file is a CSV
      if (file.name.split('.').pop()?.toLowerCase() !== 'csv') {
        setMessage({ message: 'Please select a valid CSV file.', type: 'error' });
        return;
      }
      setCsvFile(fileInfo);
    } else {
      // Check if the file is a ZIP
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

  // Main function to handle the form submission. This version makes a real API call.
  const handleSubmit = async () => {
    // Basic validation
    if (!csvFile || !zipFile) {
      setMessage({ message: 'Please upload both a CSV file and a ZIP file.', type: 'error' });
      return;
    }

    // Reset results and messages, and start processing
    setIsProcessing(true);
    setMessage(null);
    setValidIds([]);
    setRejectedIds([]);

    // Create a FormData object to send both files
    const formData = new FormData();
    formData.append('csvFile', csvFile.file);
    formData.append('zipFile', zipFile.file);

    try {
      // Make the API call to your backend endpoint
      const response = await fetch('http://localhost:8000/process-files', {
        method: 'POST',
        body: formData,
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed on the server.');
      }

      // Parse the JSON response
      const result: AnalysisResponse = await response.json();

      // Update the state with the real data from the backend
      setValidIds(result.analysis.valid_app_ids);
      setRejectedIds(result.analysis.rejected_app_ids);
      setMessage({ 
        message: `Processing completed successfully! Found ${result.analysis.valid_app_ids.length} valid and ${result.analysis.rejected_app_ids.length} rejected applications.`, 
        type: 'success' 
      });
    } catch (err: any) {
      // Handle network or server-side errors
      setMessage({ message: `Processing failed: ${err.message || 'An unexpected error occurred.'}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">AI Process</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!csvFile || !zipFile || isProcessing}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {isProcessing ? 'Processing...' : 'Start Process'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Processing Setup</h1>
          <p className="text-xl text-gray-600">Upload your CSV file and OCR files to begin processing</p>
        </div>

        {/* Message Box for success or error */}
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
            {/* CSV Upload Card */}
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

            {/* ZIP Upload Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Upload OCR Files</h3>
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

              {/* Help Text */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-2">ZIP File Structure:</p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Create folders named with application IDs</li>
                      <li>• Each folder should contain:</li>
                      <li className="ml-4">- <code className="bg-yellow-100 px-1 rounded">[app_id]_id.jpg</code> (ID image)</li>
                      <li className="ml-4">- <code className="bg-yellow-100 px-1 rounded">[app_id]_payslip.png</code> (payslip image)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {(validIds.length > 0 || rejectedIds.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Valid Applications */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Valid Applications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {validIds.length > 0 ? (
                      validIds.map((id) => (
                        <li key={id} className="bg-green-50 rounded-md p-2 flex items-center space-x-2 text-green-800 font-medium">
                           {id}
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No valid applications found.</p>
                    )}
                  </ul>
                </div>
              </div>
              {/* Rejected Applications */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Rejected Applications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {rejectedIds.length > 0 ? (
                      rejectedIds.map((id) => (
                        <li key={id} className="bg-red-50 rounded-md p-2 flex items-center space-x-2 text-red-800 font-medium">
                           {id}
                        </li>
                      ))
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

