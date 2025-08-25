import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ChatbotAssistant from './components/ChatbotAssistant'

// AIAssist Pages
import DataProcess from './pages/AIAssist/DataProcess'

// Analytics Pages
import TeamProgress from './pages/Analytics/TeamProgress'
import YourProgress from './pages/Analytics/YourProgress'

// Team Pages
import OfficerX from './pages/Team/OfficerX'
import OfficerY from './pages/Team/OfficerY'

import './App.css'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-64">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/aiassist/dataprocess" replace />} />
            
            {/* AIAssist Routes */}
            <Route path="/aiassist/dataprocess" element={<DataProcess />} />
            
            {/* Analytics Routes */}
            <Route path="/analytics/your-progress" element={<YourProgress />} />
            <Route path="/analytics/team-progress" element={<TeamProgress />} />
            
            {/* Team Routes */}
            <Route path="/team/officer-x" element={<OfficerX />} />
            <Route path="/team/officer-y" element={<OfficerY />} />
          </Routes>
        </main>
        <ChatbotAssistant />
      </div>
    </Router>
  )
}

export default App