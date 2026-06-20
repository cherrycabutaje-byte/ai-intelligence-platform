import { RoadmapStep }
  from '@/lib/coaching/roadmap-generator';

export type ExecutionStatus =
  | 'completed'
  | 'partial'
  | 'skipped';

export type OutcomeResult =
  | 'positive'
  | 'negative'
  | 'inconclusive';

export interface CoachingExecution {
  creatorId: string;
  roadmapStep: RoadmapStep;
  status: ExecutionStatus;
  outcomeResult: OutcomeResult;
  observedOutcome: string;
  metricBefore: number;
  metricAfter: number;
  executedAt: string;
}
