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

import {
  buildAudienceEvidence
} from '@/lib/audience-intelligence/audience-evidence-builder';

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

  const evidence =
    buildAudienceEvidence(
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