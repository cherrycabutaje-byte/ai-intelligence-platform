import { EvidenceRecord }
  from '@/types/evidence-record';

import { AudienceObservation }
  from '@/types/audience-observation';

export function buildAudienceEvidence(
  observation: AudienceObservation
): EvidenceRecord {

  return {
    experimentId:
      `AUD-${Date.now()}`,

    hypothesis:
      observation.hypothesis,

    constraintType:
      'AUDIENCE_SIGNAL_CLUSTER',

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