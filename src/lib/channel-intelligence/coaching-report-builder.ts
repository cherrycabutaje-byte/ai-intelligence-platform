// @ts-nocheck
import { CoachingRecommendation }
  from '@/types/coaching-recommendation';

import { CoachingReport }
  from '@/types/coaching-report';

import {
  ChannelIntelligenceReportV2
} from '@/types/channel-intelligence-report-v2';

export function buildCoachingReport(
  report: ChannelIntelligenceReportV2
): CoachingReport {

  const topAudienceInsight =
    report.audienceInsights[0];

  const topHookInsight =
    report.hookInsights[0];

  const recommendations:
    CoachingRecommendation[] = [

      {
        title:
          'Transformation-First Test',

        rationale:
          topAudienceInsight?.statement ??
          'No audience insight available',

        expectedImpact:
          'Higher click-through rate'
      },

      {
        title:
          'Curiosity Hook Test',

        rationale:
          topHookInsight?.statement ??
          'No hook insight available',

        expectedImpact:
          'Higher audience retention'
      }
    ];

  return {
    primaryConstraint:
      topAudienceInsight?.statement ??
      'No audience constraint identified',

    recommendations,

    recommendedExperiment:
      topAudienceInsight &&
      topHookInsight
        ? 'Test transformation-first titles combined with curiosity-driven hooks across the next 5 videos'
        : 'Collect more evidence before running an experiment',

    coachDirective:
      topAudienceInsight
        ? `Double down on: ${topAudienceInsight.statement}`
        : 'Collect more audience evidence'
   };
}
