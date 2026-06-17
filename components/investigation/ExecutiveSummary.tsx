// ============================================================
// InvestiGuard AI — Executive Summary Panel
// Shows a concise, real-time summary of the investigation
// including key stats, risk score, and agent contributions.
// ============================================================

import { Shield, Gauge, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { InvestigationCase, AGENT_CONFIG } from '../../types';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';

interface ExecutiveSummaryProps {
  caseData: InvestigationCase;
  verdict: { score: number; label: string; confidence: number } | null;
}

export function ExecutiveSummary({ verdict }: ExecutiveSummaryProps) {
  const { messages, evidence, isRunning, isComplete } = useRealtimeBand();

  // Count unique agents who have contributed
  const activeAgentIds = new Set(messages.map((m) => m.agentId));
  const agentList = Array.from(activeAgentIds).map((id) => AGENT_CONFIG[id]);

  // Count evidence by severity
  const highRiskEvidence = evidence.filter((e) => e.severity === 'high' || e.severity === 'critical').length;
  const totalEvidence = evidence.length;

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background-alt">
        <Shield size={12} className="text-accent" />
        <span className="font-heading text-[10px] font-semibold text-foreground">Executive Summary</span>
        {isRunning && (
          <span className="ml-auto text-[8px] text-primary flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background-alt rounded-lg p-2 text-center border border-border">
            <Gauge size={14} className={`mx-auto mb-1 ${verdict && verdict.score >= 70 ? 'text-destructive' : verdict && verdict.score >= 40 ? 'text-warning' : 'text-foreground-muted'}`} />
            <p className="text-lg font-heading font-bold text-foreground">
              {verdict ? verdict.score : '-'}
            </p>
            <p className="text-[7px] text-foreground-muted">Risk Score</p>
          </div>

          <div className="bg-background-alt rounded-lg p-2 text-center border border-border">
            <Users size={14} className="mx-auto mb-1 text-primary" />
            <p className="text-lg font-heading font-bold text-foreground">
              {agentList.length}
            </p>
            <p className="text-[7px] text-foreground-muted">Agents</p>
          </div>

          <div className="bg-background-alt rounded-lg p-2 text-center border border-border">
            <AlertTriangle size={14} className={`mx-auto mb-1 ${highRiskEvidence > 0 ? 'text-destructive' : 'text-foreground-muted'}`} />
            <p className="text-lg font-heading font-bold text-foreground">
              {totalEvidence}
            </p>
            <p className="text-[7px] text-foreground-muted">Evidences</p>
          </div>
        </div>

        {/* Verdict display */}
        {verdict && (
          <div className={`rounded-lg p-3 text-center border
            ${verdict.score >= 70 ? 'bg-destructive/10 border-destructive/30' :
              verdict.score >= 40 ? 'bg-warning/10 border-warning/30' :
              'bg-success/10 border-success/30'}`}>
            <p className={`text-[11px] font-heading font-bold
              ${verdict.score >= 70 ? 'text-destructive' :
                verdict.score >= 40 ? 'text-warning' :
                'text-success'}`}>
              {verdict.label}
            </p>
            <p className="text-[9px] text-foreground-muted mt-0.5">
              Confidence: {verdict.confidence}%
            </p>
          </div>
        )}

        {/* Agents that have contributed */}
        {agentList.length > 0 && (
          <div>
            <p className="text-[8px] font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
              Contributing Agents
            </p>
            <div className="space-y-1">
              {agentList.map((agent) => (
                <div key={agent.shortName} className="flex items-center gap-2 bg-background-alt rounded-lg px-2 py-1.5 border border-border">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-black shrink-0"
                    style={{ backgroundColor: agent.color.replace('var(', '').replace(')', '') }}
                  >
                    {agent.shortName[0]}
                  </div>
                  <span className="text-[9px] text-foreground truncate">{agent.name}</span>
                  <CheckCircle size={8} className="ml-auto text-success shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-[8px] text-foreground-muted">
            {messages.length} messages
          </span>
          {isComplete && (
            <span className="text-[8px] text-success flex items-center gap-1">
              <CheckCircle size={8} />
              Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
