import { NextResponse } from 'next/server';
import { CoachingExecution }
  from '@/types/coaching-execution';

export async function GET() {
  const mockExecution: CoachingExecution = {
    creatorId: 'christine',
    roadmapStep: {
      step: 1,
      priority: 'High Priority',
      focus: 'Transformation titles outperform travel titles',
      action: 'Lead future content with: Transformation titles outperform travel titles',
      successMetric: 'Measure click-through rate across next 5 videos applying: Transformation titles outperform travel titles'
    },
    status: 'completed',
    outcomeResult: 'positive',
    observedOutcome: 'Click-through rate increased from 4.2% to 6.8% after applying transformation-first titles.',
    metricBefore: 4.2,
    metricAfter: 6.8,
    executedAt: new Date().toISOString()
  };

  return NextResponse.json({
    success: true,
    execution: mockExecution
  });
}
