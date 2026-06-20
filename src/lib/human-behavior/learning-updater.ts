import { EvidenceRecord }
  from '@/types/evidence-record';

import { CreatorLearning }
  from '@/types/creator-learning';

export function updateLearningFromEvidence(
  learning: CreatorLearning,
  evidence: EvidenceRecord
): CreatorLearning {

  let confidence =
    learning.confidence;

  let supportingEvidenceCount =
    learning.supportingEvidenceCount;

  let contradictingEvidenceCount =
    learning.contradictingEvidenceCount;

  if (evidence.result === 'validated') {
    confidence += 8;
    supportingEvidenceCount += 1;
  }

  if (evidence.result === 'rejected') {
    confidence -= 10;
    contradictingEvidenceCount += 1;
  }

  confidence = Math.max(
    0,
    Math.min(100, confidence)
  );

  let status =
    learning.status;

  if (confidence >= 90) {
    status = 'validated';
  } else if (confidence >= 75) {
    status = 'tentative';
  } else if (confidence < 40) {
    status = 'rejected';
  } else {
    status = 'emerging';
  }

  return {
    ...learning,

    confidence,

    supportingEvidenceCount,

    contradictingEvidenceCount,

    status,

    lastUpdated:
      new Date().toISOString()
  };
}