import { NextResponse } from 'next/server';

import { rankLearnings }
  from '@/lib/coaching/learning-ranker';

import { selectPrimaryLearning }
  from '@/lib/coaching/primary-learning-selector';

import { generateCoachDirective }
  from '@/lib/coaching/coach-directive-generator';

export async function GET() {

  const ranked =
    rankLearnings([
      {
        id: '1',

        statement:
          'Transformation titles outperform travel titles',

        confidence: 84,

        status: 'tentative',

        supportingEvidenceCount: 4,

        contradictingEvidenceCount: 0,

        origin: {
          hypothesis:
            'Audience prefers transformation content'
        },

        createdAt:
          new Date().toISOString(),

        lastUpdated:
          new Date().toISOString()
      },
      {
        id: '2',

        statement:
          'Family stories improve retention',

        confidence: 60,

        status: 'emerging',

        supportingEvidenceCount: 1,

        contradictingEvidenceCount: 0,

        origin: {
          hypothesis:
            'Family narratives increase engagement'
        },

        createdAt:
          new Date().toISOString(),

        lastUpdated:
          new Date().toISOString()
      }
    ]);

  const primary =
    selectPrimaryLearning(ranked);

  const directive =
    generateCoachDirective(primary);

  return NextResponse.json({
    success: true,
    primary,
    directive
  });
}