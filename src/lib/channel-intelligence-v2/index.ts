import { collectEvidence } from './evidence/collector';
import { validateEvidence } from './evidence/validator';
import { generateObservations } from './diagnosis/observation-engine';
import { detectPatterns } from './diagnosis/pattern-engine';
import { buildDiagnoses } from './diagnosis/diagnosis-builder';
import { ChannelEvidence } from './types/evidence';
import { Diagnosis, Observation, Pattern } from './types/diagnosis';

export interface ChannelIntelligenceV2Result {
  channelName: string;
  subscribers: number;
  totalVideos: number;
  lastUploadDays: number;
  overallHealth: string;
  oneLineSummary: string;
  evidence: ChannelEvidence;
  diagnoses: Diagnosis[];
  debug: {
    observations: Observation[];
    patterns: Pattern[];
  };
}

export async function runChannelIntelligenceV2(
  channelId: string
): Promise<ChannelIntelligenceV2Result> {

  // Step 1 — Collect evidence
  const evidence = await collectEvidence(channelId);

  // Step 2 — Validate
  const validation = validateEvidence(evidence);
  if (!validation.valid) {
    throw new Error(`Insufficient evidence: ${validation.reason}`);
  }

  // Step 3 — Generate observations
  const observations = generateObservations(evidence);
  console.log(`[V2] Generated ${observations.length} observations`);

  // Step 4 — Detect patterns
  const patterns = detectPatterns(evidence, observations);
  console.log(`[V2] Detected ${patterns.length} patterns`);

  // Step 5 — Build diagnoses
  const diagnoses = await buildDiagnoses(evidence, observations, patterns);

  // Step 6 — Health and summary
  const overallHealth = evidence.driftScore > 80 ? 'At Risk'
    : evidence.driftScore > 50 ? 'Needs Attention'
    : evidence.driftScore > 20 ? 'Room to Improve'
    : 'On Track';

  const oneLineSummary = evidence.topPerformerAverage > 0 && evidence.recentPerformerAverage > 0
    ? `Your best content gets ${evidence.topPerformerAverage.toLocaleString()} views. Your recent content gets ${evidence.recentPerformerAverage.toLocaleString()}. That gap is the whole story.`
    : 'Your channel has a unique growth pattern.';

  return {
    channelName: evidence.channelTitle,
    subscribers: evidence.subscribers,
    totalVideos: evidence.totalVideos,
    lastUploadDays: evidence.daysSinceLastUpload,
    overallHealth,
    oneLineSummary,
    evidence,
    diagnoses,
    debug: { observations, patterns },
  };
}
