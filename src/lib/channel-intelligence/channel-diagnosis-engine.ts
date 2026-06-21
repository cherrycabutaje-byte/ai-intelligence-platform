// @ts-nocheck
import Anthropic from '@anthropic-ai/sdk';
import {
  fetchChannelStats,
  fetchVideoStats,
  resolveChannelId,
  VideoStats,
  ChannelStats
} from '@/lib/youtube/channel-video-collector';
import { getLearningsByCreator }
  from '@/lib/human-behavior/creator-learning-repository';
import { rankLearnings }
  from '@/lib/coaching/learning-ranker';
import { selectTopLearnings }
  from '@/lib/coaching/top-learning-selector';
import { detectSignals }
  from '@/lib/coaching/content-signal-engine';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const CHANNEL_BRAIN_PROMPT = `You are the Channel Intelligence engine for JARVIS — a Creator Intelligence Platform.

Your job is to interpret channel data and tell creators what their data means about who they are.

You think using five combined frameworks simultaneously:

HORMOZI LENS — Business Pattern Recognition
Find the one thing that actually works and call out everything that doesn't.
Be direct about the math. Never soften the truth.

JENNY HOYOS LENS — Curiosity Pattern Recognition
Look at what performs and find the curiosity pattern.
Look at what fails and find the missing curiosity.

MRBEAST LENS — Stakes Pattern Recognition
Look at what performs and find what was at stake.
Look at what fails and find the absence of stakes.

DATA SCIENTIST LENS — Numbers Pattern Recognition
Read the numbers honestly. Find the signal in the gap.
Drift score. Alignment percentage. Gap ratio. Trend direction.

THERAPIST LENS — Identity Pattern Recognition
Find the deeper identity truth behind the content patterns.
What is the creator really saying? What does the audience really want from them?

YOUR RULES:
— Never give advice
— Never suggest titles, hooks, or scripts
— Never say "you should" or "try this" or "consider"
— Only say what the data shows
— Speak in short direct paragraphs
— Maximum 4 sentences per section
— End every section with one true sentence that makes the creator want to understand more
— The solution is JARVIS's job — your job is diagnosis only

CRITICAL: Respond with valid JSON only. No prose. No markdown. Start with { end with }.

Return exactly this structure — add whyPeopleFollowYou before biggestOpportunity:
{
  "channelPositioning": {
    "whatYouSayYouAre": "one phrase",
    "whatAudienceRespondsTo": "one phrase",
    "alignmentScore": 0,
    "interpretation": "2-4 sentences. No advice."
  },
  "creatorDNA": {
    "creatorType": "2-3 word label",
    "interpretation": "2-4 sentences. Make it feel real not generic."
  },
  "topPerformers": {
    "pattern": "one sentence — what top videos have in common",
    "interpretation": "2-3 sentences."
  },
  "bottomPerformers": {
    "pattern": "one sentence — what bottom videos have in common",
    "interpretation": "2-3 sentences."
  },
  "audienceLoves": ["topic1", "topic2", "topic3", "topic4"],
  "audienceIgnores": ["topic1", "topic2", "topic3", "topic4"],
  "channelDrift": {
    "detected": true,
    "explanation": "2-4 sentences. What the drift data shows."
  },
  "whyPeopleFollowYou": "2-3 sentences. The real reason the audience follows this creator. Not the surface reason. The emotional truth underneath. Start with what people think they follow this creator for. Then reveal what they actually follow them for.",
  "contentAudienceRejects": [{"topic": "topic name", "averageViews": 0, "reason": "one sentence why this fails with this audience"}],
  "costOfDrift": {
    "alignedAverageViews": 0,
    "misalignedAverageViews": 0,
    "performanceLossPercent": 0,
    "interpretation": "one sentence about what this gap means"
  },
  "biggestOpportunity": "3-5 sentences. The most important truth about this channel right now. No advice. No titles. Just the truth."
}`;

