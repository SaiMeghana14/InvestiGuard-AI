// ============================================================
// InvestiGuard AI — Demo Data (3 Scenarios)
// ============================================================

import { DemoScenario, InvestigationCase, Transaction } from '../types';
import { AgentType } from '../types';
// ── Transactions ──────────────────────────────────────────

const transactions: Record<DemoScenario, Transaction> = {
  structuring: {
    id: 'tx-001',
    amount: 48500,
    currency: 'USD',
    senderName: 'Marcus Chen',
    senderAccount: 'CHK-***4291',
    recipientName: 'Offshore Holdings Inc.',
    recipientAccount: 'INT-***7723',
    timestamp: '2026-06-15T14:23:00Z',
    transactionType: 'wire',
    region: 'Cayman Islands',
    notes: 'Multiple deposits of $9,500 made over 5 consecutive days. Total $47,500.',
  },
  legitimate: {
    id: 'tx-002',
    amount: 12500,
    currency: 'USD',
    senderName: 'Sarah Williams',
    senderAccount: 'CHK-***8156',
    recipientName: 'HomeFirst Realty Escrow',
    recipientAccount: 'ESC-***4401',
    timestamp: '2026-06-14T10:15:00Z',
    transactionType: 'ach',
    region: 'United States',
    notes: 'Earnest money deposit for home purchase. Client has 15-year account history.',
  },
  borderline: {
    id: 'tx-003',
    amount: 320000,
    currency: 'USD',
    senderName: 'Global Trading LLC',
    senderAccount: 'BUS-***3390',
    recipientName: 'Premium Auto Exports Ltd.',
    recipientAccount: 'INT-***9912',
    timestamp: '2026-06-16T09:45:00Z',
    transactionType: 'wire',
    region: 'United Arab Emirates',
    notes: 'First-time transaction between these parties. Company registered 3 months ago.',
  },
};

// ── Cases ──────────────────────────────────────────────────

