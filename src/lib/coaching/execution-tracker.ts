import { CoachingExecution, ExecutionStatus, OutcomeResult }
  from '@/types/coaching-execution';

export interface TrackedExecution {
  creatorId: string;
  stepFocus: string;
  status: ExecutionStatus;
  outcomeResult: OutcomeResult;
  observedOutcome: string;
  metricBefore: number;
  metricAfter: number;
  executedAt: string;
}

export function trackExecution(
  execution: CoachingExecution
): TrackedExecution {
  return {
    creatorId:
      execution.creatorId,
    stepFocus:
      execution.roadmapStep.focus,
    status:
      execution.status,
    outcomeResult:
      execution.outcomeResult,
    observedOutcome:
      execution.observedOutcome,
    metricBefore:
      execution.metricBefore,
    metricAfter:
      execution.metricAfter,
    executedAt:
      execution.executedAt
  };
}
