import { NextResponse } from 'next/server';

import {
  analyzeRetentionText
} from '@/lib/retention-intelligence/retention-analyzer';

import {
  buildRetentionHypothesis
} from '@/lib/retention-intelligence/retention-hypothesis-builder';

export async function GET() {

  const signals =
    analyzeRetentionText(
      'I was struggling at first, but later I discovered a solution. Finally everything worked. Here are the three lessons I learned.'
    );

  const hypothesis =
    buildRetentionHypothesis(
      signals
    );

  return NextResponse.json({
    success: true,
    signals,
    hypothesis
  });
}