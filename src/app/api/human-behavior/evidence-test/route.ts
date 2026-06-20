import { NextResponse } from 'next/server';
import { evaluateEvidence } from '@/lib/human-behavior/evidence-evaluator';

export async function GET() {

  const evidence = evaluateEvidence(
    'exp-001',
    'Transformation titles outperform travel titles',
    'AUDIENCE_MISMATCH',
    2.0,
    3.0
  );

  return NextResponse.json({
    success: true,
    evidence
  });
}