// ============================================================
// InvestiGuard AI — Final Audit Report
// Professional full-screen modal with printable layout.
// Displays the complete investigation lifecycle, agent
// contributions, evidence chain, and final decision.
// ============================================================

import { useMemo } from 'react';
import {
  X,
  Shield,
  Clock,
  FileText,
  GitBranch,
  Gauge,
  Download,
  MessageCircle,
  Users,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowDown,
} from 'lucide-react';
import {
  InvestigationCase,
  AgentType,
  AGENT_CONFIG,
} from '../../types';
import { AgentMessage, EvidenceItem } from '../../types';

interface VerdictResult {
  score: number;
  label: string;
  confidence: number;
  recommendation: 'approve' | 'flag' | 'escalate';
}

interface AuditReportProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: InvestigationCase | null;
  verdict: VerdictResult | null;
  messages: AgentMessage[];
  evidence: EvidenceItem[];
  finalStatus: string | null;
}

// ── Agent Contribution Summaries ───────────────────────────

interface AgentSummary {
  agentId: AgentType;
  name: string;
  findings: string[];
  messagesSent: number;
  evidenceCreated: EvidenceItem[];
  riskSignals: string[];
}

function buildAgentSummaries(
  messages: AgentMessage[],
  evidence: EvidenceItem[],
): AgentSummary[] {
  const agentIds = Object.values(AgentType);
  return agentIds.map((agentId) => {
    const agentMessages = messages.filter((m) => m.agentId === agentId);
    const agentEvidence = evidence.filter((e) => e.agentId === agentId);

    const findings = agentMessages
      .filter(
        (m) =>
          m.messageType === 'analysis' ||
          m.messageType === 'finding' ||
          m.messageType === 'recommendation' ||
          m.messageType === 'decision',
      )
      .map((m) => m.content.substring(0, 180) + (m.content.length > 180 ? '...' : ''));

    const riskSignals = agentMessages
      .filter((m) => m.messageType === 'risk_alert')
      .map((m) => m.content.substring(0, 200));

    return {
      agentId,
      name: AGENT_CONFIG[agentId].name,
      findings: findings.slice(0, 3),
      messagesSent: agentMessages.length,
      evidenceCreated: agentEvidence,
      riskSignals,
    };
  }).filter((a) => a.messagesSent > 0);
}

// ── Evidence Chain Builder ─────────────────────────────────

interface EvidenceChainLink {
  title: string;
  agentName: string;
  severity: string;
  children: EvidenceChainLink[];
}

function buildEvidenceChain(evidence: EvidenceItem[]): EvidenceChainLink[] {
  const roots: EvidenceChainLink[] = [];
  const map = new Map<string, EvidenceChainLink>();

  // Create nodes
  evidence.forEach((ev) => {
    const node: EvidenceChainLink = {
      title: ev.title,
      agentName: ev.agentName,
      severity: ev.severity,
      children: [],
    };
    map.set(ev.id, node);
  });

  // Link dependencies
  evidence.forEach((ev) => {
    const node = map.get(ev.id);
    if (!node) return;
    if (ev.dependsOn && ev.dependsOn.length > 0) {
      ev.dependsOn.forEach((depId) => {
        const parent = map.get(depId);
        if (parent) {
          parent.children.push(node!);
        }
      });
    } else {
      roots.push(node);
    }
  });

  return roots.length > 0 ? roots : evidence.map((ev) => ({
    title: ev.title,
    agentName: ev.agentName,
    severity: ev.severity,
    children: [],
  }));
}

// ── Timeline Builder ───────────────────────────────────────

interface TimelineEntry {
  title: string;
  timestamp: string;
  agentName: string;
  type: string;
}

