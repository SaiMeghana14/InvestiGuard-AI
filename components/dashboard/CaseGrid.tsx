// ============================================================
// InvestiGuard AI — CaseGrid Component
// ============================================================

import { InvestigationCase } from '../../types';
import { CaseCard } from './CaseCard';

interface CaseGridProps {
  cases: InvestigationCase[];
}

export function CaseGrid({ cases }: CaseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.map((caseData) => (
        <CaseCard
          key={caseData.id}
          caseData={caseData}
        />
      ))}
    </div>
  );
}
