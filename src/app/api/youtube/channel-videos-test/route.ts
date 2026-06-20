import { NextResponse } from 'next/server';
import {
  resolveChannelId,
  collectChannelVideos
} from '@/lib/youtube/channel-video-collector';

export async function GET(req: Request) {
  const { searchParams } =
    new URL(req.url);

  const channelUrl =
    searchParams.get('channelUrl');

  if (!channelUrl) {
    return NextResponse.json(
      {
        success: false,
        message: 'channelUrl is required'
      },
      { status: 400 }
    );
  }

  const channelId =
    await resolveChannelId(
      decodeURIComponent(channelUrl)
    );

  if (!channelId) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not resolve channelId from URL'
      },
      { status: 404 }
    );
  }

  const result =
    await collectChannelVideos(channelId);

  return NextResponse.json({
    success: true,
    channelId,
    result
  });
}
