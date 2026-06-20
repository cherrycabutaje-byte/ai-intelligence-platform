import { EvidenceRecord }
  from '@/types/evidence-record';

import { HookObservation }
  from '@/types/hook-observation';

export function buildHookEvidence(
  observation: HookObservation
): EvidenceRecord {

  return {
    experimentId:
      `HOOK-${Date.now()}`,

    hypothesis:
      observation.hypothesis,

    constraintType:
      'HOOK_SIGNAL_CLUSTER',

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