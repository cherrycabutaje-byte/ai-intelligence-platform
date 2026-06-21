import { NextResponse } from 'next/server';
import { SignalDetectionResult } from '@/types/signal-detection';
import { PatternMatch } from '@/types/pattern-match';
import { EvidenceReasoning } from '@/types/evidence-reasoning';
import { StrategicReasoning, PrimaryGap } from '@/types/strategic-reasoning';

export async function GET() {
  const signals: SignalDetectionResult = {
    transformation: { beforeState: true, afterState: false, conflict: true, turningPoint: false, lesson: false, score: 40 },
    curiosity: { unresolvedQuestion: false, futureReveal: false, mystery: false, contradiction: true, score: 25 },
    stakes: { lossRisk: false, gainOpportunity: false, consequence: false, commitment: false, score: 0 }
  };

  const patternMatch: PatternMatch = {
    pattern: 'Transformation stories outperform informational content',
    confidence: 92,
    evidencePoints: 5,
    presentInVideo: false,
    alignmentScore: 12,
    gapScore: 80,
    severity: 'High',
    matchedSignals: ['beforeState'],
    recommendationConfidence: 87
  };

  const evidenceReasoning: EvidenceReasoning = {
    creatorLearning: 'Transformation stories outperform informational content',
    confidence: 92,
    evidencePoints: 5,
    currentVideoAlignment: 12,
    gapSeverity: 'High',
    conclusion: 'This video uses only 12% of your strongest proven pattern.',
    recommendationConfidence: 87
  };

  const primaryGap: PrimaryGap = {
    pattern: 'Transformation',
    historicalConfidence: 92,
    currentAlignment: 12,
    gapScore: 80,
    severity: 'High',
    recommendation: 'Add transformation arc signals.',
    missingSignals: ['afterState', 'conflict', 'turningPoint', 'lesson']
  };

  const strategicReasoning: StrategicReasoning = {
    creatorHasHistory: true,
    topStrength: 'Transformation stories outperform informational content',
    evidenceReasonings: [evidenceReasoning],
    patternMatches: [patternMatch],
    primaryGap,
    alignmentSummary: 'Current video aligns with 12% of your proven creator patterns.',
    overallRecommendationConfidence: 87,
    promptContext: 'CREATOR HISTORY\n\nStrongest Pattern: Transformation\nAlignment: 12%'
  };

  return NextResponse.json({ success: true, signals, patternMatch, evidenceReasoning, strategicReasoning });
}
