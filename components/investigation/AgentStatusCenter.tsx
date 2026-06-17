// ============================================================
// InvestiGuard AI — Agent Status Center
// Shows real-time status of all 5 agents, their progress,
// messages count, and processing duration.
// ============================================================

import { useEffect, useState } from 'react';
import { Activity, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { AgentType, AGENT_CONFIG } from '../../types';
import { getAgentRunner } from '../../lib/agentRunner';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';

interface AgentStatusItem {
  agentId: AgentType;
  status: 'idle' | 'working' | 'done';
  messagesCount: number;
  duration: number | null;
}

const INITIAL_STATUSES: AgentStatusItem[] = Object.values(AgentType).map((agentId) => ({
  agentId,
  status: 'idle' as const,
  messagesCount: 0,
  duration: null,
}));

export function AgentStatusCenter() {
  const { messages, isComplete } = useRealtimeBand();
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusItem[]>(INITIAL_STATUSES);

  useEffect(() => {
    if (messages.length === 0) return;

    const timings = getAgentRunner().getAgentTimings();
    const latestMsg = messages[messages.length - 1];

    // Count messages per agent
    const counts: Record<string, number> = {};
    messages.forEach((m) => {
      counts[m.agentId] = (counts[m.agentId] || 0) + 1;
    });

    const updated: AgentStatusItem[] = Object.values(AgentType).map((agentId) => {
      const timing = timings.find((t) => t.agentId === agentId);
      const count = counts[agentId] || 0;
      let status: 'idle' | 'working' | 'done' = 'idle';

      if (isComplete) {
        status = count > 0 ? 'done' : 'idle';
      } else if (latestMsg.agentId === agentId) {
        status = 'working';
      } else if (count > 0) {
        status = 'done';
      }

      return {
        agentId,
        status,
        messagesCount: count,
        duration: timing?.duration ?? null,
      };
    });

    setAgentStatuses(updated);
  }, [messages, isComplete]);

  const activeCount = agentStatuses.filter((a) => a.status !== 'idle').length;


  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background-alt">
        <Activity size={12} className="text-primary" />
        <span className="font-heading text-[10px] font-semibold text-foreground">Agent Status</span>
        <span className="ml-auto text-[8px] text-foreground-muted">
          {activeCount}/{agentStatuses.length} active
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1 p-2">
        {agentStatuses.map((agent) => {
          const config = AGENT_CONFIG[agent.agentId];
          const isActive = agent.status === 'working';
          const isDone = agent.status === 'done';

          return (
            <div
              key={agent.agentId}
              className={`rounded-lg p-2 text-center transition-all duration-300 border
                ${isActive
                  ? 'border-primary/50 bg-primary/10 shadow-neon'
                  : isDone
                    ? 'border-success/30 bg-success/5'
                    : 'border-border bg-background-alt/50'
                }`}
            >
              {/* Agent circle */}
              <div
                className={`w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center text-[9px] font-bold text-black
                  transition-all duration-300
                  ${isActive ? 'scale-110 pulse-ring' : ''}
                `}
                style={{
                  backgroundColor: config.color.replace('var(', '').replace(')', ''),
                  boxShadow: isActive ? `0 0 12px ${config.color.replace('var(', '').replace(')', '')}` : 'none',
                }}
              >
                {config.shortName[0]}
              </div>

              {/* Agent name */}
              <p className={`text-[7px] font-semibold truncate ${isActive ? 'text-foreground' : isDone ? 'text-success' : 'text-foreground-muted'}`}>
                {config.shortName}
              </p>

              {/* Message count */}
              <p className="text-[8px] text-foreground-muted mt-0.5">
                {agent.messagesCount} msg
              </p>

              {/* Status icon */}
              <div className="mt-0.5">
                {isActive && <Loader2 size={8} className="animate-spin mx-auto text-primary" />}
                {isDone && <CheckCircle size={8} className="mx-auto text-success" />}
                {agent.status === 'idle' && <Clock size={8} className="mx-auto text-foreground-muted" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
