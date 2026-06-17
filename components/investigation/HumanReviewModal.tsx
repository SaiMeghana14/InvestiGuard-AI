// ============================================================
// InvestiGuard AI — Human Review Modal
// ============================================================
// Enhanced with "Why This Recommendation?" explainability.

import { X, CheckCircle, AlertTriangle, Flame, Shield, Users, GitBranch } from 'lucide-react';
import { InvestigationCase, AGENT_CONFIG } from '../../types';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';

interface VerdictResult {
  score: number; label: string; confidence: number;
  recommendation: 'approve' | 'flag' | 'escalate';
}

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecision: (decision: 'approve' | 'escalate', notes: string) => void;
  caseData: InvestigationCase | null;
  verdict: VerdictResult | null;
}

const verdictConfig = {
  approve: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', button: 'bg-success hover:bg-success/90 text-black', label: 'Approve Transaction' },
  flag: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', button: 'bg-warning hover:bg-warning/90 text-black', label: 'Flag for Review' },
  escalate: { icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', button: 'bg-destructive hover:bg-destructive/90 text-white', label: 'Escalate to SAR' },
};

export function HumanReviewModal({ isOpen, onClose, onDecision, caseData, verdict }: HumanReviewModalProps) {
  const { messages, evidence } = useRealtimeBand();
  if (!isOpen || !caseData || !verdict) return null;

  const vConfig = verdictConfig[verdict.recommendation];
  const VerdictIcon = vConfig.icon;
  const contributingAgents = Array.from(new Set(messages.map((m) => m.agentId))).map((id) => AGENT_CONFIG[id]).filter(Boolean);
  const keyFindings = evidence.filter((e) => e.severity === 'high' || e.severity === 'critical').slice(0, 5);
  const highCount = evidence.filter((e) => e.severity === 'high' || e.severity === 'critical').length;
  const medCount = evidence.filter((e) => e.severity === 'medium').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl fade-in overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h2 className="font-heading text-sm font-bold text-foreground">Human Review Required</h2>
          </div>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground cursor-pointer transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-background-alt border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">{caseData.title}</p>
            <p className="text-[10px] text-foreground-muted">
              ${caseData.transaction.amount.toLocaleString()} &middot; {caseData.transaction.transactionType.toUpperCase()} &middot; {caseData.transaction.region}
            </p>
          </div>

          <div className={`${vConfig.bg} ${vConfig.border} border rounded-xl p-4 text-center`}>
            <VerdictIcon size={32} className={`mx-auto mb-2 ${vConfig.color}`} />
            <div className="text-sm font-heading font-bold text-foreground">Agent Recommendation: {verdict.label}</div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div><div className="text-2xl font-heading font-bold text-foreground">{verdict.score}</div><div className="text-[9px] text-foreground-muted">Risk Score</div></div>
              <div className="w-px h-8 bg-border" />
              <div><div className="text-2xl font-heading font-bold text-foreground">{verdict.confidence}%</div><div className="text-[9px] text-foreground-muted">Confidence</div></div>
              <div className="w-px h-8 bg-border" />
              <div><div className="text-2xl font-heading font-bold text-foreground">{contributingAgents.length}</div><div className="text-[9px] text-foreground-muted">Agents</div></div>
            </div>
          </div>

          {/* Why This Recommendation? */}
          <div className="bg-background-alt border border-border rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground mb-3">
              <GitBranch size={14} className="text-accent" />Why This Recommendation?
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 text-center">
                <p className="text-lg font-heading font-bold text-destructive">{highCount}</p>
                <p className="text-[8px] text-foreground-muted">High Risk Items</p>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-2 text-center">
                <p className="text-lg font-heading font-bold text-warning">{medCount}</p>
                <p className="text-[8px] text-foreground-muted">Medium Risk Items</p>
              </div>
            </div>
            {keyFindings.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] text-foreground-muted font-semibold uppercase tracking-wider">Key Findings</p>
                {keyFindings.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 bg-background rounded-lg px-2.5 py-2 border border-border">
                    <div className="w-1.5 h-1.5 rounded-full mt-1 bg-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-semibold text-foreground">{ev.title}</p>
                      <p className="text-[8px] text-foreground-muted truncate">{ev.description.substring(0, 100)}</p>
                      <p className="text-[7px] text-foreground-muted mt-0.5">by {ev.agentName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {contributingAgents.length > 0 && (
            <div className="bg-background-alt border border-border rounded-xl p-3">
              <h4 className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground-muted mb-2">
                <Users size={12} />Contributing Agents ({contributingAgents.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {contributingAgents.map((agent) => (
                  <div key={agent.shortName} className="flex items-center gap-1 bg-background rounded-full px-2 py-1 border border-border">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] font-bold text-black"
                      style={{ backgroundColor: agent.color.replace('var(', '').replace(')', '') }}>
                      {agent.shortName[0]}
                    </div>
                    <span className="text-[8px] text-foreground">{agent.shortName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button onClick={() => onDecision('approve', (document.getElementById('review-notes') as HTMLTextAreaElement)?.value || '')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold bg-success/20 border border-success/30 text-success hover:bg-success/30 transition-all duration-200 cursor-pointer">
              <CheckCircle size={16} /> Approve &mdash; Accept Agent Recommendation
            </button>
            <button onClick={() => onDecision('escalate', (document.getElementById('review-notes') as HTMLTextAreaElement)?.value || '')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold bg-destructive/20 border border-destructive/30 text-destructive hover:bg-destructive/30 transition-all duration-200 cursor-pointer">
              <Flame size={16} /> Escalate &mdash; Override &amp; File SAR
            </button>
          </div>

          <div>
            <label className="text-[10px] font-medium text-foreground-muted mb-1 block">Review Notes (optional)</label>
            <textarea id="review-notes" placeholder="Add your notes or override reasoning..."
              className="w-full bg-background border border-border rounded-lg p-3 text-[11px] text-foreground placeholder:text-foreground-muted/40 resize-none h-20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200" />
          </div>
        </div>
      </div>
    </div>
  );
}