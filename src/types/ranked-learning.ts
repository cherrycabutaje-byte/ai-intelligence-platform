import { CreatorLearning }
  from './creator-learning';

export interface RankedLearning {
  learning: CreatorLearning;

  priorityScore: number;
}