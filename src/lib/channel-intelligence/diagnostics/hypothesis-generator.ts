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

const HYPOTHESIS_PROMPT = `You are a straight-talking YouTube channel analyst.
A creator is reading this diagnosis about their channel.
You have the evidence. Now explain it in plain simple words.

RULES:
- Write like you are talking to a friend
- No jargon. No technical words.
- Short sentences. Direct.
- Reference the actual numbers and titles from the evidence
- Never say "alignment" or "metrics" or "KPI"
- Never give advice — that is not your job here
- Just tell them what you see and why it is happening

Return valid JSON only:
{
  "whatJarvisFound": "2-3 sentences. What the data shows. Use their actual numbers and video titles.",
  "whyThisIsHappening": "2-3 sentences. The real reason behind what the data shows. Simple language.",
  "whatThisMeansForYou": "1-2 sentences. What this means for the creator right now. Make it personal.",
  "alternativeExplanation": "1 sentence. One other possible explanation for what we are seeing."
}`;

async function generateHypothesis(
  diagnosis: ScoredDiagnosis,
  evidence: ChannelEvidence
): Promise<FullDiagnosis> {
  const prompt = `Channel: ${evidence.channelStats.channelTitle}
Subscribers: ${evidence.channelStats.subscribers.toLocaleString()}
Total videos analyzed: ${evidence.totalVideosAnalyzed}
Days since last upload: ${evidence.daysSinceLastUpload}

Top 3 videos:
${evidence.topVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

Recent 5 videos:
${evidence.recentVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

Bottom 3 videos:
${evidence.bottomVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`).join('\n')}

Average views: ${evidence.averageViews}
Top performer average: ${evidence.topPerformerAverage}
Recent video average: ${evidence.recentPerformerAverage}

DIAGNOSIS TRIGGERED: ${diagnosis.rule.name}
WHAT JARVIS LOOKED FOR: ${diagnosis.rule.whatJarvisLooksFor}
EVIDENCE FOUND:
${diagnosis.evidencePoints.map(e => `• ${e}`).join('\n')}
CONFIDENCE: ${diagnosis.finalConfidence}%

Now explain this diagnosis in simple plain words.
Use the actual video titles and numbers.
Write like a trusted friend telling them the truth.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: HYPOTHESIS_PROMPT,
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
}

export async function generateAllHypotheses(
  diagnoses: ScoredDiagnosis[],
  evidence: ChannelEvidence
): Promise<FullDiagnosis[]> {
  // Only generate for top 5 diagnoses to control cost and latency
  const top5 = diagnoses.slice(0, 5);

  const results = await Promise.all(
    top5.map(d => generateHypothesis(d, evidence))
  );

  return results;
}
