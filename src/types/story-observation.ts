export type StoryObservationType =
  'story_signal_cluster';

export interface StoryObservation {
  observationType:
    StoryObservationType;

  hypothesis: string;

  signals: string[];

  supportsHypothesis: boolean;

  confidence: number;

  observedAt: string;
}