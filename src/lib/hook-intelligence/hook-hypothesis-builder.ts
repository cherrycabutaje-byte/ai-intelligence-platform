import { HookSignal }
  from '@/types/hook-signal';

import { HookHypothesis }
  from '@/types/hook-hypothesis';

export function buildHookHypothesis(
  signals: HookSignal[]
): HookHypothesis {

  const categories =
    signals.map(
      signal => signal.category
    );

  const hasCuriosityHook =
    categories.includes(
      'curiosity'
    ) &&
    categories.includes(
      'problem'
    );

  if (hasCuriosityHook) {

    return {
      statement:
        'Hook relies on curiosity-driven problem framing',

      confidence: 80,

      supportingSignals:
        signals.map(
          signal => signal.statement
        ),

      alternativeHypotheses: [
        'Hook relies on surprise',
        'Hook relies on direct value promise'
      ]
    };
  }

  return {
    statement:
      'Hook strategy unclear',

    confidence: 40,

    supportingSignals:
      signals.map(
        signal => signal.statement
      )
  };
}