import { NextResponse } from 'next/server';

import {
  analyzeAudienceText
} from '@/lib/audience-intelligence/audience-analyzer';

import {
  buildAudienceHypothesis
} from '@/lib/audience-intelligence/audience-hypothesis-builder';

import {
  createAudienceObservation
} from '@/lib/audience-intelligence/audience-observation-adapter';

export async function GET() {

  const signals =
    analyzeAudienceText(
      'I feel stuck and I want change and hope'
    );

  const hypothesis =
    buildAudienceHypothesis(
      signals
    );

  const observation =
    createAudienceObservation(
      hypothesis
    );

  return NextResponse.json({
    success: true,
    signals,
    hypothesis,
    observation
  });
}