export type RetentionSignalCategory =
  | 'attention_drop'
  | 'open_loop'
  | 'payoff'
  | 'information_density';

export interface RetentionSignal {
  category: RetentionSignalCategory;

  statement: string;

  confidence: number;
}