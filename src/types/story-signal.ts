export type StorySignalCategory =
  | 'conflict'
  | 'transformation'
  | 'stakes'
  | 'identity';

export interface StorySignal {
  category: StorySignalCategory;

  statement: string;

  confidence: number;
}