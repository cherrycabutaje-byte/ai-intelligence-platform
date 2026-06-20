import { NextResponse } from 'next/server';

import { rankLearnings }
  from '@/lib/coaching/learning-ranker';

import { selectPrimaryLearning }
  from '@/lib/coaching/primary-learning-selector';

import { generateCoachDirective }
  from '@/lib/coaching/coach-directive-generator';

import { explainDirective }
  from '@/lib/coaching/directive-explainer';

import { recommendExperiment }
  from '@/lib/coaching/experiment-recommender';

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
      }
    ]);

  const primary =
    selectPrimaryLearning(ranked);

  return NextResponse.json({
    success: true,

    directive:
      generateCoachDirective(primary),

    explanation:
      explainDirective(primary),

    experiment:
      recommendExperiment(primary)
  });
}