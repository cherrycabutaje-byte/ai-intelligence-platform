import { NextResponse } from 'next/server';
import { collectChannelEvidence } from '@/lib/channel-intelligence/diagnostics/channel-evidence-collector';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId') ?? 'UCKzIKD_YEqELez3Y5Vl1-3A';
  const evidence = await collectChannelEvidence(channelId);
  return NextResponse.json({
    totalVideosAnalyzed: evidence.totalVideosAnalyzed,
    averageViews: evidence.averageViews,
    topPerformerAverage: evidence.topPerformerAverage,
    recentPerformerAverage: evidence.recentPerformerAverage,
    driftScore: evidence.driftScore,
    daysSinceLastUpload: evidence.daysSinceLastUpload,
    gapRatio: evidence.gapRatio,
    topVideoTitles: evidence.topVideoTitles,
    bottomVideoTitles: evidence.bottomVideoTitles,
    recentVideoTitles: evidence.recentVideoTitles,
    allVideosCount: evidence.allVideos.length,
    sampleViews: evidence.allVideos.slice(0, 5).map(v => ({ title: v.title.slice(0, 30), views: v.views }))
  });
}
