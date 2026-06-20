import { RankedLearning }
  from '@/types/ranked-learning';

export interface Opportunity {
  statement: string;
  priorityScore: number;
  priorityLabel: string;
  reason: string;
}

function getPriorityLabel(
  rank: number
): string {
  if (rank === 1) return 'High Priority';
  if (rank === 2) return 'Medium Priority';
  return 'Supporting';
}

export function buildOpportunity(
  ranked: RankedLearning,
  rank: number
): Opportunity {
  return {
    statement:
      ranked.learning.statement,
    priorityScore:
      ranked.priorityScore,
    priorityLabel:
      getPriorityLabel(rank),
    reason:
      `Confidence ${ranked.learning.confidence}% with ${ranked.learning.supportingEvidenceCount} supporting evidence points.`
  };
}
