import {
  resolveChannelId,
  collectChannelVideos
} from '@/lib/youtube/channel-video-collector';
import { analyzeAudienceText }
  from '@/lib/audience-intelligence/audience-analyzer';
import { buildAudienceHypothesis }
  from '@/lib/audience-intelligence/audience-hypothesis-builder';
import { createAudienceObservation }
  from '@/lib/audience-intelligence/audience-observation-adapter';
import { buildAudienceEvidence }
  from '@/lib/audience-intelligence/audience-evidence-builder';
import { analyzeStoryText }
  from '@/lib/story-intelligence/story-analyzer';
import { buildStoryHypothesis }
  from '@/lib/story-intelligence/story-hypothesis-builder';
import { createStoryObservation }
  from '@/lib/story-intelligence/story-observation-adapter';
import { buildStoryEvidence }
  from '@/lib/story-intelligence/story-evidence-builder';
import { analyzeHookText }
  from '@/lib/hook-intelligence/hook-analyzer';
import { buildHookHypothesis }
  from '@/lib/hook-intelligence/hook-hypothesis-builder';
import { createHookObservation }
  from '@/lib/hook-intelligence/hook-observation-adapter';
import { buildHookEvidence }
  from '@/lib/hook-intelligence/hook-evidence-builder';
import { analyzeRetentionText }
  from '@/lib/retention-intelligence/retention-analyzer';
import { buildRetentionHypothesis }
  from '@/lib/retention-intelligence/retention-hypothesis-builder';
import { createRetentionObservation }
  from '@/lib/retention-intelligence/retention-observation-adapter';
import { buildRetentionEvidence }
  from '@/lib/retention-intelligence/retention-evidence-builder';
import { processEvidence }
  from '@/lib/human-behavior/memory-manager';

export interface ChannelAnalysisResult {
  videosProcessed: number;
  transcriptLength: number;
  audienceEvidence: number;
  storyEvidence: number;
  hookEvidence: number;
  retentionEvidence: number;
  totalEvidence: number;
  learningsUpdated: number;
  failedEngines: string[];
}

async function runEngine(
  engineName: string,
  fn: () => Promise<void>,
  failedEngines: string[]
): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch {
    failedEngines.push(engineName);
    return false;
  }
}

export async function analyzeChannel(
  channelUrl: string,
  creatorId: string,
  baseUrl: string
): Promise<ChannelAnalysisResult> {
  const failedEngines: string[] = [];

  const channelId =
    await resolveChannelId(channelUrl);

  if (!channelId) {
    throw new Error(
      `Could not resolve channelId from: ${channelUrl}`
    );
  }

  const { videoIds } =
    await collectChannelVideos(channelId);

  if (videoIds.length === 0) {
    throw new Error(
      `No videos found for channel: ${channelId}`
    );
  }

  const videoId = videoIds[0];
  const videoUrl =
    `https://www.youtube.com/watch?v=${videoId}`;

  const scrapeRes = await fetch(
    `${baseUrl}/api/jarvis/scrape`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: videoUrl,
        platform: 'YouTube'
      })
    }
  );

  const scrapeData = await scrapeRes.json();
  const transcript: string =
    scrapeData.scraped_data?.transcript ?? '';

  const transcriptLength = transcript.length;

  let audienceEvidence = 0;
  let storyEvidence = 0;
  let hookEvidence = 0;
  let retentionEvidence = 0;

  const audienceOk = await runEngine(
    'audience',
    async () => {
      const signals =
        analyzeAudienceText(transcript);
      const hypothesis =
        buildAudienceHypothesis(signals);
      const observation =
        createAudienceObservation(hypothesis);
      const evidence =
        buildAudienceEvidence(observation);
      await processEvidence(creatorId, evidence);
    },
    failedEngines
  );
  if (audienceOk) audienceEvidence = 1;

  const storyOk = await runEngine(
    'story',
    async () => {
      const signals =
        analyzeStoryText(transcript);
      const hypothesis =
        buildStoryHypothesis(signals);
      const observation =
        createStoryObservation(hypothesis);
      const evidence =
        buildStoryEvidence(observation);
      await processEvidence(creatorId, evidence);
    },
    failedEngines
  );
  if (storyOk) storyEvidence = 1;

  const hookOk = await runEngine(
    'hook',
    async () => {
      const signals =
        analyzeHookText(transcript);
      const hypothesis =
        buildHookHypothesis(signals);
      const observation =
        createHookObservation(hypothesis);
      const evidence =
        buildHookEvidence(observation);
      await processEvidence(creatorId, evidence);
    },
    failedEngines
  );
  if (hookOk) hookEvidence = 1;

  const retentionOk = await runEngine(
    'retention',
    async () => {
      const signals =
        analyzeRetentionText(transcript);
      const hypothesis =
        buildRetentionHypothesis(signals);
      const observation =
        createRetentionObservation(hypothesis);
      const evidence =
        buildRetentionEvidence(observation);
      await processEvidence(creatorId, evidence);
    },
    failedEngines
  );
  if (retentionOk) retentionEvidence = 1;

  const totalEvidence =
    audienceEvidence +
    storyEvidence +
    hookEvidence +
    retentionEvidence;

  return {
    videosProcessed: 1,
    transcriptLength,
    audienceEvidence,
    storyEvidence,
    hookEvidence,
    retentionEvidence,
    totalEvidence,
    learningsUpdated: totalEvidence,
    failedEngines
  };
}
