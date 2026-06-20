import { NextResponse } from 'next/server';

import {
  buildMemoryPoweredReport
} from '@/lib/channel-intelligence/memory-powered-report-builder';

import {
  buildCoachingReport
} from '@/lib/channel-intelligence/coaching-report-builder';

export async function GET() {

  const report =
    await buildMemoryPoweredReport(
      'christine'
    );

  const coaching =
    buildCoachingReport(
      report
    );

  return NextResponse.json({
    success: true,
    report,
    coaching
  });
}