import { NextResponse } from 'next/server';
import { updateConfidence } from '@/lib/human-behavior/confidence-updater';

export async function GET() {

  const updated = updateConfidence(
    {
      statement:
        'Transformation titles outperform travel titles',

      supportingEvidenceCount: 1,

      contradictingEvidenceCount: 0,

      confidence: 60,

      status: 'emerging',

      lastUpdated:
        new Date().toISOString()
    },
    {
      experimentId: 'exp-002',

      hypothesis:
        'Transformation titles outperform travel titles',

      constraintType:
        'AUDIENCE_MISMATCH',

      metricBefore: 2,

      metricAfter: 3,

      result: 'validated',

      evidenceStrength: 50,

      learning:
        'Performance changed by 50.0%'
    }
  );

  return NextResponse.json({
    success: true,
    updated
  });
}