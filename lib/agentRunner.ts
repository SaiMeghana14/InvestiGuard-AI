// ============================================================
// InvestiGuard AI — Agent Runner (Simulated Workflow)
// ============================================================
// Runs the 5-agent investigation pipeline as a simulated
// real-time workflow. Each agent publishes messages and
// evidence items with configurable delays.
// ============================================================

import { AgentMessage, EvidenceItem, InvestigationCase, AgentTiming, AgentType } from '../types';
import { AGENT_CONFIG } from '../types';
import { SCRIPTS, ScriptedMessage, DemoScenario } from './demoData';

type MessageCallback = (message: AgentMessage) => void;
type EvidenceCallback = (evidence: EvidenceItem) => void;
type StatusCallback = (status: RunnerStatus) => void;

export interface RunnerStatus {
  phase: 'idle' | 'running' | 'paused' | 'complete';
  currentAgentIndex: number;
  totalMessages: number;
}

export interface AgentRunner {
  start: (caseData: InvestigationCase) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  onMessage: (cb: MessageCallback) => () => void;
  onEvidence: (cb: EvidenceCallback) => () => void;
  onStatus: (cb: StatusCallback) => () => void;
  getStatus: () => RunnerStatus;
  getMessages: () => AgentMessage[];
  getEvidence: () => EvidenceItem[];
  getAgentTimings: () => AgentTiming[];
}

