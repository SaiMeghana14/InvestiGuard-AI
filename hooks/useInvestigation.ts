// ============================================================
// InvestiGuard AI — useInvestigation Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { InvestigationCase } from '../types';
import { getAgentRunner, RunnerStatus } from '../lib/agentRunner';

export function useInvestigation(caseData: InvestigationCase | null) {
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus>({ phase: 'idle', currentAgentIndex: 0, totalMessages: 0 });

  useEffect(() => {
    if (!caseData) return;

    const runner = getAgentRunner();
    const unsubStatus = runner.onStatus(setRunnerStatus);

    return () => {
      unsubStatus();
    };
  }, [caseData?.id]);

  const startInvestigation = useCallback(() => {
    if (!caseData) return;
    const runner = getAgentRunner();
    runner.start(caseData);
  }, [caseData]);

  const pauseInvestigation = useCallback(() => {
    getAgentRunner().pause();
  }, []);

  const resumeInvestigation = useCallback(() => {
    getAgentRunner().resume();
  }, []);

  const resetInvestigation = useCallback(() => {
    getAgentRunner().reset();
  }, []);

  return {
    runnerStatus,
    startInvestigation,
    pauseInvestigation,
    resumeInvestigation,
    resetInvestigation,
  };
}
