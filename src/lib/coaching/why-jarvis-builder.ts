import { StrategicReasoning } from '@/types/strategic-reasoning';
import { WhyJarvisBelievesThis } from '@/types/viral-brief';

export function buildWhyJarvisBelievesThis(
  reasoning: StrategicReasoning
): WhyJarvisBelievesThis {
  if (!reasoning.creatorHasHistory || !reasoning.primaryGap) {
    return {
      creatorHasHistory: false,
      strongestLearning: 'No channel history available yet',
      confidence: 0,
      evidencePoints: 0,
      currentVideoAlignment: 0,
      gapSeverity: 'Low',
      missingSignals: [],
      conclusion: 'Submit more videos to build your creator profile and unlock personalized pattern intelligence.',
      topStrength: 'No pattern history available',
      overallRecommendationConfidence: 0
    };
  }

  const primary = reasoning.primaryGap;
  const topEvidence = reasoning.evidenceReasonings.find(
    e => e.creatorLearning === primary.pattern
  ) ?? reasoning.evidenceReasonings[0];

  const conclusion = `This video uses only ${primary.currentAlignment}% of your strongest proven pattern. Your channel history shows this pattern drives your best results. The ${primary.gapScore}-point gap explains the performance risk.`;

  return {
    creatorHasHistory: true,
    strongestLearning: primary.pattern,
    confidence: primary.historicalConfidence,
    evidencePoints: topEvidence?.evidencePoints ?? 0,
    currentVideoAlignment: primary.currentAlignment,
    gapSeverity: primary.severity,
    missingSignals: primary.missingSignals ?? [],
    conclusion,
    topStrength: reasoning.topStrength,
    overallRecommendationConfidence:
      reasoning.overallRecommendationConfidence
  };
}
