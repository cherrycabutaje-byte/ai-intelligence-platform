import { NextResponse } from 'next/server';

import {
  buildChannelReport
} from '@/lib/channel-intelligence/channel-report-builder';

export async function GET() {

  const report =
    buildChannelReport();

  return NextResponse.json({
    success: true,
    report
  });
}