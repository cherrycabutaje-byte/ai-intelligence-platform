import { NextResponse } from 'next/server';

import {
  analyzeStoryText
} from '@/lib/story-intelligence/story-analyzer';

import {
  buildStoryHypothesis
} from '@/lib/story-intelligence/story-hypothesis-builder';

export async function GET() {

  const signals =
    analyzeStoryText(
      'I was stuck in my old life. Everything changed when I moved to Greece. I became a different person.'
    );

  const hypothesis =
    buildStoryHypothesis(
      signals
    );

  return NextResponse.json({
    success: true,
    signals,
    hypothesis
  });
}