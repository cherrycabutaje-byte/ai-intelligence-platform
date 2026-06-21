import { NextResponse } from 'next/server';
import { runChannelDiagnosis }
  from '@/lib/channel-intelligence/channel-diagnosis-engine';

export async function POST(req: Request) {
  const { channelId, creatorId } = await req.json();

  if (!channelId || !creatorId) {
    return NextResponse.json(
      { success: false, message: 'channelId and creatorId are required' },
      { status: 400 }
    );
  }

  const diagnosis = await runChannelDiagnosis(channelId, creatorId);

  return NextResponse.json({ success: true, diagnosis });
}
