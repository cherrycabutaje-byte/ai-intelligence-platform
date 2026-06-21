import {
  fetchChannelStats,
  fetchVideoStats,
  VideoStats,
  ChannelStats
} from '@/lib/youtube/channel-video-collector';

export interface ChannelEvidence {
  channelStats: ChannelStats;
  allVideos: VideoStats[];
  topVideos: VideoStats[];
  bottomVideos: VideoStats[];
  recentVideos: VideoStats[];
  averageViews: number;
  averageLikes: number;
  averageEngagementRate: number;
  gapRatio: number;
  daysSinceLastUpload: number;
  uploadFrequencyDays: number;
  totalVideosAnalyzed: number;
  topVideoTitles: string[];
  bottomVideoTitles: string[];
  recentVideoTitles: string[];
  allTags: string[];
  topTags: string[];
  channelDescription: string;
  channelKeywords: string[];
  topPerformerAverage: number;
  bottomPerformerAverage: number;
  recentPerformerAverage: number;
  driftScore: number;
  avgDurationSeconds: number;
  shortFormCount: number;
  longFormCount: number;
  topVideoDescriptions: string[];
  allCategories: string[];
}

function calculateAverageViews(videos: VideoStats[]): number {
  if (videos.length === 0) return 0;
  return Math.round(
    videos.reduce((sum, v) => sum + v.views, 0) / videos.length
  );
}

function calculateAverageLikes(videos: VideoStats[]): number {
  if (videos.length === 0) return 0;
  return Math.round(
    videos.reduce((sum, v) => sum + v.likes, 0) / videos.length
  );
}

function calculateEngagementRate(videos: VideoStats[]): number {
  if (videos.length === 0) return 0;
  const rates = videos
    .filter(v => v.views > 0)
    .map(v => (v.likes + v.comments) / v.views * 100);
  if (rates.length === 0) return 0;
  return Math.round(
    rates.reduce((sum, r) => sum + r, 0) / rates.length * 10
  ) / 10;
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

function extractTopTags(videos: VideoStats[], limit = 10): string[] {
  const tagCount: Record<string, number> = {};
  videos.forEach(v => {
    v.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] ?? 0) + v.views;
    });
  });
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export async function collectChannelEvidence(
  channelId: string
): Promise<ChannelEvidence> {
  const [channelStats, allVideos] = await Promise.all([
    fetchChannelStats(channelId),
    fetchVideoStats(channelId)
  ]);

  const empty: ChannelEvidence = {
    channelStats,
    allVideos: [],
    topVideos: [],
    bottomVideos: [],
    recentVideos: [],
    averageViews: 0,
    averageLikes: 0,
    averageEngagementRate: 0,
    gapRatio: 0,
    daysSinceLastUpload: 0,
    uploadFrequencyDays: 0,
    totalVideosAnalyzed: 0,
    topVideoTitles: [],
    bottomVideoTitles: [],
    recentVideoTitles: [],
    allTags: [],
    topTags: [],
    channelDescription: channelStats.description,
    channelKeywords: channelStats.keywords,
    topPerformerAverage: 0,
    bottomPerformerAverage: 0,
    recentPerformerAverage: 0,
    driftScore: 0,
    avgDurationSeconds: 0,
    shortFormCount: 0,
    longFormCount: 0,
    topVideoDescriptions: [],
    allCategories: []
  };

  if (allVideos.length === 0) return empty;

  const sortedByViews = [...allVideos].sort((a, b) => b.views - a.views);
  const topVideos = sortedByViews.slice(0, 3);
  const bottomVideos = sortedByViews.slice(-3).reverse();

  const sortedByDate = [...allVideos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const recentVideos = sortedByDate.slice(0, 5);

  const averageViews = calculateAverageViews(allVideos);
  const topPerformerAverage = calculateAverageViews(topVideos);
  const bottomPerformerAverage = calculateAverageViews(bottomVideos);
  const recentPerformerAverage = calculateAverageViews(recentVideos);
  const averageLikes = calculateAverageLikes(allVideos);
  const averageEngagementRate = calculateEngagementRate(allVideos);

  const gapRatio = bottomPerformerAverage > 0
    ? Math.round(topPerformerAverage / bottomPerformerAverage)
    : topPerformerAverage;

  const daysSinceLastUpload = recentVideos.length > 0
    ? calculateDaysSince(recentVideos[0].publishedAt)
    : 0;

  const uploadFrequencyDays = calculateUploadFrequency(allVideos);
  const driftScore = calculateDriftScore(recentVideos, topVideos);

  const allTags = [...new Set(allVideos.flatMap(v => v.tags))];
  const topTags = extractTopTags(topVideos);

  const avgDurationSeconds = Math.round(
    allVideos.reduce((sum, v) => sum + v.durationSeconds, 0) / allVideos.length
  );
  const shortFormCount = allVideos.filter(v => v.durationSeconds <= 60).length;
  const longFormCount = allVideos.filter(v => v.durationSeconds > 300).length;
  const allCategories = [...new Set(allVideos.map(v => v.categoryId).filter(Boolean))];

  return {
    channelStats,
    allVideos,
    topVideos,
    bottomVideos,
    recentVideos,
    averageViews,
    averageLikes,
    averageEngagementRate,
    gapRatio,
    daysSinceLastUpload,
    uploadFrequencyDays,
    totalVideosAnalyzed: allVideos.length,
    topVideoTitles: topVideos.map(v => v.title),
    bottomVideoTitles: bottomVideos.map(v => v.title),
    recentVideoTitles: recentVideos.map(v => v.title),
    allTags,
    topTags,
    channelDescription: channelStats.description,
    channelKeywords: channelStats.keywords,
    topPerformerAverage,
    bottomPerformerAverage,
    recentPerformerAverage,
    driftScore,
    avgDurationSeconds,
    shortFormCount,
    longFormCount,
    topVideoDescriptions: topVideos.map(v => v.description),
    allCategories
  };
}
