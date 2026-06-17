// ============================================================
// InvestiGuard AI — Dashboard Page
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, Activity, Zap, Cpu } from 'lucide-react';
import { DemoScenario } from '../types';
import { getAllDemoCases, getDemoCase } from '../lib/demoData';
import { getAgentRunner } from '../lib/agentRunner';
import { CaseGrid } from '../components/dashboard/CaseGrid';
import { NewInvestigationModal } from '../components/dashboard/NewInvestigationModal';

export default function Dashboard() {
  const [cases, setCases] = useState(getAllDemoCases());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectScenario = (scenario: DemoScenario) => {
    setIsModalOpen(false);
    const caseData = getDemoCase(scenario);
    const runner = getAgentRunner();
    runner.reset();
    navigate('/investigation/' + caseData.id);
  };

  const stats = [
    { label: 'Active Cases', value: cases.filter((c) => c.status === 'in_progress' || c.status === 'awaiting_review').length, icon: Activity, color: 'text-primary' },
    { label: 'Pending Review', value: cases.filter((c) => c.status === 'awaiting_review').length, icon: Shield, color: 'text-warning' },
    { label: 'Resolved', value: cases.filter((c) => c.status === 'resolved').length, icon: Zap, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-foreground text-glow">
                InvestiGuard AI
              </h1>
              <p className="text-xs text-foreground-muted">Multi-Agent Investigation Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/agent-network')}
              className="flex items-center gap-2 bg-background-card border border-border px-4 py-2.5 rounded-xl
                         text-xs font-semibold text-foreground-muted hover:text-foreground hover:border-primary/30
                         transition-all duration-200 cursor-pointer"
            >
              <Cpu size={14} />
              Agent Network
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl
                         text-xs font-semibold hover:brightness-110 transition-all duration-200
                         neon-glow-blue cursor-pointer"
            >
              <Plus size={14} />
              New Investigation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-background-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={stat.color} />
                  <span className="text-xs text-foreground-muted">{stat.label}</span>
                </div>
                <p className={'text-2xl font-heading font-bold ' + stat.color}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Case Grid */}
        <div className="mb-4">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-4">Investigation Cases</h2>
          <CaseGrid cases={cases} />
        </div>
      </div>

      <NewInvestigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />
    </div>
  );
}
