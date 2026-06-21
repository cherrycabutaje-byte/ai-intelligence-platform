import { NextResponse } from 'next/server';
import { getLearningsByCreator }
  from '@/lib/human-behavior/creator-learning-repository';
import { rankLearnings }
  from '@/lib/coaching/learning-ranker';
import { selectTopLearnings }
  from '@/lib/coaching/top-learning-selector';
import { scoreAudit }
  from '@/lib/coaching/audit-scorer';
import { detectSignals }
  from '@/lib/coaching/content-signal-engine';
import { matchPatterns }
  from '@/lib/coaching/creator-pattern-matcher';
import { buildStrategicReasoning }
  from '@/lib/coaching/strategic-reasoning-engine';
import { generateViralBrief }
  from '@/lib/coaching/viral-brief-generator';

const DEFAULT_LEARNINGS = [
  {
    id: 'default-1',
    statement: 'Content that tells a personal transformation story outperforms generic list content',
    confidence: 70,
    status: 'tentative' as const,
    supportingEvidenceCount: 3,
    contradictingEvidenceCount: 0,
    origin: { hypothesis: 'Personal stories drive more engagement' },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'default-2',
    statement: 'Curiosity-driven hooks in the first 3 seconds retain more viewers',
    confidence: 75,
    status: 'tentative' as const,
    supportingEvidenceCount: 4,
    contradictingEvidenceCount: 0,
    origin: { hypothesis: 'Strong hooks improve retention' },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'default-3',
    statement: 'Content with clear stakes and personal risk gets more shares',
    confidence: 68,
    status: 'tentative' as const,
    supportingEvidenceCount: 2,
    contradictingEvidenceCount: 0,
    origin: { hypothesis: 'Stakes drive shareability' },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
];

export async function POST(req: Request) {
  const start = Date.now();

  const {
    creatorId,
    videoTitle,
    transcript,
    topic
  } = await req.json();

  if (!creatorId) {
    return NextResponse.json(
      { success: false, message: 'creatorId is required' },
      { status: 400 }
    );
  }

  // Fetch creator learnings
  const fetchedLearnings =
    await getLearningsByCreator(creatorId);
  const creatorHasHistory =
    fetchedLearnings && fetchedLearnings.length > 0;
  const learnings = creatorHasHistory
    ? fetchedLearnings
    : DEFAULT_LEARNINGS;

  // Rank and select top learnings
  const ranked = rankLearnings(learnings);
  const top = selectTopLearnings(ranked);
  const score = scoreAudit(ranked);

  // Phase 8A — signal detection + pattern matching
  // + strategic reasoning (pure functions, no latency)
  const detailedSignals = transcript
    ? detectSignals(transcript)
    : detectSignals('');

  const patternMatches = matchPatterns(
    top,
    detailedSignals
  );

  const reasoning = buildStrategicReasoning(
    patternMatches,
    creatorHasHistory ?? false
  );

  // Internal diagnostic log — not in response
  console.log('[JARVIS Phase 8A]', {
    creatorId,
    creatorHasHistory,
    signalScores: {
      transformation: detailedSignals.signals.transformation.score,
      curiosity: detailedSignals.signals.curiosity.score,
      stakes: detailedSignals.signals.stakes.score
    },
    patternMatches: patternMatches.map(m => ({
      pattern: m.pattern.slice(0, 40),
      alignmentScore: m.alignmentScore,
      gapScore: m.gapScore,
      severity: m.severity
    })),
    primaryGap: reasoning.primaryGap
      ? {
          pattern: reasoning.primaryGap.pattern.slice(0, 40),
          gapScore: reasoning.primaryGap.gapScore,
          severity: reasoning.primaryGap.severity
        }
      : null,
    overallRecommendationConfidence:
      reasoning.overallRecommendationConfidence
  });

  // Generate brief with strategic reasoning
  const brief = await generateViralBrief(
    creatorId,
    top,
    score,
    reasoning,
    topic,
    videoTitle,
    transcript
  );

  const elapsed = Date.now() - start;
  console.log(`[JARVIS] viral-direct completed in ${elapsed}ms`);

  return NextResponse.json({
    success: true,
    brief
  });
}
