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

export interface Diagnosis {
  title: string;
  category: 'identity' | 'audience' | 'momentum';
  severity: 'Critical' | 'High' | 'Medium';
  jarvisNoticed: string;
  pattern: string;
  turningPoint: string;
  whyItMatters: string;
  proof: string[];
  whatJarvisCannotIgnore: string;
  evidenceStrength: string;
}

export interface DiagnosisResult {
  diagnoses: Diagnosis[];
  debug: {
    observations: Observation[];
    patterns: Pattern[];
  };
}
