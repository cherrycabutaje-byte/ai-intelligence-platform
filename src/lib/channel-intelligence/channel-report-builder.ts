import { ChannelIntelligenceReport }
  from '@/types/channel-intelligence-report';

export function buildChannelReport():
  ChannelIntelligenceReport {

  return {

    audienceInsights: [
      'Audience responds strongly to transformation content'
    ],

    storyInsights: [
      'Transformation stories appear frequently'
    ],

    hookInsights: [
      'Curiosity-driven problem hooks perform well'
    ],

    retentionInsights: [
      'Open loops and payoffs improve retention'
    ],

    coachingRecommendations: [
      'Lead with transformation earlier',
      'Use curiosity-driven hooks',
      'Create stronger open loops',
      'Increase emotional payoff'
    ]
  };
}