import {
  EvidenceRecord,
  EvidenceResult
} from '@/types/evidence-record';

export function evaluateEvidence(
  experimentId: string,
  hypothesis: string,
  constraintType: string,
  metricBefore: number,
  metricAfter: number
): EvidenceRecord {

  const improvement =
  metricBefore === 0
    ? 0
    : ((metricAfter - metricBefore) / metricBefore) * 100;

  let result: EvidenceResult =
    'inconclusive';

  if (improvement >= 20) {
    result = 'validated';
  } else if (improvement < 0) {
    result = 'rejected';
  }

  return {
    experimentId,

    hypothesis,

    constraintType,

    metricBefore,

    metricAfter,

    result,

    evidenceStrength:
      Math.round(Math.abs(improvement)),

    learning:
      `Performance changed by ${improvement.toFixed(1)}%`
  };
}