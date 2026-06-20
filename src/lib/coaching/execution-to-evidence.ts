import { TrackedExecution }
  from '@/lib/coaching/execution-tracker';
import { EvidenceRecord }
  from '@/types/evidence-record';
import { OutcomeResult }
  from '@/types/coaching-execution';

function deriveEvidenceStrength(
  metricBefore: number,
  metricAfter: number
): number {
  if (metricBefore === 0) return 0;
  const deltaPercent = Math.abs(
    ((metricAfter - metricBefore) / metricBefore) * 100
  );
  return Math.min(Math.round(deltaPercent), 100);
}

function mapOutcomeToResult(
  outcomeResult: OutcomeResult
): EvidenceRecord['result'] {
  switch (outcomeResult) {
    case 'positive':
      return 'validated';
    case 'negative':
      return 'rejected';
    default:
      return 'inconclusive';
  }
}

export function convertExecutionToEvidence(
  tracked: TrackedExecution
): EvidenceRecord {
  return {
    experimentId:
      `${tracked.creatorId}-${tracked.executedAt}`,
    hypothesis:
      tracked.stepFocus,
    constraintType:
      'COACHING_EXECUTION',
    metricBefore:
      tracked.metricBefore,
    metricAfter:
      tracked.metricAfter,
    result:
      mapOutcomeToResult(
        tracked.outcomeResult
      ),
    evidenceStrength:
      deriveEvidenceStrength(
        tracked.metricBefore,
        tracked.metricAfter
      ),
    learning:
      tracked.observedOutcome
  };
}