export interface ChannelDiagnosis {
  channelId: string;
  creatorId: string;
  generatedAt: string;
  channelStats: ChannelStats;
  topVideos: VideoStats[];
  bottomVideos: VideoStats[];
  averageViews: number;
  gapRatio: number;
  recentVideos: VideoStats[];
  driftAlignmentScore: number;
  historicalAlignmentScore: number;
  diagnosis: {
    channelPositioning: {
      whatYouSayYouAre: string;
      whatAudienceRespondsTo: string;
      alignmentScore: number;
      interpretation: string;
    };
    creatorDNA: {
      creatorType: string;
      interpretation: string;
    };
    topPerformers: {
      pattern: string;
      interpretation: string;
    };
    bottomPerformers: {
      pattern: string;
      interpretation: string;
    };
    audienceLoves: string[];
    audienceIgnores: string[];
    channelDrift: {
      detected: boolean;
      explanation: string;
    };
    whyPeopleFollowYou: string;
    contentAudienceRejects: Array<{ topic: string; averageViews: number; reason: string }>;
    costOfDrift: {
      alignedAverageViews: number;
      misalignedAverageViews: number;
      performanceLossPercent: number;
      interpretation: string;
    };
    biggestOpportunity: string;
  };
}

function calculateStats(videos: VideoStats[]) {
  if (videos.length === 0) return {
    top: [], bottom: [], average: 0, gapRatio: 0, recent: []
  };

  const sorted = [...videos].sort((a, b) => b.views - a.views);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-3).reverse();
  const average = Math.round(
    videos.reduce((sum, v) => sum + v.views, 0) / videos.length
  );
  const gapRatio = bottom[0]?.views > 0
    ? Math.round(top[0].views / bottom[0].views)
    : top[0]?.views ?? 0;

  // Recent = last 5 by date
  const recent = [...videos]
    .sort((a, b) =>
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
    )
    .slice(0, 5);

  return { top, bottom, average, gapRatio, recent };
}

function calculateDriftScore(
  recentVideos: VideoStats[]
): number {
  if (recentVideos.length === 0) return 0;
  const combinedTitles = recentVideos
    .map(v => v.title).join(' ');
  const signals = detectSignals(combinedTitles);
  return Math.round(
    (signals.signals.transformation.score +
      signals.signals.curiosity.score) / 2
  );
}

export async function runChannelDiagnosis(
  channelIdentifier: string,
  creatorId: string
): Promise<ChannelDiagnosis> {

  // Resolve channel ID
  const channelId = await resolveChannelId(channelIdentifier)
    ?? channelIdentifier;

  // Fetch channel stats and video stats in parallel
  const [channelStats, videos] = await Promise.all([
    fetchChannelStats(channelId),
    fetchVideoStats(channelId)
  ]);

  // Calculate performance stats
  const { top, bottom, average, gapRatio, recent } =
    calculateStats(videos);

  // Get creator learnings from Supabase
  const learnings = await getLearningsByCreator(creatorId);
  const ranked = learnings && learnings.length > 0
    ? rankLearnings(learnings) : [];
  const topLearnings = selectTopLearnings(ranked);
  const primaryLearning = topLearnings[0];

  // Calculate drift
  const driftScore = calculateDriftScore(recent);
  const historicalScore = primaryLearning
    ? primaryLearning.learning.confidence : 70;

  // Build Claude prompt
  const userPrompt = `Analyze this YouTube channel and produce the Channel Diagnosis.

CHANNEL: ${channelStats.channelTitle}
SUBSCRIBERS: ${channelStats.subscribers.toLocaleString()}
TOTAL VIDEOS: ${channelStats.totalVideos}
CHANNEL DESCRIPTION: ${channelStats.description.slice(0, 300)}

PERFORMANCE DATA:
Average views per video: ${average}
Gap ratio (best vs worst): ${gapRatio}x

TOP 3 PERFORMING VIDEOS:
${top.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

BOTTOM 3 PERFORMING VIDEOS:
${bottom.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

MOST RECENT 5 VIDEOS:
${recent.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

CREATOR DNA:
Strongest Pattern: ${primaryLearning?.learning.statement ?? 'No history yet'}
Confidence: ${primaryLearning?.learning.confidence ?? 0}%
Evidence Points: ${primaryLearning?.learning.supportingEvidenceCount ?? 0}

DRIFT ANALYSIS:
Recent content alignment: ${driftScore}%
Historical alignment: ${historicalScore}%
Drift detected: ${driftScore < 40 ? 'YES' : 'NO'}

Apply all five lenses. No advice. No titles. Just the truth.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: CHANNEL_BRAIN_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const rawText = response.content[0]?.type === 'text'
    ? response.content[0].text : '{}';

  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    channelId,
    creatorId,
    generatedAt: new Date().toISOString(),
    channelStats,
    topVideos: top,
    bottomVideos: bottom,
    averageViews: average,
    gapRatio,
    recentVideos: recent,
    driftAlignmentScore: driftScore,
    historicalAlignmentScore: historicalScore,
    diagnosis: parsed
  };
}







