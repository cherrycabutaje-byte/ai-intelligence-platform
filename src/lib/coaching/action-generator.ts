import { RankedLearning }
  from '@/types/ranked-learning';

export function generateAction(
  learning: RankedLearning
): string {
  return `Lead future content with: ${learning.learning.statement}`;
}
