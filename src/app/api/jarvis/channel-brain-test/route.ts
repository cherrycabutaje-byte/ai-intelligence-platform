import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const CHANNEL_BRAIN_PROMPT = `You are the Channel Intelligence engine for JARVIS — a Creator Intelligence Platform.

Your job is to interpret channel data and tell creators what their data means about who they are.

You think using five combined frameworks simultaneously:

HORMOZI LENS — Business Pattern Recognition
Find the one thing that actually works and call out everything that doesn't.
Be direct about the math. Never soften the truth.
"Your best content performs 193x better. That is not luck. That is a signal."

JENNY HOYOS LENS — Curiosity Pattern Recognition
Look at what performs and find the curiosity pattern.
Look at what fails and find the missing curiosity.
"Your audience clicks on unresolved questions. Your worst videos answer the question in the title."

MRBEAST LENS — Stakes Pattern Recognition
Look at what performs and find what was at stake.
Look at what fails and find the absence of stakes.
"Your best video had something at risk. Your worst videos had nothing at stake for anyone."

DATA SCIENTIST LENS — Numbers Pattern Recognition
Read the numbers honestly. Find the signal in the gap.
Drift score. Alignment percentage. Gap ratio. Trend direction.
"18% alignment vs 71% historical average. 53-point drop in 30 days. This is significant."

THERAPIST LENS — Identity Pattern Recognition
Find the deeper identity truth behind the content patterns.
What is the creator really saying? What does the audience really want from them?
"They follow you for hope, not plant knowledge. The plant is just the door."

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

Return exactly this structure:
{
  "channelPositioning": {
    "whatYouSayYouAre": "one phrase — what the channel description suggests",
    "whatAudienceRespondsTo": "one phrase — what top videos actually show",
    "alignmentScore": 0,
    "interpretation": "2-4 sentences. What the gap between these two things means. No advice."
  },
  "creatorDNA": {
    "creatorType": "2-3 word label — Transformation Creator / Stakes Storyteller / etc",
    "interpretation": "2-4 sentences. What this pattern means in plain terms. Reference the confidence score and evidence. Make it feel real not generic."
  },
  "topPerformers": {
    "pattern": "one sentence — what the top videos have in common",
    "interpretation": "2-3 sentences. What this pattern reveals about the audience."
  },
  "bottomPerformers": {
    "pattern": "one sentence — what the bottom videos have in common",
    "interpretation": "2-3 sentences. What this pattern reveals about what does not work."
  },
  "audienceLoves": ["topic1", "topic2", "topic3", "topic4"],
  "audienceIgnores": ["topic1", "topic2", "topic3", "topic4"],
  "channelDrift": {
    "detected": true,
    "explanation": "2-4 sentences. What the drift data shows. When it started. What changed. No advice."
  },
  "biggestOpportunity": "3-5 sentences. The most important truth about this channel right now. What the data is pointing at. End with something that makes the creator want to ask JARVIS what to do next. No advice. No titles. No hooks. Just the truth."
}`;

function buildChannelPrompt(data: {
  channelTitle: string;
  subscribers: number;
  totalVideos: number;
  channelDescription: string;
  topVideos: Array<{ title: string; views: number }>;
  bottomVideos: Array<{ title: string; views: number }>;
  averageViews: number;
  gapRatio: number;
  recentVideos: Array<{ title: string; views: number }>;
  creatorDNA: {
    statement: string;
    confidence: number;
    evidencePoints: number;
  };
  driftAlignmentScore: number;
  historicalAlignmentScore: number;
}): string {
  return `Analyze this YouTube channel and produce the Channel Diagnosis.

CHANNEL: ${data.channelTitle}
SUBSCRIBERS: ${data.subscribers.toLocaleString()}
TOTAL VIDEOS: ${data.totalVideos}
CHANNEL DESCRIPTION: ${data.channelDescription}

PERFORMANCE DATA:
Average views per video: ${data.averageViews}
Gap ratio (best vs worst): ${data.gapRatio}x

TOP 3 PERFORMING VIDEOS:
${data.topVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

BOTTOM 3 PERFORMING VIDEOS:
${data.bottomVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

MOST RECENT 5 VIDEOS (for drift detection):
${data.recentVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

CREATOR DNA FROM CHANNEL HISTORY:
Strongest Pattern: ${data.creatorDNA.statement}
Confidence: ${data.creatorDNA.confidence}%
Evidence Points: ${data.creatorDNA.evidencePoints}

DRIFT ANALYSIS:
Recent content alignment with strongest pattern: ${data.driftAlignmentScore}%
Historical alignment average: ${data.historicalAlignmentScore}%
Drift detected: ${data.driftAlignmentScore < 40 ? 'YES' : 'NO'}

Now apply all five lenses simultaneously.
Hormozi: what is the one thing that works and what does not.
Jenny Hoyos: what curiosity patterns explain the performance gap.
MrBeast: what stakes patterns explain the performance gap.
Data Scientist: what do the numbers say honestly.
Therapist: what is the deeper identity truth this creator has not seen yet.

No advice. No titles. No hooks. Just the truth.`;
}

export async function POST(req: Request) {
  const body = await req.json();

  // Accept either real data or test data
  const channelData = body.channelData ?? {
    channelTitle: "Cherry Vibes",
    subscribers: 2300,
    totalVideos: 47,
    channelDescription: "Are you looking to bring some positive energy, good luck, and prosperity into your living space? Welcome to Cherry Vibes — your guide to lucky plants, feng shui, and positive home energy.",
    topVideos: [
      { title: "10 Indoor Plants That Bring Good Luck & Positive Energy to Your Home", views: 774 },
      { title: "Lucky Bamboo Care Guide — How To Keep Your Fortune Plant Thriving", views: 312 },
      { title: "5 Feng Shui Plants For Your Bedroom — Better Sleep and Energy", views: 287 }
    ],
    bottomVideos: [
      { title: "Mastering Conflict Resolution: Effective Strategies to Handle Arguments", views: 4 },
      { title: "The Scale: What No One Tells You About Gaining Weight", views: 29 },
      { title: "Morning Routine For Positive Energy — How I Start My Day", views: 31 }
    ],
    averageViews: 267,
    gapRatio: 193,
    recentVideos: [
      { title: "The Scale: What No One Tells You About Gaining Weight", views: 29 },
      { title: "Morning Routine For Positive Energy", views: 31 },
      { title: "Mastering Conflict Resolution", views: 4 },
      { title: "5 Feng Shui Plants For Your Bedroom", views: 287 },
      { title: "Lucky Bamboo Care Guide", views: 312 }
    ],
    creatorDNA: {
      statement: "Transformation titles outperform travel titles",
      confidence: 92,
      evidencePoints: 5
    },
    driftAlignmentScore: 18,
    historicalAlignmentScore: 71
  };

  const userPrompt = buildChannelPrompt(channelData);

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

  return NextResponse.json({
    success: true,
    diagnosis: parsed
  });
}
