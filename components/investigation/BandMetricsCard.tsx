// ============================================================
// InvestiGuard AI — Band Collaboration Metrics Card
// Premium glassmorphism card showing real-time multi-agent
// collaboration metrics. Optimized for hackathon demo visibility.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  GitBranch,
  FileSearch,
  Users,
  Gauge,
  Activity,
} from 'lucide-react';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';

// ── Animated Counter ───────────────────────────────────────

function AnimatedCounter({
  value,
  suffix = '',
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startValue = prevValueRef.current;
    prevValueRef.current = value;
    if (startValue === value) {
      setDisplay(value);
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    const frame = requestAnimationFrame(function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

// ── Metric Item ────────────────────────────────────────────

interface MetricDef {
  icon: typeof MessageCircle;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  gradient: string;
}

// ── Main Component ─────────────────────────────────────────

interface BandMetricsCardProps {
  verdict: { score: number; label: string; confidence: number } | null;
}

export function BandMetricsCard({ verdict }: BandMetricsCardProps) {
  const { messages, evidence } = useRealtimeBand();

  const handoffs = messages.filter(
    (m) => m.messageType === 'handoff' || m.messageType === 'task_handoff',
  ).length;
  const activeAgents = new Set(messages.map((m) => m.agentId)).size;
  const confidence = verdict?.confidence ?? 0;

  const metrics: MetricDef[] = [
    {
      icon: MessageCircle,
      label: 'Messages Exchanged',
      value: messages.length,
      color: 'text-primary',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      icon: GitBranch,
      label: 'Agent Handoffs',
      value: handoffs,
      color: 'text-accent',
      gradient: 'from-accent/20 to-accent/5',
    },
    {
      icon: FileSearch,
      label: 'Evidence Objects',
      value: evidence.length,
      color: 'text-secondary',
      gradient: 'from-secondary/20 to-secondary/5',
    },
    {
      icon: Users,
      label: 'Active Agents',
      value: activeAgents,
      color: 'text-warning',
      gradient: 'from-warning/20 to-warning/5',
    },
    {
      icon: Gauge,
      label: 'Decision Confidence',
      value: confidence,
      suffix: '%',
      color:
        confidence >= 70
          ? 'text-success'
          : confidence >= 40
            ? 'text-warning'
            : 'text-destructive',
      gradient:
        confidence >= 70
          ? 'from-success/20 to-success/5'
          : confidence >= 40
            ? 'from-warning/20 to-warning/5'
            : 'from-destructive/20 to-destructive/5',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl
      bg-gradient-to-br from-background-card/95 via-background-card/80 to-background-card/95
      backdrop-blur-2xl
      shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03)_inset]">

      {/* Glassmorphism shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl border border-primary/10 pointer-events-none" />
      <div className="absolute -inset-[1px] rounded-xl opacity-30 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-pulse pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 px-3.5 py-2.5 border-b border-border/40 bg-background-alt/40">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center border border-primary/20 shadow-[0_0_8px_rgba(0,150,255,0.15)]">
          <Activity size={11} className="text-primary" />
        </div>
        <span className="font-heading text-[10px] font-bold text-foreground tracking-wider">
          BAND COLLABORATION METRICS
        </span>
        <div className="ml-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_4px_rgba(0,150,255,0.8)]" />
          <span className="text-[7px] font-semibold text-primary tracking-widest uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="relative z-10 p-3">
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-lg
                bg-gradient-to-br from-background-alt/80 to-background-alt/40
                border border-border/30 p-2.5
                hover:border-primary/30 hover:shadow-[0_0_12px_rgba(0,150,255,0.08)]
                transition-all duration-300"
            >
              {/* Hover state gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              {/* Shine effect on hover */}
              <div className="absolute -inset-full top-0 left-0 w-full h-full
                bg-gradient-to-r from-transparent via-white/[0.03] to-transparent
                -skew-x-12 group-hover:left-full transition-all duration-700 pointer-events-none" />

              <div className="relative z-10 flex items-start gap-2.5">
                {/* Icon container */}
                <div
                  className={`p-1.5 rounded-lg bg-background-card/80 border border-border/30
                    shadow-[0_0_6px_rgba(0,0,0,0.2)] shrink-0 ${metric.color}`}
                >
                  <metric.icon size={12} strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[7px] text-foreground-muted font-medium uppercase tracking-wider mb-0.5 truncate">
                    {metric.label}
                  </p>
                  <p className={`text-lg font-heading font-bold leading-tight tracking-tight ${metric.color}`}>
                    <AnimatedCounter value={metric.value} suffix={metric.suffix ?? ''} />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary footer */}
        {messages.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-[8px] text-foreground-muted">
              <span>
                <span className="font-semibold text-foreground/80">{activeAgents}</span> agents collaborating via{' '}
                <span className="font-semibold text-primary">Band</span>
              </span>
              <span className="text-[7px] text-foreground-muted/60">
                {handoffs} handoffs &middot; {evidence.length} evidence items
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
