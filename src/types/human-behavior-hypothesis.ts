export interface HumanBehaviorHypothesis {
  hypothesis: string;

  confidence: number;

  supportingEvidence: string[];

  contradictingEvidence: string[];

  alternativeHypotheses: {
    hypothesis: string;
    confidence: number;
  }[];

  primaryConstraint: string;

  recommendedExperiment: string;

  successMetric: string;

  expectedLearning: string;
}