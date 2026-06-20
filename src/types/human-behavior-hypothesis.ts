export interface HumanBehaviorHypothesis {
  hypotheses: {
    hypothesis: string;

    confidence: number;

    supportingEvidence: string[];

    contradictingEvidence: string[];

    alternativeHypotheses: string[];
  }[];

  primaryConstraint?: string;

  recommendedExperiment?: string;

  successMetric?: string;

  expectedLearning?: string;
}