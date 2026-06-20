import { NextResponse } from 'next/server';
import { updateCreatorMemory } from '@/lib/human-behavior/memory-builder';

export async function GET() {

  const memory = updateCreatorMemory(
    {
      creatorId: 'christine',

      learnings: [],

      lastUpdated:
        new Date().toISOString()
    },
    {
      statement:
        'Transformation titles outperform travel titles',

      supportingEvidenceCount: 2,

      contradictingEvidenceCount: 0,

      confidence: 68,

      status: 'emerging',

      lastUpdated:
        new Date().toISOString()
    }
  );

  return NextResponse.json({
    success: true,
    memory
  });
}