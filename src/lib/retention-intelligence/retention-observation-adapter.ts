import { RetentionHypothesis }
  from '@/types/retention-hypothesis';

import { RetentionObservation }
  from '@/types/retention-observation';

export function createRetentionObservation(
  hypothesis: RetentionHypothesis
): RetentionObservation {

  return {
    observationType:
      'retention_signal_cluster',

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