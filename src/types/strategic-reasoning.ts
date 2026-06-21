import { EvidenceReasoning } from './evidence-reasoning';
import { PatternMatch } from './pattern-match';

export interface PrimaryGap {
  pattern: string;
  historicalConfidence: number;
  currentAlignment: number;
  gapScore: number;
  severity: string;
  recommendation: string;
}

export interface StrategicReasoning {
  creatorHasHistory: boolean;
  topStrength: string;
  evidenceReasonings: EvidenceReasoning[];
  patternMatches: PatternMatch[];
  primaryGap: PrimaryGap | null;
  alignmentSummary: string;
  overallRecommendationConfidence: number;
  promptContext: string;
}
