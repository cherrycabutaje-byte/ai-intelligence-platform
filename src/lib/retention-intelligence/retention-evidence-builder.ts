import { EvidenceRecord }
  from '@/types/evidence-record';

import { RetentionObservation }
  from '@/types/retention-observation';

export function buildRetentionEvidence(
  observation: RetentionObservation
): EvidenceRecord {

  return {
    experimentId:
      `RETENTION-${Date.now()}`,

    hypothesis:
      observation.hypothesis,

    constraintType:
      'RETENTION_SIGNAL_CLUSTER',

    metricBefore: 0,

    metricAfter:
      observation.confidence,

    result:
      observation.supportsHypothesis
        ? 'validated'
        : 'rejected',

    evidenceStrength:
      observation.confidence,

    learning:
      observation.hypothesis
  };
}