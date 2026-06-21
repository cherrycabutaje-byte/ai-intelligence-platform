export interface TransformationSignals {
  beforeState: boolean;
  afterState: boolean;
  conflict: boolean;
  turningPoint: boolean;
  lesson: boolean;
  score: number;
}

export interface CuriositySignals {
  unresolvedQuestion: boolean;
  futureReveal: boolean;
  mystery: boolean;
  contradiction: boolean;
  score: number;
}

export interface StakesSignals {
  lossRisk: boolean;
  gainOpportunity: boolean;
  consequence: boolean;
  commitment: boolean;
  score: number;
}

export interface SignalDetectionResult {
  transformation: TransformationSignals;
  curiosity: CuriositySignals;
  stakes: StakesSignals;
}
