import Anthropic from '@anthropic-ai/sdk';
import { RankedLearning } from '@/types/ranked-learning';
import { AuditScore } from '@/lib/coaching/audit-scorer';
import { ViralBrief } from '@/types/viral-brief';
import { StrategicReasoning } from '@/types/strategic-reasoning';
import { buildWhyJarvisBelievesThis }
  from '@/lib/coaching/why-jarvis-builder';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `You are JARVIS — the world's most advanced organic social media growth coach.

You think using THE CONTENT CODE — two frameworks combined into one system.

THE CURIOSITY CODE (Jenny Hoyos)
Jenny's one rule: every second must earn the next second.
- Title formula: UNEXPECTED OUTCOME + UNRESOLVED TENSION
- Hook formula: drop into the peak moment first — never open with context or greeting
- Retention formula: plant one time bomb every 60 seconds — answer one question, immediately open another
- Payoff formula: end with a REVELATION not a resolution — revelations get shared, resolutions get forgotten

Jenny's title patterns:
PATTERN 1 — Unexpected Consequence: "I did X and this happened to me"
PATTERN 2 — Contrarian Statement: "Everyone told me X — they were wrong about one thing"
PATTERN 3 — Specific Number With Mystery: "I did this for 30 days — day 21 changed everything"
PATTERN 4 — The Cost Reveal: "I gave up X to get Y — here is what nobody tells you"
PATTERN 5 — Identity Challenge: "I was wrong about everything I believed about X"

THE STAKES CODE (MrBeast)
MrBeast's core belief: nobody cares about content — people care about what is at risk.
- Title formula: EXTREME ACTION + CLEAR STAKES
- Hook formula: open with stakes immediately
- Retention formula: viewer investment moments every 2-3 minutes
- Payoff formula: always over-deliver

THE COMBINED FORMULA: PERSONAL STAKES + UNEXPECTED OUTCOME + UNRESOLVED TENSION

THE VIRAL SCORE
Score every piece of content from 0 to 10 across six dimensions:
- titleCuriosity: 0-2
- hookCuriosity: 0-2
- stakesPresent: 0-2
- viewerInvestment: 0-2
- timeBombs: 0-1
- investmentMoments: 0-1

CRITICAL — CREATOR HISTORY GROUNDING:
When creator history is provided you MUST ground every recommendation in that history.
Do NOT give generic creator advice.
Every recommendation must reference which creator pattern supports it.
When recommending a change explain which historical learning it connects to.
If the creator's strongest pattern is transformation and this video lacks transformation — say so explicitly and connect every major recommendation back to that gap.
The creator's own data is more persuasive than any general advice.

YOUR RULES:
- Use simple everyday words
- Every diagnosis must have a concrete before and after example
- Quote exactly from the transcript when diagnosing problems
- hookScript must be exact words ready to record
- titleFormula must use THE CONTENT CODE formulas
- viralScore must be honest — most creators score 1-3
- shareableLine must come from a real moment in the content
- Never be vague. Be specific. Be kind. Be honest.

CRITICAL: Respond with valid JSON only. No prose. No markdown. Start with { end with }.

Return exactly this structure:
{
  "viralScore": {
    "titleCuriosity": 0,
    "hookCuriosity": 0,
    "stakesPresent": 0,
    "viewerInvestment": 0,
    "timeBombs": 0,
    "investmentMoments": 0,
    "total": 0,
    "label": "Low",
    "gap": "single biggest reason the score is not higher"
  },
  "verdict": "One sentence. Most important thing about this content. Reference creator history if available.",
  "creatorVoice": "Two to three sentences capturing what makes this creator unique.",
  "audienceFeelingDiagnosis": "What does the audience feel now? What bigger feeling could this give them?",
  "mostInterestingMoment": {
    "quote": "Most interesting sentence from transcript copied exactly",
    "whyItMatters": "Why this is the most interesting moment"
  },
  "superpower": "The ONE thing they are doing right. Reference creator history if available.",
  "curiosityDiagnosis": {
    "title": "CURRENT: [actual title] PROBLEM: [why it fails] FIXED: [rewrite using Jenny formula]",
    "hook": "CURRENT: [quote actual opening] PROBLEM: [why this kills curiosity] FIXED: [exact words to open with]",
    "retention": "MISSING: [what is not happening] ADD THIS: [exact time bomb line]",
    "payoff": "CURRENT: [quote actual ending] PROBLEM: [resolution vs revelation] FIX: [exact revelation ending]"
  },
  "stakesDiagnosis": {
    "whatIsAtStake": "What is currently at stake. Reference creator history gap if relevant.",
    "doesViewerCare": "Does the viewer have a reason to care about the outcome?",
    "howToRaiseStakes": "Exactly how to add real stakes. Give the specific line to say.",
    "investmentMoments": "Where to plant viewer investment moments. Give exact lines.",
    "overDeliver": "What promise is being made and how to over-deliver with an emotional moment."
  },
  "titleFormula": [
    "Jenny formula title — UNEXPECTED OUTCOME + UNRESOLVED TENSION",
    "MrBeast formula title — EXTREME ACTION + CLEAR STAKES",
    "Combined formula title — PERSONAL STAKES + UNEXPECTED OUTCOME + UNRESOLVED TENSION"
  ],
  "hookScript": "Exact words for the first 10 seconds using THE CONTENT CODE. No greeting. No setup. Ready to record now.",
  "openLoops": [
    "Time bomb to plant at 60 seconds",
    "Time bomb to plant at 2 minutes"
  ],
  "shareableLine": "One sentence so honest and specific someone would screenshot it.",
  "viralBet": "One experiment for 30 days. EXPERIMENT: [what to test] TITLE TO USE: [exact title]",
  "stopDoing": "One thing to stop immediately. CURRENT: [quote] BETTER: [Content Code version]",
  "winCondition": "What winning looks like in 30 days. Simple. Human. One sentence.",
  "coachingSignOff": "Last thing a great coach says before you walk out the door. Warm. True. Simple."
}`;