const cases: Record<DemoScenario, InvestigationCase> = {
  structuring: {
    id: 'case-structuring',
    title: 'Potential Structuring — Marcus Chen',
    description: 'Multiple cash deposits just below reporting threshold. Possible structuring pattern detected.',
    status: 'in_progress',
    riskScore: null,
    verdict: null,
    confidenceScore: null,
    transactionId: 'tx-001',
    transaction: transactions.structuring,
    createdAt: '2026-06-16T08:00:00Z',
    updatedAt: '2026-06-16T08:00:00Z',
  },
  legitimate: {
    id: 'case-legitimate',
    title: 'High-Value ACH — Sarah Williams',
    description: 'Large ACH transfer flagged for review. Client has established history.',
    status: 'in_progress',
    riskScore: null,
    verdict: null,
    confidenceScore: null,
    transactionId: 'tx-002',
    transaction: transactions.legitimate,
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
  borderline: {
    id: 'case-borderline',
    title: 'Suspicious Wire — Global Trading LLC',
    description: 'High-value wire transfer to high-risk jurisdiction. Newly registered entity.',
    status: 'in_progress',
    riskScore: null,
    verdict: null,
    confidenceScore: null,
    transactionId: 'tx-003',
    transaction: transactions.borderline,
    createdAt: '2026-06-17T06:00:00Z',
    updatedAt: '2026-06-17T06:00:00Z',
  },
};

// ── ScriptedMessage definition (keeping here for backward compat) ──

export interface ScriptedMessage {
  agentId: AgentType;
  content: string;
  messageType: 'thought' | 'finding' | 'handoff' | 'question' | 'decision' | 'analysis' | 'evidence' | 'task_handoff' | 'recommendation' | 'risk_alert' | 'human_review_request';
  delayMs: number;
  references?: string[];
  targetAgent?: AgentType;
  evidenceDependsOn?: string[];
}


function buildScriptForStructuring(): ScriptedMessage[] {
  const msgs: ScriptedMessage[] = [];
  let idx = 0;
  const add = (msg: ScriptedMessage) => { msgs.push(msg); idx++; };

  // 1. Lead opens the case
  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Initiating investigation case STR-2026-001. Transaction: $48,500 wire to Cayman Islands via Offshore Holdings Inc. This exceeds 10x normal activity threshold. Flagging for multi-agent analysis. Delegating to Intake Analyst for initial parse.',
    messageType: 'task_handoff',
    targetAgent: AgentType.INTAKE_ANALYST,
    delayMs: 600,
  });

  // 2. Intake parses and flags
  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Received task from Lead. Parsing transaction STR-2026-001... **Key findings:**\n- Wire transfer of $48,500\n- Destination: Cayman Islands (high-risk jurisdiction)\n- Amount is $1,500 below $50k CTR reporting threshold\n- Sender: Marcus Chen, account open 8 months\n- **5 sequential deposits of ~$9,500** over 5 days\n\nThis pattern matches known structuring behavior. Flagging for Transaction Analyst.',
    messageType: 'analysis',
    delayMs: 1500,
  });

  // 3. Intake submits evidence
  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Submitting evidence of structuring pattern for the board.',
    messageType: 'evidence',
    delayMs: 400,
  });

  // 4. Intake hands off to TX Analyst (task_handoff style)
  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Task handoff: Transaction Analyst, please analyze the deposit pattern across branches and states. Intake found 5 deposits of ~$9,500 in CA, NV, AZ — worth investigating further.',
    messageType: 'task_handoff',
    targetAgent: AgentType.TRANSACTION_ANALYST,
    references: [msgs[1]?.id || ''].filter(Boolean),
    delayMs: 600,
  });

  // 5. TX Analyst analyzes
  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Received handoff from Intake Analyst. Analyzing deposit pattern... Confirming **5 deposits of $9,498-$9,502** across 3 states (CA, NV, AZ). Each deposit 24-48h apart. **Round-trip airfare estimated at $1,200** — suspicious for personal banking. This is a textbook structuring pattern to avoid CTR (Currency Transaction Report) filing requirements.\n\nReferencing Intake Analyst evidence: deposit amounts, timing, and geographic dispersion all consistent with deliberate structuring.',
    messageType: 'analysis',
    references: [],
    delayMs: 2000,
  });

  // 6. TX Analyst deeper analysis
  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Deepening analysis: Cross-referenced deposit locations with known high-risk corridors. All 3 branches are within 15mi of major transit hubs. Sender likely used air travel between deposits. Estimated travel cost ~$1,200 for someone depositing $47,500 — economical only if the goal is **avoiding detection**, not convenience.',
    messageType: 'analysis',
    references: [],
    delayMs: 1500,
  });

  // 7. TX Analyst submits evidence about multi-state pattern
  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Submitting multi-state structuring pattern evidence with dependency on Intake findings.',
    messageType: 'evidence',
    evidenceDependsOn: ['ev-case-structuring-1'],
    delayMs: 300,
  });

  // 8. TX Analyst handoff to Behavior Analyst
  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Task handoff to Behavior Analyst: Please review Marcus Chen profile. Transaction pattern confirmed as structuring. Need customer behavior context to complete risk profile. Transaction Analyst has submitted multi-state pattern evidence for your reference.',
    messageType: 'task_handoff',
    targetAgent: AgentType.BEHAVIOR_ANALYST,
    references: [],
    delayMs: 600,
  });

  // 9. Behavior Analyst
  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Received handoff from Transaction Analyst. Reviewing Marcus Chen profile...\n- Account age: **8 months** (relatively new)\n- Occupation: Consultant (self-reported, unverified)\n- Avg monthly deposits: **$3,200**\n- **This transaction: $48,500 (15x normal)**\n- No prior international wires\n- No prior cash deposits at branches\n\n**Conclusion:** Severe behavioral deviation. This transaction is completely outside the customer established pattern. Referencing TX Analyst finding on structuring — the multi-state deposits combined with this profile strongly suggest the account is being used for layering.',
    messageType: 'analysis',
    delayMs: 2200,
  });

  // 10. Behavior flags risk
  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'RISK ALERT: Behavioral anomaly detected — 15x normal activity, newly active account, high-risk jurisdiction destination. Combining with Transaction Analyst structuring pattern: overall profile suggests **structured layering scheme**.',
    messageType: 'risk_alert',
    references: [],
    delayMs: 1000,
  });

  // 11. Behavior submits evidence
  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Submitting behavioral deviation evidence, depends on transaction pattern evidence.',
    messageType: 'evidence',
    evidenceDependsOn: ['ev-case-structuring-2'],
    delayMs: 300,
  });

  // 12. Handoff to Risk Assessor
  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Task handoff to Risk Assessor: Analysis complete. Transaction pattern: STRUCTURING (high). Customer behavior: DEVIATION (high). Both evidence items submitted to board. Please aggregate and score.',
    messageType: 'task_handoff',
    targetAgent: AgentType.RISK_ASSESSOR,
    references: [],
    delayMs: 600,
  });

  // 13. Risk Assessor
  add({
    agentId: AgentType.RISK_ASSESSOR,
    content: 'Received comprehensive analysis from Transaction Analyst and Behavior Analyst. Aggregating findings...\n\n**Risk Factor Assessment:**\n- Structuring pattern (TX Analyst): **HIGH** - 9/10\n- Multi-state deposits (TX Analyst): **HIGH** - 8/10\n- New account, short history (Behavior): **MEDIUM** - 5/10\n- 15x normal activity (Behavior): **HIGH** - 8/10\n- High-risk jurisdiction destination: **HIGH** - 8/10\n- Amount below $50k threshold (Intake): **SUSPICIOUS** - 7/10\n\n**Recommendation:** ESCALATE to Human Review\n**Risk Score: 85/100** - SEVERITY: HIGH',
    messageType: 'recommendation',
    references: [],
    delayMs: 2500,
  });

  // 14. Lead synthesizes
  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'All agents completed. Synthesizing final report...\n\n**Case STR-2026-001 — Final Verdict**\n\nAgents involved:\n1. Intake Analyst — parsed transaction, flagged structuring\n2. Transaction Analyst — confirmed multi-state structuring pattern\n3. Behavior Analyst — flagged 15x behavioral deviation\n4. Risk Assessor — scored **85/100** HIGH RISK\n\n**Verdict: ESCALATE for Human Review**\n\nConfidence: 85%\nBasis: Structuring + behavioral deviation + high-risk jurisdiction',
    messageType: 'decision',
    delayMs: 1500,
  });

  // 15. Human review request
  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Human review required for case STR-2026-001. 4 agents have completed analysis with consensus: ESCALATE. Risk score 85/100. Awaiting human decision.',
    messageType: 'human_review_request',
    delayMs: 800,
  });

  return msgs;
}

