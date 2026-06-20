import { RoadmapStep }
  from '@/lib/coaching/roadmap-generator';

export interface AuditOpportunity {
  statement: string;
  priority: string;
  reason: string;
  action: string;
  successMetric: string;
}

export interface GrowthAudit {
  auditVersion: string;
  creatorId: string;
  generatedAt: string;
  overallScore: number;
  scoreLabel: string;
  scoreReason: string;
  topOpportunity: AuditOpportunity;
  supportingInsights: string[];
  roadmap: RoadmapStep[];
  experiment: string;
  expectedImpact: string;
}
