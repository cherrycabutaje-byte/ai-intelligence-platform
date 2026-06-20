import { RankedLearning }
  from '@/types/ranked-learning';

export function generateCoachDirective(
  primaryLearning: RankedLearning | null
): string {

  if (!primaryLearning) {
    return 'No coaching directive available.';
  }

  return `Double down on: ${primaryLearning.learning.statement}`;
}