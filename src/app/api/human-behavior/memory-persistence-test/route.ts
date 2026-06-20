import { NextResponse } from 'next/server';

import {
  processEvidence
} from '@/lib/human-behavior/memory-manager';

import {
  getLearningsByCreator
} from '@/lib/human-behavior/creator-learning-repository';

export async function GET() {

  await processEvidence(
    'christine',
    {
      experimentId: 'EXP-PERSIST-001',

      hypothesis:
        'Transformation titles outperform travel titles',

      constraintType:
        'AUDIENCE_MISMATCH',

      metricBefore: 2,

      metricAfter: 3,

      result: 'validated',

      evidenceStrength: 50,

      learning:
        'Persistence verification'
    }
  );

  const learnings =
    await getLearningsByCreator(
      'christine'
    );

  const learning =
    learnings.find(
      l =>
        l.statement ===
        'Transformation titles outperform travel titles'
    );

  return NextResponse.json({
    success: true,
    learning
  });
}