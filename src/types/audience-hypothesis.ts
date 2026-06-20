export interface AudienceHypothesis {
  statement: string;

  confidence: number;

  supportingSignals: string[];

  alternativeHypotheses?: string[];
}