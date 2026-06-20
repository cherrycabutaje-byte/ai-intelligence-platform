export interface IntelligenceInsight {
  statement: string;

  confidence: number;

  supportingEvidenceCount: number;
}

export interface ChannelIntelligenceReportV2 {

  audienceInsights:
    IntelligenceInsight[];

  storyInsights:
    IntelligenceInsight[];

  hookInsights:
    IntelligenceInsight[];

  retentionInsights:
    IntelligenceInsight[];
}