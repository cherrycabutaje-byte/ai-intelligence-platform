export type GapSeverity = 'High' | 'Medium' | 'Low';

export interface PatternMatch {
  pattern: string;
  confidence: number;
  evidencePoints: number;
  presentInVideo: boolean;
  alignmentScore: number;
  gapScore: number;
  severity: GapSeverity;
  recommendationConfidence: number;
}
