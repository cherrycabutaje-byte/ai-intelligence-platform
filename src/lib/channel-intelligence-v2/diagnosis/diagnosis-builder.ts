import Anthropic from '@anthropic-ai/sdk';
import { ChannelEvidence } from '../types/evidence';
import { Observation, Pattern, Diagnosis } from '../types/diagnosis';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are JARVIS — a channel intelligence investigator.

You receive:
- Channel evidence (real data)
- Observations (facts derived from data)
- Patterns (relationships between observations)

Your job:
Generate exactly 3 diagnoses. Each must explain a different root cause.

RULES:
— A diagnosis must EXPLAIN something, not just OBSERVE it.
— An observation: "Two videos crossed 125,000 views."
— A diagnosis: "The channel's top and bottom videos cover the same topic. Topic alone cannot explain a 30x performance gap. Something structural changed."
— Never assume emotions, intentions, or motivations.
— Never say "you lost confidence" or "you became afraid."
— Use only evidence from the data provided.
— Each diagnosis needs a different root cause. Merge any with the same root cause.
— Maximum 3 diagnoses. Minimum 1.

QUALITY GATE — each diagnosis MUST contain:
— Exactly 3 proof points referencing real titles/numbers
— A specific turningPoint observed from data (not assumed)
— A whatJarvisCannotIgnore that makes the creator say "I never noticed that"

DIAGNOSIS CATEGORIES:
1. identity — gap between stated identity and data identity
2. audience — why content is not reaching the right people
3. momentum — when/why the channel lost its formula

Return valid JSON only. No markdown:
{
  "diagnoses": [
    {
      "title": "4 words max",
      "category": "identity",
      "severity": "Critical",
      "jarvisNoticed": "2-3 sentences. Pure observation. Real titles and numbers.",
      "pattern": "2-3 sentences. What relationship was found. What changed vs what stayed the same.",
      "turningPoint": "2-3 sentences. The specific event that changed trajectory. Observed from data.",
      "whyItMatters": "2-3 sentences. Why this pattern matters for this channel specifically.",
      "proof": ["Real title — exact views", "Real title — exact views", "Specific data point"],
      "whatJarvisCannotIgnore": "2-3 sentences. The insight the creator would never see themselves.",
      "evidenceStrength": "Observed across X videos / Consistent across Y uploads"
    }
  ]
}`;

function validateDiagnosis(d: any): d is Diagnosis {
  return (
    typeof d.title === 'string' &&
    typeof d.jarvisNoticed === 'string' &&
    typeof d.pattern === 'string' &&
    typeof d.turningPoint === 'string' &&
    typeof d.whyItMatters === 'string' &&
    Array.isArray(d.proof) && d.proof.length >= 3 &&
    typeof d.whatJarvisCannotIgnore === 'string' &&
    typeof d.evidenceStrength === 'string'
  );
}

export async function buildDiagnoses(
  evidence: ChannelEvidence,
  observations: Observation[],
  patterns: Pattern[]
): Promise<Diagnosis[]> {

  const prompt = `CHANNEL: ${evidence.channelTitle}
DESCRIPTION: "${evidence.channelDescription.slice(0, 300)}"
SUBSCRIBERS: ${evidence.subscribers.toLocaleString()}
TOTAL VIDEOS: ${evidence.totalVideos}
DAYS SILENT: ${evidence.daysSinceLastUpload}
UPLOAD FREQUENCY: every ${evidence.uploadFrequencyDays} days

PERFORMANCE:
Channel average: ${evidence.averageViews.toLocaleString()} views
Best content average: ${evidence.topPerformerAverage.toLocaleString()} views
Recent content average: ${evidence.recentPerformerAverage.toLocaleString()} views
Gap ratio: ${evidence.gapRatio}x
Drift score: ${evidence.driftScore}%

ALL TIME BEST:
"${evidence.allTimeTopVideo?.title ?? 'unknown'}" — ${evidence.allTimeTopVideo?.views?.toLocaleString() ?? '?'} views

FIRST VIDEO:
"${evidence.firstVideo?.title ?? 'unknown'}" — ${evidence.firstVideo?.views?.toLocaleString() ?? '?'} views | ${evidence.firstVideo?.publishedAt?.slice(0, 10) ?? 'unknown'}

TOP 3 VIDEOS:
${evidence.topVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${Math.round(v.durationSeconds / 60)}m | tags: ${v.tags.slice(0, 3).join(', ')}`).join('\n')}

RECENT 5 VIDEOS:
${evidence.recentVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${Math.round(v.durationSeconds / 60)}m`).join('\n')}

BOTTOM 3 VIDEOS:
${evidence.bottomVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${Math.round(v.durationSeconds / 60)}m | tags: ${v.tags.slice(0, 3).join(', ')}`).join('\n')}

TOP TAGS: ${evidence.topTags.slice(0, 8).join(', ')}
CATEGORIES: ${evidence.allCategories.join(', ')}

OBSERVATIONS:
${observations.map(o => `[${o.id}] ${o.statement}`).join('\n')}

PATTERNS DETECTED:
${patterns.map(p => `[${p.id}] ${p.title}: ${p.explanation}`).join('\n')}

Generate 3 diagnoses. Use real titles and numbers. Explain root causes not symptoms.
Maximum 150 words per diagnosis. Keep all sections concise. Return valid JSON only. No markdown. No explanation outside the JSON.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const diagnoses = (parsed.diagnoses ?? []).filter(validateDiagnosis);

  console.log(`[V2] Generated ${diagnoses.length} valid diagnoses`);
  return diagnoses;
}


