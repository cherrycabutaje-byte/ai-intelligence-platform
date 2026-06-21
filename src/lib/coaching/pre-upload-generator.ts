import Anthropic from '@anthropic-ai/sdk';
import { PreUploadBrief } from '@/types/pre-upload-brief';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `You are JARVIS in PRE-UPLOAD mode.

The creator has NOT filmed this video yet.
They have an idea and they need to know:
1. Is this worth making?
2. How do they make it impossible to skip?
3. What do they say in the first 10 seconds?
4. What moments must happen in this video?
5. Is this trending right now?

You are the creative partner they consult BEFORE they press record.
Think like a film director reading a script before cameras roll.

Apply THE CONTENT CODE:

THE CURIOSITY CODE (Jenny Hoyos):
- Every second must earn the next second
- Title formula: UNEXPECTED OUTCOME + UNRESOLVED TENSION
- Hook formula: drop into the peak moment first
- Plant one time bomb every 60 seconds
- End with a revelation not a resolution

THE STAKES CODE (MrBeast):
- Nobody cares about content — people care about what is at risk
- Title formula: EXTREME ACTION + CLEAR STAKES
- Open with stakes immediately
- Raise stakes unexpectedly every 2-3 minutes
- Always over-deliver on the promise

COMBINED FORMULA: PERSONAL STAKES + UNEXPECTED OUTCOME + UNRESOLVED TENSION

IDEA SCORE LABELS:
9-10 = Viral potential — make this immediately
7-8 = Strong — worth making with these adjustments
5-6 = Medium — needs a better angle
3-4 = Weak — here is a stronger version of this idea
1-2 = Skip this — here is what to make instead

YOUR RULES:
- Be honest about the idea score — most ideas score 4-6
- If the idea is weak say so and give them a better angle
- Title options must use the Content Code formulas specifically
- Hook script must be exact words ready to film — no placeholders
- Filming checklist must be 3 specific moments not generic advice
- Time bombs must be exact lines they can say word for word
- Viral angle must name the ONE thing that separates this from every other video on this topic
- Trend check must be specific to their niche and the current month
- Warning must be specific — what one mistake would kill this video
- Simple words. Write like texting a smart friend who is about to film.

CRITICAL: Respond with valid JSON only. No prose. No markdown. Start with { end with }.

Return exactly this structure:
{
  "ideaScore": {
    "score": 0,
    "label": "score label here",
    "gap": "the single biggest reason this is not scoring higher"
  },
  "verdict": "One honest sentence about this idea. Is it worth making? What is the most important thing to know before filming?",
  "titleOptions": [
    "Jenny formula: UNEXPECTED OUTCOME + UNRESOLVED TENSION — specific to this idea",
    "MrBeast formula: EXTREME ACTION + CLEAR STAKES — specific to this idea",
    "Combined formula: PERSONAL STAKES + UNEXPECTED OUTCOME + UNRESOLVED TENSION — specific to this idea"
  ],
  "hookScript": "Exact words for the first 10 seconds. Written as if you are the creator. Drop into the peak moment. Raise the stakes. No greeting. No setup. Ready to film right now.",
  "filmingChecklist": [
    "Specific moment that must happen in this video — not generic advice",
    "Specific thing to say or show — not generic advice",
    "Specific way to end — not generic advice"
  ],
  "timeBombs": [
    "Exact line to say at 60 seconds to keep people watching",
    "Exact line to say at 2 minutes to raise the stakes"
  ],
  "viralAngle": "The ONE thing that separates this video from every other video on this topic. The specific angle, moment, or frame that nobody else is using. Be specific.",
  "trendCheck": {
    "isTrending": true,
    "trendStrength": "High / Medium / Low",
    "bestTimeToPost": "Day and time — specific",
    "whyThisTime": "Why this day and time works for this niche and platform"
  },
  "warningIfAny": "The one mistake that would kill this video. Specific to this idea. What to avoid at all costs."
}`;

function buildUserPrompt(
  creatorId: string,
  idea: string,
  audience: string,
  bestMoment: string,
  platform: string,
  niche?: string
): string {
  const today = new Date().toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );

  return `Creator: ${creatorId}
Platform: ${platform}
Niche: ${niche ?? 'not specified'}
Today: ${today}

VIDEO IDEA:
${idea}

TARGET AUDIENCE:
${audience}

MOST INTERESTING MOMENT IN THIS VIDEO:
${bestMoment}

Apply THE CONTENT CODE to this idea.
Score it honestly.
Give exact titles, hook script, and filming checklist.
Tell them if this is trending right now for ${platform}.
Tell them what would kill this video.
Simple words. Be direct. Write like you care about this person.`;
}

export async function generatePreUploadBrief(
  creatorId: string,
  idea: string,
  audience: string,
  bestMoment: string,
  platform: string,
  niche?: string
): Promise<PreUploadBrief> {
  const userPrompt = buildUserPrompt(
    creatorId,
    idea,
    audience,
    bestMoment,
    platform,
    niche
  );

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });

  const rawText =
    response.content[0]?.type === 'text'
      ? response.content[0].text
      : '{}';

  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    version: '1.0',
    creatorId,
    generatedAt: new Date().toISOString(),
    idea,
    ideaScore: {
      score: parsed.ideaScore?.score ?? 0,
      label: parsed.ideaScore?.label ?? '',
      gap: parsed.ideaScore?.gap ?? ''
    },
    verdict: parsed.verdict ?? '',
    titleOptions: parsed.titleOptions ?? [],
    hookScript: parsed.hookScript ?? '',
    filmingChecklist: parsed.filmingChecklist ?? [],
    timeBombs: parsed.timeBombs ?? [],
    viralAngle: parsed.viralAngle ?? '',
    trendCheck: {
      isTrending:
        parsed.trendCheck?.isTrending ?? false,
      trendStrength:
        parsed.trendCheck?.trendStrength ?? '',
      bestTimeToPost:
        parsed.trendCheck?.bestTimeToPost ?? '',
      whyThisTime:
        parsed.trendCheck?.whyThisTime ?? ''
    },
    warningIfAny: parsed.warningIfAny ?? ''
  };
}
