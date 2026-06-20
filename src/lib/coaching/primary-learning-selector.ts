import { RankedLearning }
  from '@/types/ranked-learning';

export function selectPrimaryLearning(
  rankedLearnings: RankedLearning[]
): RankedLearning | null {

  if (
    rankedLearnings.length === 0
  ) {
    return null;
  }

  return rankedLearnings[0];
}