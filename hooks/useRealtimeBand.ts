// ============================================================
// InvestiGuard AI — useRealtimeBand Hook
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentMessage, EvidenceItem } from '../types';
import { getAgentRunner, RunnerStatus } from '../lib/agentRunner';

export interface BandState {
  messages: AgentMessage[];
  evidence: EvidenceItem[];
  status: RunnerStatus;
  isRunning: boolean;
  isComplete: boolean;
}

export function useRealtimeBand() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [status, setStatus] = useState<RunnerStatus>({ phase: 'idle', currentAgentIndex: 0, totalMessages: 0 });
  const messagesRef = useRef<AgentMessage[]>([]);
  const evidenceRef = useRef<EvidenceItem[]>([]);

  useEffect(() => {
    const runner = getAgentRunner();

    // Populate from stored messages
    setMessages(runner.getMessages());
    setEvidence(runner.getEvidence());
    setStatus(runner.getStatus());

    const unsubMsg = runner.onMessage((msg) => {
      messagesRef.current = [...messagesRef.current, msg];
      setMessages([...messagesRef.current]);
    });

    const unsubEv = runner.onEvidence((ev) => {
      evidenceRef.current = [...evidenceRef.current, ev];
      setEvidence([...evidenceRef.current]);
    });

    const unsubStatus = runner.onStatus(setStatus);

    return () => {
      unsubMsg();
      unsubEv();
      unsubStatus();
    };
  }, []);

  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    evidenceRef.current = [];
    setMessages([]);
    setEvidence([]);
  }, []);

  return {
    messages,
    evidence,
    status,
    isRunning: status.phase === 'running',
    isComplete: status.phase === 'complete',
    clearMessages,
  } as BandState & { clearMessages: () => void };
}
