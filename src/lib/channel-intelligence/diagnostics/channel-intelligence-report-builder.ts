import { FullDiagnosis } from './hypothesis-generator';
import { ChannelEvidence } from './channel-evidence-collector';

export interface ChannelIntelligenceReport {
  channelId: string;
  creatorId: string;
  generatedAt: string;
  channelName: string;
  subscribers: number;
  totalVideos: number;
  executiveSummary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    overallHealth: string;
    oneLineSummary: string;
  };
  diagnoses: FullDiagnosis[];
  topOpportunity: string;
}

function getOverallHealth(diagnoses: FullDiagnosis[]): string {
  const criticalCount = diagnoses.filter(
    d => d.rule.severity === 'Critical'
  ).length;
  const highCount = diagnoses.filter(
    d => d.rule.severity === 'High'
  ).length;

  if (criticalCount >= 2) return 'At Risk';
  if (criticalCount >= 1) return 'Needs Attention';
  if (highCount >= 2) return 'Room to Improve';
  return 'On Track';
}

function getOneLineSummary(
  diagnoses: FullDiagnosis[],
  evidence: ChannelEvidence
): string {
  if (diagnoses.length === 0) {
    return 'No major issues detected in the available data.';
  }

  const topDiagnosis = diagnoses[0];

  switch (topDiagnosis.rule.id) {
    case 'RULE_001':
      return `Your best content gets ${evidence.topPerformerAverage.toLocaleString()} views. Your recent content gets ${evidence.recentPerformerAverage.toLocaleString()}. That gap is the whole story.`;
    case 'RULE_002':
      return `Your channel says one thing but your audience watches something completely different.`;
    case 'RULE_003':
      return `Your channel is trying to be too many things at once and the algorithm does not know who to send it to.`;
    case 'RULE_009':
      return `You went quiet ${evidence.daysSinceLastUpload} days ago. The algorithm moved on. Your subscribers are still waiting.`;
    default:
      return `${diagnoses.length} issues found. The most important one is: ${topDiagnosis.rule.name}.`;
  }
}

function getTopOpportunity(diagnoses: FullDiagnosis[]): string {
  const opportunity = diagnoses.find(
    d => d.rule.category === 'opportunity'
  );

  if (opportunity) {
    return opportunity.whatJarvisFound;
  }

  const topDiagnosis = diagnoses[0];
  if (!topDiagnosis) return '';

  return topDiagnosis.rule.recommendedAction;
}

export function buildReport(
  diagnoses: FullDiagnosis[],
  evidence: ChannelEvidence,
  channelId: string,
  creatorId: string
): ChannelIntelligenceReport {
  const criticalCount = diagnoses.filter(
    d => d.rule.severity === 'Critical'
  ).length;
  const highCount = diagnoses.filter(
    d => d.rule.severity === 'High'
  ).length;
  const mediumCount = diagnoses.filter(
    d => d.rule.severity === 'Medium'
  ).length;

  return {
    channelId,
    creatorId,
    generatedAt: new Date().toISOString(),
    channelName: evidence.channelStats.channelTitle,
    subscribers: evidence.channelStats.subscribers,
    totalVideos: evidence.channelStats.totalVideos,
    executiveSummary: {
      criticalCount,
      highCount,
      mediumCount,
      overallHealth: getOverallHealth(diagnoses),
      oneLineSummary: getOneLineSummary(diagnoses, evidence)
    },
    diagnoses,
    topOpportunity: getTopOpportunity(diagnoses)
  };
}