function generateEvidenceFromMessage(
  msg: ScriptedMessage,
  caseId: string,
  index: number,
): EvidenceItem | null {
  const generateTypes = ['finding', 'analysis', 'evidence', 'risk_alert', 'recommendation'];
  if (!generateTypes.includes(msg.messageType)) return null;

  const content = msg.content;
  let severity: EvidenceItem['severity'] = 'low';
  let category: EvidenceItem['category'] = 'pattern';
  let title = 'Analysis Note';

  if (content.includes('HIGH') || content.includes('RISK') || content.includes('SUSPICIOUS') || content.includes('shell') || content.includes('\u26a0')) {
    severity = 'high';
  } else if (content.includes('MEDIUM') || content.includes('anomal') || content.includes('Flag')) {
    severity = 'medium';
  }

  if (content.includes('structuring') || content.includes('pattern') || content.includes('Pattern')) {
    category = 'pattern';
    title = 'Transaction Pattern Analysis';
  } else if (content.includes('profile') || content.includes('behavior') || content.includes('deviation')) {
    category = 'behavior';
    title = 'Customer Behavior Profile';
  } else if (content.includes('Risk') || content.includes('score') || content.includes('Score')) {
    category = 'reference';
    title = 'Risk Assessment';
  } else if (content.includes('wire') || content.includes('transfer') || content.includes('deposit')) {
    category = 'anomaly';
    title = 'Transaction Anomaly';
  } else if (content.includes('address') || content.includes('registered') || content.includes('jurisdiction') || content.includes('virtual office')) {
    category = 'network';
    title = 'Network Analysis';
  } else if (content.includes('evidence') || content.includes('board') || content.includes('submitting')) {
    category = 'document';
    title = 'Evidence Submission';
  }

  return {
    id: `ev-${caseId}-${index}`,
    caseId,
    agentId: msg.agentId,
    agentName: AGENT_CONFIG[msg.agentId].name,
    title,
    description: content.substring(0, 200),
    severity,
    category,
    dependsOn: msg.evidenceDependsOn?.length ? msg.evidenceDependsOn : undefined,
    sourceMessageId: `msg-${caseId}-${index}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

export function createAgentRunner(): AgentRunner {
  let timeoutIds: ReturnType<typeof setTimeout>[] = [];
  let isPaused = false;
  let isRunning = false;
  let currentIndex = 0;
  let totalMessages = 0;
  let script: ScriptedMessage[] = [];
  let currentCaseId = '';
  const messagesStore: AgentMessage[] = [];
  const evidenceStore: EvidenceItem[] = [];
  const agentTimings: Map<AgentType, { first: number | null; last: number | null; count: number }> = new Map();

  const messageListeners = new Set<MessageCallback>();
  const evidenceListeners = new Set<EvidenceCallback>();
  const statusListeners = new Set<StatusCallback>();

  function notifyStatus(phase: RunnerStatus['phase']) {
    const status: RunnerStatus = { phase, currentAgentIndex: currentIndex, totalMessages };
    statusListeners.forEach((cb) => cb(status));
  }

  function notifyMessage(msg: AgentMessage) {
    messagesStore.push(msg);
    messageListeners.forEach((cb) => cb(msg));
  }

  function notifyEvidence(ev: EvidenceItem) {
    evidenceStore.push(ev);
    evidenceListeners.forEach((cb) => cb(ev));
  }

  function scheduleNext() {
    if (currentIndex >= script.length) {
      isRunning = false;
      notifyStatus('complete');
      return;
    }

    if (isPaused) {
      notifyStatus('paused');
      return;
    }

    const step = script[currentIndex];
    const timeoutId = setTimeout(() => {
      if (isPaused) return;

      // Track agent timing
      const now = Date.now();
      const timing = agentTimings.get(step.agentId) || { first: null, last: null, count: 0 };
      if (timing.first === null) timing.first = now;
      timing.last = now;
      timing.count++;
      agentTimings.set(step.agentId, timing);

      const msgId = `msg-${currentCaseId}-${currentIndex}-${now}`;
      const msg: AgentMessage = {
        id: msgId,
        caseId: currentCaseId,
        agentId: step.agentId,
        agentName: AGENT_CONFIG[step.agentId].name,
        content: step.content,
        messageType: step.messageType,
        references: step.references?.length ? step.references : undefined,
        targetAgent: step.targetAgent || undefined,
        createdAt: new Date().toISOString(),
      };

      notifyMessage(msg);
      totalMessages++;

      const ev = generateEvidenceFromMessage(step, currentCaseId, currentIndex);
      if (ev) {
        ev.sourceMessageId = msgId;
        notifyEvidence(ev);
      }

      currentIndex++;
      scheduleNext();
    }, step.delayMs);

    timeoutIds.push(timeoutId);
  }

  return {
    start(caseData: InvestigationCase) {
      this.reset();

      const scenario = caseData.id.replace('case-', '') as DemoScenario;
      script = SCRIPTS[scenario] || [];
      currentCaseId = caseData.id;
      currentIndex = 0;
      totalMessages = 0;
      isPaused = false;
      isRunning = true;

      notifyStatus('running');
      scheduleNext();
    },

    pause() {
      isPaused = true;
      notifyStatus('paused');
    },

    resume() {
      if (!isPaused) return;
      isPaused = false;
      isRunning = true;
      notifyStatus('running');
      scheduleNext();
    },

    reset() {
      timeoutIds.forEach(clearTimeout);
      timeoutIds = [];
      isPaused = false;
      isRunning = false;
      currentIndex = 0;
      totalMessages = 0;
      script = [];
      currentCaseId = '';
      messagesStore.length = 0;
      evidenceStore.length = 0;
      agentTimings.clear();
      notifyStatus('idle');
    },

    onMessage(cb: MessageCallback) {
      messageListeners.add(cb);
      return () => messageListeners.delete(cb);
    },

    onEvidence(cb: EvidenceCallback) {
      evidenceListeners.add(cb);
      return () => evidenceListeners.delete(cb);
    },

    onStatus(cb: StatusCallback) {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },

    getStatus() {
      return {
        phase: isRunning ? 'running' : isPaused ? 'paused' : currentIndex >= script.length ? 'complete' : 'idle',
        currentAgentIndex: currentIndex,
        totalMessages,
      };
    },

    getMessages() {
      return [...messagesStore];
    },

    getEvidence() {
      return [...evidenceStore];
    },

    getAgentTimings(): AgentTiming[] {
      return Array.from(agentTimings.entries()).map(([agentId, t]) => ({
        agentId,
        messagesCount: t.count,
        firstMessageAt: t.first,
        lastMessageAt: t.last,
        duration: t.first && t.last ? t.last - t.first : null,
      }));
    },
  };
}

let _runner: AgentRunner | null = null;

export function getAgentRunner(): AgentRunner {
  if (!_runner) {
    _runner = createAgentRunner();
  }
  return _runner;
}
