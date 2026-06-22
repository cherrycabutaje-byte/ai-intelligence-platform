import { NextResponse } from 'next/server';

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ success: false, message: 'URL required' }, { status: 400 });

    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ success: false, message: 'Invalid YouTube URL' }, { status: 400 });

    const apiKey = process.env.YOUTUBE_API_KEY;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
    );
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      videoId,
      title: item.snippet?.title ?? '',
      description: item.snippet?.description ?? '',
      tags: item.snippet?.tags ?? [],
      views: parseInt(item.statistics?.viewCount ?? '0'),
      likes: parseInt(item.statistics?.likeCount ?? '0'),
      comments: parseInt(item.statistics?.commentCount ?? '0'),
      publishedAt: item.snippet?.publishedAt ?? '',
      channelTitle: item.snippet?.channelTitle ?? '',
      thumbnail: item.snippet?.thumbnails?.maxres?.url ?? item.snippet?.thumbnails?.high?.url ?? '',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
