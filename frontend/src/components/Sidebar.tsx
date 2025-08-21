import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type SectionKey = 'aiassist' | 'analytics' | 'team';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    aiassist: true,
    analytics: true,
    team: true
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const isActiveSection = (sectionPaths: string[]) => {
    return sectionPaths.some(path => location.pathname.startsWith(path));
  };

  return (
    <div className='fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 shadow-sm'>
      {/* Logo Design */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <span className="font-bold text-xl text-gray-800">BPAi</span>
      </div>

      {/* Navigation Section */}
      <nav className="mt-6 px-4">
        {/* Analytics Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('aiassist')}
            className={`flex items-center justify-between p-3 rounded-lg w-full text-left transition-colors duration-200 
            ${isActiveSection(['/aiassist']) ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="font-medium">AI Assist</span>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.aiassist ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          {expandedSections.aiassist && (
            <div className="ml-8 mt-2 space-y-1">
              <Link
                to="/aiassist/dataprocess"
                className={`block py-2 px-3 rounded-lg text-sm transition-colors duration-200
                ${isActiveLink('/aiassist/dataprocess') ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                AI Process
              </Link>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('analytics')}
            className={`flex items-center justify-between p-3 rounded-lg w-full text-left transition-colors duration-200 
            ${isActiveSection(['/analytics']) ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="font-medium">Analytics</span>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.analytics ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          {expandedSections.analytics && (
            <div className="ml-8 mt-2 space-y-1">
              <Link
                to="/analytics/your-progress"
                className={`block py-2 px-3 rounded-lg text-sm transition-colors duration-200
                ${isActiveLink('/analytics/your-progress') ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Your Progress
              </Link>
              <Link
                to="/analytics/team-progress"
                className={`block py-2 px-3 rounded-lg text-sm transition-colors duration-200
                ${isActiveLink('/analytics/team-progress') ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Team Progress
              </Link>
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('team')}
            className={`flex items-center justify-between p-3 rounded-lg w-full text-left transition-colors duration-200 
            ${isActiveSection(['/team']) ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="font-medium">Applications</span>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.team ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          {expandedSections.team && (
            <div className="ml-8 mt-2 space-y-1">
              <Link
                to="/team/officer-x"
                className={`block py-2 px-3 rounded-lg text-sm transition-colors duration-200
                ${isActiveLink('/team/officer-x') ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Officer X (You)
              </Link>
              <Link
                to="/team/officer-y"
                className={`block py-2 px-3 rounded-lg text-sm transition-colors duration-200
                ${isActiveLink('/team/officer-y') ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Officer Y
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            📖 Help Guide
          </button>
          <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            📋 Internal Docs
          </button>
        </div>
        <div className="mt-4 flex items-center p-2 bg-red-50 rounded-lg">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-2">
            <span className="text-white font-bold text-xs">LO</span>
          </div>
          <span className="text-sm text-gray-700 font-medium">Loan Officer</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
