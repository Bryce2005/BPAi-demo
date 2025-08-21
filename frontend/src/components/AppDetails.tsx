import React from 'react';
import { X } from 'lucide-react';
import type { ApplicationDetailsModalProps } from '../shared/types';
import { modalSections, rightPanelSections, expandableSections } from './modalSections';

const ApplicationDetailsModal = ({ application, isOpen, onClose }: ApplicationDetailsModalProps) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
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
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dynamic Sections */}
            {modalSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div key={section.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-6 h-6 ${section.iconBg || ''} rounded flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${section.iconColor}`} />
                    </div>
                    <h3 className="font-medium">{section.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {section.fields.map((field, index) => (
                      <div key={index}>
                        <p className="text-sm text-gray-600">{field.label}</p>
                        <p className={`font-medium ${field.className || ''}`}>
                          {field.getValue(application)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Contact Client Button */}
            <button className="w-full bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors">
              📧 Contact Client
            </button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightPanelSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div key={section.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-6 h-6 ${section.iconBg || ''} rounded flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${section.iconColor}`} />
                    </div>
                    <h3 className="font-medium">{section.title}</h3>
                  </div>
                  {section.renderContent(application)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="px-6 pb-6 space-y-4">
          {expandableSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.id} className="border rounded-lg">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <span className="text-gray-400">▼</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;