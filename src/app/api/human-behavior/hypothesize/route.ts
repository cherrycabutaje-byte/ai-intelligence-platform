import { generateExperiment } from '@/lib/human-behavior/experiment-generator';
import { NextRequest, NextResponse } from 'next/server';
import { generateHypothesis } from '@/lib/human-behavior/claude-human-behavior';
import { parseHypothesis } from '@/lib/human-behavior/hypothesis-parser';
import { classifyConstraint } from '@/lib/human-behavior/constraint-classifier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await generateHypothesis(
      body.title || '',
      body.transcript || '',
      body.views || 0
    );

    const rawContent =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : '';

    const hypothesis = parseHypothesis(rawContent);

      const constraint =
  classifyConstraint(hypothesis);

const experiment =
  generateExperiment(constraint);

   return NextResponse.json({
  success: true,
  rawContent,
  hypothesis,
  constraint,
  experiment
});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    );
  }
}