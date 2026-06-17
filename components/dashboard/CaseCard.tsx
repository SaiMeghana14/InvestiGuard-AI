// ============================================================
// InvestiGuard AI — CaseCard Component
// ============================================================

import { InvestigationCase } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Clock, Activity } from 'lucide-react';

interface CaseCardProps {
  caseData: InvestigationCase;
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-foreground-muted', bg: 'bg-muted' },
  in_progress: { label: 'In Progress', icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
  awaiting_review: { label: 'Awaiting Review', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  escalated: { label: 'Escalated', icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function CaseCard({ caseData }: CaseCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[caseData.status];
  const StatusIcon = status.icon;

  const getRiskBadge = () => {
    if (caseData.riskScore === null) return null;
    if (caseData.riskScore >= 70) return { label: 'High Risk', color: 'text-destructive border-destructive/40 bg-destructive/10' };
    if (caseData.riskScore >= 40) return { label: 'Medium Risk', color: 'text-warning border-warning/40 bg-warning/10' };
    return { label: 'Low Risk', color: 'text-success border-success/40 bg-success/10' };
  };

  const riskBadge = getRiskBadge();

  return (
    <button
      onClick={() => navigate(`/investigation/${caseData.id}`)}
      className="w-full text-left group bg-background-card border border-border rounded-xl p-5
                 hover:border-primary/40 hover:neon-glow-blue transition-all duration-300 cursor-pointer
                 relative overflow-hidden"
    >
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center`}>
            <StatusIcon size={16} className={status.color} />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              {caseData.title}
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              {caseData.transaction.transactionType.toUpperCase()} · ${caseData.transaction.amount.toLocaleString()}
            </p>
          </div>
        </div>
        <ArrowRight size={16} className="text-foreground-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      <p className="text-xs text-foreground-muted mb-3 line-clamp-2">
        {caseData.description}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.color} ${status.bg} border-transparent`}>
          {status.label}
        </span>
        {riskBadge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskBadge.color} ${riskBadge.color.split(' ')[1]} ${riskBadge.color.split(' ')[2]}`}>
            {riskBadge.label}
          </span>
        )}
        <span className="text-[10px] text-foreground-muted ml-auto">
          {caseData.transaction.region}
        </span>
      </div>
    </button>
  );
}
