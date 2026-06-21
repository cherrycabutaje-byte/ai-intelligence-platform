import {
  fetchChannelStats,
  fetchVideoStats,
  VideoStats,
  ChannelStats
} from '@/lib/youtube/channel-video-collector';

export interface ChannelEvidence {
  // Channel overview
  channelStats: ChannelStats;

  // Performance
  allVideos: VideoStats[];
  topVideos: VideoStats[];
  bottomVideos: VideoStats[];
  recentVideos: VideoStats[];
  averageViews: number;
  gapRatio: number;

  // Posting behavior
  daysSinceLastUpload: number;
  uploadFrequencyDays: number;
  totalVideosAnalyzed: number;

  // Topic patterns
  topVideoTitles: string[];
  bottomVideoTitles: string[];
  recentVideoTitles: string[];
  channelDescription: string;

  // Performance gaps
  topPerformerAverage: number;
  bottomPerformerAverage: number;
  recentPerformerAverage: number;
  driftScore: number;
}

function calculateAverageViews(videos: VideoStats[]): number {
  if (videos.length === 0) return 0;
  return Math.round(
    videos.reduce((sum, v) => sum + v.views, 0) / videos.length
  );
}

function calculateDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function calculateUploadFrequency(videos: VideoStats[]): number {
  if (videos.length < 2) return 0;
  const sorted = [...videos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const newest = new Date(sorted[0].publishedAt).getTime();
  const oldest = new Date(sorted[sorted.length - 1].publishedAt).getTime();
  const daySpan = (newest - oldest) / (1000 * 60 * 60 * 24);
  return Math.round(daySpan / videos.length);
}

function calculateDriftScore(
  recentVideos: VideoStats[],
  topVideos: VideoStats[]
): number {
  if (recentVideos.length === 0 || topVideos.length === 0) return 100;
  const recentAvg = calculateAverageViews(recentVideos);
  const topAvg = calculateAverageViews(topVideos);
  if (topAvg === 0) return 0;
  const ratio = recentAvg / topAvg;
  return Math.round((1 - ratio) * 100);
}

export async function collectChannelEvidence(
  channelId: string
): Promise<ChannelEvidence> {
  const [channelStats, allVideos] = await Promise.all([
    fetchChannelStats(channelId),
    fetchVideoStats(channelId)
  ]);

  if (allVideos.length === 0) {
    return {
      channelStats,
      allVideos: [],
      topVideos: [],
      bottomVideos: [],
      recentVideos: [],
      averageViews: 0,
      gapRatio: 0,
      daysSinceLastUpload: 0,
      uploadFrequencyDays: 0,
      totalVideosAnalyzed: 0,
      topVideoTitles: [],
      bottomVideoTitles: [],
      recentVideoTitles: [],
      channelDescription: channelStats.description,
      topPerformerAverage: 0,
      bottomPerformerAverage: 0,
      recentPerformerAverage: 0,
      driftScore: 0
    };
  }

  // Sort by views
  const sortedByViews = [...allVideos].sort((a, b) => b.views - a.views);
  const topVideos = sortedByViews.slice(0, 3);
  const bottomVideos = sortedByViews.slice(-3).reverse();

  // Sort by date for recent
  const sortedByDate = [...allVideos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const recentVideos = sortedByDate.slice(0, 5);

  const averageViews = calculateAverageViews(allVideos);
  const topPerformerAverage = calculateAverageViews(topVideos);
  const bottomPerformerAverage = calculateAverageViews(bottomVideos);
  const recentPerformerAverage = calculateAverageViews(recentVideos);

  const gapRatio = bottomPerformerAverage > 0
    ? Math.round(topPerformerAverage / bottomPerformerAverage)
    : topPerformerAverage;

  const daysSinceLastUpload = recentVideos.length > 0
    ? calculateDaysSince(recentVideos[0].publishedAt)
    : 0;

  const uploadFrequencyDays = calculateUploadFrequency(allVideos);

  const driftScore = calculateDriftScore(recentVideos, topVideos);

  return {
    channelStats,
    allVideos,
    topVideos,
    bottomVideos,
    recentVideos,
    averageViews,
    gapRatio,
    daysSinceLastUpload,
    uploadFrequencyDays,
    totalVideosAnalyzed: allVideos.length,
    topVideoTitles: topVideos.map(v => v.title),
    bottomVideoTitles: bottomVideos.map(v => v.title),
    recentVideoTitles: recentVideos.map(v => v.title),
    channelDescription: channelStats.description,
    topPerformerAverage,
    bottomPerformerAverage,
    recentPerformerAverage,
    driftScore
  };
}
