import { NextResponse } from 'next/server';

import {
  processEvidence
} from '@/lib/human-behavior/memory-manager';

export async function GET() {

  const result =
    await processEvidence(
      'christine',
      {
        experimentId: 'EXP-003',

        hypothesis:
          'Transformation titles outperform travel titles',

        constraintType:
          'AUDIENCE_MISMATCH',

        metricBefore: 2,

        metricAfter: 3,

        result: 'validated',

        evidenceStrength: 50,

        learning:
          'Performance changed by 50%'
      }
    );

  return NextResponse.json({
    success: true,
    result
  });
}