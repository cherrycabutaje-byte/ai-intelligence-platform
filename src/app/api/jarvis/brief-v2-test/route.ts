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

const PLANT_TRANSCRIPT = "welcome to my channel are you looking to bring some positive energy good luck and prosperity into your living space in this video we ll introduce you to 10 beautiful indoor plants that are believed to attract Good Fortune wealth and Tranquility whether you re a seasoned plant enthusiast or just starting out these plants are perfect for any home first on our list is the jade plant also known as CA OVA this succulent not only looks beautiful with its thick shiny leaves but is also believe to bring prosperity and financial luck place it near the entrance of your home to invite positive energy and wealth next up we have the lucky bamboo known for its slender elegant stocks and minimalist style this plant is a popular choice for attracting good fortune and health there you have it our top 10 lucky indoor plants not only do these plants look amazing but they also bring positive energy and good fortune into your home have any of these plants brought you luck let us know in the comments below don t forget to like share and subscribe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creatorId') ?? 'christine';

  const learnings = await getLearningsByCreator(creatorId);
  const creatorHasHistory = learnings && learnings.length > 0;

  const defaultLearnings = creatorHasHistory ? learnings : [
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
    }
  ];

  const ranked = rankLearnings(defaultLearnings);
  const top = selectTopLearnings(ranked);
  const score = scoreAudit(ranked);
  const detailedSignals = detectSignals(PLANT_TRANSCRIPT);
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
    undefined,
    '10 Indoor Plants That Bring Good Luck & Positive Energy to Your Home',
    PLANT_TRANSCRIPT
  );

  return NextResponse.json({
    success: true,
    whyJarvisBelievesThis: brief.whyJarvisBelievesThis,
    verdict: brief.verdict,
    viralScore: brief.viralScore,
    stopDoing: brief.stopDoing,
    viralBet: brief.viralBet,
    coachingSignOff: brief.coachingSignOff
  });
}
