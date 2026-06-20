import { GrowthAudit, AuditOpportunity }
  from '@/types/growth-audit';
import { AuditScore }
  from '@/lib/coaching/audit-scorer';
import { RoadmapStep }
  from '@/lib/coaching/roadmap-generator';

export interface CoachingOutput {
  primaryConstraint: string;
  supportingInsights: string[];
  why: string;
  actionPlan: string[];
  experiment: string;
  expectedImpact: string;
  highestOpportunity: {
    statement: string;
    priorityLabel: string;
    reason: string;
  };
  roadmap: RoadmapStep[];
}

function buildScoreReason(
  primaryConstraint: string,
  supportingInsights: string[]
): string {
  const bulletPoints =
    [primaryConstraint, ...supportingInsights]
      .map(insight => `- ${insight}`)
      .join('\n');

  return `Growth score is driven primarily by:\n${bulletPoints}`;
}

function buildTopOpportunity(
  coaching: CoachingOutput
): AuditOpportunity {
  const primaryRoadmapStep =
    coaching.roadmap[0];

  return {
    statement:
      coaching.highestOpportunity.statement,
    priority:
      coaching.highestOpportunity.priorityLabel,
    reason:
      coaching.highestOpportunity.reason,
    action:
      primaryRoadmapStep?.action ??
      coaching.actionPlan[0] ?? '',
    successMetric:
      primaryRoadmapStep?.successMetric ?? ''
  };
}

export function buildAudit(
  creatorId: string,
  coaching: CoachingOutput,
  score: AuditScore
): GrowthAudit {
  return {
    auditVersion: '7.0',
    creatorId,
    generatedAt: new Date().toISOString(),
    overallScore: score.overallScore,
    scoreLabel: score.scoreLabel,
    scoreReason: buildScoreReason(
      coaching.primaryConstraint,
      coaching.supportingInsights
    ),
    topOpportunity:
      buildTopOpportunity(coaching),
    supportingInsights:
      coaching.supportingInsights,
    roadmap:
      coaching.roadmap,
    experiment:
      coaching.experiment,
    expectedImpact:
      coaching.expectedImpact
  };
}
