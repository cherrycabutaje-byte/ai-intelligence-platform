import { NextResponse } from 'next/server';

import {
  updateLearningFromEvidence
} from '@/lib/human-behavior/learning-updater';

export async function GET() {

  const updated =
    updateLearningFromEvidence(
      {
        id: '1',

        statement:
          'Transformation titles outperform travel titles',

        origin: {
          hypothesis:
            'Audience prefers transformation content'
        },

        confidence: 68,

        status: 'emerging',

        supportingEvidenceCount: 2,

        contradictingEvidenceCount: 0,

        createdAt:
          new Date().toISOString(),

        lastUpdated:
          new Date().toISOString()
      },
      {
        experimentId: 'EXP-002',

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
    updated
  });
}