import { NextResponse } from 'next/server';
import { testClaudeConnection } from '@/lib/human-behavior/claude-human-behavior';

export async function GET() {
  try {
    const response = await testClaudeConnection();

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Claude connection failed',
        details: String(error)
      },
      { status: 500 }
    );
  }
}