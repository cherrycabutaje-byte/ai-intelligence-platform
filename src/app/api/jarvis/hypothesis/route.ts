import { NextResponse } from 'next/server';
import { generateHypothesis } from '@/lib/hypothesis-engine';

export async function GET() {
  const result = generateHypothesis();

  return NextResponse.json(result);
}