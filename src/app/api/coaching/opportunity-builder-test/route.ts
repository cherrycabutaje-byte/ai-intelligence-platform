import { NextResponse } from 'next/server';
import { buildOpportunity }
  from '@/lib/coaching/opportunity-builder';

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
      priorityScore: 104
    },
    {
      learning: {
        id: '2',
        statement: 'Story follows a transformation arc',
        confidence: 76,
        status: 'tentative' as const,
        supportingEvidenceCount: 3,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Transformation arcs retain viewers' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 91
    },
    {
      learning: {
        id: '3',
        statement: 'Hook relies on curiosity-driven problem framing',
        confidence: 70,
        status: 'tentative' as const,
        supportingEvidenceCount: 2,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Curiosity hooks perform better' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 80
    }
  ];

  const opportunities =
    mockLearnings.map(
      (ranked, index) =>
        buildOpportunity(ranked, index + 1)
    );

  return NextResponse.json({
    success: true,
    opportunities
  });
}
