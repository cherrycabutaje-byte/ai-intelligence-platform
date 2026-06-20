import { EvidenceRecord }
  from '@/types/evidence-record';

import { StoryObservation }
  from '@/types/story-observation';

export function buildStoryEvidence(
  observation: StoryObservation
): EvidenceRecord {

  return {
    experimentId:
      `STORY-${Date.now()}`,

    hypothesis:
      observation.hypothesis,

    constraintType:
      'STORY_SIGNAL_CLUSTER',

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