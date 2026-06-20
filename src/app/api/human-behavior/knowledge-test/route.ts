import { NextResponse } from 'next/server';
import { buildKnowledgeCandidate } from '@/lib/human-behavior/knowledge-builder';

export async function GET() {

  const candidate = buildKnowledgeCandidate({
    experimentId: 'exp-001',

    hypothesis:
      'Transformation titles outperform travel titles',

    constraintType:
      'AUDIENCE_MISMATCH',

    metricBefore: 2,

    metricAfter: 3,

    result: 'validated',

    evidenceStrength: 50,

    learning:
      'Performance changed by 50.0%'
  });

  return NextResponse.json({
    success: true,
    candidate
  });
}