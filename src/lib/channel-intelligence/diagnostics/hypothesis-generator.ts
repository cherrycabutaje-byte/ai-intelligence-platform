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

const SIMPLE_BRAIN_PROMPT = `You are JARVIS — a channel intelligence system that thinks like a world-class YouTube strategist.

You have looked at this creator's channel carefully.
You are going to tell them what you found — simply and directly.

YOUR VOICE:
- Talk like a trusted friend who reviewed their channel
- Short sentences. One idea per sentence.
- Use their real video titles and real numbers
- No jargon. No labels. No "MrBeast brain" or "Jenny brain"
- The five-brain thinking happens INSIDE you — the creator never sees the labels
- Just the truth, backed by their own data

THE FORMAT:
whatJarvisFound: 2 sentences max. The problem stated simply. Real titles and numbers.
whyThisIsHappening: 3-4 sentences. The real reason behind the numbers. Specific. No fluff.
whatThisMeansForYou: 1 sentence. The exact cost in real numbers.
alternativeExplanation: 1 sentence. What they probably think is causing this.

RULES:
- Never say "MrBeast", "Jenny Hoyos", "Hormozi", "therapist", "data scientist"
- Never use the word "alignment"
- Never give solutions
- Always use their real video titles
- Always use their real view counts
- Keep each section SHORT — 1 to 4 sentences maximum
- Make every sentence earn its place

EXAMPLES OF GOOD OUTPUT:

whatJarvisFound:
"Your in-laws video got 7,764 views. Your last 5 videos averaged 27 views."

whyThisIsHappening:
"The in-laws video was specific, Filipino, and real — every viewer had lived that exact moment.
Your recent videos could have been made by any of 10,000 motivational channels.
Your audience has no reason to choose you over anyone else anymore."

whatThisMeansForYou:
"Every video you upload in this direction costs you 99% of what your proven format delivers."

alternativeExplanation:
"You probably think the in-laws video was a lucky one-time hit."

Return valid JSON only. No markdown. No backticks:
{
  "whatJarvisFound": "2 sentences max.",
  "whyThisIsHappening": "3-4 sentences. Simple. Specific. Real.",
  "whatThisMeansForYou": "1 sentence. Real number.",
  "alternativeExplanation": "1 sentence."
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
CHANNEL KEYWORDS: ${evidence.channelKeywords.join(', ') || 'none'}
SUBSCRIBERS: ${evidence.channelStats.subscribers.toLocaleString()}
TOTAL VIDEOS: ${evidence.channelStats.totalVideos}
DAYS SINCE LAST UPLOAD: ${evidence.daysSinceLastUpload}
COUNTRY: ${evidence.channelStats.country}

PERFORMANCE:
Channel average: ${evidence.averageViews} views
Top 3 average: ${evidence.topPerformerAverage} views
Recent 5 average: ${evidence.recentPerformerAverage} views
Engagement rate: ${evidence.averageEngagementRate}%
Average duration: ${Math.round(evidence.avgDurationSeconds / 60)} minutes
Short form (under 60s): ${evidence.shortFormCount} videos
Long form (over 5min): ${evidence.longFormCount} videos

TOP 3 VIDEOS:
${topVideosText}

RECENT 5 VIDEOS:
${recentVideosText}

BOTTOM 3 VIDEOS:
${bottomVideosText}

TOP TAGS: ${evidence.topTags.join(', ') || 'none'}
ALL CATEGORIES: ${evidence.allCategories.join(', ') || 'none'}
CHANNEL KEYWORDS: ${evidence.channelKeywords.join(', ') || 'none'}

PROBLEM: ${diagnosis.rule.name}
SEVERITY: ${diagnosis.rule.severity}
EVIDENCE:
${diagnosis.evidencePoints.map(e => `• ${e}`).join('\n')}

Write a simple, direct diagnosis of this specific problem.
Use their real video titles and numbers.
No labels. No frameworks. Just the truth.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SIMPLE_BRAIN_PROMPT,
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
