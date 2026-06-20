export function calculatePriorityScore(
  confidence: number,
  supportingEvidenceCount: number
): number {

  return confidence +
    (supportingEvidenceCount * 5);
}