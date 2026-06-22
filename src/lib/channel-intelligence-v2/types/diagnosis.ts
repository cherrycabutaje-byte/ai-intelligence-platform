export interface Observation {
  id: string;
  statement: string;
  evidence: string[];
}

export interface Pattern {
  id: string;
  title: string;
  observations: string[];
  explanation: string;
}

export interface IntelligencePattern {
  id: string;
  observation: string;
  confidence: number;
}

export interface Hypothesis {
  explanation: string;
  confidence: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
}

export interface CoreMechanism {
  name: string;
  mechanismType: string;
  creatorTranslation: string;
  description: string;
  evidence: string[];
  confidence: number;
  mechanismStrength: number;
}

export interface Contradiction {
  creatorBelief: string;
  audienceBehavior: string;
  insight: string;
}

export interface BlindSpot {
  insight: string;
  confidence: number;
  reasoning: string;
  passesNonObvious: boolean;
  passesEvidenceBased: boolean;
  passesPerspectiveShift: boolean;
}

export interface ChannelIntelligence {
  executiveSummary: string;
  evidence: string[];
  patterns: IntelligencePattern[];
  hypotheses: Hypothesis[];
  coreMechanisms: CoreMechanism[];
  contradictions: Contradiction[];
  blindSpots: BlindSpot[];
  missingEvidence: string[];
  strategicTension: string;
}
