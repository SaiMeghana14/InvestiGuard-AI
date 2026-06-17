// ============================================================
// InvestiGuard AI — Investigation Workspace Page
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Shield, Network, Bot, FileText } from 'lucide-react';
import { getDemoCase } from '../lib/demoData';
import { useInvestigation } from '../hooks/useInvestigation';
import { useRealtimeBand } from '../hooks/useRealtimeBand';
import { NetworkGraph } from '../components/investigation/NetworkGraph';
import { ChatPanel } from '../components/investigation/ChatPanel';
import { EvidenceBoard } from '../components/investigation/EvidenceBoard';
import { HumanReviewModal } from '../components/investigation/HumanReviewModal';
import { AgentStatusCenter } from '../components/investigation/AgentStatusCenter';
import { ExecutiveSummary } from '../components/investigation/ExecutiveSummary';
import { BandMetricsCard } from '../components/investigation/BandMetricsCard';
import { AuditReport } from '../components/investigation/AuditReport';

interface VerdictResult {
  score: number; label: string; confidence: number;
  recommendation: 'approve' | 'flag' | 'escalate';
}

export default function InvestigationPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<any>(null);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showAuditReport, setShowAuditReport] = useState(false);

  const { runnerStatus, startInvestigation, pauseInvestigation, resumeInvestigation, resetInvestigation } =
    useInvestigation(caseData);
  const { evidence, messages, isComplete } = useRealtimeBand();

  useEffect(() => {
    if (!caseId) return;
    const scenario = caseId.replace('case-', '') as any;
    const data = getDemoCase(scenario);
    setCaseData(data);
    setVerdict(null);
    setFinalStatus(null);
    setShowReviewModal(false);
  }, [caseId]);

  useEffect(() => {
    if (caseData && runnerStatus.phase === 'idle') {
      startInvestigation();
    }
  }, [caseData]);

  useEffect(() => {
    if (!isComplete || !caseData) return;
    const highEv = evidence.filter((e: any) => e.severity === 'high' || e.severity === 'critical').length;
    let score: number, label: string, recommendation: 'approve' | 'flag' | 'escalate';
    if (caseData.id === 'case-structuring') { score = 85; label = 'High Risk - Escalate'; recommendation = 'escalate'; }
    else if (caseData.id === 'case-legitimate') { score = 12; label = 'Low Risk - Approve'; recommendation = 'approve'; }
    else { score = 72; label = 'Medium-High Risk - Escalate'; recommendation = 'escalate'; }
    const confidence = Math.min(95, 70 + highEv * 8);
    setVerdict({ score, label, confidence, recommendation });
    setTimeout(() => setShowReviewModal(true), 1000);
  }, [isComplete, caseData?.id]);

  const handleDecision = useCallback((decision: 'approve' | 'escalate', notes: string) => {
    setShowReviewModal(false);
    setFinalStatus(decision === 'approve'
      ? 'Transaction Approved - Case Closed'
      : 'Case Escalated - Suspicious Activity Report Filed');
  }, []);

  const handleReset = () => {
    resetInvestigation();
    setVerdict(null);
    setShowReviewModal(false);
    setFinalStatus(null);
    if (caseData) setTimeout(() => startInvestigation(), 100);
  };

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <p className="text-foreground-muted">Loading case...</p>
      </div>
    );
  }

  const tx = caseData.transaction;

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-background-alt/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-foreground-muted hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield size={14} className="text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-xs font-bold text-foreground">{caseData.title}</h1>
              <p className="text-[9px] text-foreground-muted">
                ${tx.amount.toLocaleString()} &middot; {tx.transactionType.toUpperCase()} &middot; {tx.region}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-background-card border border-border rounded-lg px-2 py-1 mr-1">
              <Bot size={10} className="text-primary" />
              <span className="text-[8px] text-foreground-muted">Demo Mode</span>
              <div className="w-3.5 h-2 rounded-full bg-primary/30 relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 w-1.5 h-1 rounded-full bg-primary transition-all" />
              </div>
            </div>

            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="flex items-center gap-1 bg-background-card border border-border px-2 py-1.5 rounded-lg text-[10px] font-semibold text-foreground-muted hover:text-foreground transition-all cursor-pointer"
              title="Toggle Network View"
            >
              <Network size={12} />
            </button>

            {runnerStatus.phase === 'idle' && (
              <button onClick={startInvestigation}
                className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:brightness-110 transition-all cursor-pointer">
                <Play size={12} /> Start
              </button>
            )}
            {runnerStatus.phase === 'running' && (
              <button onClick={pauseInvestigation}
                className="flex items-center gap-1.5 bg-warning/20 text-warning border border-warning/30 px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-warning/30 transition-all cursor-pointer">
                <Pause size={12} /> Pause
              </button>
            )}
            {runnerStatus.phase === 'paused' && (
              <button onClick={resumeInvestigation}
                className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:brightness-110 transition-all cursor-pointer">
                <Play size={12} /> Resume
              </button>
            )}
            {isComplete && (
              <button onClick={() => setShowAuditReport(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-primary hover:brightness-110 hover:shadow-[0_0_12px_rgba(0,150,255,0.2)] transition-all cursor-pointer">
                <FileText size={12} /> Generate Report
              </button>
            )}
            {(runnerStatus.phase === 'complete' || runnerStatus.phase === 'running') && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 bg-background-card border border-border px-3 py-1.5 rounded-lg text-[10px] font-semibold text-foreground-muted hover:text-foreground transition-all cursor-pointer">
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 max-w-full mx-auto w-full min-h-0">
        {/* Left Column: Agent Network + Status Center + Chat */}
        <div className={`flex-1 flex flex-col gap-3 min-w-0 ${showLeftPanel ? '' : 'hidden lg:hidden'}`}>
          {/* Network Graph */}
          <div className="shrink-0">
            <NetworkGraph />
          </div>

          {/* Agent Status Center */}
          <div className="shrink-0">
            <AgentStatusCenter />
          </div>

          {/* Chat Panel */}
          <div className="flex-1 min-h-[250px] lg:min-h-0">
            <ChatPanel />
          </div>
        </div>

        {/* Right Sidebar: Executive Summary + Evidence Board */}
        <div className="lg:w-[380px] flex flex-col gap-3">
          <div className="shrink-0">
            <ExecutiveSummary caseData={caseData} verdict={verdict} />
          </div>
          <div className="shrink-0">
            <BandMetricsCard verdict={verdict} />
          </div>
          <div className="flex-1 min-h-[350px]">
            <EvidenceBoard caseData={caseData} verdict={verdict} />
          </div>
        </div>
      </div>

      {/* Final Status Banner */}
      {finalStatus && (
        <div className="mx-3 mb-3">
          <div className="bg-background-card border border-primary/30 rounded-xl p-4 text-center fade-in">
            <p className="text-sm font-heading font-bold text-foreground">{finalStatus}</p>
            <button onClick={handleReset}
              className="mt-3 flex items-center gap-1.5 mx-auto bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg text-[10px] font-semibold hover:bg-primary/30 transition-all cursor-pointer">
              <RotateCcw size={12} /> Start New Investigation
            </button>
          </div>
        </div>
      )}

      <HumanReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onDecision={handleDecision}
        caseData={caseData}
        verdict={verdict}
      />

      <AuditReport
        isOpen={showAuditReport}
        onClose={() => setShowAuditReport(false)}
        caseData={caseData}
        verdict={verdict}
        messages={messages}
        evidence={evidence}
        finalStatus={finalStatus}
      />
    </div>
  );
}
