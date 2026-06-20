export type KnowledgeStatus =
  | 'emerging'
  | 'tentative'
  | 'validated'
  | 'rejected';

export interface KnowledgeCandidate {
  statement: string;

  supportingEvidenceCount: number;

  contradictingEvidenceCount: number;

  confidence: number;

  status: KnowledgeStatus;

  lastUpdated: string;
}