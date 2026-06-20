import { NextResponse } from 'next/server';

import {
  saveLearning
} from '@/lib/human-behavior/creator-learning-repository';

export async function GET() {
  try {

    const saved = await saveLearning(
      'christine',
      {
        id: crypto.randomUUID(),

        statement:
          'Transformation titles outperform travel titles',

        origin: {
          hypothesis:
            'Audience responds more strongly to transformation content',

          constraintType:
            'AUDIENCE_MISMATCH',

          experimentId:
            'EXP-001'
        },

        confidence: 68,

        status: 'emerging',

        supportingEvidenceCount: 2,

        contradictingEvidenceCount: 0,

        createdAt:
          new Date().toISOString(),

        lastUpdated:
          new Date().toISOString()
      }
    );

    return NextResponse.json({
      success: true,
      saved
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}