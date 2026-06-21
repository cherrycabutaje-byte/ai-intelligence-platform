import { NextResponse } from 'next/server';
import { generateAction }
  from '@/lib/coaching/action-generator';

export async function GET() {
  const mockLearning = {
    learning: {
      id: '1',
      statement:
        'Transformation titles outperform travel titles',
      confidence: 84,
      status: 'tentative' as const,
      supportingEvidenceCount: 4,
      contradictingEvidenceCount: 0,
      origin: {
        hypothesis:
          'Audience prefers transformation content'
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    priorityScore: 88
  };

  return NextResponse.json({
    success: true,
    action: generateAction(mockLearning)
  });
}
