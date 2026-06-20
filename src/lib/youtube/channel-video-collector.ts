const MAX_VIDEOS = 1;

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
    const handle =
      channelUrl.split('youtube.com/@')[1]?.split('?')[0] ?? null;
    if (!handle) return null;

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&key=${apiKey}`
    );
    const data = await res.json();
    return data.items?.[0]?.id?.channelId ?? null;
  }

  return null;
}

export async function collectChannelVideos(
  channelId: string
): Promise<ChannelVideoResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&type=video&order=date&maxResults=${MAX_VIDEOS}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();

  const videoIds: string[] =
    (data.items ?? [])
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

  return {
    channelId,
    videoIds,
    totalFetched: videoIds.length
  };
}
