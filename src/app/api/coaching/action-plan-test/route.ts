import { NextResponse } from 'next/server';
import { generateActionPlan }
  from '@/lib/coaching/action-plan-generator';

export async function GET() {
  const mockLearnings = [
    {
      learning: {
        id: '1',
        statement: 'Transformation titles outperform travel titles',
        confidence: 84,
        status: 'validated' as const,
        supportingEvidenceCount: 4,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Audience prefers transformation content' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 88
    },
    {
      learning: {
        id: '2',
        statement: 'Short hooks under 10 seconds retain more viewers',
        confidence: 76,
        status: 'tentative' as const,
        supportingEvidenceCount: 3,
        contradictingEvidenceCount: 1,
        origin: { hypothesis: 'Shorter hooks perform better' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 79
    },
    {
      learning: {
        id: '3',
        statement: 'Personal stories outperform tips-only videos',
        confidence: 70,
        status: 'tentative' as const,
        supportingEvidenceCount: 2,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Stories drive more connection' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 72
    }
  ];

  const actionPlan =
    generateActionPlan(mockLearnings);

  return NextResponse.json({
    success: true,
    actionCount: actionPlan.length,
    actionPlan
  });
}
