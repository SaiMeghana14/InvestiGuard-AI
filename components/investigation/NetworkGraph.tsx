// ============================================================
// InvestiGuard AI — Network Graph (Agent Collaboration Viz)
// ============================================================
// Enhanced with animated message packets (data flowing between
// agents), glow effects, message counters, and evidence
// transfer visualization.
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { Activity, MessageSquare } from 'lucide-react';
import { AgentType, AGENT_CONFIG } from '../../types';
import { useRealtimeBand } from '../../hooks/useRealtimeBand';

const AGENTS = Object.values(AgentType);

interface AnimatedPacket {
  id: string;
  from: AgentType;
  to: AgentType;
  progress: number; // 0 to 1
}

function getNodePosition(index: number, total: number, cx: number, cy: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

export function NetworkGraph() {
  const { messages, isRunning, isComplete } = useRealtimeBand();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 200 });
  const [activeAgents, setActiveAgents] = useState<Set<AgentType>>(new Set());
  const [pulseAgent, setPulseAgent] = useState<AgentType | null>(null);
  const [packets, setPackets] = useState<AnimatedPacket[]>([]);
  const [agentMsgCount, setAgentMsgCount] = useState<Record<string, number>>({});
  const packetIdRef = useRef(0);

  // Resize observer
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const parent = svg.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: Math.max(160, Math.min(280, width * 0.45)) });
      }
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Track messages and animate packets
  useEffect(() => {
    if (messages.length === 0) return;

    const latestMsg = messages[messages.length - 1];
    setPulseAgent(latestMsg.agentId);

    // Update active agents
    const newActive = new Set(activeAgents);
    newActive.add(latestMsg.agentId);
    setActiveAgents(newActive);

    // Update message counts
    const counts = { ...agentMsgCount };
    messages.forEach((m) => {
      counts[m.agentId] = (counts[m.agentId] || 0) + 1;
    });
    setAgentMsgCount(counts);

    // Animate packet when handoff or task_handoff occurs
    if (messages.length >= 2 && (latestMsg.messageType === 'task_handoff' || latestMsg.messageType === 'handoff')) {
      const prevMsg = messages[messages.length - 2];
      if (prevMsg.agentId !== latestMsg.agentId) {
        // Create animated packet from prev to current
        const packet: AnimatedPacket = {
          id: `packet-${packetIdRef.current++}`,
          from: prevMsg.agentId,
          to: latestMsg.agentId,
          progress: 0,
        };

        setPackets((prev) => [...prev.slice(-5), packet]);

        // Animate the packet
        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.05;
          if (progress >= 1) {
            clearInterval(interval);
            setPackets((p) => p.filter((pk) => pk.id !== packet.id));
          } else {
            setPackets((p) =>
              p.map((pk) => (pk.id === packet.id ? { ...pk, progress } : pk))
            );
          }
        }, 30);

        // Clean up animation after timeout
        setTimeout(() => clearInterval(interval), 2000);
      }
    }

    // Clear pulse after animation
    const timer = setTimeout(() => setPulseAgent(null), 1500);
    return () => clearTimeout(timer);
  }, [messages]);

  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;
  const radius = Math.min(cx, cy) - 32;

  // Calculate node positions
  const nodePositions = AGENTS.map((_, i) => getNodePosition(i, AGENTS.length, cx, cy, radius));

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background-alt">
        <Activity size={14} className="text-primary" />
        <span className="font-heading text-xs font-semibold text-foreground">Agent Collaboration Network</span>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1 text-[9px] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Active
          </span>
        )}
        {isComplete && (
          <span className="ml-auto text-[9px] text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Complete
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
          style={{ minHeight: '160px' }}
        >
          {/* Connection rings (all-pairs) */}
          {AGENTS.map((from, i) =>
            AGENTS.filter((_, j) => j > i).map((to, j) => {
              const posFrom = nodePositions[i];
              const posTo = nodePositions[i + j + 1];
              const isActive = messages.some(
                (m) =>
                  (m.messageType === 'task_handoff' || m.messageType === 'handoff') &&
                  m.agentId === from
              ) || messages.some(
                (m) =>
                  (m.messageType === 'task_handoff' || m.messageType === 'handoff') &&
                  m.agentId === to
              );

              return (
                <line
                  key={`${from}-${to}`}
                  x1={posFrom.x}
                  y1={posFrom.y}
                  x2={posTo.x}
                  y2={posTo.y}
                  stroke={isActive ? 'var(--color-primary)' : 'var(--color-border)'}
                  strokeWidth={isActive ? 2 : 0.5}
                  opacity={isActive ? 0.8 : 0.2}
                  className="transition-all duration-500"
                />
              );
            })
          )}

          {/* Animated Packets */}
          {packets.map((packet) => {
            const fromIdx = AGENTS.indexOf(packet.from);
            const toIdx = AGENTS.indexOf(packet.to);
            if (fromIdx === -1 || toIdx === -1) return null;

            const fromPos = nodePositions[fromIdx];
            const toPos = nodePositions[toIdx];
            const x = fromPos.x + (toPos.x - fromPos.x) * packet.progress;
            const y = fromPos.y + (toPos.y - fromPos.y) * packet.progress;

            return (
              <g key={packet.id}>
                {/* Glow trail */}
                <circle cx={x} cy={y} r={5} fill="var(--color-accent)" opacity={0.3}>
                  <animate attributeName="r" values="5;8;5" dur="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.3s" repeatCount="indefinite" />
                </circle>
                {/* Packet dot */}
                <circle cx={x} cy={y} r={3} fill="var(--color-accent)" />
                {/* Speed trail */}
                <circle cx={x} cy={y} r={6} fill="none" stroke="var(--color-accent)" strokeWidth={1} opacity={0.5}>
                  <animate attributeName="r" values="6;10;6" dur="0.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="0.4s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}

          {/* Agent Nodes */}
          {AGENTS.map((agentType, i) => {
            const pos = nodePositions[i];
            const config = AGENT_CONFIG[agentType];
            const isActive = activeAgents.has(agentType);
            const isPulsing = pulseAgent === agentType;
            const msgCount = agentMsgCount[agentType] || 0;
            const color = config.color.replace('var(', '').replace(')', '');

            return (
              <g key={agentType}>
                {/* Background glow ring */}
                {(isActive || isPulsing) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={20}
                    fill={color}
                    opacity={0.08}
                    className="transition-all duration-300"
                  >
                    {isPulsing && (
                      <animate
                        attributeName="r"
                        values="20;28;20"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                )}

                {/* Pulse ring when agent is active */}
                {isPulsing && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={16}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0}
                    className="pulse-ring"
                  >
                    <animate
                      attributeName="r"
                      values="16;24;16"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={11}
                  fill={isActive ? color : 'var(--color-background-card)'}
                  stroke={isActive ? color : 'var(--color-border)'}
                  strokeWidth={2.5}
                  className="transition-colors duration-300"
                />

                {/* Node initial */}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? '#000' : 'var(--color-foreground-muted)'}
                  fontSize={9}
                  fontWeight={700}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {config.shortName[0]}
                </text>

                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 20}
                  textAnchor="middle"
                  fill={isActive ? 'var(--color-foreground)' : 'var(--color-foreground-muted)'}
                  fontSize={7}
                  fontWeight={isActive ? 600 : 400}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {config.shortName}
                </text>

                {/* Message count badge */}
                {msgCount > 0 && (
                  <g>
                    <circle
                      cx={pos.x + 12}
                      cy={pos.y - 12}
                      r={7}
                      fill={color}
                      opacity={0.9}
                    />
                    <text
                      x={pos.x + 12}
                      y={pos.y - 11}
                      textAnchor="middle"
                      fill="#000"
                      fontSize={6}
                      fontWeight={800}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {msgCount > 9 ? '9+' : msgCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={8} fill="var(--color-primary)" opacity={0.15} />
          <circle cx={cx} cy={cy} r={4} fill="var(--color-primary)" opacity={0.6} />
          <circle cx={cx} cy={cy} r={2} fill="var(--color-primary)" />
        </svg>

        {/* Status overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between px-1">
          <span className="text-[8px] text-foreground-muted">
            {activeAgents.size}/{AGENTS.length} agents active
          </span>
          {messages.length > 0 && (
            <span className="text-[8px] text-foreground-muted flex items-center gap-1">
              <MessageSquare size={8} />
              {messages.length} msgs
            </span>
          )}
        </div>
      </div>
    </div>
  );
}