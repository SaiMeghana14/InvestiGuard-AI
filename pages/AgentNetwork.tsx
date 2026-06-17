// ============================================================
// InvestiGuard AI — Agent Network Page
// ============================================================

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Cpu } from 'lucide-react';
import { AgentType, AGENT_CONFIG } from '../types';

const AGENTS = Object.values(AgentType);

const agentConnections: { from: AgentType; to: AgentType; label: string }[] = [
  { from: AgentType.LEAD_INVESTIGATOR, to: AgentType.INTAKE_ANALYST, label: 'Delegates parsing' },
  { from: AgentType.INTAKE_ANALYST, to: AgentType.TRANSACTION_ANALYST, label: 'Passes findings' },
  { from: AgentType.INTAKE_ANALYST, to: AgentType.BEHAVIOR_ANALYST, label: 'Passes findings' },
  { from: AgentType.TRANSACTION_ANALYST, to: AgentType.BEHAVIOR_ANALYST, label: 'Shares pattern data' },
  { from: AgentType.TRANSACTION_ANALYST, to: AgentType.RISK_ASSESSOR, label: 'Pattern results' },
  { from: AgentType.BEHAVIOR_ANALYST, to: AgentType.RISK_ASSESSOR, label: 'Profile results' },
  { from: AgentType.RISK_ASSESSOR, to: AgentType.LEAD_INVESTIGATOR, label: 'Risk score' },
];

export default function AgentNetwork() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-foreground-muted hover:text-foreground transition-colors mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Cpu size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground text-glow">Agent Network</h1>
            <p className="text-xs text-foreground-muted">The 5 specialized AI agents of InvestiGuard</p>
          </div>
        </div>

        {/* Agent Flow Diagram */}
        <div className="bg-background-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-4">Investigation Workflow</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {AGENTS.map((agentType, i) => (
              <div key={agentType} className="flex items-center gap-3">
                <div className="bg-background-alt border border-border rounded-xl p-3 text-center w-28">
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold text-black"
                    style={{ backgroundColor: AGENT_CONFIG[agentType].color.replace('var(', '').replace(')', '') }}>
                    {AGENT_CONFIG[agentType].shortName[0]}
                  </div>
                  <p className="text-[10px] font-semibold text-foreground">{AGENT_CONFIG[agentType].shortName}</p>
                  <p className="text-[8px] text-foreground-muted mt-1">{AGENT_CONFIG[agentType].role.split(',')[0]}</p>
                </div>
                {i < AGENTS.length - 1 && (
                  <div className="hidden md:flex items-center text-foreground-muted">
                    <Activity size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Agent Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agentType) => {
            const config = AGENT_CONFIG[agentType];
            const connections = agentConnections.filter(c => c.from === agentType || c.to === agentType);
            return (
              <div key={agentType} className="bg-background-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
                    style={{ backgroundColor: config.color.replace('var(', '').replace(')', '') }}>
                    {config.shortName[0]}
                  </div>
                  <div>
                    <h3 className="font-heading text-xs font-bold text-foreground">{config.name}</h3>
                    <p className="text-[9px] text-foreground-muted">{config.emoji} {config.shortName}</p>
                  </div>
                </div>
                <p className="text-[10px] text-foreground/80 mb-3">{config.role}</p>
                <div className="space-y-1">
                  <p className="text-[8px] text-foreground-muted uppercase tracking-wider font-semibold">Connections</p>
                  {connections.map((conn) => (
                    <div key={`${conn.from}-${conn.to}`} className="flex items-center gap-1.5 text-[9px] text-foreground-muted">
                      <Activity size={8} className="text-primary" />
                      <span>{AGENT_CONFIG[conn.from].shortName}</span>
                      <span className="text-foreground-muted/50">&rarr;</span>
                      <span>{AGENT_CONFIG[conn.to].shortName}</span>
                      <span className="text-foreground-muted/50">({conn.label})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}