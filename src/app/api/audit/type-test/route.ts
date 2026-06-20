import { NextResponse } from 'next/server';
import { GrowthAudit }
  from '@/types/growth-audit';

export async function GET() {
  const mockAudit: GrowthAudit = {
    auditVersion: '7.0',
    creatorId: 'christine',
    generatedAt: new Date().toISOString(),
    overallScore: 83,
    scoreLabel: 'Strong',
    scoreReason:
      'Primary signal: Transformation titles outperform travel titles. Supported by: Story follows a transformation arc and Hook relies on curiosity-driven problem framing.',
    topOpportunity: {
      statement:
        'Transformation titles outperform travel titles',
      priority: 'High Priority',
      reason:
        'Confidence 92% with 5 supporting evidence points.',
      action:
        'Lead future content with: Transformation titles outperform travel titles',
      successMetric:
        'Measure click-through rate across next 5 videos applying: Transformation titles outperform travel titles'
    },
    supportingInsights: [
      'Story follows a transformation arc',
      'Hook relies on curiosity-driven problem framing'
    ],
    roadmap: [
      {
        step: 1,
        priority: 'High Priority',
        focus:
          'Transformation titles outperform travel titles',
        action:
          'Lead future content with: Transformation titles outperform travel titles',
        successMetric:
          'Measure click-through rate across next 5 videos applying: Transformation titles outperform travel titles'
      }
    ],
    experiment:
      'Test: Transformation titles outperform travel titles - while also applying: Story follows a transformation arc',
    expectedImpact:
      'Applying this learning is expected to improve audience connection and retention based on 5 supporting evidence points.'
  };

  return NextResponse.json({
    success: true,
    audit: mockAudit
  });
}
