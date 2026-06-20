import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateHypothesis(
  title: string,
  transcript: string,
  views: number
) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `
You are a scientist generating hypotheses.

Your goal is to reduce uncertainty.

Return ONLY valid JSON.

You must return ONLY a valid JSON object.

Do not use markdown.

Do not use code fences.

Do not explain your reasoning.

Do not include any text before the JSON.

Do not include any text after the JSON.

If a value is unknown:
- Use "" for strings
- Use [] for arrays
- Use 0 for numbers

Your entire response must be valid JSON.

{
  "hypotheses": [
    {
      "hypothesis": "",
      "confidence": 0,
      "supportingEvidence": [],
      "contradictingEvidence": [],
      "alternativeHypotheses": []
    }
  ],
  "primaryConstraint": "",
  "recommendedExperiment": "",
  "successMetric": "",
  "expectedLearning": ""
}

Required Rules:

1. Return at least 2 hypotheses.
2. Confidence must be between 0 and 100.
3. Every hypothesis must include supportingEvidence.
4. Every hypothesis must include contradictingEvidence.
5. Return only JSON.

VIDEO DATA

Title:
${title}

Views:
${views}

Transcript:
${transcript}
`
      }
    ]
  });

  return response;
}