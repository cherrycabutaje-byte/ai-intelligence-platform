export type LearningStatus =
  | 'emerging'
  | 'tentative'
  | 'validated'
  | 'rejected';

export interface CreatorLearning {
  id: string;

  statement: string;

  origin: {
    hypothesis: string;

    constraintType?: string;

    experimentId?: string;
  };

  confidence: number;

  status: LearningStatus;

  supportingEvidenceCount: number;

  contradictingEvidenceCount: number;

  createdAt: string;

  lastUpdated: string;
}