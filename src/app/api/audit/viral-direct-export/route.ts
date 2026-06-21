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
import { renderViralBriefPDF }
  from '@/lib/coaching/viral-brief-pdf-renderer';

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

  const fetchedLearnings =
    await getLearningsByCreator(creatorId);
  const creatorHasHistory =
    fetchedLearnings && fetchedLearnings.length > 0;
  const learnings = creatorHasHistory
    ? fetchedLearnings
    : DEFAULT_LEARNINGS;

  const ranked = rankLearnings(learnings);
  const top = selectTopLearnings(ranked);
  const score = scoreAudit(ranked);

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

  console.log('[JARVIS Phase 8A Export]', {
    creatorId,
    creatorHasHistory,
    signalScores: {
      transformation: detailedSignals.signals.transformation.score,
      curiosity: detailedSignals.signals.curiosity.score,
      stakes: detailedSignals.signals.stakes.score
    },
    primaryGap: reasoning.primaryGap
      ? {
          pattern: reasoning.primaryGap.pattern.slice(0, 40),
          gapScore: reasoning.primaryGap.gapScore
        }
      : null,
    overallRecommendationConfidence:
      reasoning.overallRecommendationConfidence
  });

  const brief = await generateViralBrief(
    creatorId,
    top,
    score,
    reasoning,
    topic,
    videoTitle,
    transcript
  );

  const pdfBuffer = await renderViralBriefPDF(brief);

  const elapsed = Date.now() - start;
  console.log(`[JARVIS] viral-direct-export completed in ${elapsed}ms`);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        `attachment; filename="jarvis-content-code-brief.pdf"`
    }
  });
}
