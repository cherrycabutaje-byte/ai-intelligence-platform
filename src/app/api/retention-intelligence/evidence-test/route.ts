import { NextResponse } from 'next/server';

import {
  analyzeRetentionText
} from '@/lib/retention-intelligence/retention-analyzer';

import {
  buildRetentionHypothesis
} from '@/lib/retention-intelligence/retention-hypothesis-builder';

import {
  createRetentionObservation
} from '@/lib/retention-intelligence/retention-observation-adapter';

import {
  buildRetentionEvidence
} from '@/lib/retention-intelligence/retention-evidence-builder';

export async function GET() {

  const signals =
    analyzeRetentionText(
      'I was struggling at first, but later I discovered a solution. Finally everything worked. Here are the three lessons I learned.'
    );

  const hypothesis =
    buildRetentionHypothesis(
      signals
    );

  const observation =
    createRetentionObservation(
      hypothesis
    );

  const evidence =
    buildRetentionEvidence(
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