function buildScriptForLegitimate(): ScriptedMessage[] {
  const msgs: ScriptedMessage[] = [];
  const add = (msg: ScriptedMessage) => msgs.push(msg);

  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Initiating case LEG-2026-002: Sarah Williams — $12,500 ACH to HomeFirst Realty Escrow. Appears to be real estate related but exceeds $10k threshold. Delegating to Intake Analyst.',
    messageType: 'task_handoff',
    targetAgent: AgentType.INTAKE_ANALYST,
    delayMs: 500,
  });

  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Parsing transaction LEG-2026-002...\n- Type: ACH transfer\n- Amount: **$12,500**\n- Recipient: HomeFirst Realty Escrow (licensed since 2012)\n- Purpose Description: Earnest money for home purchase\n- Domestic transfer (US to US)\n\nInitial assessment: Low risk flags. Amount is consistent with earnest money deposits (1-3% of home value). Recipient is a known, licensed entity.',
    messageType: 'analysis',
    delayMs: 1200,
  });

  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Passing to Transaction Analyst for pattern verification. Preliminary assessment: routine real estate transaction.',
    messageType: 'task_handoff',
    targetAgent: AgentType.TRANSACTION_ANALYST,
    delayMs: 500,
  });

  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Analyzing transaction pattern: Single ACH to escrow company. Escrow company HomeFirst Realty licensed in NY since 2012 — clean regulatory record. Amount $12,500 is within expected range for earnest money deposit on median home. No pattern anomalies. Transaction fits expected profile.',
    messageType: 'analysis',
    delayMs: 1800,
  });

  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'No anomalies detected in transaction pattern. Handing to Behavior Analyst for customer profile check.',
    messageType: 'task_handoff',
    targetAgent: AgentType.BEHAVIOR_ANALYST,
    delayMs: 500,
  });

  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Customer profile review for Sarah Williams:\n- **Account age: 15 years** (well-established)\n- Avg monthly balance: $45,000-$80,000\n- Consistent direct deposit from employer (verified employer)\n- Prior real estate transaction in 2019 — clean\n- No international activity\n\n**Risk Level: LOW** — Customer profile is consistent with legitimate home purchase. Previous real estate transaction provides behavioral precedent.',
    messageType: 'analysis',
    delayMs: 2000,
  });

  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'No behavioral concerns. Handing to Risk Assessor for final scoring.',
    messageType: 'task_handoff',
    targetAgent: AgentType.RISK_ASSESSOR,
    delayMs: 400,
  });

  add({
    agentId: AgentType.RISK_ASSESSOR,
    content: 'Aggregating findings from all agents...\n\n**Risk Assessment:**\n- Known licensed recipient: **LOW**\n- 15-year account history: **LOW**\n- Amount consistent with purpose: **LOW**\n- Domestic transfer only: **LOW**\n- Established behavioral profile: **LOW**\n\n**Overall Risk Score: 12/100**\n**Recommendation:** APPROVE — No suspicious indicators. Standard real estate transaction.',
    messageType: 'recommendation',
    delayMs: 2000,
  });

  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Case LEG-2026-002 final review. All agents: LOW risk consensus. Risk score: **12/100**. Recommendation: **APPROVE**. No human intervention required. Flagging as auto-approved.',
    messageType: 'decision',
    delayMs: 1000,
  });

  return msgs;
}

