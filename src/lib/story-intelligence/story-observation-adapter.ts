import { StoryHypothesis }
  from '@/types/story-hypothesis';

import { StoryObservation }
  from '@/types/story-observation';

export function createStoryObservation(
  hypothesis: StoryHypothesis
): StoryObservation {

  return {
    observationType:
      'story_signal_cluster',

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