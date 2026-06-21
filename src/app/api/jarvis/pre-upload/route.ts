import { NextResponse } from 'next/server';
import { generatePreUploadBrief }
  from '@/lib/coaching/pre-upload-generator';

export async function POST(req: Request) {
  const {
    creatorId,
    idea,
    audience,
    bestMoment,
    platform,
    niche
  } = await req.json();

  if (!creatorId || !idea || !audience || !bestMoment || !platform) {
    return NextResponse.json(
      {
        success: false,
        message: 'creatorId, idea, audience, bestMoment and platform are required'
      },
      { status: 400 }
    );
  }

  const brief = await generatePreUploadBrief(
    creatorId,
    idea,
    audience,
    bestMoment,
    platform,
    niche
  );

  return NextResponse.json({
    success: true,
    brief
  });
}
