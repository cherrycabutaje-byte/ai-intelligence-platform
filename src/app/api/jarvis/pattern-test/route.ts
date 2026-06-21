import { NextResponse } from 'next/server';
import { getLearningsByCreator }
  from '@/lib/human-behavior/creator-learning-repository';
import { rankLearnings }
  from '@/lib/coaching/learning-ranker';
import { selectTopLearnings }
  from '@/lib/coaching/top-learning-selector';
import { detectSignals }
  from '@/lib/coaching/content-signal-engine';
import { matchPatterns }
  from '@/lib/coaching/creator-pattern-matcher';

const TRANSCRIPTS: Record<string, string> = {
  christine: "welcome to my channel are you looking to bring some positive energy good luck and prosperity into your living space in this video we ll introduce you to 10 beautiful indoor plants that are believed to attract Good Fortune wealth and Tranquility whether you re a seasoned plant enthusiast or just starting out these plants are perfect for any home first on our list is the jade plant also known as CA OVA this succulent not only looks beautiful with its thick shiny leaves but is also believe to bring prosperity and financial luck place it near the entrance of your home to invite positive energy and wealth next up we have the lucky bamboo known for its slender elegant stocks and minimalist style this plant is a popular choice for attracting good fortune and health ensure it s placed in a spot with indirect sunlight there you have it our top 10 lucky indoor plants not only do these plants look amazing but they also bring positive energy and good fortune into your home have any of these plants brought you luck let us know in the comments below don t forget to like share and subscribe",

  selfHelp: "In this video I am going to say something that is going to make a lot of you feel uncomfortable. Three years ago I was afraid to leave home. I was stuck waiting for someone to give me a sign. I almost gave up everything I had worked for. But that moment when I realized nobody was coming to save me was the turning point. Today I live in Greece with nothing but a backpack and a laptop. I learned that the cost of waiting is your entire life. If you do not act now what happens next is on you. The moment you stop expecting someone to fix it is the moment you become dangerous. Stay with me because what I am about to tell you will change how you see everything."
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creatorId =
    searchParams.get('creatorId') ?? 'christine';
  const transcriptKey =
    searchParams.get('transcript') ?? 'christine';

  const transcript =
    TRANSCRIPTS[transcriptKey] ?? TRANSCRIPTS.christine;

  const learnings =
    await getLearningsByCreator(creatorId);

  if (!learnings || learnings.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'No learnings found for creator'
    });
  }

  const ranked = rankLearnings(learnings);
  const top = selectTopLearnings(ranked);
  const detailedSignals = detectSignals(transcript);
  const patternMatches = matchPatterns(top, detailedSignals);

  return NextResponse.json({
    success: true,
    creatorId,
    transcript: transcriptKey,
    signalScores: {
      transformation: detailedSignals.signals.transformation.score,
      curiosity: detailedSignals.signals.curiosity.score,
      stakes: detailedSignals.signals.stakes.score
    },
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
