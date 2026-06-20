import { NextResponse } from 'next/server';

import {
  buildMemoryPoweredReport
} from '@/lib/channel-intelligence/memory-powered-report-builder';

export async function GET() {

  const report =
    await buildMemoryPoweredReport(
      'christine'
    );

  return NextResponse.json({
    success: true,
    report
  });
}