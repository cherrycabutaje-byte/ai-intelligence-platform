import { ConstraintClassification } from './constraint-classifier';

export interface ExperimentDesign {
  experiment: string;

  successMetric: string;

  expectedLearning: string;

  confidence: number;
}

export function generateExperiment(
  constraint: ConstraintClassification
): ExperimentDesign {

  switch (constraint.constraintType) {

    case 'AUDIENCE_MISMATCH':
      return {
        experiment:
          'Test audience-focused positioning against current positioning.',

        successMetric:
          'CTR increase greater than 20%.',

        expectedLearning:
          'Determine which audience identity responds most strongly.',

        confidence: 75
      };

    case 'ATTENTION_LEAK':
      return {
        experiment:
          'Test a stronger hook within the first 10 seconds.',

        successMetric:
          'Increase average view duration by 20%.',

        expectedLearning:
          'Determine whether early attention loss is reducing performance.',

        confidence: 75
      };

    case 'TRUST_LEAK':
      return {
        experiment:
          'Test stronger proof, credibility, or social validation.',

        successMetric:
          'Increase engagement rate by 15%.',

        expectedLearning:
          'Determine whether trust signals improve audience response.',

        confidence: 70
      };

    default:
      return {
        experiment:
          'Run a test to reduce uncertainty.',

        successMetric:
          'Measure performance improvement.',

        expectedLearning:
          'Determine which hypothesis is most likely correct.',

        confidence: 50
      };
  }
}