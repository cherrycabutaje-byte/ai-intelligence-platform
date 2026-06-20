import { HumanBehaviorHypothesis } from '@/types/human-behavior-hypothesis';
import { ConstraintType } from '@/types/constraint-type';

export interface ConstraintClassification {
  constraintType: ConstraintType;

  confidence: number;

  reasoning: string;
}

export function classifyConstraint(
  hypothesis: HumanBehaviorHypothesis
): ConstraintClassification {

  const constraint =
    hypothesis.primaryConstraint?.toLowerCase() ?? '';

  if (constraint.includes('audience')) {
    return {
      constraintType: ConstraintType.AUDIENCE_MISMATCH,
      confidence: 80,
      reasoning: hypothesis.primaryConstraint ?? ''
    };
  }

  if (constraint.includes('attention')) {
    return {
      constraintType: ConstraintType.ATTENTION_LEAK,
      confidence: 80,
      reasoning: hypothesis.primaryConstraint ?? ''
    };
  }

  if (constraint.includes('trust')) {
    return {
      constraintType: ConstraintType.TRUST_LEAK,
      confidence: 80,
      reasoning: hypothesis.primaryConstraint ?? ''
    };
  }

  return {
    constraintType: ConstraintType.EXPERIMENT_NEEDED,
    confidence: 50,
    reasoning:
      hypothesis.primaryConstraint ??
      'No clear constraint identified'
  };
}