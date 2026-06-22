import { collectEvidence } from './evidence/collector';
import { validateEvidence } from './evidence/validator';
import { generateObservations } from './diagnosis/observation-engine';
import { detectPatterns } from './diagnosis/pattern-engine';
import { buildIntelligence } from './diagnosis/diagnosis-builder';
import { ChannelEvidence } from './types/evidence';
import { ChannelIntelligence, Observation, Pattern } from './types/diagnosis';

export interface ChannelIntelligenceV2Result {
  channelName: string;
  subscribers: number;
  totalVideos: number;
  lastUploadDays: number;
  overallHealth: string;
  oneLineSummary: string;
  evidence: ChannelEvidence;
  intelligence: ChannelIntelligence;
  debug: {
    observations: Observation[];
    patterns: Pattern[];
  };
}

export async function runChannelIntelligenceV2(
  channelId: string
): Promise<ChannelIntelligenceV2Result> {

  const evidence = await collectEvidence(channelId);

  const validation = validateEvidence(evidence);
  if (!validation.valid) {
    throw new Error(`Insufficient evidence: ${validation.reason}`);
  }

  const observations = generateObservations(evidence);
  console.log(`[V2] Generated ${observations.length} observations`);

  const patterns = detectPatterns(evidence, observations);
  console.log(`[V2] Detected ${patterns.length} patterns`);

  const intelligence = await buildIntelligence(evidence, observations, patterns);

  const overallHealth = evidence.driftScore > 80 ? 'At Risk'
    : evidence.driftScore > 50 ? 'Needs Attention'
    : evidence.driftScore > 20 ? 'Room to Improve'
    : 'On Track';

  const oneLineSummary = intelligence.executiveSummary.split('.')[0] + '.';

  return {
    channelName: evidence.channelTitle,
    subscribers: evidence.subscribers,
    totalVideos: evidence.totalVideos,
    lastUploadDays: evidence.daysSinceLastUpload,
    overallHealth,
    oneLineSummary,
    evidence,
    intelligence,
    debug: { observations, patterns },
  };
}

