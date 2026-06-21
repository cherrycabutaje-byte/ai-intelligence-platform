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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creatorId');
  const topic = searchParams.get('topic') ?? undefined;
  const videoUrl = searchParams.get('videoUrl') ?? undefined;

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

  let videoTitle: string | undefined;
  let transcript: string | undefined;

  if (videoUrl) {
    const baseUrl = new URL(req.url).origin;
    const scrapeRes = await fetch(
      `${baseUrl}/api/jarvis/scrape`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, platform: 'YouTube' })
      }
    );
    const scrapeData = await scrapeRes.json();
    videoTitle = scrapeData.scraped_data?.title ?? undefined;
    transcript = scrapeData.scraped_data?.transcript ?? undefined;
  }

  const detailedSignals = transcript
    ? detectSignals(transcript)
    : detectSignals('');

  const patternMatches = matchPatterns(top, detailedSignals);

  const reasoning = buildStrategicReasoning(
    patternMatches,
    creatorHasHistory ?? false
  );

  const brief = await generateViralBrief(
    creatorId,
    top,
    score,
    reasoning,
    topic,
    videoTitle,
    transcript
  );

  return NextResponse.json({
    success: true,
    brief
  });
}
