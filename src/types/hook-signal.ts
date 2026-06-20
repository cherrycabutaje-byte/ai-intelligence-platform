export type HookSignalCategory =
  | 'curiosity'
  | 'surprise'
  | 'problem'
  | 'promise';

export interface HookSignal {
  category: HookSignalCategory;

  statement: string;

  confidence: number;
}