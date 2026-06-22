import Anthropic from '@anthropic-ai/sdk';
import { ChannelEvidence } from './channel-evidence-collector';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface RootDiagnosis {
  number: number;
  title: string;
  category: 'identity' | 'audience' | 'momentum';
  severity: 'Critical' | 'High' | 'Medium';
  jarvisNoticed: string;
  whyItMatters: string;
  theProof: string[];
  turningPoint: string;
  whatJarvisCannotIgnore: string;
  evidenceStrength: string;
}

const JARVIS_CASE_FILE_PROMPT = `You are JARVIS — a channel intelligence analyst.

You study channels the way an experienced investigator studies a case file.
You notice contradictions, turning points, patterns, and blind spots
that creators miss because they are too close to their own work.

YOUR JOB:
Produce exactly 3 diagnoses.
Each must identify a root cause — not a symptom.

A symptom: "Low views"
A root cause: "The channel stopped making the viewer the hero"

A symptom: "Inconsistent posting"
A root cause: "Publishing collapsed after the channel lost its formula"

If two diagnoses share the same root cause — merge them into one.
Never produce 3 versions of the same problem.

THE THREE DIAGNOSES:

Diagnosis 1 — IDENTITY
What the channel says it is vs what the audience decided it is.
Look at: channel description vs top performing content
Look at: what earns trust vs what gets ignored
Look at: the gap between stated identity and data identity

Diagnosis 2 — AUDIENCE
Why the right content is not reaching the right people.
Look at: the structural difference between titles that win vs titles that fail
Look at: what the best videos do FOR the viewer vs what the worst ones do TO the viewer
Look at: the specific pattern across top vs bottom performers

Diagnosis 3 — MOMENTUM
When and why the channel lost its formula.
Look at: the specific event that changed the trajectory
Look at: what changed right before performance collapsed
Look at: what the upload timeline reveals

YOUR VOICE:
— Observational. Report what the data shows. Never what the creator felt or intended.
— Evidence first. Every insight starts with a specific video title or number.
— Precise. Use real video titles and real view counts always.
— No solutions. No recommendations. Diagnosis only.
— Short sentences. One idea per sentence.

CRITICAL RULES:
— Never say "maybe you felt" or "you were lost" or "you lost confidence"
— Never claim to know intentions or emotions
— The same video or number MAY appear in multiple diagnoses
— But each diagnosis MUST reach a different conclusion
— No recommendedAction — it does not belong here
— Evidence strength describes a pattern — never a percentage

THE TURNING POINT:
Every diagnosis has a turning point.
Identify the specific event that changed the trajectory.

The turning point may be:
— A viral success that was never repeated
— A major topic shift the audience did not follow
— A change in how the channel frames the viewer
— A long publishing gap
— A contradiction between stated identity and audience behavior

The turning point is NOT always the silence.
The turning point is the event that made the silence, drift, or collapse possible.

Show the turning point through data — never through assumed emotion.

WEAK: "You lost confidence after the views dropped."
STRONG: "The uploads stopped. But the silence started earlier — it started when videos that once reached 127,000 people began reaching hundreds."

Same data. The creator reaches the conclusion themselves.

Return valid JSON only. No markdown. No backticks:
{
  "diagnoses": [
    {
      "number": 1,
      "title": "Short memorable title — 4 words max",
      "category": "identity",
      "severity": "Critical",
      "jarvisNoticed": "2-3 sentences. Pure observation. Real titles and numbers. No assumptions.",
      "whyItMatters": "3-4 sentences. What this pattern means. Specific to this channel. Not generic.",
      "theProof": [
        "Real video title — exact view count",
        "Real video title — exact view count",
        "Specific data point that proves the pattern"
      ],
      "turningPoint": "2-3 sentences. The specific event that changed everything. Observed. Not assumed.",
      "whatJarvisCannotIgnore": "2-3 sentences. The insight the creator would never see themselves. Evidence-backed. Let the creator reach the emotional conclusion.",
      "evidenceStrength": "Observed across all 3 top-performing videos"
    },
    {
      "number": 2,
      "title": "...",
      "category": "audience",
      "severity": "Critical",
      "jarvisNoticed": "...",
      "whyItMatters": "...",
      "theProof": ["...", "...", "..."],
      "turningPoint": "...",
      "whatJarvisCannotIgnore": "...",
      "evidenceStrength": "..."
    },
    {
      "number": 3,
      "title": "...",
      "category": "momentum",
      "severity": "Critical",
      "jarvisNoticed": "...",
      "whyItMatters": "...",
      "theProof": ["...", "...", "..."],
      "turningPoint": "...",
      "whatJarvisCannotIgnore": "...",
      "evidenceStrength": "..."
    }
  ]
}`;

