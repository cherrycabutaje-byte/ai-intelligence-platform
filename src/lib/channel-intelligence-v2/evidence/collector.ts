import { ChannelEvidence, VideoData } from '../types/evidence';

const YT_API = 'https://www.googleapis.com/youtube/v3';

function getKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY not set');
  return key;
}

function parseDuration(iso: string): number {
  const match = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? '0') * 3600) +
         (parseInt(match[2] ?? '0') * 60) +
         parseInt(match[3] ?? '0');
}

async function fetchVideoIds(
  channelId: string,
  order: 'date' | 'viewCount',
  max: number
): Promise<string[]> {
  const res = await fetch(
    `${YT_API}/search?part=id&channelId=${channelId}&type=video&order=${order}&maxResults=${max}&key=${getKey()}`
  );
  const data = await res.json();
  return (data.items ?? [])
    .map((i: any) => i.id?.videoId)
    .filter(Boolean);
}

async function fetchVideoStats(ids: string[]): Promise<VideoData[]> {
  if (!ids.length) return [];
  const res = await fetch(
    `${YT_API}/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}&key=${getKey()}`
  );
  const data = await res.json();
  return (data.items ?? []).map((item: any): VideoData => ({
    videoId: item.id,
    title: item.snippet?.title ?? '',
    description: (item.snippet?.description ?? '').slice(0, 500),
    views: parseInt(item.statistics?.viewCount ?? '0'),
    likes: parseInt(item.statistics?.likeCount ?? '0'),
    comments: parseInt(item.statistics?.commentCount ?? '0'),
    durationSeconds: parseDuration(item.contentDetails?.duration ?? ''),
    tags: item.snippet?.tags ?? [],
    categoryId: item.snippet?.categoryId ?? '',
    publishedAt: item.snippet?.publishedAt ?? '',
  }));
}

function avg(videos: VideoData[]): number {
  if (!videos.length) return 0;
  return Math.round(videos.reduce((s, v) => s + v.views, 0) / videos.length);
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

export async function collectEvidence(channelId: string): Promise<ChannelEvidence> {
  const key = getKey();

  // Fetch channel stats
  const chRes = await fetch(
    `${YT_API}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${key}`
  );
  const chData = await chRes.json();
  const ch = chData.items?.[0];
  if (!ch) throw new Error(`Channel not found: ${channelId}`);

  const subscribers = parseInt(ch.statistics?.subscriberCount ?? '0');
  const totalVideos = parseInt(ch.statistics?.videoCount ?? '0');
  const totalViews = parseInt(ch.statistics?.viewCount ?? '0');

  // Fetch video IDs — top by views + latest + oldest
  const [topIds, latestIds] = await Promise.all([
    fetchVideoIds(channelId, 'viewCount', 25),
    fetchVideoIds(channelId, 'date', 10),
  ]);

  const allIds = [...new Set([...topIds, ...latestIds])];
  const allVideos = await fetchVideoStats(allIds);
  console.log("[V2] Videos fetched:", allVideos.length, "topIds:", topIds.length, "latestIds:", latestIds.length);

  if (!allVideos.length) {
    return {
      channelId,
      channelTitle: ch.snippet?.title ?? '',
      channelDescription: ch.snippet?.description ?? '',
      subscribers,
      totalVideos,
      totalViews,
      channelStartDate: ch.snippet?.publishedAt ?? '',
      country: ch.snippet?.country ?? '',
      daysSinceLastUpload: 0,
      uploadFrequencyDays: 0,
      averageViews: 0,
      topPerformerAverage: 0,
      recentPerformerAverage: 0,
      gapRatio: 0,
      driftScore: 0,
      topVideos: [],
      bottomVideos: [],
      recentVideos: [],
      allTimeTopVideo: null,
      firstVideo: null,
      topTags: [],
      allTags: [],
      allCategories: [],
      shortFormCount: 0,
      longFormCount: 0,
      avgDurationSeconds: 0,
    };
  }

  const sortedByViews = [...allVideos].sort((a, b) => b.views - a.views);
  const sortedByDate = [...allVideos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const sortedByDateAsc = [...allVideos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const topVideos = sortedByViews.slice(0, 3);
  const bottomVideos = sortedByViews.slice(-3).reverse();
  const recentVideos = sortedByDate.slice(0, 5);
  const allTimeTopVideo = sortedByViews[0] ?? null;
  const firstVideo = sortedByDateAsc[0] ?? null;

  const topPerformerAverage = avg(topVideos);
  const recentPerformerAverage = avg(recentVideos);
  const averageViews = avg(allVideos);
  const gapRatio = bottomVideos[0]?.views > 0
    ? Math.round(topVideos[0]?.views / bottomVideos[0]?.views)
    : topVideos[0]?.views ?? 0;

  const driftScore = topPerformerAverage > 0
    ? Math.round((1 - recentPerformerAverage / topPerformerAverage) * 100)
    : 0;

  const daysSinceLastUpload = recentVideos[0]
    ? daysSince(recentVideos[0].publishedAt)
    : 0;

  const uploadFrequencyDays = allVideos.length > 1
    ? Math.round(
        (new Date(sortedByDate[0].publishedAt).getTime() -
         new Date(sortedByDateAsc[0].publishedAt).getTime()) /
        (86400000 * allVideos.length)
      )
    : 0;

  const allTags = [...new Set(allVideos.flatMap(v => v.tags))];
  const topTagMap: Record<string, number> = {};
  topVideos.forEach(v => v.tags.forEach(t => {
    topTagMap[t] = (topTagMap[t] ?? 0) + v.views;
  }));
  const topTags = Object.entries(topTagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  const allCategories = [...new Set(allVideos.map(v => v.categoryId).filter(Boolean))];
  const avgDurationSeconds = Math.round(
    allVideos.reduce((s, v) => s + v.durationSeconds, 0) / allVideos.length
  );

  return {
    channelId,
    channelTitle: ch.snippet?.title ?? '',
    channelDescription: ch.snippet?.description ?? '',
    subscribers,
    totalVideos,
    totalViews,
    channelStartDate: ch.snippet?.publishedAt ?? '',
    country: ch.snippet?.country ?? '',
    daysSinceLastUpload,
    uploadFrequencyDays,
    averageViews,
    topPerformerAverage,
    recentPerformerAverage,
    gapRatio,
    driftScore,
    topVideos,
    bottomVideos,
    recentVideos,
    allTimeTopVideo,
    firstVideo,
    topTags,
    allTags,
    allCategories,
    shortFormCount: allVideos.filter(v => v.durationSeconds <= 60).length,
    longFormCount: allVideos.filter(v => v.durationSeconds > 300).length,
    avgDurationSeconds,
  };
}

