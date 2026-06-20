import { NextResponse } from 'next/server';
import { CoachingExecution }
  from '@/types/coaching-execution';
import { trackExecution }
  from '@/lib/coaching/execution-tracker';
import { convertExecutionToEvidence }
  from '@/lib/coaching/execution-to-evidence';
import { processEvidence }
  from '@/lib/human-behavior/memory-manager';

export async function POST(req: Request) {
  const body: CoachingExecution =
    await req.json();

  if (!body.creatorId) {
    return NextResponse.json(
      {
        success: false,
        message: 'creatorId is required'
      },
      { status: 400 }
    );
  }

  const trackedExecution =
    trackExecution(body);

  const evidence =
    convertExecutionToEvidence(
      trackedExecution
    );

  const updatedLearning =
    await processEvidence(
      body.creatorId,
      evidence
    );

  return NextResponse.json({
    success: true,
    trackedExecution,
    evidence,
    updatedLearning
  });
}
