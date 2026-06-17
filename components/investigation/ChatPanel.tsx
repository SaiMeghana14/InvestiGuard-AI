// ============================================================
// InvestiGuard AI — Chat Panel (The Band)
// ============================================================

import { useEffect, useRef } from 'react';
import {
  MessageSquare, UserCheck, AlertTriangle,
  Lightbulb, GitBranch, Shield, ArrowRight, FileText,
} from 'lucide-react';
import { AGENT_CONFIG, MessageType } from '../../types';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';

const messageStyleConfig: Record<MessageType, {
  icon: typeof MessageSquare;
  label: string;
  borderColor: string;
  bgColor: string;
  badge: string;
}> = {
  thought:       { icon: Lightbulb, label: 'Thinking', borderColor: 'border-primary/20', bgColor: 'bg-primary/5', badge: 'bg-primary/10 text-primary' },
  finding:       { icon: Lightbulb, label: 'Finding', borderColor: 'border-accent/20', bgColor: 'bg-accent/5', badge: 'bg-accent/10 text-accent' },
  handoff:       { icon: ArrowRight, label: 'Handoff', borderColor: 'border-foreground-muted/20', bgColor: 'bg-background-alt', badge: 'bg-muted text-foreground-muted' },
  question:      { icon: MessageSquare, label: 'Question', borderColor: 'border-warning/20', bgColor: 'bg-warning/5', badge: 'bg-warning/10 text-warning' },
  decision:      { icon: Shield, label: 'Decision', borderColor: 'border-success/20', bgColor: 'bg-success/5', badge: 'bg-success/10 text-success' },
  analysis:      { icon: GitBranch, label: 'Analysis', borderColor: 'border-primary/30', bgColor: 'bg-primary/10', badge: 'bg-primary/20 text-primary' },
  evidence:      { icon: FileText, label: 'Evidence', borderColor: 'border-accent/30', bgColor: 'bg-accent/10', badge: 'bg-accent/20 text-accent' },
  task_handoff:  { icon: UserCheck, label: 'Task Handoff', borderColor: 'border-secondary/30', bgColor: 'bg-secondary/10', badge: 'bg-secondary/20 text-secondary' },
  recommendation:{ icon: Shield, label: 'Recommendation', borderColor: 'border-warning/30', bgColor: 'bg-warning/10', badge: 'bg-warning/20 text-warning' },
  risk_alert:    { icon: AlertTriangle, label: 'Risk Alert', borderColor: 'border-destructive/30', bgColor: 'bg-destructive/10', badge: 'bg-destructive/20 text-destructive' },
  human_review_request: { icon: Shield, label: 'Review Needed', borderColor: 'border-destructive/40', bgColor: 'bg-destructive/15', badge: 'bg-destructive/20 text-destructive' },
};

export function ChatPanel() {
  const { messages, isRunning, isComplete } = useRealtimeBand();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background-alt">
        <MessageSquare size={14} className="text-primary" />
        <span className="font-heading text-xs font-semibold text-foreground">Agent Band Chat</span>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
          </span>
        )}
        {isComplete && <span className="ml-auto text-[10px] text-success">Complete</span>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-foreground-muted">Waiting for agents to start...</p>
          </div>
        )}

        {messages.map((msg) => {
          const config = AGENT_CONFIG[msg.agentId];
          const style = messageStyleConfig[msg.messageType] || messageStyleConfig.thought;
          const Icon = style.icon;

          return (
            <div key={msg.id} className={`fade-in border rounded-lg p-3 ${style.borderColor} ${style.bgColor}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-black shrink-0"
                  style={{ backgroundColor: config.color.replace('var(', '').replace(')', '') }}
                >
                  {config.shortName[0]}
                </div>
                <span className="text-[10px] font-semibold text-foreground">{config.name}</span>
                <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded ${style.badge}`}>
                  <Icon size={8} className="inline mr-0.5" />{style.label}
                </span>
              </div>

              <div className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {renderMessageContent(msg.content)}
              </div>

              {msg.targetAgent && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-foreground-muted bg-background-alt rounded px-2 py-1 border border-border">
                  <ArrowRight size={10} className="text-primary" />
                  Handing off to: <span className="font-semibold text-foreground">{AGENT_CONFIG[msg.targetAgent].name}</span>
                </div>
              )}

              {msg.references && msg.references.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-[8px] text-foreground-muted">
                  <GitBranch size={8} />
                  References: {msg.references.filter(Boolean).length} message(s)
                </div>
              )}
            </div>
          );
        })}

        {isRunning && (
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="flex gap-1">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
            <span className="text-[9px] text-foreground-muted">Agents collaborating...</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border bg-background-alt flex items-center justify-between">
        <span className="text-[10px] text-foreground-muted">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
        {isComplete && <span className="text-[10px] text-success">Investigation complete</span>}
      </div>
    </div>
  );
}

function renderMessageContent(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
