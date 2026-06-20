import { NextResponse } from 'next/server';
import { buildAudit }
  from '@/lib/coaching/audit-builder';
import { scoreAudit }
  from '@/lib/coaching/audit-scorer';

export async function GET() {
  const mockLearnings = [
    {
      learning: {
        id: '1',
        statement: 'Transformation titles outperform travel titles',
        confidence: 92,
        status: 'validated' as const,
        supportingEvidenceCount: 5,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Audience prefers transformation content' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 117
    },
    {
      learning: {
        id: '2',
        statement: 'Story follows a transformation arc',
        confidence: 68,
        status: 'tentative' as const,
        supportingEvidenceCount: 2,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Transformation arcs retain viewers' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 78
    },
    {
      learning: {
        id: '3',
        statement: 'Hook relies on curiosity-driven problem framing',
        confidence: 68,
        status: 'tentative' as const,
        supportingEvidenceCount: 2,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: 'Curiosity hooks perform better' },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      priorityScore: 78
    }
  ];

  const mockCoaching = {
    primaryConstraint:
      'Double down on: Transformation titles outperform travel titles',
    supportingInsights: [
      'Story follows a transformation arc',
      'Hook relies on curiosity-driven problem framing'
    ],
    why:
      'Confidence: 92%. Supported by 5 evidence points.',
    actionPlan: [
      'Lead future content with: Transformation titles outperform travel titles',
      'Lead future content with: Story follows a transformation arc',
      'Lead future content with: Hook relies on curiosity-driven problem framing'
    ],
    experiment:
      'Test: Transformation titles outperform travel titles - while also applying: Story follows a transformation arc and Hook relies on curiosity-driven problem framing',
    expectedImpact:
      'Applying this learning is expected to improve audience connection and retention based on 5 supporting evidence points.',
    highestOpportunity: {
      statement:
        'Transformation titles outperform travel titles',
      priorityLabel: 'High Priority',
      reason:
        'Confidence 92% with 5 supporting evidence points.'
    },
    roadmap: [
      {
        step: 1,
        priority: 'High Priority',
        focus: 'Transformation titles outperform travel titles',
        action: 'Lead future content with: Transformation titles outperform travel titles',
        successMetric: 'Measure click-through rate across next 5 videos applying: Transformation titles outperform travel titles'
      },
      {
        step: 2,
        priority: 'Medium Priority',
        focus: 'Story follows a transformation arc',
        action: 'Lead future content with: Story follows a transformation arc',
        successMetric: 'Track audience retention across next 3 videos applying: Story follows a transformation arc'
      },
      {
        step: 3,
        priority: 'Supporting',
        focus: 'Hook relies on curiosity-driven problem framing',
        action: 'Lead future content with: Hook relies on curiosity-driven problem framing',
        successMetric: 'Observe engagement signals across next 2 videos applying: Hook relies on curiosity-driven problem framing'
      }
    ]
  };

  const score = scoreAudit(mockLearnings);
  const audit = buildAudit(
    'christine',
    mockCoaching,
    score
  );

  return NextResponse.json({
    success: true,
    audit
  });
}
