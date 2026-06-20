import { NextResponse } from 'next/server';
import { convertExecutionToEvidence }
  from '@/lib/coaching/execution-to-evidence';

export async function GET() {
  const mockTracked = {
    creatorId: 'christine',
    stepFocus: 'Transformation titles outperform travel titles',
    status: 'completed' as const,
    outcomeResult: 'positive' as const,
    observedOutcome: 'Click-through rate increased from 4.2% to 6.8% after applying transformation-first titles.',
    metricBefore: 4.2,
    metricAfter: 6.8,
    executedAt: '2026-06-20T16:15:01.702Z'
  };

  const evidence =
    convertExecutionToEvidence(
      mockTracked
    );

  return NextResponse.json({
    success: true,
    evidence
  });
}
