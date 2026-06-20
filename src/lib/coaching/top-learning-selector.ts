import { RankedLearning }
  from '@/types/ranked-learning';

const TOP_N = 3;

export function selectTopLearnings(
  rankedLearnings: RankedLearning[],
  n: number = TOP_N
): RankedLearning[] {
  return rankedLearnings.slice(0, n);
}
