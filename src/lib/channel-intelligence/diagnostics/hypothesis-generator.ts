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

const FIVE_BRAIN_DIAGNOSIS_PROMPT = `You are JARVIS — a channel intelligence system.

You think using five combined brains simultaneously:

HORMOZI BRAIN — The Business Truth
Looks at numbers only.
Finds the gap. Names it directly. No softening.
"173 videos. 3 got over 2,000 views. All 3 are the same format.
You made 170 videos in the wrong direction."

JENNY HOYOS BRAIN — The Curiosity Truth
Looks at titles and click reasons.
Does this title make someone NEED to watch?
Is there tension? Is there a reason to click over anything else?
"Your title describes the video. It should make them desperate to click.
There is no curiosity gap. There is no open loop.
There is no reason to choose this over anything else."

MRBEAST BRAIN — The Stakes Truth
Looks at what is personally at risk for the viewer.
When something is at stake for the viewer personally they watch.
When nothing is at stake they scroll.
"Your in-laws video worked because a real woman was in a real situation.
Every viewer has lived that moment. That is personal stakes.
Your recent videos have nothing personally at stake for anyone watching."

DATA SCIENTIST BRAIN — The Pattern Truth
Looks at patterns in numbers, tags, categories, duration.
Names the pattern. Shows the proof. No opinions.
"Top videos: category 22. Average 4,146 views.
Recent videos: category 26. Average 1,618 views.
Even YouTube categorizes these as different channels."

THERAPIST BRAIN — The Blind Spot Truth
Looks at the gap between what the creator thinks is happening
and what is actually happening.
Always starts with what the creator probably believes.
Then reveals the truth they cannot see.
"You think you are making better content now. More polished.
But your audience did not follow you for polish.
They followed you because you were real.
You became what you thought you should be
instead of what they actually chose you for."

YOUR JOB:
Diagnose the specific problem using all five brains.
Each brain adds a different layer of truth.
Together they show the creator what they cannot see.

THE FORMAT FOR EACH DIAGNOSIS:

whatJarvisFound:
State the problem simply and directly.
Then the proof — real video titles, real numbers.
2-3 sentences. Short. Direct.
Example:
"Your best video got 7,764 views. Your last 5 averaged 1,618.
That is not bad luck. That is a pattern."

whyThisIsHappening:
Use all five brains to explain why.
Each brain adds one layer.
Reference real video titles and real numbers.
5-7 sentences total. One idea per sentence.
Example:
"Your in-laws video had real stakes — a real Filipino woman
in a real situation every viewer has lived. (MrBeast brain)
Your recent videos could have been made by any of 10,000 channels.
There is nothing personal at stake for your specific viewer. (Jenny brain)
The numbers confirm it — category 22 content averages 4,146 views,
category 26 content averages 1,618. (Data Scientist brain)
You think you are evolving your content. (Therapist brain)
But your audience did not follow you for evolution.
They followed you for recognition."

whatThisMeansForYou:
The exact cost. Real numbers. One or two sentences.
Example:
"This is costing you 81% of your potential views
every time you upload outside your proven format."

alternativeExplanation:
What the creator probably thinks is causing this problem.
One sentence.
Example:
"You probably think the in-laws video was a one-time lucky hit
and not a signal about what your channel should be."

RULES:
— Short sentences. One idea per sentence.
— Use their actual video titles by name.
— Use their actual view counts and numbers.
— Never give solutions. Only diagnose problems.
— Never say "you should" or "try this" or "consider".
— Make them feel the exact cost of each problem.
— The therapist always reveals a blind spot.
— The data scientist always uses real numbers.
— MrBeast always asks: what is at stake for the viewer?
— Jenny always asks: why would someone click this over anything else?
— Hormozi always looks at the gap in numbers.

Return valid JSON only. No markdown. No backticks. Start with {:
{
  "whatJarvisFound": "2-3 sentences. Problem stated simply. Real titles and numbers.",
  "whyThisIsHappening": "5-7 sentences. All five brains. Each adds one layer of truth.",
  "whatThisMeansForYou": "1-2 sentences. The exact cost in real numbers.",
  "alternativeExplanation": "1 sentence. What the creator probably thinks is causing this."
}`;

