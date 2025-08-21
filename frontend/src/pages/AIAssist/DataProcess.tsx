import React, { useState, useRef } from 'react';
import { Upload, FileText, Package, Link, AlertCircle } from 'lucide-react';

interface FileInfo {
  file: File;
  name: string;
  size: string;
}

const DataProcess: React.FC = () => {
  const [csvFile, setCsvFile] = useState<FileInfo | null>(null);
  const [zipFile, setZipFile] = useState<FileInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  
  const csvInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (file: File, type: 'csv' | 'zip') => {
    const fileInfo: FileInfo = {
      file,
      name: file.name,
      size: formatFileSize(file.size)
    };

    if (type === 'csv') {
      setCsvFile(fileInfo);
    } else {
      setZipFile(fileInfo);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'csv' | 'zip') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const handleSubmit = async () => {
    
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    formData.append('csv_file', csvFile.file);
    if (zipFile) {
      formData.append('zip_file', zipFile.file);
    }

    try {
      const response = await fetch('/api/process-data', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert(`Processing completed!\nValid: ${result.valid_applications}\nRejected: ${result.rejected_applications}`);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Processing failed: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              disabled={!csvFile || isProcessing}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
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
        </div>
      </main>
    </div>
  );
};

export default DataProcess;