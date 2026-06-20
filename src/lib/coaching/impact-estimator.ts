import { RankedLearning }
  from '@/types/ranked-learning';

export function estimateImpact(
  learning: RankedLearning
): string {
  return `Applying this learning is expected to improve audience connection and retention based on ${learning.learning.supportingEvidenceCount} supporting evidence points.`;
}
