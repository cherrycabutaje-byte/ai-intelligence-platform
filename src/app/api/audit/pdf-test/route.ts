import { NextResponse } from 'next/server';
import { renderAuditPDF }
  from '@/lib/coaching/audit-pdf-renderer';

export async function GET() {
  const mockAudit = {
    auditVersion: '7.0',
    creatorId: 'christine',
    generatedAt: new Date().toISOString(),
    overallScore: 82,
    scoreLabel: 'Strong',
    scoreReason:
      'Growth score is driven primarily by:\n- Double down on: Transformation titles outperform travel titles\n- Story follows a transformation arc\n- Hook relies on curiosity-driven problem framing',
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
    ],
    experiment:
      'Test: Transformation titles outperform travel titles - while also applying: Story follows a transformation arc and Hook relies on curiosity-driven problem framing',
    expectedImpact:
      'Applying this learning is expected to improve audience connection and retention based on 5 supporting evidence points.'
  };

  const buffer =
    await renderAuditPDF(mockAudit);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="jarvis-audit-test.pdf"'
    }
  });
}

