import { NextResponse } from 'next/server';

import {
  analyzeStoryText
} from '@/lib/story-intelligence/story-analyzer';

export async function GET() {

  const signals =
    analyzeStoryText(
      'I was stuck in my old life. Everything changed when I moved to Greece. I became a different person.'
    );

  return NextResponse.json({
    success: true,
    signals
  });
}