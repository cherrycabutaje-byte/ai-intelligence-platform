import { NextResponse } from 'next/server';

import {
  analyzeHookText
} from '@/lib/hook-intelligence/hook-analyzer';

import {
  buildHookHypothesis
} from '@/lib/hook-intelligence/hook-hypothesis-builder';

import {
  createHookObservation
} from '@/lib/hook-intelligence/hook-observation-adapter';

import {
  buildHookEvidence
} from '@/lib/hook-intelligence/hook-evidence-builder';

export async function GET() {

  const signals =
    analyzeHookText(
      'You wont believe what happened when I moved to Greece. I was stuck and found the solution.'
    );

  const hypothesis =
    buildHookHypothesis(
      signals
    );

  const observation =
    createHookObservation(
      hypothesis
    );

  const evidence =
    buildHookEvidence(
      observation
    );

  return NextResponse.json({
    success: true,
    signals,
    hypothesis,
    observation,
    evidence
  });
}