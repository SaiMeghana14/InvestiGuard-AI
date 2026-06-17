// ============================================================
// InvestiGuard AI — Shared Types
// ============================================================

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientAccount: string;
  timestamp: string;
  transactionType: 'wire' | 'ach' | 'internal' | 'crypto';
  region: string;
  notes?: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'awaiting_review' | 'resolved' | 'escalated';
  riskScore: number | null;
  verdict: 'approve' | 'flag' | 'escalate' | null;
  confidenceScore: number | null;
  transactionId: string;
  transaction: Transaction;
  createdAt: string;
  updatedAt: string;
  humanReviewNotes?: string;
}

/**
 * Extended message types for richer agent collaboration:
 * - thought: internal reasoning / deliberation
 * - finding: discovery from analysis
 * - handoff: passing task to another agent
 * - question: asking another agent for input
 * - decision: final determination
 * - analysis: deeper analytical breakdown
 * - evidence: submitting a piece of evidence for the board
 * - task_handoff: explicit task delegation with context
 * - recommendation: suggesting a course of action
 * - risk_alert: flagging elevated risk
 * - human_review_request: requesting human intervention
 */
export type MessageType = 'thought' | 'finding' | 'handoff' | 'question' | 'decision' | 'analysis' | 'evidence' | 'task_handoff' | 'recommendation' | 'risk_alert' | 'human_review_request';

export interface AgentMessage {
  id: string;
  caseId: string;
  agentId: AgentType;
  agentName: string;
  content: string;
  messageType: MessageType;
  /** references to previous message IDs this message builds upon */
  references?: string[];
  /** evidence item IDs this message contributed */
  evidenceIds?: string[];
  /** target agent for task_handoff */
  targetAgent?: AgentType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  agentId: AgentType;
  agentName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'pattern' | 'anomaly' | 'behavior' | 'network' | 'document' | 'reference';
  /** references to other evidence IDs this depends on */
  dependsOn?: string[];
  /** the message ID that generated this evidence */
  sourceMessageId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export enum AgentType {
  LEAD_INVESTIGATOR = 'lead_investigator',
  INTAKE_ANALYST = 'intake_analyst',
  TRANSACTION_ANALYST = 'transaction_analyst',
  BEHAVIOR_ANALYST = 'behavior_analyst',
  RISK_ASSESSOR = 'risk_assessor',
}

export interface AgentTiming {
  agentId: AgentType;
  messagesCount: number;
  firstMessageAt: number | null;
  lastMessageAt: number | null;
  duration: number | null; // ms
}

export const AGENT_CONFIG: Record<AgentType, { name: string; shortName: string; color: string; role: string; emoji: string }> = {
  [AgentType.LEAD_INVESTIGATOR]: {
    name: 'Lead Investigator',
    shortName: 'Lead',
    color: 'var(--color-agent-lead)',
    role: 'Orchestrates investigation, delegates tasks, synthesizes findings',
    emoji: '🕵️',
  },
  [AgentType.INTAKE_ANALYST]: {
    name: 'Intake Analyst',
    shortName: 'Intake',
    color: 'var(--color-agent-intake)',
    role: 'Reviews transaction details, flags red flags',
    emoji: '📥',
  },
  [AgentType.TRANSACTION_ANALYST]: {
    name: 'Transaction Analyst',
    shortName: 'TX Analyst',
    color: 'var(--color-agent-tx)',
    role: 'Analyzes transaction patterns, detects anomalies',
    emoji: '📊',
  },
  [AgentType.BEHAVIOR_ANALYST]: {
    name: 'Behavior Analyst',
    shortName: 'Behavior',
    color: 'var(--color-agent-behavior)',
    role: 'Evaluates customer behavior patterns',
    emoji: '👤',
  },
  [AgentType.RISK_ASSESSOR]: {
    name: 'Risk Assessor',
    shortName: 'Risk',
    color: 'var(--color-agent-risk)',
    role: 'Calculates risk scores, recommends verdict',
    emoji: '⚠️',
  },
};

export type DemoScenario = 'structuring' | 'legitimate' | 'borderline';

/** Timeline event for the investigation timeline */
export interface TimelineEvent {
  id: string;
  caseId: string;
  agentId: AgentType;
  agentName: string;
  title: string;
  description: string;
  eventType: 'case_opened' | 'agent_started' | 'analysis_done' | 'handoff' | 'evidence_added' | 'risk_scored' | 'verdict_reached' | 'human_review';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface AgentStatus {
  agentId: AgentType;
  status: 'idle' | 'working' | 'done';
  currentTask: string;
  messagesCount: number;
  duration: number | null;
  startTime: number | null;
}
