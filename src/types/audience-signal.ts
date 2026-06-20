export type AudienceSignalCategory =
  | 'desire'
  | 'fear'
  | 'goal'
  | 'pain-point';

export interface AudienceSignal {
  category:
    AudienceSignalCategory;

  statement: string;

  confidence: number;
}