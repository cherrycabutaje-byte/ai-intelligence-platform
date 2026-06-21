import { GapSeverity } from './pattern-match';

export interface EvidenceReasoning {
  creatorLearning: string;
  confidence: number;
  evidencePoints: number;
  currentVideoAlignment: number;
  gapSeverity: GapSeverity;
  conclusion: string;
  recommendationConfidence: number;
}
