import {
  getLearningsByCreator
} from '@/lib/human-behavior/creator-learning-repository';

import {
  ChannelIntelligenceReportV2,
  IntelligenceInsight
} from '@/types/channel-intelligence-report-v2';

import { CreatorLearning }
  from '@/types/creator-learning';

function mapLearningToInsight(
  learning: CreatorLearning
): IntelligenceInsight {

  return {
    statement:
      learning.statement,

    confidence:
      learning.confidence,

    supportingEvidenceCount:
      learning.supportingEvidenceCount
  };
}

export async function buildMemoryPoweredReport(
  creatorId: string
): Promise<ChannelIntelligenceReportV2> {

  const learnings =
    await getLearningsByCreator(
      creatorId
    );

const audienceInsights =
  learnings
    .filter(
      learning =>
        [
          'AUDIENCE_SIGNAL_CLUSTER',
          'AUDIENCE_MISMATCH'
        ].includes(
          learning.origin.constraintType ?? ''
        )
    )
    .map(
      mapLearningToInsight
    );

  const storyInsights =
    learnings
      .filter(
        learning =>
          learning.origin.constraintType ===
          'STORY_SIGNAL_CLUSTER'
      )
      .map(
        mapLearningToInsight
      );

  const hookInsights =
    learnings
      .filter(
        learning =>
          learning.origin.constraintType ===
          'HOOK_SIGNAL_CLUSTER'
      )
      .map(
        mapLearningToInsight
      );

const retentionInsights =
  learnings
    .filter(
      learning =>
        [
          'RETENTION_SIGNAL_CLUSTER',
          'ATTENTION_LEAK'
        ].includes(
          learning.origin.constraintType ?? ''
        )
    )
    .map(
      mapLearningToInsight
    );

  return {
    audienceInsights,
    storyInsights,
    hookInsights,
    retentionInsights
  };
}