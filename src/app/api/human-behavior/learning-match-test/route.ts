import { NextResponse } from 'next/server';

import {
  findMatchingLearning
} from '@/lib/human-behavior/learning-matcher';

export async function GET() {

  const match =
    findMatchingLearning(
      'Transformation titles outperform travel titles',
      [
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
        }
      ]
    );

  return NextResponse.json({
    success: true,
    match
  });
}