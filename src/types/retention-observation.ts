export type RetentionObservationType =
  'retention_signal_cluster';

export interface RetentionObservation {
  observationType:
    RetentionObservationType;

  hypothesis: string;

  signals: string[];

  supportsHypothesis: boolean;

  confidence: number;

  observedAt: string;
}