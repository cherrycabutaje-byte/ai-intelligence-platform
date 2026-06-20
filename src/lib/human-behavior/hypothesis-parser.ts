import { HumanBehaviorHypothesis } from '@/types/human-behavior-hypothesis';

export function parseHypothesis(
  rawContent: string
): HumanBehaviorHypothesis {
  try {
  const cleanedContent = rawContent
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim();

const parsed = JSON.parse(cleanedContent);

    return {
      hypotheses: parsed.hypotheses ?? [],

      primaryConstraint:
        parsed.primaryConstraint ?? undefined,

      recommendedExperiment:
        parsed.recommendedExperiment ?? undefined,

      successMetric:
        parsed.successMetric ?? undefined,

      expectedLearning:
        parsed.expectedLearning ?? undefined
    };
  } catch {
    return {
      hypotheses: [
        {
          hypothesis:
            'Failed to parse Claude response',

          confidence: 0,

          supportingEvidence: [],

          contradictingEvidence: [
            'Invalid JSON returned'
          ],

          alternativeHypotheses: []
        }
      ]
    };
  }
}