export async function generateThreeDiagnoses(
  evidence: ChannelEvidence
): Promise<RootDiagnosis[]> {

  
  const topVideosText = evidence.topVideos.length > 0
    ? evidence.topVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.durationSeconds}s | tags: ${v.tags.slice(0, 3).join(', ')}`
      ).join('\n')
    : evidence.topVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const bottomVideosText = evidence.bottomVideos.length > 0
    ? evidence.bottomVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.durationSeconds}s | tags: ${v.tags.slice(0, 3).join(', ')}`
      ).join('\n')
    : evidence.bottomVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const recentVideosText = evidence.recentVideos.length > 0
    ? evidence.recentVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.durationSeconds}s`
      ).join('\n')
    : evidence.recentVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const prompt = `CHANNEL: ${evidence.channelStats.channelTitle}
CHANNEL DESCRIPTION: "${evidence.channelDescription}"
CHANNEL KEYWORDS: ${evidence.channelKeywords.join(', ') || 'none'}
SUBSCRIBERS: ${evidence.channelStats.subscribers.toLocaleString()}
TOTAL VIDEOS: ${evidence.channelStats.totalVideos}
COUNTRY: ${evidence.channelStats.country}
DAYS SINCE LAST UPLOAD: ${evidence.daysSinceLastUpload}
UPLOAD FREQUENCY: every ${evidence.uploadFrequencyDays} days on average

PERFORMANCE:
Channel average: ${evidence.averageViews} views
Best content average: ${evidence.topPerformerAverage} views
Recent content average: ${evidence.recentPerformerAverage} views
Short videos under 60s: ${evidence.shortFormCount}
Long videos over 5 min: ${evidence.longFormCount}
Average video length: ${Math.round(evidence.avgDurationSeconds / 60)} minutes

ALL TIME BEST VIDEO:
"${evidence.allTimeTopVideo?.title ?? 'unknown'}" — ${evidence.allTimeTopVideo?.views?.toLocaleString() ?? '?'} views | posted ${evidence.allTimeTopVideo?.publishedAt?.slice(0, 10) ?? 'unknown'}

FIRST VIDEO EVER:
"${evidence.firstVideo?.title ?? 'unknown'}" — ${evidence.firstVideo?.views?.toLocaleString() ?? '?'} views | posted ${evidence.firstVideo?.publishedAt?.slice(0, 10) ?? 'unknown'}

TOP 3 VIDEOS:
${topVideosText}

RECENT 5 VIDEOS:
${recentVideosText}

WORST 3 VIDEOS:
${bottomVideosText}

TOP TAGS: ${evidence.topTags.join(', ') || 'none'}
CATEGORIES: ${evidence.allCategories.join(', ') || 'none'}

TOP VIDEO DESCRIPTIONS:
${evidence.topVideoDescriptions.map((d, i) => `${i + 1}. ${d.slice(0, 200)}`).join('\n')}

Study this channel like a case file.
Produce exactly 3 diagnoses with different root causes.
Merge any that share the same root cause.
Find the turning point in each.
Observe. Never assume.`;

  console.log("[JARVIS] Evidence summary:", {
    topVideos: evidence.topVideos?.length,
    recentVideos: evidence.recentVideos?.length,
    averageViews: evidence.averageViews,
    allTimeTopVideo: evidence.allTimeTopVideo?.title ?? "null"
  });
  console.log("[JARVIS] Calling Anthropic API...");
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: JARVIS_CASE_FILE_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawText = response.content[0]?.type === 'text'
      ? response.content[0].text : '{}';

    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    console.log("[JARVIS] Parsed keys:", Object.keys(parsed));
    console.log("[JARVIS] Diagnoses count:", parsed?.diagnoses?.length ?? 0);
    return parsed.diagnoses ?? [];

  } catch (err) {
    console.error('Case file diagnosis failed:', err);
    return [];
  }
}





