import {
  CreatorLearning
} from './creator-learning';

export interface CreatorMemory {
  creatorId: string;

  learnings: CreatorLearning[];

  lastUpdated: string;
}