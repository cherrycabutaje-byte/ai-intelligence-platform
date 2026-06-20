import { HookHypothesis }
  from '@/types/hook-hypothesis';

import { HookObservation }
  from '@/types/hook-observation';

export function createHookObservation(
  hypothesis: HookHypothesis
): HookObservation {

  return {
    observationType:
      'hook_signal_cluster',

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