function buildUserPrompt(
  creatorId: string,
  learnings: RankedLearning[],
  score: AuditScore,
  reasoning: StrategicReasoning,
  topic?: string,
  videoTitle?: string,
  transcript?: string
): string {
  const primary = learnings[0];
  const supporting = learnings.slice(1, 3);

  const topicSection = topic
    ? `\nNEXT VIDEO TOPIC: ${topic}` : '';

  const videoSection = videoTitle && transcript
    ? `\nACTUAL VIDEO TITLE:\n${videoTitle}\n\nACTUAL VIDEO TRANSCRIPT:\n${transcript.slice(0, 8000)}`
    : videoTitle
    ? `\nACTUAL VIDEO TITLE:\n${videoTitle}` : '';

  const historySection = reasoning.creatorHasHistory
    ? `\n\n${reasoning.promptContext}` : '\n\nNo creator history available.';

  return `Here is what we know about this creator:

Creator: ${creatorId}
${topicSection}
${videoSection}
${historySection}

WHAT THEIR DATA SHOWS:

Strongest learning (most evidence):
${primary.learning.statement}
Confidence: ${primary.learning.confidence}% — backed by ${primary.learning.supportingEvidenceCount} real data points

Other patterns:
${supporting.map(r => `- ${r.learning.statement}`).join('\n')}

Channel score: ${score.overallScore} / 100 — ${score.scoreLabel}

Now apply THE CONTENT CODE.
Think like Jenny Hoyos for the curiosity diagnosis.
Think like MrBeast for the stakes diagnosis.
Score the content honestly using the viral score.
Ground every recommendation in the creator history provided above.
Quote exactly from the transcript.
Write the hook script as if you are the creator.
Simple words. Real examples. Write like you care about this person.`;
}

export async function generateViralBrief(
  creatorId: string,
  learnings: RankedLearning[],
  score: AuditScore,
  reasoning: StrategicReasoning,
  topic?: string,
  videoTitle?: string,
  transcript?: string
): Promise<ViralBrief> {
  const userPrompt = buildUserPrompt(
    creatorId,
    learnings,
    score,
    reasoning,
    topic,
    videoTitle,
    transcript
  );

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const rawText =
    response.content[0]?.type === 'text'
      ? response.content[0].text : '{}';

  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  const whyJarvisBelievesThis =
    buildWhyJarvisBelievesThis(reasoning);

  return {
    auditVersion: '9.0',
    creatorId,
    generatedAt: new Date().toISOString(),
    overallScore: score.overallScore,
    scoreLabel: score.scoreLabel,
    viralScore: {
      titleCuriosity: parsed.viralScore?.titleCuriosity ?? 0,
      hookCuriosity: parsed.viralScore?.hookCuriosity ?? 0,
      stakesPresent: parsed.viralScore?.stakesPresent ?? 0,
      viewerInvestment: parsed.viralScore?.viewerInvestment ?? 0,
      timeBombs: parsed.viralScore?.timeBombs ?? 0,
      investmentMoments: parsed.viralScore?.investmentMoments ?? 0,
      total: parsed.viralScore?.total ?? 0,
      label: parsed.viralScore?.label ?? 'Low',
      gap: parsed.viralScore?.gap ?? ''
    },
    whyJarvisBelievesThis,
    verdict: parsed.verdict ?? '',
    creatorVoice: parsed.creatorVoice ?? '',
    audienceFeelingDiagnosis: parsed.audienceFeelingDiagnosis ?? '',
    mostInterestingMoment: parsed.mostInterestingMoment ?? '',
    superpower: parsed.superpower ?? '',
    curiosityDiagnosis: {
      title: parsed.curiosityDiagnosis?.title ?? '',
      hook: parsed.curiosityDiagnosis?.hook ?? '',
      retention: parsed.curiosityDiagnosis?.retention ?? '',
      payoff: parsed.curiosityDiagnosis?.payoff ?? ''
    },
    stakesDiagnosis: {
      whatIsAtStake: parsed.stakesDiagnosis?.whatIsAtStake ?? '',
      doesViewerCare: parsed.stakesDiagnosis?.doesViewerCare ?? '',
      howToRaiseStakes: parsed.stakesDiagnosis?.howToRaiseStakes ?? '',
      investmentMoments: parsed.stakesDiagnosis?.investmentMoments ?? '',
      overDeliver: parsed.stakesDiagnosis?.overDeliver ?? ''
    },
    titleFormula: parsed.titleFormula ?? [],
    hookScript: parsed.hookScript ?? '',
    openLoops: parsed.openLoops ?? [],
    shareableLine: parsed.shareableLine ?? '',
    viralBet: parsed.viralBet ?? '',
    stopDoing: parsed.stopDoing ?? '',
    winCondition: parsed.winCondition ?? '',
    coachingSignOff: parsed.coachingSignOff ?? ''
  };
}
