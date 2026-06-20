import { NextResponse } from 'next/server';

import {
  analyzeAudienceText
} from '@/lib/audience-intelligence/audience-analyzer';

import {
  buildAudienceHypothesis
} from '@/lib/audience-intelligence/audience-hypothesis-builder';

export async function GET() {

  const signals =
    analyzeAudienceText(
      'I feel stuck and I want change and hope'
    );

  const hypothesis =
    buildAudienceHypothesis(
      signals
    );

  return NextResponse.json({
    success: true,
    signals,
    hypothesis
  });
}