function buildScriptForBorderline(): ScriptedMessage[] {
  const msgs: ScriptedMessage[] = [];
  const add = (msg: ScriptedMessage) => msgs.push(msg);

  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Initiating HIGH-2026-003: Global Trading LLC — $320,000 wire to Premium Auto Exports Ltd. in UAE. High-value, first-time cross-border. This requires full multi-agent investigation. Delegating to Intake Analyst.',
    messageType: 'task_handoff',
    targetAgent: AgentType.INTAKE_ANALYST,
    delayMs: 600,
  });

  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Parsing HIGH-2026-003...\n- Wire transfer: **$320,000**\n- Sender: Global Trading LLC (registered 92 days ago in Delaware)\n- Recipient: Premium Auto Exports Ltd. (Dubai, UAE)\n- Signatory: David Park (no prior banking relationship)\n- Business category: Import/Export (vague)\n\n**Red flags:** (1) Company registered <90 days (2) No prior transactions (3) UAE is high-risk jurisdiction (4) Amount exceeds $300k EDD threshold.\n\nThis warrants enhanced due diligence. Passing to Transaction Analyst.',
    messageType: 'analysis',
    delayMs: 1500,
  });

  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Submitting initial findings to evidence board.',
    messageType: 'evidence',
    delayMs: 300,
  });

  add({
    agentId: AgentType.INTAKE_ANALYST,
    content: 'Full findings for Transaction Analyst: Please verify counterparty and analyze transaction chain. Key concern is the newly registered LLC wiring to UAE entity.',
    messageType: 'task_handoff',
    targetAgent: AgentType.TRANSACTION_ANALYST,
    delayMs: 500,
  });

  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Analyzing transaction chain...\n- Premium Auto Exports Ltd. — registered in Dubai Free Trade Zone\n- $320k is consistent with luxury vehicle export (e.g., 2-3 high-end cars)\n- However: First-time transaction with this counterparty\n- LLC registration address is a **virtual office** — no physical premises\n- Virtual office + free trade zone registration is a known pattern for trade-based money laundering\n\n**Conclusion:** Transaction amount is plausible for auto export, but counterparty verification raises concerns.',
    messageType: 'analysis',
    delayMs: 2000,
  });

  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Submitting counterparty analysis — virtual office pattern flagged.',
    messageType: 'evidence',
    evidenceDependsOn: ['ev-case-borderline-1'],
    delayMs: 300,
  });

  add({
    agentId: AgentType.TRANSACTION_ANALYST,
    content: 'Handing to Behavior Analyst for sender profile review. Key concern: newly registered LLC with vague business description wiring to UAE entity. Please verify business operations.',
    messageType: 'task_handoff',
    targetAgent: AgentType.BEHAVIOR_ANALYST,
    delayMs: 500,
  });

  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Investigating Global Trading LLC profile...\n- **Registered: 92 days ago** in Delaware (known for corporate anonymity)\n- Listed address: virtual office in Wilmington, DE\n- Claims operations in NY but **no NY business license on file**\n- Single signatory: David Park — SSN trace shows NY address but no prior financial history\n- **No public web presence** — no website, no LinkedIn, no business listings\n- Business category Import/Export is deliberately vague\n\n**Assessment:** High risk of being a shell company. Trade-based money laundering indicator.',
    messageType: 'analysis',
    delayMs: 2200,
  });

  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'RISK ALERT: Shell company indicators detected — virtual office, no web presence, vague business category, Delaware registration with claimed NY operations. Trade-based ML risk HIGH.',
    messageType: 'risk_alert',
    delayMs: 800,
  });

  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Submitting shell company analysis — referencing counterparty evidence.',
    messageType: 'evidence',
    evidenceDependsOn: ['ev-case-borderline-2'],
    delayMs: 300,
  });

  add({
    agentId: AgentType.BEHAVIOR_ANALYST,
    content: 'Handing to Risk Assessor with findings: shell company indicators, no verifiable operations, high-risk jurisdiction. Recommendation: request EDD documentation before proceeding.',
    messageType: 'task_handoff',
    targetAgent: AgentType.RISK_ASSESSOR,
    delayMs: 500,
  });

  add({
    agentId: AgentType.RISK_ASSESSOR,
    content: 'Aggregating all agent findings...\n\n**Risk Factor Assessment:**\n- Newly registered entity (Intake): **HIGH** - 8/10\n- High-risk jurisdiction UAE (Intake): **HIGH** - 8/10\n- Virtual office / shell indicators (TX Analyst): **HIGH** - 9/10\n- No verifiable operations (Behavior): **HIGH** - 8/10\n- Amount over EDD threshold: **HIGH** - 7/10\n- Vague business description (Behavior): **MEDIUM** - 6/10\n\n**Overall Risk Score: 72/100**\n**Severity: MEDIUM-HIGH**\n**Recommendation:** ESCALATE — Request enhanced due diligence documentation. Possible trade-based money laundering.',
    messageType: 'recommendation',
    delayMs: 2500,
  });

  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Case HIGH-2026-003 final synthesis: 4 agents completed analysis.\n\n**Findings summary:**\n1. Intake: Red flags on newly registered LLC + UAE jurisdiction\n2. TX Analyst: Confirmed virtual office, plausible but suspicious transaction\n3. Behavior: Shell company indicators, no verifiable operations\n4. Risk Assessor: Score **72/100** — MEDIUM-HIGH severity\n\n**Verdict: ESCALATE** for human review. Additional KYC/EDD documentation required before any approval. Confidence: 78%.',
    messageType: 'decision',
    delayMs: 1500,
  });

  add({
    agentId: AgentType.LEAD_INVESTIGATOR,
    content: 'Human review required for case HIGH-2026-003. 4 agents completed with consensus: ESCALATE (72/100 risk). Awaiting human reviewer decision regarding Enhanced Due Diligence documentation request.',
    messageType: 'human_review_request',
    delayMs: 800,
  });

  return msgs;
}

// ── SCRIPTS Map ────────────────────────────────────────────

export const SCRIPTS: Record<DemoScenario, ScriptedMessage[]> = {
  structuring: buildScriptForStructuring(),
  legitimate: buildScriptForLegitimate(),
  borderline: buildScriptForBorderline(),
};

export function getDemoCase(scenario: DemoScenario): InvestigationCase {
  return { ...cases[scenario], transaction: { ...transactions[scenario] } };
}

export function getAllDemoCases(): InvestigationCase[] {
  return (Object.keys(cases) as DemoScenario[]).map((key) => ({
    ...cases[key],
    transaction: { ...transactions[key] },
  }));
}
