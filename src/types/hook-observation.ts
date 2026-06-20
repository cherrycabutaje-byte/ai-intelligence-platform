export type HookObservationType =
  'hook_signal_cluster';

export interface HookObservation {
  observationType:
    HookObservationType;

  hypothesis: string;

  signals: string[];

  supportsHypothesis: boolean;

  confidence: number;

  observedAt: string;
}