function buildTimeline(
  caseData: InvestigationCase | null,
  messages: AgentMessage[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  if (caseData?.createdAt) {
    entries.push({
      title: 'Case Created',
      timestamp: caseData.createdAt,
      agentName: 'System',
      type: 'case_opened',
    });
  }

  const messageTypes: Record<string, string> = {
    task_handoff: 'Agent Handoff',
    analysis: 'Analysis Done',
    evidence: 'Evidence Submitted',
    risk_alert: 'Risk Flagged',
    recommendation: 'Recommendation',
    decision: 'Decision Reached',
    human_review_request: 'Human Review Requested',
  };

  messages.forEach((m) => {
    const label = messageTypes[m.messageType] || m.messageType;
    entries.push({
      title: `${m.agentName}: ${label}`,
      timestamp: m.createdAt,
      agentName: m.agentName,
      type: m.messageType,
    });
  });

  return entries;
}

// ── Download / Print Handler ───────────────────────────────

function handleDownload() {
  window.print();
}

// ── Main Component ─────────────────────────────────────────

export function AuditReport({
  isOpen,
  onClose,
  caseData,
  verdict,
  messages,
  evidence,
  finalStatus,
}: AuditReportProps) {
  const agentSummaries = useMemo(
    () => buildAgentSummaries(messages, evidence),
    [messages, evidence],
  );

  const evidenceChain = useMemo(
    () => buildEvidenceChain(evidence),
    [evidence],
  );

  const timeline = useMemo(
    () => buildTimeline(caseData, messages),
    [caseData, messages],
  );

  const handoffs = messages.filter(
    (m) => m.messageType === 'handoff' || m.messageType === 'task_handoff',
  ).length;
  const activeAgents = new Set(messages.map((m) => m.agentId)).size;

  if (!isOpen || !caseData) return null;

  const tx = caseData.transaction;
  const totalMessages = messages.length;
  const criticalEvidence = evidence.filter(
    (e) => e.severity === 'high' || e.severity === 'critical',
  ).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto
      bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[900px] my-8">

        {/* Close button — hidden during print */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full
            bg-background-card border border-border flex items-center justify-center
            text-foreground-muted hover:text-foreground hover:border-primary/50
            transition-all duration-200 cursor-pointer print:hidden shadow-lg"
        >
          <X size={14} />
        </button>

        {/* ── Report Content ─────────────────────────────────── */}
        <div
          id="audit-report"
          className="bg-background rounded-2xl border border-border/60 shadow-2xl overflow-hidden
            print:border-none print:shadow-none print:rounded-none"
        >

          {/* ── HEADER ── */}
          <div className="relative bg-gradient-to-r from-primary/15 via-background-alt to-accent/10
            border-b border-border/60 px-8 py-8 print:px-6 print:py-6">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30
                  flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(0,150,255,0.15)]">
                  <Shield size={22} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-heading text-xl font-bold text-foreground tracking-tight">
                    Investigation Audit Report
                  </h1>
                  <p className="text-[11px] text-foreground-muted mt-0.5">
                    InvestiGuard AI &middot; Multi-Agent Collaboration Analysis
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-[10px] text-foreground-muted">Report Generated</p>
                <p className="text-xs text-foreground font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-8 print:px-6 print:py-4 print:space-y-6">

            {/* ── SECTION 1: INVESTIGATION OVERVIEW ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Search size={12} className="text-primary" />
                </div>
                <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
                  Investigation Overview
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Case ID', value: caseData.id },
                  { label: 'Customer', value: tx.senderName },
                  { label: 'Transaction Amount', value: `$${tx.amount.toLocaleString()} ${tx.currency}` },
                  { label: 'Transaction Type', value: tx.transactionType.toUpperCase() },
                  { label: 'Jurisdiction', value: tx.region },
                  { label: 'Risk Score', value: verdict ? `${verdict.score}/100` : 'In Progress' },
                  { label: 'Confidence', value: verdict ? `${verdict.confidence}%` : 'In Progress' },
                  { label: 'Case Status', value: finalStatus || caseData.status.replace('_', ' ') },
                  { label: 'Created', value: new Date(caseData.createdAt).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label}
                    className="bg-background-alt/80 border border-border/40 rounded-lg p-3">
                    <p className="text-[8px] text-foreground-muted font-medium uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 2: INVESTIGATION TIMELINE ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <Clock size={12} className="text-accent" />
                </div>
                <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
                  Investigation Timeline
                </h2>
              </div>

              <div className="bg-background-alt/50 border border-border/40 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { title: 'Case Created', subtitle: new Date(caseData.createdAt).toLocaleTimeString(),
                      icon: '📋', color: 'text-primary' },
                    { title: 'Intake Analysis', subtitle: timeline.find(t => t.type === 'analysis')?.timestamp
                      ? new Date(timeline.find(t => t.type === 'analysis')!.timestamp).toLocaleTimeString() : '...',
                      icon: '🔍', color: 'text-secondary' },
                    { title: 'Transaction Analysis', subtitle: timeline.filter(t => t.type === 'analysis').length > 1
                      ? new Date(timeline.filter(t => t.type === 'analysis')[1]?.timestamp || '').toLocaleTimeString() : '...',
                      icon: '📊', color: 'text-agent-tx' },
                    { title: 'Behavior Review', subtitle: timeline.find(t => t.type === 'risk_alert')?.timestamp
                      ? new Date(timeline.find(t => t.type === 'risk_alert')!.timestamp).toLocaleTimeString() : '...',
                      icon: '👤', color: 'text-agent-behavior' },
                    { title: 'Risk Assessment', subtitle: timeline.find(t => t.type === 'recommendation')?.timestamp
                      ? new Date(timeline.find(t => t.type === 'recommendation')!.timestamp).toLocaleTimeString() : '...',
                      icon: '⚠️', color: 'text-agent-risk' },
                    { title: 'Lead Recommendation', subtitle: timeline.find(t => t.type === 'decision')?.timestamp
                      ? new Date(timeline.find(t => t.type === 'decision')!.timestamp).toLocaleTimeString() : '...',
                      icon: '🎯', color: 'text-primary' },
                    { title: 'Human Review', subtitle: finalStatus ? 'Completed' : 'Pending',
                      icon: '👁️', color: 'text-warning' },
                  ].map((step) => (
                    <div key={step.title}
                      className="bg-background-card/50 border border-border/30 rounded-lg p-2.5 text-center">
                      <span className="text-lg">{step.icon}</span>
                      <p className={`text-[9px] font-semibold ${step.color} mt-0.5`}>{step.title}</p>
                      <p className="text-[7px] text-foreground-muted/70 mt-0.5">{step.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SECTION 3: AGENT CONTRIBUTIONS ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-warning/15 border border-warning/30 flex items-center justify-center">
                  <Users size={12} className="text-warning" />
                </div>
                <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
                  Agent Contributions
                </h2>
              </div>

              <div className="space-y-3">
                {agentSummaries.map((agent) => (
                  <div key={agent.agentId}
                    className="bg-background-alt/60 border border-border/40 rounded-xl overflow-hidden">
                    {/* Agent header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30
                      bg-gradient-to-r from-background-alt to-background-alt/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-black"
                          style={{ backgroundColor: AGENT_CONFIG[agent.agentId].color.replace('var(', '').replace(')', '') }}>
                          {agent.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{agent.name}</p>
                          <p className="text-[8px] text-foreground-muted">{AGENT_CONFIG[agent.agentId].role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <MessageCircle size={10} className="text-primary" />
                          {agent.messagesSent} msgs
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={10} className="text-accent" />
                          {agent.evidenceCreated.length} evidence
                        </span>
                      </div>
                    </div>

                    {/* Key findings */}
                    {agent.findings.length > 0 && (
                      <div className="px-4 py-2.5 border-b border-border/20">
                        <p className="text-[8px] font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                          Key Findings
                        </p>
                        <ul className="space-y-1">
                          {agent.findings.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[9px] text-foreground/60 mt-0.5 shrink-0">&bull;</span>
                              <p className="text-[9px] text-foreground/80 leading-relaxed">{f}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk signals */}
                    {agent.riskSignals.length > 0 && (
                      <div className="px-4 py-2 bg-destructive/5">
                        <p className="text-[8px] font-semibold text-destructive uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertTriangle size={8} /> Risk Signals
                        </p>
                        {agent.riskSignals.map((rs, i) => (
                          <p key={i} className="text-[9px] text-destructive/80 leading-relaxed mb-1">
                            {rs}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 4: EVIDENCE CHAIN ── */}
            {evidence.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                    <GitBranch size={12} className="text-secondary" />
                  </div>
                  <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
                    Evidence Chain
                  </h2>
                </div>

                <div className="bg-background-alt/50 border border-border/40 rounded-xl p-5">
                  <div className="flex flex-col items-center gap-2">
                    {evidenceChain.length > 0 ? (
                      evidenceChain.map((root, ri) => (
                        <div key={ri} className="w-full">
                          <EvidenceNode node={root} depth={0} />
                        </div>
                      ))
                    ) : (
                      evidence.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-2 text-[10px] text-foreground/70">
                          <div className="w-2 h-2 rounded-full bg-primary/50" />
                          <span className="font-medium">{ev.title}</span>
                          <span className="text-foreground-muted">by {ev.agentName}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Legend */}
                  {evidenceChain.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-4 text-[8px] text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-0.5 rounded bg-primary/50" /> Dependency Flow
                      </span>
                      <span className="flex items-center gap-1">
                        <ArrowDown size={8} className="text-primary/50" /> Builds Upon
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── SECTION 5: FINAL DECISION ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg
                  bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30
                  flex items-center justify-center">
                  <Gauge size={12} className="text-primary" />
                </div>
                <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
                  Final Decision
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recommendation */}
                <div className={`rounded-xl p-5 border
                  ${verdict && verdict.score >= 70
                    ? 'bg-destructive/10 border-destructive/30'
                    : verdict && verdict.score >= 40
                      ? 'bg-warning/10 border-warning/30'
                      : 'bg-success/10 border-success/30'}`}>
                  <p className="text-[9px] text-foreground-muted uppercase tracking-wider mb-2 font-medium">
                    Recommendation
                  </p>
                  <p className={`text-lg font-heading font-bold
                    ${verdict && verdict.score >= 70 ? 'text-destructive'
                      : verdict && verdict.score >= 40 ? 'text-warning'
                        : 'text-success'}`}>
                    {verdict?.label || 'In Progress'}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-foreground-muted">
                    <span>Risk Score: <span className="font-semibold text-foreground">{verdict?.score ?? '—'}/100</span></span>
                    <span>Confidence: <span className="font-semibold text-foreground">{verdict?.confidence ?? '—'}%</span></span>
                  </div>
                </div>

                {/* Human Decision */}
                <div className="bg-background-alt/80 border border-border/40 rounded-xl p-5">
                  <p className="text-[9px] text-foreground-muted uppercase tracking-wider mb-2 font-medium">
                    Human Reviewer Decision
                  </p>
                  <div className="flex items-center gap-2">
                    {finalStatus ? (
                      <>
                        <CheckCircle size={16} className={
                          finalStatus.includes('Approved') ? 'text-success' : 'text-destructive'
                        } />
                        <p className={`text-sm font-heading font-bold
                          ${finalStatus.includes('Approved') ? 'text-success' : 'text-destructive'}`}>
                          {finalStatus.includes('Approved') ? 'Approved' : 'Escalated'}
                        </p>
                      </>
                    ) : (
                      <>
                        <Clock size={16} className="text-warning" />
                        <p className="text-sm font-heading font-bold text-warning">Awaiting Review</p>
                      </>
                    )}
                  </div>
                  {finalStatus && (
                    <p className="mt-1.5 text-[9px] text-foreground-muted">{finalStatus}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ── SECTION 6: COLLABORATION SUMMARY ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <TrendingUp size={12} className="text-primary" />
                </div>
                <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
                  Collaboration Summary
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: MessageCircle, label: 'Messages Exchanged', value: totalMessages, color: 'text-primary',
                    bg: 'bg-primary/10', border: 'border-primary/20' },
                  { icon: GitBranch, label: 'Agent Handoffs', value: handoffs, color: 'text-accent',
                    bg: 'bg-accent/10', border: 'border-accent/20' },
                  { icon: FileText, label: 'Evidence Shared', value: evidence.length, color: 'text-secondary',
                    bg: 'bg-secondary/10', border: 'border-secondary/20' },
                  { icon: Users, label: 'Agents Involved', value: activeAgents, color: 'text-warning',
                    bg: 'bg-warning/10', border: 'border-warning/20' },
                ].map((stat) => (
                  <div key={stat.label}
                    className={`${stat.bg} ${stat.border} border rounded-xl p-4 text-center
                      group hover:scale-[1.02] transition-transform duration-200`}>
                    <div className={`${stat.color} mb-2`}>
                      <stat.icon size={20} className="mx-auto" strokeWidth={1.5} />
                    </div>
                    <p className={`text-2xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[9px] text-foreground-muted mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 bg-background-alt/50 border border-border/30 rounded-lg p-3">
                <p className="text-[9px] text-foreground-muted text-center leading-relaxed">
                  <span className="font-semibold text-primary">{activeAgents} specialized AI agents</span> collaborated
                  through the{' '}
                  <span className="font-semibold text-primary">Band</span> messaging layer,
                  exchanging <span className="font-semibold text-foreground">{totalMessages} messages</span> across{' '}
                  <span className="font-semibold text-foreground">{handoffs} handoffs</span> to generate{' '}
                  <span className="font-semibold text-foreground">{evidence.length} evidence items</span>
                  {criticalEvidence > 0 && (
                    <span> with <span className="font-semibold text-destructive">{criticalEvidence} critical flags</span></span>
                  )}.
                </p>
              </div>
            </section>

          </div>

          {/* ── FOOTER ── */}
          <div className="px-8 py-4 border-t border-border/40 bg-background-alt/50
            flex items-center justify-between print:hidden">
            <p className="text-[8px] text-foreground-muted">
              InvestiGuard AI &middot; Automated Multi-Agent Investigation System
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-primary text-on-primary
                px-4 py-2 rounded-lg text-[10px] font-semibold
                hover:brightness-110 active:brightness-90
                transition-all duration-200 cursor-pointer shadow-lg shadow-primary/20"
            >
              <Download size={12} />
              Download Report
            </button>
          </div>

          {/* Print-only footer */}
          <div className="hidden print:block px-6 py-3 text-[7px] text-foreground-muted text-center border-t border-border/30">
            InvestiGuard AI — Multi-Agent Investigation Report &middot; Generated {new Date().toISOString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Evidence Chain Node (Recursive) ────────────────────────

function EvidenceNode({
  node,
  depth,
}: {
  node: EvidenceChainLink;
  depth: number;
}) {
  const hasChildren = node.children.length > 0;
  const severityColor =
    node.severity === 'high' || node.severity === 'critical'
      ? 'border-destructive/40 text-destructive'
      : node.severity === 'medium'
        ? 'border-warning/40 text-warning'
        : 'border-primary/30 text-primary';

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div
        className={`bg-background-card border rounded-lg px-4 py-2.5 text-center
          min-w-[180px] max-w-[300px] shadow-sm ${severityColor.replace('text-', 'border-').replace('destructive', 'destructive/40').replace('warning', 'warning/40').replace('primary', 'primary/30')}`}
      >
        <p className="text-[10px] font-semibold text-foreground">{node.title}</p>
        <p className="text-[8px] text-foreground-muted mt-0.5">{node.agentName}</p>
      </div>

      {/* Arrow to children */}
      {hasChildren && (
        <div className="flex flex-col items-center py-1">
          <ArrowDown size={12} className="text-primary/50" />
          <div className="flex items-center gap-1">
            <div className="w-px h-3 bg-primary/30" />
          </div>
        </div>
      )}

      {/* Children */}
      {hasChildren && (
        <div className="flex flex-wrap justify-center gap-3">
          {node.children.map((child, i) => (
            <EvidenceNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
