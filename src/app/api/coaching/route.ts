import { NextResponse } from 'next/server';
import { getLearningsByCreator }
  from '@/lib/human-behavior/creator-learning-repository';
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

export async function GET(req: Request) {
  const { searchParams } =
    new URL(req.url);

  const creatorId =
    searchParams.get('creatorId');

  if (!creatorId) {
    return NextResponse.json(
      {
        success: false,
        message: 'creatorId is required'
      },
      { status: 400 }
    );
  }

  const learnings =
    await getLearningsByCreator(
      creatorId
    );

  if (!learnings || learnings.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: 'No learnings found for creator'
      },
      { status: 404 }
    );
  }

  const ranked =
    rankLearnings(learnings);

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
