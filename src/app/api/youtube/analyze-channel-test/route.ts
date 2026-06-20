import { NextResponse } from 'next/server';
import { analyzeChannel }
  from '@/lib/youtube/channel-analysis-orchestrator';

export async function POST(req: Request) {
  const { channelUrl, creatorId } =
    await req.json();

  if (!channelUrl || !creatorId) {
    return NextResponse.json(
      {
        success: false,
        message: 'channelUrl and creatorId are required'
      },
      { status: 400 }
    );
  }

  const baseUrl =
    new URL(req.url).origin;

  const result =
    await analyzeChannel(
      channelUrl,
      creatorId,
      baseUrl
    );

  return NextResponse.json({
    success: true,
    result
  });
}
