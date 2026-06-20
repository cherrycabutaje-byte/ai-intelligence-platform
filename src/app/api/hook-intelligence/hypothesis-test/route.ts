import { NextResponse } from 'next/server';

import {
  analyzeHookText
} from '@/lib/hook-intelligence/hook-analyzer';

import {
  buildHookHypothesis
} from '@/lib/hook-intelligence/hook-hypothesis-builder';

export async function GET() {

  const signals =
    analyzeHookText(
      'You wont believe what happened when I moved to Greece. I was stuck and found the solution.'
    );

  const hypothesis =
    buildHookHypothesis(
      signals
    );

  return NextResponse.json({
    success: true,
    signals,
    hypothesis
  });
}