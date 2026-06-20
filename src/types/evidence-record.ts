export type EvidenceResult =
  | 'validated'
  | 'rejected'
  | 'inconclusive';

export interface EvidenceRecord {
  experimentId: string;

  hypothesis: string;

  constraintType: string;

  metricBefore: number;

  metricAfter: number;

  result: EvidenceResult;

  evidenceStrength: number;

  learning: string;
}