import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId') ?? 'UCKzIKD_YEqELez3Y5Vl1-3A';
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YOUTUBE_API_KEY not set' });
  }

  // Step 1 — search by viewCount
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&type=video&order=viewCount&maxResults=5&key=${apiKey}`
  );
  const searchData = await searchRes.json();

  const videoIds = (searchData.items ?? [])
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  // Step 2 — get stats
  let statsData = null;
  if (videoIds.length > 0) {
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`
    );
    statsData = await statsRes.json();
  }

  return NextResponse.json({
    apiKeyExists: !!apiKey,
    searchStatus: searchRes.status,
    searchError: searchData.error ?? null,
    videoIdsFound: videoIds,
    statsStatus: statsData ? 'fetched' : 'not fetched',
    statsError: statsData?.error ?? null,
    firstVideo: statsData?.items?.[0] ?? null
  });
}
