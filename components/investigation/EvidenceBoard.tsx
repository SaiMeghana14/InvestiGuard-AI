// ============================================================
// InvestiGuard AI — Evidence Board
// Enhanced with evidence dependency chains.
// ============================================================

import { useState } from 'react';
import { FileText, Gauge, GitBranch } from 'lucide-react';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';
import { InvestigationCase } from '../../types';

interface EvidenceBoardProps {
  caseData: InvestigationCase;
  verdict: { score: number; label: string; confidence: number } | null;
}

const severityConfig = {
  low: { color: 'text-foreground-muted', bg: 'bg-muted', label: 'Info' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', label: 'Notable' },
  high: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'High' },
  critical: { color: 'text-destructive', bg: 'bg-destructive/20', label: 'Critical' },
};

const categoryIcons = {
  pattern: '📊',
  anomaly: '⚠️',
  behavior: '👤',
  network: '🔗',
  document: '📄',
  reference: '📋',
};

export function EvidenceBoard({ caseData, verdict }: EvidenceBoardProps) {
  const { evidence } = useRealtimeBand();
  const [activeTab, setActiveTab] = useState<'transaction' | 'evidence' | 'timeline'>('transaction');

  const sortedEvidence = [...evidence].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const tx = caseData.transaction;

  const tabs = [
    { id: 'transaction' as const, label: 'Transaction' },
    { id: 'evidence' as const, label: 'Evidence (' + sortedEvidence.length + ')' },
    { id: 'timeline' as const, label: 'Timeline' },
  ];

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background-alt">
        <FileText size={14} className="text-primary" />
        <span className="font-heading text-xs font-semibold text-foreground">Evidence Board</span>
      </div>

      <div className="flex border-b border-border bg-background-alt/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={'flex-1 text-[10px] font-medium py-2.5 px-3 transition-all duration-200 cursor-pointer '
              + (activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-foreground-muted hover:text-foreground')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Transaction Details Tab */}
        {activeTab === 'transaction' && (
          <div className="space-y-3 fade-in">
            <div className="bg-background-alt border border-border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-foreground-muted">Amount</span>
                <span className="text-sm font-heading font-bold text-foreground">${tx.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-foreground-muted">Currency</span>
                <span className="text-[11px] text-foreground">{tx.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-foreground-muted">Type</span>
                <span className="text-[11px] text-foreground uppercase">{tx.transactionType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-foreground-muted">Region</span>
                <span className="text-[11px] text-foreground">{tx.region}</span>
              </div>
            </div>

            <div className="bg-background-alt border border-border rounded-lg p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Sender</h4>
              <p className="text-xs text-foreground">{tx.senderName}</p>
              <p className="text-[10px] text-foreground-muted">{tx.senderAccount}</p>
            </div>

            <div className="bg-background-alt border border-border rounded-lg p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Recipient</h4>
              <p className="text-xs text-foreground">{tx.recipientName}</p>
              <p className="text-[10px] text-foreground-muted">{tx.recipientAccount}</p>
            </div>

            {tx.notes && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                <p className="text-[10px] text-warning font-semibold mb-1">{'⚠'} Notes</p>
                <p className="text-[10px] text-foreground-muted">{tx.notes}</p>
              </div>
            )}

            {verdict && (
              <div className={'bg-background-alt border border-border rounded-lg p-4 text-center fade-in'}>
                <Gauge size={24} className={'mx-auto mb-2 ' + (verdict.score >= 70 ? 'text-destructive' : verdict.score >= 40 ? 'text-warning' : 'text-success')} />
                <div className="text-2xl font-heading font-bold text-foreground">{verdict.score}/100</div>
                <div className="text-[10px] text-foreground-muted mt-1">Risk Score</div>
                <div className={'mt-2 text-xs font-semibold px-3 py-1 rounded-full inline-block '
                  + (verdict.score >= 70 ? 'bg-destructive/10 text-destructive' :
                     verdict.score >= 40 ? 'bg-warning/10 text-warning' :
                     'bg-success/10 text-success')}>
                  {verdict.label}
                </div>
                <div className="mt-2 text-[10px] text-foreground-muted">
                  Confidence: {verdict.confidence}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evidence Tab with dependency chains */}
        {activeTab === 'evidence' && (
          <div className="space-y-2 fade-in">
            {sortedEvidence.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-foreground-muted">No evidence collected yet</p>
              </div>
            )}
            {sortedEvidence.map((ev) => {
              const sev = severityConfig[ev.severity];
              const hasDeps = ev.dependsOn && ev.dependsOn.length > 0;
              const dependentEvs = hasDeps
                ? ev.dependsOn!.map((depId) => evidence.find((e) => e.id === depId)).filter(Boolean)
                : [];

              return (
                <div key={ev.id} className="bg-background-alt border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{categoryIcons[ev.category]}</span>
                      <span className="text-[10px] font-semibold text-foreground">{ev.title}</span>
                    </div>
                    <span className={'text-[8px] px-1.5 py-0.5 rounded ' + sev.color + ' ' + sev.bg}>
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground/80 leading-relaxed">{ev.description}</p>
                  <p className="text-[8px] text-foreground-muted mt-1">
                    {ev.agentName} &middot; {new Date(ev.createdAt).toLocaleTimeString()}
                  </p>

                  {/* Dependency chain */}
                  {dependentEvs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-1 text-[8px] text-foreground-muted mb-1">
                        <GitBranch size={8} />
                        <span className="font-semibold">Depends on:</span>
                      </div>
                      {dependentEvs.map((dep) => dep && (
                        <div key={dep.id} className="flex items-center gap-1 ml-3 text-[8px] text-foreground-muted/70">
                          <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                          <span>{dep.title}</span>
                          <span className="text-foreground-muted/40">by {dep.agentName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-0 fade-in">
            {sortedEvidence.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-foreground-muted">Timeline will appear as agents work</p>
              </div>
            )}
            <div className="relative">
              {sortedEvidence.map((ev, i) => (
                <div key={ev.id} className="flex gap-3 pb-4 relative">
                  {i < sortedEvidence.length - 1 && (
                    <div className="absolute left-2 top-4 bottom-0 w-px bg-border" />
                  )}
                  <div className={'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 '
                    + (ev.severity === 'high' || ev.severity === 'critical'
                      ? 'border-destructive bg-destructive/10'
                      : 'border-primary bg-primary/10')}>
                    <div className={'w-1.5 h-1.5 rounded-full '
                      + (ev.severity === 'high' || ev.severity === 'critical'
                        ? 'bg-destructive' : 'bg-primary')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground">{ev.title}</p>
                    <p className="text-[9px] text-foreground-muted">
                      {ev.agentName} &middot; {new Date(ev.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
