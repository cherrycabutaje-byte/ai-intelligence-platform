import { NextResponse } from 'next/server';
import { collectChannelEvidence } from '@/lib/channel-intelligence/diagnostics/channel-evidence-collector';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId') ?? 'UCKzIKD_YEqELez3Y5Vl1-3A';
  const evidence = await collectChannelEvidence(channelId);
  return NextResponse.json({
    totalVideosAnalyzed: evidence.totalVideosAnalyzed,
    averageViews: evidence.averageViews,
    averageLikes: evidence.averageLikes,
    averageEngagementRate: evidence.averageEngagementRate,
    topPerformerAverage: evidence.topPerformerAverage,
    recentPerformerAverage: evidence.recentPerformerAverage,
    driftScore: evidence.driftScore,
    daysSinceLastUpload: evidence.daysSinceLastUpload,
    uploadFrequencyDays: evidence.uploadFrequencyDays,
    gapRatio: evidence.gapRatio,
    shortFormCount: evidence.shortFormCount,
    longFormCount: evidence.longFormCount,
    avgDurationSeconds: evidence.avgDurationSeconds,
    channelKeywords: evidence.channelKeywords,
    topTags: evidence.topTags,
    allTagsCount: evidence.allTags.length,
    allCategories: evidence.allCategories,
    topVideoTitles: evidence.topVideoTitles,
    bottomVideoTitles: evidence.bottomVideoTitles,
    recentVideoTitles: evidence.recentVideoTitles,
    topVideoDescriptions: evidence.topVideoDescriptions,
    channelDescription: evidence.channelDescription.slice(0, 150),
    recentVideosPublishedAt: evidence.recentVideos.map(v => v.publishedAt)
  });
}
