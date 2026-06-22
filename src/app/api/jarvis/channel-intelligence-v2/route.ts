import { NextResponse } from 'next/server';
import { runChannelIntelligenceV2 } from '@/lib/channel-intelligence-v2';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: Request) {
  try {
    const { channelId } = await req.json();

    if (!channelId) {
      return NextResponse.json(
        { success: false, message: 'channelId is required' },
        { status: 400 }
      );
    }

    const result = await runChannelIntelligenceV2(channelId);

    return NextResponse.json({
      success: true,
      channelName: result.channelName,
      subscribers: result.subscribers,
      totalVideos: result.totalVideos,
      lastUploadDays: result.lastUploadDays,
      overallHealth: result.overallHealth,
      oneLineSummary: result.oneLineSummary,
      evidence: {
        averageViews: result.evidence.averageViews,
        topPerformerAverage: result.evidence.topPerformerAverage,
        recentPerformerAverage: result.evidence.recentPerformerAverage,
        gapRatio: result.evidence.gapRatio,
        driftScore: result.evidence.driftScore,
        topVideos: result.evidence.topVideos,
        bottomVideos: result.evidence.bottomVideos,
        allTimeTopVideo: result.evidence.allTimeTopVideo,
        firstVideo: result.evidence.firstVideo,
        topTags: result.evidence.topTags,
      },
      intelligence: result.intelligence,
      ...(isDev && { debug: result.debug }),
    });

  } catch (error) {
    console.error('[V2] Error:', error);
    return NextResponse.json(
      { success: false, message: String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
