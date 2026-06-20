import { NextResponse } from 'next/server';

import {
  analyzeHookText
} from '@/lib/hook-intelligence/hook-analyzer';

export async function GET() {

  const signals =
    analyzeHookText(
      'You wont believe what happened when I moved to Greece. I was stuck and found the solution.'
    );

  return NextResponse.json({
    success: true,
    signals
  });
}