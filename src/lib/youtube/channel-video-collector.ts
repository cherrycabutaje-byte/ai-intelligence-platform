export const MAX_VIDEOS = 20;

export interface VideoStats {
  videoId: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  durationSeconds: number;
  tags: string[];
  categoryId: string;
  publishedAt: string;
  thumbnail: string;
}

export interface ChannelStats {
  channelId: string;
  channelTitle: string;
  description: string;
  keywords: string[];
  subscribers: number;
  totalVideos: number;
  totalViews: number;
  channelStartDate: string;
  country: string;
  customUrl: string;
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

function parseDuration(iso: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? '0');
  const m = parseInt(match[2] ?? '0');
  const s = parseInt(match[3] ?? '0');
  return h * 3600 + m * 60 + s;
}

export async function fetchChannelStats(
  channelId: string
): Promise<ChannelStats> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`
  );
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error(`Channel not found: ${channelId}`);

  const keywords = item.brandingSettings?.channel?.keywords ?? '';

  return {
    channelId,
    channelTitle: item.snippet?.title ?? '',
    description: item.snippet?.description ?? '',
    keywords: keywords.split(/\s+/).filter(Boolean),
    subscribers: parseInt(item.statistics?.subscriberCount ?? '0'),
    totalVideos: parseInt(item.statistics?.videoCount ?? '0'),
    totalViews: parseInt(item.statistics?.viewCount ?? '0'),
    channelStartDate: item.snippet?.publishedAt ?? '',
    country: item.snippet?.country ?? '',
    customUrl: item.snippet?.customUrl ?? ''
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
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`
  );
  const data = await res.json();

  return (data.items ?? []).map((item: {
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      tags?: string[];
      categoryId?: string;
      thumbnails?: { medium?: { url?: string } };
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    contentDetails?: { duration?: string };
  }) => ({
    videoId: item.id,
    title: item.snippet?.title ?? '',
    description: (item.snippet?.description ?? '').slice(0, 500),
    views: parseInt(item.statistics?.viewCount ?? '0'),
    likes: parseInt(item.statistics?.likeCount ?? '0'),
    comments: parseInt(item.statistics?.commentCount ?? '0'),
    duration: item.contentDetails?.duration ?? '',
    durationSeconds: parseDuration(item.contentDetails?.duration ?? ''),
    tags: item.snippet?.tags ?? [],
    categoryId: item.snippet?.categoryId ?? '',
    publishedAt: item.snippet?.publishedAt ?? '',
    thumbnail: item.snippet?.thumbnails?.medium?.url ?? ''
  }));
}

export async function fetchVideoStats(
  channelId: string
): Promise<VideoStats[]> {
  const byViews = await fetchVideoIdsByOrder(channelId, 'viewCount', 15);
  const byDate = await fetchVideoIdsByOrder(channelId, 'date', 10);
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

  return { channelId, videoIds, totalFetched: videoIds.length };
}