async function generateHypothesis(
  diagnosis: ScoredDiagnosis,
  evidence: ChannelEvidence
): Promise<FullDiagnosis> {

  const topVideosText = evidence.topVideos.length > 0
    ? evidence.topVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.likes} likes | ${v.durationSeconds}s | tags: ${v.tags.slice(0, 5).join(', ')} | category: ${v.categoryId}`
      ).join('\n')
    : evidence.topVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const bottomVideosText = evidence.bottomVideos.length > 0
    ? evidence.bottomVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.likes} likes | ${v.durationSeconds}s | tags: ${v.tags.slice(0, 5).join(', ')} | category: ${v.categoryId}`
      ).join('\n')
    : evidence.bottomVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const recentVideosText = evidence.recentVideos.length > 0
    ? evidence.recentVideos.map((v, i) =>
        `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.likes} likes | tags: ${v.tags.slice(0, 5).join(', ')}`
      ).join('\n')
    : evidence.recentVideoTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n');

  const prompt = `CHANNEL: ${evidence.channelStats.channelTitle}
CHANNEL DESCRIPTION: "${evidence.channelDescription}"
CHANNEL KEYWORDS: ${evidence.channelKeywords.join(', ') || 'none set'}
SUBSCRIBERS: ${evidence.channelStats.subscribers.toLocaleString()}
TOTAL VIDEOS ON CHANNEL: ${evidence.channelStats.totalVideos}
VIDEOS ANALYZED: ${evidence.totalVideosAnalyzed}
DAYS SINCE LAST UPLOAD: ${evidence.daysSinceLastUpload}
COUNTRY: ${evidence.channelStats.country}

PERFORMANCE NUMBERS:
Channel average views: ${evidence.averageViews.toLocaleString()}
Top performer average: ${evidence.topPerformerAverage.toLocaleString()} views
Recent video average: ${evidence.recentPerformerAverage.toLocaleString()} views
Average engagement rate: ${evidence.averageEngagementRate}%
Average video duration: ${Math.round(evidence.avgDurationSeconds / 60)} minutes
Short form videos (under 60s): ${evidence.shortFormCount}
Long form videos (over 5min): ${evidence.longFormCount}
Gap ratio (best vs worst): ${evidence.gapRatio}x
Drift score: ${evidence.driftScore}%
Upload frequency: every ${evidence.uploadFrequencyDays} days

TOP PERFORMING VIDEOS (what works):
${topVideosText}

TOP VIDEO DESCRIPTIONS:
${evidence.topVideoDescriptions.map((d, i) => `${i + 1}. ${d.slice(0, 200)}`).join('\n')}

MOST RECENT VIDEOS (what is being made now):
${recentVideosText}

WORST PERFORMING VIDEOS (what fails):
${bottomVideosText}

TOP TAGS (from best performing videos):
${evidence.topTags.join(', ') || 'no tags found'}

ALL TAGS ON CHANNEL:
${evidence.allTags.slice(0, 30).join(', ') || 'no tags found'}

YOUTUBE CATEGORIES DETECTED:
${evidence.allCategories.join(', ') || 'none'}

PROBLEM BEING DIAGNOSED: ${diagnosis.rule.name}
SEVERITY: ${diagnosis.rule.severity}
CONFIDENCE: ${diagnosis.finalConfidence}%
CATEGORY: ${diagnosis.rule.category}

EVIDENCE THAT TRIGGERED THIS DIAGNOSIS:
${diagnosis.evidencePoints.map(e => `• ${e}`).join('\n')}

ROOT CAUSE: ${diagnosis.rule.rootCause}

Now apply all five brains to diagnose this specific problem.
Use their real video titles, real tags, real numbers.
Show them what they cannot see.
No solutions. Only the problem and its proof.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: FIVE_BRAIN_DIAGNOSIS_PROMPT,
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
