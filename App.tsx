import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvestigationPage from './pages/Investigation';
import AgentNetwork from './pages/AgentNetwork';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background scanline">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investigation/:caseId" element={<InvestigationPage />} />
          <Route path="/agent-network" element={<AgentNetwork />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
