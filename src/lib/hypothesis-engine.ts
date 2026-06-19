import { Hypothesis } from '@/types/hypothesis';

export function generateHypothesis(): Hypothesis {
  return {
    hypothesis:
      'Audience may respond more strongly to transformation stories than destination-focused content.',

    confidence: 72,

    supportingEvidence: [
      'Healing themes appear repeatedly across transcripts.',
      'Emotional transformation is stronger than travel information.',
      'Packaging focuses on locations while story focuses on personal change.'
    ],

    contradictingEvidence: [
      'No A/B test has been performed.',
      'Only a small number of videos analyzed.'
    ],

    alternativeHypotheses: [
      {
        hypothesis: 'Audience prefers travel discovery content.',
        confidence: 45
      },
      {
        hypothesis: 'Audience follows creator personality regardless of topic.',
        confidence: 53
      }
    ],

    primaryConstraint: 'Packaging-Story Mismatch',

    recommendedExperiment:
      'Test transformation-focused title versus destination-focused title.',

    successMetric:
      'Increase CTR by at least 25%.',

    expectedLearning:
      'Determine whether emotional transformation framing attracts more clicks.'
  };
}