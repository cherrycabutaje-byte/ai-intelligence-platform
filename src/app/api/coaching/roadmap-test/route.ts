import { NextResponse } from 'next/server';
import { generateRoadmap }
  from '@/lib/coaching/roadmap-generator';

export async function GET() {
  const mockPrioritized = {
    highestOpportunity: {
      statement: 'Transformation titles outperform travel titles',
      priorityScore: 104,
      priorityLabel: 'High Priority',
      reason: 'Confidence 84% with 4 supporting evidence points.'
    },
    secondaryOpportunities: [
      {
        statement: 'Story follows a transformation arc',
        priorityScore: 91,
        priorityLabel: 'Medium Priority',
        reason: 'Confidence 76% with 3 supporting evidence points.'
      },
      {
        statement: 'Hook relies on curiosity-driven problem framing',
        priorityScore: 80,
        priorityLabel: 'Supporting',
        reason: 'Confidence 70% with 2 supporting evidence points.'
      }
    ]
  };

  const roadmap =
    generateRoadmap(mockPrioritized);

  return NextResponse.json({
    success: true,
    roadmap
  });
}
