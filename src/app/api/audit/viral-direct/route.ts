import { NextResponse } from 'next/server';
import { getLearningsByCreator }
  from '@/lib/human-behavior/creator-learning-repository';
import { rankLearnings }
  from '@/lib/coaching/learning-ranker';
import { selectTopLearnings }
  from '@/lib/coaching/top-learning-selector';
import { scoreAudit }
  from '@/lib/coaching/audit-scorer';
import { generateViralBrief }
  from '@/lib/coaching/viral-brief-generator';

export async function POST(req: Request) {
  const {
    creatorId,
    videoTitle,
    transcript,
    topic
  } = await req.json();

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
    await getLearningsByCreator(creatorId);

  if (!learnings || learnings.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: 'No learnings found for creator'
      },
      { status: 404 }
    );
  }

  const ranked = rankLearnings(learnings);
  const top = selectTopLearnings(ranked);
  const score = scoreAudit(ranked);

  const brief = await generateViralBrief(
    creatorId,
    top,
    score,
    topic,
    videoTitle,
    transcript
  );

  return NextResponse.json({
    success: true,
    brief
  });
}
