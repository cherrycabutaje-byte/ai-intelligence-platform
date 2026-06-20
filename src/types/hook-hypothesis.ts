export interface HookHypothesis {
  statement: string;

  confidence: number;

  supportingSignals: string[];

  alternativeHypotheses?: string[];
}