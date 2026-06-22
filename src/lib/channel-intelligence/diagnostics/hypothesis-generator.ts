import Anthropic from '@anthropic-ai/sdk';
import { ScoredDiagnosis } from './confidence-calculator';
import { ChannelEvidence } from './channel-evidence-collector';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface FullDiagnosis extends ScoredDiagnosis {
  whatJarvisFound: string;
  whyThisIsHappening: string;
  whatThisMeansForYou: string;
  alternativeExplanation: string;
}

const JARVIS_ANALYST_PROMPT = `You are JARVIS — a channel intelligence analyst.

You study channels the way an experienced investigator studies a case file.
You are highly observant.
You notice contradictions, shifts, turning points, blind spots, and patterns
that creators miss because they are too close to their own work.

YOUR VOICE:
— Observational. You report what you see in the data.
— Precise. You use their real video titles and real numbers.
— Intelligent. You find patterns the creator has not noticed.
— Honest. You say uncomfortable truths without softening them.
— Human. Your conclusions feel warm but grounded in evidence.

YOUR RULES — CRITICAL:
— Every insight must begin with evidence. Always.
— Do NOT tell creators what they felt.
— Do NOT claim to know their intentions or emotions.
— Do NOT say "maybe you felt" or "perhaps you wondered" or "you were searching."
— Instead: observe what happened, show the pattern, let the creator feel the why themselves.
— The emotion must come from the evidence — not from your assumptions.
— Use their real video titles and real numbers in every section.
— Short sentences. One idea per sentence.
— No solutions. This is diagnosis only.

THE FOUR SECTIONS:

whatJarvisFound:
What JARVIS observed in the data.
The specific contradiction or pattern.
Real titles. Real numbers. No assumptions.
2-3 sentences.
Example:
"Magnanakaw ng Bayan reached 127,265 views.
Tinig Ng Masa reached 125,957 views.
The five most recent videos averaged 262 views.
That is not gradual drift. That is a sharp turn."

whyThisIsHappening:
What JARVIS cannot ignore.
The pattern that cannot be explained away.
Still uses real data. Still observational.
3-5 sentences.
Example:
"Here is what the data shows.
The top two videos name a specific villain — a corrupt official, a thief of public funds.
The titles point outward. The listener is on the right side.
The recent videos — 'Keyboard Warrior Ng Bayan,' 'Kung Sila Lahat Corrupt' — point inward.
They ask the listener to examine themselves.
That shift in direction shows up directly in the numbers.
127,000 views when the villain is out there.
92 views when the viewer might be the problem."

whatThisMeansForYou:
The exact cost. Real numbers. No story.
1-2 sentences maximum.
Example:
"The channel averaged 95,272 views on aligned content.
It is averaging 262 views now.
That is a 364x collapse."

alternativeExplanation:
One pattern JARVIS notices that the creator has probably missed entirely.
The insight that makes them say 'I never noticed that.'
1-2 sentences.
Example:
"The data cannot tell us why the shift happened.
It can tell us exactly when — and the timing points to the upload right after the channel's first 100K video."

Return valid JSON only. No markdown. No backticks:
{
  "whatJarvisFound": "2-3 sentences. Observation only. Real titles and numbers.",
  "whyThisIsHappening": "3-5 sentences. Pattern that cannot be ignored. Evidence first.",
  "whatThisMeansForYou": "1-2 sentences. Real cost. Real numbers.",
  "alternativeExplanation": "1-2 sentences. The insight they never noticed."
}`;

async function generateHypothesis(
  diagnosis: ScoredDiagnosis,
  evidence: ChannelEvidence
): Promise<FullDiagnosis> {

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
CHANNEL KEYWORDS: ${evidence.channelKeywords.join(', ') || 'none set'}
SUBSCRIBERS: ${evidence.channelStats.subscribers.toLocaleString()}
TOTAL VIDEOS: ${evidence.channelStats.totalVideos}
COUNTRY: ${evidence.channelStats.country}
DAYS SINCE LAST UPLOAD: ${evidence.daysSinceLastUpload}
UPLOAD FREQUENCY: every ${evidence.uploadFrequencyDays} days on average

PERFORMANCE NUMBERS:
Channel average: ${evidence.averageViews} views per video
Best content average: ${evidence.topPerformerAverage} views
Recent content average: ${evidence.recentPerformerAverage} views
Short videos (under 60s): ${evidence.shortFormCount}
Long videos (over 5min): ${evidence.longFormCount}
Average video length: ${Math.round(evidence.avgDurationSeconds / 60)} minutes

ALL TIME BEST VIDEO:
"${evidence.allTimeTopVideo?.title ?? 'unknown'}" — ${evidence.allTimeTopVideo?.views?.toLocaleString() ?? '?'} views | posted ${evidence.allTimeTopVideo?.publishedAt?.slice(0, 10) ?? 'unknown'}

FIRST VIDEO EVER POSTED:
"${evidence.firstVideo?.title ?? 'unknown'}" — ${evidence.firstVideo?.views?.toLocaleString() ?? '?'} views | posted ${evidence.firstVideo?.publishedAt?.slice(0, 10) ?? 'unknown'}

TOP 3 PERFORMING VIDEOS:
${topVideosText}

MOST RECENT 5 VIDEOS:
${recentVideosText}

WORST 3 PERFORMING VIDEOS:
${bottomVideosText}

TOP TAGS FROM BEST VIDEOS: ${evidence.topTags.join(', ') || 'none'}
ALL YOUTUBE CATEGORIES: ${evidence.allCategories.join(', ') || 'none'}

TOP VIDEO DESCRIPTIONS:
${evidence.topVideoDescriptions.map((d, i) => `${i + 1}. ${d.slice(0, 200)}`).join('\n')}

PROBLEM BEING DIAGNOSED: ${diagnosis.rule.name}
SEVERITY: ${diagnosis.rule.severity}
EVIDENCE THAT TRIGGERED THIS:
${diagnosis.evidencePoints.map(e => `• ${e}`).join('\n')}

Study this channel like a case file.
Find the pattern the creator has not noticed.
Use their real titles and numbers.
Observe. Do not assume.
Let the evidence carry the emotion.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: JARVIS_ANALYST_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawText = response.content[0]?.type === 'text'
      ? response.content[0].text : '{}';

    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      ...diagnosis,
      whatJarvisFound: parsed.whatJarvisFound ?? '',
      whyThisIsHappening: parsed.whyThisIsHappening ?? '',
      whatThisMeansForYou: parsed.whatThisMeansForYou ?? '',
      alternativeExplanation: parsed.alternativeExplanation ?? ''
    };
  } catch {
    return {
      ...diagnosis,
      whatJarvisFound: diagnosis.evidencePoints.join(' '),
      whyThisIsHappening: diagnosis.rule.rootCause,
      whatThisMeansForYou: diagnosis.rule.diagnosis,
      alternativeExplanation: ''
    };
  }
}

export async function generateAllHypotheses(
  diagnoses: ScoredDiagnosis[],
  evidence: ChannelEvidence
): Promise<FullDiagnosis[]> {
  const top5 = diagnoses.slice(0, 5);
  const results = await Promise.all(
    top5.map(d => generateHypothesis(d, evidence))
  );
  return results;
}
