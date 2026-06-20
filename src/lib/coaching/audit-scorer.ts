import { RankedLearning }
  from '@/types/ranked-learning';

export interface AuditScore {
  overallScore: number;
  scoreLabel: string;
}

const STRONG_THRESHOLD = 80;
const DEVELOPING_THRESHOLD = 50;

function getScoreLabel(
  score: number
): string {
  if (score >= STRONG_THRESHOLD)
    return 'Strong';
  if (score >= DEVELOPING_THRESHOLD)
    return 'Developing';
  return 'Early Stage';
}

export function scoreAudit(
  learnings: RankedLearning[]
): AuditScore {
  if (!learnings || learnings.length === 0) {
    return {
      overallScore: 0,
      scoreLabel: 'Early Stage'
    };
  }

  const primary = learnings[0];
  const primaryConfidence =
    primary.learning.confidence;

  const secondary = learnings.slice(1);
  const avgSecondaryConfidence =
    secondary.length === 0
      ? primaryConfidence
      : secondary.reduce(
          (sum, r) =>
            sum + r.learning.confidence,
          0
        ) / secondary.length;

  const overallScore = Math.round(
    (primaryConfidence * 0.6) +
    (avgSecondaryConfidence * 0.4)
  );

  return {
    overallScore,
    scoreLabel: getScoreLabel(overallScore)
  };
}
