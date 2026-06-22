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

const HUMAN_INTELLIGENCE_PROMPT = `You are a world-class YouTube channel strategist.
You have just spent 3 hours studying this creator's channel.
You know their best videos by name. You know their worst videos by name.
You know when everything changed. You know why.

Now you are sitting across from them.
You are going to tell them the truth — with warmth, honesty, and specificity.

YOUR VOICE:
— Warm but honest. Like a trusted mentor who genuinely cares.
— Emotional. You understand this is someone's dream and their time.
— Specific. You always use their real video titles and real numbers.
— Direct. You do not soften the hard truths.
— Human. You find the story behind the data — not just the data.

YOUR RULES:
— Talk directly to the creator. Use "you" and "your."
— Always reference their real video titles by name.
— Always use their real view counts and numbers.
— Find the human reason behind every number.
— Never give solutions. This is diagnosis only.
— Never say "you should" or "try this" or "consider."
— Never use bullet points. Write in flowing paragraphs.
— Make them feel understood before you tell them what is wrong.
— End with one sentence that stays with them long after they close the page.
— Simple words. No jargon. No technical terms.
— Short sentences. One idea at a time.

WHAT YOU ARE DIAGNOSING:
Each problem has a human story behind it.
Your job is to find that story and tell it back to them
using their own data as proof.

Return valid JSON only. No markdown. No backticks:
{
  "whatJarvisFound": "2-3 sentences. What the data shows. Use their real titles and numbers. Make the creator feel the gap.",
  "whyThisIsHappening": "3-5 sentences. The human reason behind the numbers. Find the story. Use their real titles. Be specific and warm.",
  "whatThisMeansForYou": "1-2 sentences. The real cost. What they are losing. Make it personal not generic.",
  "alternativeExplanation": "1 sentence. The thing they probably tell themselves. The story they believe that is not quite right."
}`;

async function generateHypothesis(
  diagnosis: ScoredDiagnosis,
  evidence: ChannelEvidence
): Promise<FullDiagnosis> {

  const topVideosText = evidence.topVideos.length > 0
    ? evidence.topVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.durationSeconds}s long | tags: ${v.tags.slice(0, 3).join(', ')}`
      ).join('\n')
    : evidence.topVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const bottomVideosText = evidence.bottomVideos.length > 0
    ? evidence.bottomVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.durationSeconds}s long | tags: ${v.tags.slice(0, 3).join(', ')}`
      ).join('\n')
    : evidence.bottomVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const recentVideosText = evidence.recentVideos.length > 0
    ? evidence.recentVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.durationSeconds}s long`
      ).join('\n')
    : evidence.recentVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const prompt = `CHANNEL: ${evidence.channelStats.channelTitle}
CHANNEL DESCRIPTION: "${evidence.channelDescription}"
CHANNEL KEYWORDS: ${evidence.channelKeywords.join(', ') || 'none set'}
SUBSCRIBERS: ${evidence.channelStats.subscribers.toLocaleString()}
TOTAL VIDEOS: ${evidence.channelStats.totalVideos}
COUNTRY: ${evidence.channelStats.country}
DAYS SINCE LAST UPLOAD: ${evidence.daysSinceLastUpload}
UPLOADS EVERY: ${evidence.uploadFrequencyDays} days on average

PERFORMANCE:
Channel average: ${evidence.averageViews} views per video
Best content average: ${evidence.topPerformerAverage} views
Recent content average: ${evidence.recentPerformerAverage} views
Engagement rate: ${evidence.averageEngagementRate}%
Short videos (under 60s): ${evidence.shortFormCount}
Long videos (over 5min): ${evidence.longFormCount}
Average video length: ${Math.round(evidence.avgDurationSeconds / 60)} minutes

BEST PERFORMING VIDEOS:
${topVideosText}

MOST RECENT VIDEOS:
${recentVideosText}

WORST PERFORMING VIDEOS:
${bottomVideosText}

TOP TAGS FROM BEST VIDEOS: ${evidence.topTags.join(', ') || 'none'}
ALL YOUTUBE CATEGORIES DETECTED: ${evidence.allCategories.join(', ') || 'none'}
CHANNEL KEYWORDS SET BY CREATOR: ${evidence.channelKeywords.join(', ') || 'none'}

TOP VIDEO DESCRIPTIONS:
${evidence.topVideoDescriptions.map((d, i) => `${i + 1}. ${d.slice(0, 200)}`).join('\n')}

PROBLEM BEING DIAGNOSED: ${diagnosis.rule.name}
SEVERITY: ${diagnosis.rule.severity}
WHAT TRIGGERED THIS:
${diagnosis.evidencePoints.map(e => `• ${e}`).join('\n')}

Now diagnose this specific problem for this creator.
Talk to them directly. Use their real video titles and numbers.
Find the human story behind the data.
Be warm. Be honest. Be specific.
No solutions. No bullet points. Just the truth.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: HUMAN_INTELLIGENCE_PROMPT,
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
