import { EvaluatedDiagnosis } from './rule-evaluator';
import { ChannelEvidence } from './channel-evidence-collector';

export interface ScoredDiagnosis extends EvaluatedDiagnosis {
  finalConfidence: number;
  confidenceLabel: string;
}

function getConfidenceLabel(score: number): string {
  if (score >= 85) return 'Very High';
  if (score >= 70) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

function applyModifiers(
  diagnosis: EvaluatedDiagnosis,
  evidence: ChannelEvidence
): number {
  let score = diagnosis.rawConfidence;

  // More data = more confidence
  if (evidence.totalVideosAnalyzed >= 15) score += 5;
  if (evidence.totalVideosAnalyzed >= 10) score += 3;
  if (evidence.totalVideosAnalyzed < 5) score -= 10;

  // More evidence points = more confidence
  if (diagnosis.evidencePoints.length >= 4) score += 5;
  if (diagnosis.evidencePoints.length >= 3) score += 3;

  // Large performance gaps = more confidence
  if (evidence.gapRatio >= 20) score += 5;
  if (evidence.gapRatio >= 10) score += 3;

  return Math.min(95, Math.max(40, score));
}

export function calculateConfidence(
  diagnoses: EvaluatedDiagnosis[],
  evidence: ChannelEvidence
): ScoredDiagnosis[] {
  return diagnoses.map(diagnosis => {
    const finalConfidence = applyModifiers(diagnosis, evidence);
    return {
      ...diagnosis,
      finalConfidence,
      confidenceLabel: getConfidenceLabel(finalConfidence)
    };
  });
}
