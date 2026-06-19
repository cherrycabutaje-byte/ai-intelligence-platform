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

{
  "hypothesis": "",
  "confidence": 0,
  "supportingEvidence": [],
  "contradictingEvidence": [],
  "alternativeHypotheses": [],
  "primaryConstraint": "",
  "recommendedExperiment": "",
  "successMetric": "",
  "expectedLearning": ""
}

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