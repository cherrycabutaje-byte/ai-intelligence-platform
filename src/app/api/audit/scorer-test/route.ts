import { NextResponse } from 'next/server';
import { scoreAudit }
  from '@/lib/coaching/audit-scorer';

export async function GET() {
  const mockLearnings = [
    {
      learning: {
        id: '1',
        statement: 'Transformation titles outperform travel titles',
        confidence: 92,
        status: 'validated' as const,
        supportingEvidenceCount: 5,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Audience prefers transformation content' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 117
    },
    {
      learning: {
        id: '2',
        statement: 'Story follows a transformation arc',
        confidence: 68,
        status: 'tentative' as const,
        supportingEvidenceCount: 2,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Transformation arcs retain viewers' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 78
    },
    {
      learning: {
        id: '3',
        statement: 'Hook relies on curiosity-driven problem framing',
        confidence: 68,
        status: 'tentative' as const,
        supportingEvidenceCount: 2,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Curiosity hooks perform better' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 78
    }
  ];

  const score = scoreAudit(mockLearnings);
  const emptyScore = scoreAudit([]);

  return NextResponse.json({
    success: true,
    score,
    emptyScore
  });
}
