import { RankedLearning }
  from '@/types/ranked-learning';
import { generateAction }
  from './action-generator';

export function generateActionPlan(
  learnings: RankedLearning[]
): string[] {
  return learnings.map(
    learning => generateAction(learning)
  );
}
