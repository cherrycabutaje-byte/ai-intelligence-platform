import { StorySignal }
  from '@/types/story-signal';

import { StoryHypothesis }
  from '@/types/story-hypothesis';

export function buildStoryHypothesis(
  signals: StorySignal[]
): StoryHypothesis {

  const categories =
    signals.map(
      signal => signal.category
    );

  const hasTransformationStory =
    categories.includes(
      'conflict'
    ) &&
    categories.includes(
      'transformation'
    );

  if (hasTransformationStory) {

    return {
      statement:
        'Story follows a transformation arc',

      confidence: 80,

      supportingSignals:
        signals.map(
          signal => signal.statement
        ),

      alternativeHypotheses: [
        'Story is primarily motivational',
        'Story is primarily educational'
      ]
    };
  }

  return {
    statement:
      'Story structure unclear',

    confidence: 40,

    supportingSignals:
      signals.map(
        signal => signal.statement
      )
  };
}