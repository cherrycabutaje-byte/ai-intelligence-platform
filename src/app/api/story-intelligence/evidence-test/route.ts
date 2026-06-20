import { NextResponse } from 'next/server';

import {
  analyzeStoryText
} from '@/lib/story-intelligence/story-analyzer';

import {
  buildStoryHypothesis
} from '@/lib/story-intelligence/story-hypothesis-builder';

import {
  createStoryObservation
} from '@/lib/story-intelligence/story-observation-adapter';

import {
  buildStoryEvidence
} from '@/lib/story-intelligence/story-evidence-builder';

export async function GET() {

  const signals =
    analyzeStoryText(
      'I was stuck in my old life. Everything changed when I moved to Greece. I became a different person.'
    );

  const hypothesis =
    buildStoryHypothesis(
      signals
    );

  const observation =
    createStoryObservation(
      hypothesis
    );

  const evidence =
    buildStoryEvidence(
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