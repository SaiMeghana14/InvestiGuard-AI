// ============================================================
// InvestiGuard AI — NewInvestigationModal Component
// ============================================================

import { X, Zap, User, Building2, AlertTriangle } from 'lucide-react';
import { DemoScenario } from '../../types';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

const scenarios: { id: DemoScenario; title: string; description: string; icon: typeof Zap; color: string }[] = [
  {
    id: 'structuring',
    title: 'Potential Structuring',
    description: 'Marcus Chen — $48,500 wire to Cayman Islands via 5 sequential deposits. Classic structuring pattern.',
    icon: AlertTriangle,
    color: 'text-destructive',
  },
  {
    id: 'legitimate',
    title: 'High-Value Transfer (Low Risk)',
    description: 'Sarah Williams — $12,500 ACH to real estate escrow. Established customer with clean 15-year history.',
    icon: User,
    color: 'text-success',
  },
  {
    id: 'borderline',
    title: 'Suspicious Wire (Borderline)',
    description: 'Global Trading LLC — $320,000 to UAE. Newly registered company, no prior activity.',
    icon: Building2,
    color: 'text-warning',
  },
];

export function NewInvestigationModal({ isOpen, onClose, onSelectScenario }: NewInvestigationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <h2 className="font-heading text-sm font-bold text-foreground">New Investigation</h2>
          </div>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-foreground-muted mb-4">
          Select a demo scenario to begin an automated investigation by the 5-agent AI Band.
        </p>

        <div className="space-y-3">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario.id)}
                className="w-full text-left bg-background border border-border rounded-xl p-4
                           hover:border-primary/40 hover:neon-glow-blue transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-background-alt flex items-center justify-center ${scenario.color} shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {scenario.title}
                    </h3>
                    <p className="text-xs text-foreground-muted mt-1">
                      {scenario.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
