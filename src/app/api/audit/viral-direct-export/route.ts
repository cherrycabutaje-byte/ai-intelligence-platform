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
import { renderViralBriefPDF }
  from '@/lib/coaching/viral-brief-pdf-renderer';

const DEFAULT_LEARNINGS = [
  {
    learning: {
      id: 'default-1',
      statement: 'Content that tells a personal transformation story outperforms generic list content',
      confidence: 70,
      status: 'tentative' as const,
      supportingEvidenceCount: 3,
      contradictingEvidenceCount: 0,
      origin: { hypothesis: 'Personal stories drive more engagement' },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    priorityScore: 85
  },
  {
    learning: {
      id: 'default-2',
      statement: 'Curiosity-driven hooks in the first 3 seconds retain more viewers',
      confidence: 75,
      status: 'tentative' as const,
      supportingEvidenceCount: 4,
      contradictingEvidenceCount: 0,
      origin: { hypothesis: 'Strong hooks improve retention' },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    priorityScore: 79
  },
  {
    learning: {
      id: 'default-3',
      statement: 'Content with clear stakes and personal risk gets more shares',
      confidence: 68,
      status: 'tentative' as const,
      supportingEvidenceCount: 2,
      contradictingEvidenceCount: 0,
      origin: { hypothesis: 'Stakes drive shareability' },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    priorityScore: 72
  }
];

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

  let learnings = await getLearningsByCreator(creatorId);

  if (!learnings || learnings.length === 0) {
    learnings = DEFAULT_LEARNINGS.map(d => d.learning);
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

  const pdfBuffer = await renderViralBriefPDF(brief);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        `attachment; filename="jarvis-content-code-brief.pdf"`
    }
  });
}
