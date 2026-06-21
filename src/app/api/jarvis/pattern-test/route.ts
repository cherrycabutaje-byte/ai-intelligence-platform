import { NextResponse } from 'next/server';
import { detectSignals } from '@/lib/coaching/content-signal-engine';
import { matchPatterns } from '@/lib/coaching/creator-pattern-matcher';

const TRANSCRIPT = "welcome to my channel are you looking to bring some positive energy good luck and prosperity into your living space in this video we ll introduce you to 10 beautiful indoor plants";

const MOCK_LEARNINGS = [{
  learning: {
    id: '1',
    statement: 'Transformation titles outperform travel titles',
    confidence: 92,
    status: 'validated' as const,
    supportingEvidenceCount: 5,
    contradictingEvidenceCount: 0,
    origin: { hypothesis: 'Audience prefers transformation content' },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  },
  priorityScore: 117
}];

export async function GET() {
  const detailedSignals = detectSignals(TRANSCRIPT);
  const patternMatches = matchPatterns(MOCK_LEARNINGS, detailedSignals);
  return NextResponse.json({
    success: true,
    patternMatches: patternMatches.map(m => ({
      pattern: m.pattern,
      confidence: m.confidence,
      evidencePoints: m.evidencePoints,
      alignmentScore: m.alignmentScore,
      gapScore: m.gapScore,
      severity: m.severity,
      matchedSignals: m.matchedSignals,
      recommendationConfidence: m.recommendationConfidence
    }))
  });
}
