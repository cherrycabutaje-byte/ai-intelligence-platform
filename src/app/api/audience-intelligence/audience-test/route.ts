import { NextResponse } from 'next/server';

import {
  analyzeAudienceText
} from '@/lib/audience-intelligence/audience-analyzer';

export async function GET() {

  const signals =
    analyzeAudienceText(
      'I feel stuck and I want change and hope'
    );

  return NextResponse.json({
    success: true,
    signals
  });
}