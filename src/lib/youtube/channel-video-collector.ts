export const MAX_VIDEOS = 20;

export interface VideoStats {
  videoId: string;
  title: string;
  views: number;
  publishedAt: string;
}

export interface ChannelStats {
  channelId: string;
  channelTitle: string;
  description: string;
  subscribers: number;
  totalVideos: number;
  channelStartDate: string;
}

export interface ChannelVideoResult {
  channelId: string;
  videoIds: string[];
  totalFetched: number;
}

export async function resolveChannelId(
  channelUrl: string
): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  if (channelUrl.includes('youtube.com/channel/')) {
    return channelUrl.split('youtube.com/channel/')[1]?.split('?')[0] ?? null;
  }
  if (channelUrl.includes('youtube.com/@')) {
    const handle = channelUrl.split('youtube.com/@')[1]?.split('?')[0] ?? null;
    if (!handle) return null;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&key=${apiKey}`
    );
    const data = await res.json();
    return data.items?.[0]?.id?.channelId ?? null;
  }
  if (channelUrl.startsWith('UC') && channelUrl.length > 20) {
    return channelUrl;
  }
  return null;
}

export async function fetchChannelStats(
  channelId: string
): Promise<ChannelStats> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
  );
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error(`Channel not found: ${channelId}`);

  return {
    channelId,
    channelTitle: item.snippet?.title ?? '',
    description: item.snippet?.description ?? '',
    subscribers: parseInt(item.statistics?.subscriberCount ?? '0'),
    totalVideos: parseInt(item.statistics?.videoCount ?? '0'),
    channelStartDate: item.snippet?.publishedAt ?? ''
  };
}

async function fetchVideoIdsByOrder(
  channelId: string,
  order: 'date' | 'viewCount',
  maxResults: number
): Promise<string[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&type=video&order=${order}&maxResults=${maxResults}&key=${apiKey}`
  );
  const data = await res.json();
  return (data.items ?? [])
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean) as string[];
}

async function fetchStatsForIds(
  videoIds: string[]
): Promise<VideoStats[]> {
  if (videoIds.length === 0) return [];
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`
  );
  const data = await res.json();

  return (data.items ?? []).map((item: {
    id: string;
    snippet?: { title?: string; publishedAt?: string };
    statistics?: { viewCount?: string };
  }) => ({
    videoId: item.id,
    title: item.snippet?.title ?? '',
    views: parseInt(item.statistics?.viewCount ?? '0'),
    publishedAt: item.snippet?.publishedAt ?? ''
  }));
}

export async function fetchVideoStats(
  channelId: string
): Promise<VideoStats[]> {
  // Fetch by viewCount for top/bottom analysis
  const byViews = await fetchVideoIdsByOrder(channelId, 'viewCount', 20);
  // Fetch by date for recent/drift analysis
  const byDate = await fetchVideoIdsByOrder(channelId, 'date', 10);

  // Combine unique IDs
  const allIds = [...new Set([...byViews, ...byDate])];

  if (allIds.length === 0) return [];

  return fetchStatsForIds(allIds);
}

export async function collectChannelVideos(
  channelId: string
): Promise<ChannelVideoResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&type=video&order=date&maxResults=20&key=${apiKey}`
  );
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }
  const data = await response.json();
  const videoIds: string[] = (data.items ?? [])
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean) as string[];

  return {
    channelId,
    videoIds,
    totalFetched: videoIds.length
  };
}
