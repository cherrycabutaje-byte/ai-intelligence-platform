import { AudienceHypothesis }
  from '@/types/audience-hypothesis';

import { AudienceObservation }
  from '@/types/audience-observation';

export function createAudienceObservation(
  hypothesis: AudienceHypothesis
): AudienceObservation {

  return {
    observationType:
      'audience_signal_cluster',

    hypothesis:
      hypothesis.statement,

    signals:
      hypothesis.supportingSignals,

    supportsHypothesis: true,

    confidence:
      hypothesis.confidence,

    observedAt:
      new Date().toISOString()
  };
}