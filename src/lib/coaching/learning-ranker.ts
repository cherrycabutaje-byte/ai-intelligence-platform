import { CreatorLearning }
  from '@/types/creator-learning';

import { RankedLearning }
  from '@/types/ranked-learning';

import {
  calculatePriorityScore
} from './priority-score';

export function rankLearnings(
  learnings: CreatorLearning[]
): RankedLearning[] {

  return learnings
    .map(learning => ({
      learning,

      priorityScore:
        calculatePriorityScore(
          learning.confidence,
          learning.supportingEvidenceCount
        )
    }))
    .sort(
      (a, b) =>
        b.priorityScore -
        a.priorityScore
    );
}