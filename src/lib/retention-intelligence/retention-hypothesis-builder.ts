import { RetentionSignal }
  from '@/types/retention-signal';

import { RetentionHypothesis }
  from '@/types/retention-hypothesis';

export function buildRetentionHypothesis(
  signals: RetentionSignal[]
): RetentionHypothesis {

  const categories =
    signals.map(
      signal => signal.category
    );

  const hasStrongRetentionPattern =
    categories.includes(
      'open_loop'
    ) &&
    categories.includes(
      'payoff'
    );

  if (hasStrongRetentionPattern) {

    return {
      statement:
        'Content uses effective retention structure',

      confidence: 80,

      supportingSignals:
        signals.map(
          signal => signal.statement
        ),

      alternativeHypotheses: [
        'Retention relies on information density',
        'Retention relies on pacing'
      ]
    };
  }

  return {
    statement:
      'Retention structure unclear',

    confidence: 40,

    supportingSignals:
      signals.map(
        signal => signal.statement
      )
  };
}