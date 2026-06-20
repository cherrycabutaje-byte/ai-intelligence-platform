import { AudienceSignal }
  from '@/types/audience-signal';

import { AudienceHypothesis }
  from '@/types/audience-hypothesis';

export function buildAudienceHypothesis(
  signals: AudienceSignal[]
): AudienceHypothesis {

  const statements =
    signals.map(
      signal => signal.statement
    );

  const hasTransformationSignals =
    statements.includes(
      'Feeling stuck in life'
    ) &&
    statements.includes(
      'Desire for change'
    );

  if (hasTransformationSignals) {

    return {
      statement:
        'Audience seeks personal transformation',

      confidence: 75,

      supportingSignals:
        statements,

      alternativeHypotheses: [
        'Audience seeks motivation',
        'Audience seeks emotional support'
      ]
    };
  }

  return {
    statement:
      'Audience intent unclear',

    confidence: 40,

    supportingSignals:
      statements
  };
}