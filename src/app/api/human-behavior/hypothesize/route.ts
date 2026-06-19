import { NextRequest, NextResponse } from 'next/server';
import { generateHypothesis } from '@/lib/human-behavior/claude-human-behavior';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await generateHypothesis(
      body.title || '',
      body.transcript || '',
      body.views || 0
    );

    return NextResponse.json({
      success: true,
      hypothesis: result
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    );
  }
}