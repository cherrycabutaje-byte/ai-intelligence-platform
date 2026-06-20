import { RankedLearning }
  from '@/types/ranked-learning';

export function recommendExperiment(
  primaryLearning: RankedLearning | null
): string {

  if (!primaryLearning) {
    return 'No experiment available.';
  }

  return (
    `Test content based on: ` +
    primaryLearning.learning.statement
  );
}