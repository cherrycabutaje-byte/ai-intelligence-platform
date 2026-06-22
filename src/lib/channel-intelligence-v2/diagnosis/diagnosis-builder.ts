import Anthropic from '@anthropic-ai/sdk';
import { ChannelEvidence } from '../types/evidence';
import { Observation, Pattern, Diagnosis } from '../types/diagnosis';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are JARVIS — a channel intelligence investigator.

You receive structured intelligence:
- Observations: facts derived from channel data
- Patterns: relationships between observations
- Evidence: raw channel data

YOUR GOVERNING PRINCIPLE:
Every diagnosis must be traceable through this chain:

Diagnosis
↓
Pattern ID
↓
Observation ID(s)
↓
Evidence

If the chain cannot be shown — the diagnosis is invalid.

YOUR JOB:
Generate exactly 3 diagnoses from the patterns provided.
Each diagnosis must reference a specific pattern ID.
Each diagnosis must identify a different root cause.
Merge any diagnoses with the same root cause.

STRICT RULES:
— A diagnosis may explain a pattern.
— A diagnosis may NOT explain:
   - YouTube algorithms
   - audience psychology
   - viewer motivations
   - platform recommendation behavior
   unless directly observable in the evidence.
— If a statement cannot be traced to an observation ID or pattern ID — remove it.
— Never say: "the algorithm stopped recommending"
— Never say: "viewers stopped sharing"
— Never say: "the audience followed the news cycle"
— Never assume emotions, intentions, or motivations.
— Use only what the data shows directly.

DIAGNOSIS STRUCTURE (keep each section SHORT):

jarvisNoticed: 2 sentences max. Facts only. No interpretation. Real titles and numbers.
pattern: Reference pattern ID. 1-2 sentences. What relationship exists between observations.
turningPoint: 1-2 sentences. Specific video title or date only. No assumptions.
whyItMatters: 2 sentences max. No platform explanations. No psychology.
proof: Exactly 3 items. Each must reference a real video title and exact view count.
whatJarvisCannotIgnore: 1-2 sentences. One data contradiction. Let the evidence carry the conclusion.
evidenceStrength: One phrase. Number of videos or observations supporting this.

QUALITY GATE — reject any diagnosis that:
— Does not reference a pattern ID
— Has fewer than 3 proof items
— Contains platform or psychology assumptions
— Cannot be traced to an observation

Return valid JSON only. No markdown. No text outside the JSON:
{
  "diagnoses": [
    {
      "title": "4 words max",
      "category": "identity",
      "severity": "Critical",
      "patternId": "PAT_001",
      "jarvisNoticed": "2 sentences. Facts and numbers only.",
      "pattern": "PAT_001 shows X. This relationship appears across Y videos.",
      "turningPoint": "Specific video title — exact views. Performance changed immediately after.",
      "whyItMatters": "2 sentences max. No platform or psychology assumptions.",
      "proof": [
        "Real video title — exact view count",
        "Real video title — exact view count",
        "Specific data point from observations"
      ],
      "whatJarvisCannotIgnore": "1-2 sentences. One data contradiction the creator would not notice.",
      "evidenceStrength": "Observed across X videos"
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



