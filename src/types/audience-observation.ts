export type AudienceObservationType =
  'audience_signal_cluster';

export interface AudienceObservation {
  observationType:
    AudienceObservationType;

  hypothesis: string;

  signals: string[];

  supportsHypothesis: boolean;

  confidence: number;

  observedAt: string;
}