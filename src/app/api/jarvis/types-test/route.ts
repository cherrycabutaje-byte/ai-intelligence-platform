import { NextResponse } from 'next/server';
import { SignalDetectionResult }
  from '@/types/signal-detection';
import { PatternMatch }
  from '@/types/pattern-match';
import { EvidenceReasoning }
  from '@/types/evidence-reasoning';
import { StrategicReasoning }
  from '@/types/strategic-reasoning';

export async function GET() {
  const signals: SignalDetectionResult = {
    transformation: {
      beforeState: true,
      afterState: false,
      conflict: true,
      turningPoint: false,
      lesson: false,
      score: 40
    },
    curiosity: {
      unresolvedQuestion: false,
      futureReveal: false,
      mystery: false,
      contradiction: true,
      score: 25
    },
    stakes: {
      lossRisk: false,
      gainOpportunity: false,
      consequence: false,
      commitment: false,
      score: 0
    }
  };

  const patternMatch: PatternMatch = {
    pattern: 'Transformation stories outperform informational content',
    confidence: 92,
    evidencePoints: 5,
    presentInVideo: false,
    alignmentScore: 12,
    gapScore: 80,
    severity: 'High',
    recommendationConfidence: 87
  };

  const evidenceReasoning: EvidenceReasoning = {
    creatorLearning:
      'Transformation stories outperform informational content',
    confidence: 92,
    evidencePoints: 5,
    currentVideoAlignment: 12,
    gapSeverity: 'High',
    conclusion:
      'This video uses 12% of your strongest proven pattern. That gap is the primary reason this video will underperform your best content.',
    recommendationConfidence: 87
  };

  const primaryGap = {
    pattern: 'Transformation',
    historicalConfidence: 92,
    currentAlignment: 12,
    gapScore: 80,
    severity: 'High',
    recommendation:
      'Add a personal transformation arc — before state, conflict, turning point, after state.'
  };

  const strategicReasoning: StrategicReasoning = {
    creatorHasHistory: true,
    evidenceReasonings: [evidenceReasoning],
    patternMatches: [patternMatch],
    primaryGap,
    alignmentSummary:
      'This video aligns at 12% with your strongest historical pattern.',
    overallRecommendationConfidence: 87
  };

  return NextResponse.json({
    success: true,
    signals,
    patternMatch,
    evidenceReasoning,
    strategicReasoning
  });
}
