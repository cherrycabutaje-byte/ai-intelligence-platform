export interface StoryHypothesis {
  statement: string;

  confidence: number;

  supportingSignals: string[];

  alternativeHypotheses?: string[];
}