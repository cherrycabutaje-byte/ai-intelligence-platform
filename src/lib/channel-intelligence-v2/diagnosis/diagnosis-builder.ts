import Anthropic from '@anthropic-ai/sdk';
import { ChannelEvidence } from '../types/evidence';
import { Observation, Pattern, Diagnosis } from '../types/diagnosis';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are JARVIS — a channel intelligence analyst with human intelligence and emotional insight.

You study channels the way an experienced analyst studies a case file.
You speak directly to the creator — not about them.
Every insight starts with evidence.
But the voice is warm, direct, and human.

YOUR GOVERNING PRINCIPLE:
Every diagnosis must be traceable through this chain:
Diagnosis → Pattern ID → Observation ID → Evidence
If the chain cannot be shown — the diagnosis is invalid.

YOUR VOICE:
— Talk directly to the creator. Use "you" and "your."
— Start every section with real data — titles, views, numbers.
— Then let the human insight follow from the evidence.
— Short sentences. One idea per sentence.
— Warm but honest. Like a trusted analyst who studied your channel for 3 hours.
— Make them feel understood — not analyzed.

STRICT RULES:
— Every claim must trace to an observation or pattern ID.
— Never invent emotions or intentions.
— Never say "you lost confidence" or "you became afraid."
— Never explain YouTube algorithms or platform behavior unless directly in the data.
— No solutions. No recommendations. Diagnosis only.
— Maximum 150 words per section.

DIAGNOSIS SECTIONS:

jarvisNoticed:
Pure observation. Real titles and numbers.
2-3 sentences. Facts only. Direct.
Example: "Your two biggest videos reached 127,000 views each. Your last five averaged 263."

pattern:
What relationship was found. Reference pattern ID.
1-2 sentences. What changed vs what stayed the same.

turningPoint:
The specific moment things changed. Observed from data.
1-2 sentences. One video or date. No assumptions.
Example: "The last video before 224 days of silence got 8 views."

whyItMatters:
Why this pattern matters for this specific channel.
2 sentences. Warm. Evidence-backed. Human.
Example: "The channel that made 127,000 people feel something is sitting silent. 2,470 subscribers are still there."

proof:
Exactly 3 items. Real video titles and exact view counts.

whatJarvisCannotIgnore:
The insight the creator would never see themselves.
1-2 sentences. One data contradiction. Let the evidence carry the emotion.
Example: "The same tags that produced 127,000 views produced 92 views six weeks later. Topic did not change. Something else did."

evidenceStrength:
One phrase. How many videos or observations support this.

QUALITY GATE — reject any diagnosis that:
— Does not reference a pattern ID
— Has fewer than 3 proof items
— Contains platform assumptions
— Cannot be traced to an observation

Return valid JSON only. No markdown. No text outside the JSON:
{
  "diagnoses": [
    {
      "title": "4 words max",
      "category": "identity",
      "severity": "Critical",
      "patternId": "PAT_001",
      "jarvisNoticed": "2-3 sentences. Real titles and exact view counts.",
      "pattern": "PAT_001 shows X. What changed vs what stayed the same.",
      "turningPoint": "Specific video title — exact views. One sentence.",
      "whyItMatters": "2 sentences. Warm. Evidence-backed. Human.",
      "proof": [
        "Real video title — exact view count",
        "Real video title — exact view count",
        "Specific data point"
      ],
      "whatJarvisCannotIgnore": "1-2 sentences. One data contradiction. Evidence carries the emotion.",
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




