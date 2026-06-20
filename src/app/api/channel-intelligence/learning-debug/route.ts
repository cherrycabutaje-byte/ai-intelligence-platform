import { NextResponse } from 'next/server';

import {
  getLearningsByCreator
} from '@/lib/human-behavior/creator-learning-repository';

export async function GET() {

  const learnings =
    await getLearningsByCreator(
      'christine'
    );

  return NextResponse.json({
    success: true,
    learnings: learnings.map(
      learning => ({
        statement:
          learning.statement,

        constraintType:
          learning.origin.constraintType
      })
    )
  });
}