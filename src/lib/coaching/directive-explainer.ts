import { RankedLearning }
  from '@/types/ranked-learning';

export function explainDirective(
  primaryLearning: RankedLearning | null
): string {

  if (!primaryLearning) {
    return 'No explanation available.';
  }

  return (
    `Confidence: ${primaryLearning.learning.confidence}%. ` +
    `Supported by ${primaryLearning.learning.supportingEvidenceCount} evidence points.`
  );
}