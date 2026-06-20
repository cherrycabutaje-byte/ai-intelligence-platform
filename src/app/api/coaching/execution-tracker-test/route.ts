import { NextResponse } from 'next/server';
import { trackExecution }
  from '@/lib/coaching/execution-tracker';

export async function GET() {
  const mockExecution = {
    creatorId: 'christine',
    roadmapStep: {
      step: 1,
      priority: 'High Priority',
      focus: 'Transformation titles outperform travel titles',
      action: 'Lead future content with: Transformation titles outperform travel titles',
      successMetric: 'Measure click-through rate across next 5 videos applying: Transformation titles outperform travel titles'
    },
    status: 'completed' as const,
    outcomeResult: 'positive' as const,
    observedOutcome: 'Click-through rate increased from 4.2% to 6.8% after applying transformation-first titles.',
    metricBefore: 4.2,
    metricAfter: 6.8,
    executedAt: new Date().toISOString()
  };

  const tracked =
    trackExecution(mockExecution);

  return NextResponse.json({
    success: true,
    tracked
  });
}
