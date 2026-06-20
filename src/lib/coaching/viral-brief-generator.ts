import Anthropic from '@anthropic-ai/sdk';
import { RankedLearning }
  from '@/types/ranked-learning';
import { AuditScore }
  from '@/lib/coaching/audit-scorer';
import { ViralBrief }
  from '@/types/viral-brief';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `You are JARVIS — an AI content growth coach that thinks like the world's best viral content architects.

You analyze creator data the way Jenny Hoyos analyzes videos — you look for the mechanical reasons content succeeds or fails. You understand hook strength, retention structure, emotional payoff, rewatch value, and pattern interrupts. You apply these principles to both short-form and long-form video.

Your job is to look at what a creator is already doing, find their hidden superpower, diagnose what is killing their growth, and give them one clear bet to make.

You do not give generic advice. You do not say "post consistently" or "engage with your audience". You find the specific mechanical reason their content works or does not work — and you say it plainly.

You think in these questions:
- What is the ONE thing this creator does that makes people stay?
- What is the ONE thing that is making people leave?
- What would happen if they led with their strongest moment instead of building up to it?
- Is there a transformation, a stakes moment, or a payoff that is being buried?
- What is the experiment that would prove or disprove the most important hypothesis?

Your language is clear, direct, and simple. No jargon. No corporate speak. Write like you are texting a friend who happens to be a creator. Short sentences. High conviction. No fluff.

CRITICAL: You must respond with valid JSON only. No prose before or after. No markdown. Start with { and end with }.

Return exactly this structure:
{
  "verdict": "One sentence. The most important thing about this creator right now.",
  "superpower": "The ONE thing they are doing right that they probably do not realize is their advantage.",
  "hookDiagnosis": "What is happening in their hook. Is it working? Why or why not? What would make it stronger?",
  "retentionFix": "The ONE change that would keep more people watching. Specific to their content pattern.",
  "viralBet": "The single experiment to run in the next 30 days. Specific. Measurable. Short-form or long-form depending on their strength.",
  "stopDoing": "The ONE thing to eliminate immediately. What is wasting their time or hurting their growth.",
  "winCondition": "What does success look like in 30 days. One metric. One number."
}`;

function buildUserPrompt(
  creatorId: string,
  learnings: RankedLearning[],
  score: AuditScore
): string {
  const primary = learnings[0];
  const supporting = learnings.slice(1, 3);

  const audienceSignals = learnings
    .filter(r =>
      r.learning.origin.hypothesis
        .toLowerCase()
        .includes('audience')
    )
    .map(r => r.learning.statement)
    .join(', ') || 'Not yet detected';

  const hookSignals = learnings
    .filter(r =>
      r.learning.origin.hypothesis
        .toLowerCase()
        .includes('hook')
    )
    .map(r => r.learning.statement)
    .join(', ') || 'Not yet detected';

  const retentionSignals = learnings
    .filter(r =>
      r.learning.origin.hypothesis
        .toLowerCase()
        .includes('retention')
    )
    .map(r => r.learning.statement)
    .join(', ') || 'Not yet detected';

  const storySignals = learnings
    .filter(r =>
      r.learning.origin.hypothesis
        .toLowerCase()
        .includes('story') ||
      r.learning.origin.hypothesis
        .toLowerCase()
        .includes('transformation')
    )
    .map(r => r.learning.statement)
    .join(', ') || 'Not yet detected';

  return `Here is what we know about this creator from real data:

Creator: ${creatorId}

TOP LEARNING (highest confidence):
${primary.learning.statement}
Confidence: ${primary.learning.confidence}% — supported by ${primary.learning.supportingEvidenceCount} evidence points

SUPPORTING LEARNINGS:
${supporting.map(r => `- ${r.learning.statement}`).join('\n')}

AUDIENCE SIGNALS:
${audienceSignals}

HOOK SIGNALS:
${hookSignals}

RETENTION SIGNALS:
${retentionSignals}

STORY SIGNALS:
${storySignals}

CHANNEL SCORE: ${score.overallScore} / 100 — ${score.scoreLabel}

Now think like a viral content architect.
Diagnose this creator. Be specific. Be honest. Be direct.
Short sentences. No fluff.`;
}

export async function generateViralBrief(
  creatorId: string,
  learnings: RankedLearning[],
  score: AuditScore
): Promise<ViralBrief> {
  const userPrompt =
    buildUserPrompt(creatorId, learnings, score);

  const response =
    await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

  const rawText =
    response.content[0]?.type === 'text'
      ? response.content[0].text
      : '{}';

  const cleaned =
    rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

  const parsed = JSON.parse(cleaned);

  return {
    auditVersion: '8.0',
    creatorId,
    generatedAt: new Date().toISOString(),
    overallScore: score.overallScore,
    scoreLabel: score.scoreLabel,
    verdict: parsed.verdict ?? '',
    superpower: parsed.superpower ?? '',
    hookDiagnosis: parsed.hookDiagnosis ?? '',
    retentionFix: parsed.retentionFix ?? '',
    viralBet: parsed.viralBet ?? '',
    stopDoing: parsed.stopDoing ?? '',
    winCondition: parsed.winCondition ?? ''
  };
}
