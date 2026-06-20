export interface RetentionHypothesis {
  statement: string;

  confidence: number;

  supportingSignals: string[];

  alternativeHypotheses?: string[];
}