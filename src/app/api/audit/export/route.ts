import { NextResponse } from 'next/server';
import { getLearningsByCreator }
  from '@/lib/human-behavior/creator-learning-repository';
import { rankLearnings }
  from '@/lib/coaching/learning-ranker';
import { selectTopLearnings }
  from '@/lib/coaching/top-learning-selector';
import { generateCoachDirective }
  from '@/lib/coaching/coach-directive-generator';
import { explainDirective }
  from '@/lib/coaching/directive-explainer';
import { generateActionPlan }
  from '@/lib/coaching/action-plan-generator';
import { synthesizeExperiment }
  from '@/lib/coaching/experiment-synthesizer';
import { estimateImpact }
  from '@/lib/coaching/impact-estimator';
import { buildOpportunity }
  from '@/lib/coaching/opportunity-builder';
import { prioritizeOpportunities }
  from '@/lib/coaching/opportunity-prioritizer';
import { generateRoadmap }
  from '@/lib/coaching/roadmap-generator';
import { scoreAudit }
  from '@/lib/coaching/audit-scorer';
import { buildAudit }
  from '@/lib/coaching/audit-builder';
import { renderAuditPDF }
  from '@/lib/coaching/audit-pdf-renderer';

export async function GET(req: Request) {
  const { searchParams } =
    new URL(req.url);

  const creatorId =
    searchParams.get('creatorId');

  if (!creatorId) {
    return NextResponse.json(
      {
        success: false,
        message: 'creatorId is required'
      },
      { status: 400 }
    );
  }

  const learnings =
    await getLearningsByCreator(
      creatorId
    );

  if (!learnings || learnings.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: 'No learnings found for creator'
      },
      { status: 404 }
    );
  }

  const ranked =
    rankLearnings(learnings);

  const top =
    selectTopLearnings(ranked);

  const primary = top[0];
  const supporting = top.slice(1);

  const opportunities =
    top.map(
      (r, index) =>
        buildOpportunity(r, index + 1)
    );

  const prioritized =
    prioritizeOpportunities(opportunities);

  const roadmap =
    generateRoadmap(prioritized);

  const coaching = {
    primaryConstraint:
      generateCoachDirective(primary),
    supportingInsights:
      supporting.map(
        r => r.learning.statement
      ),
    why:
      explainDirective(primary),
    actionPlan:
      generateActionPlan(top),
    experiment:
      synthesizeExperiment(top),
    expectedImpact:
      estimateImpact(primary),
    highestOpportunity:
      prioritized.highestOpportunity ?? {
        statement: '',
        priorityLabel: '',
        reason: ''
      },
    roadmap
  };

  const score =
    scoreAudit(ranked);

  const audit =
    buildAudit(
      creatorId,
      coaching,
      score
    );

  const pdfBuffer =
    await renderAuditPDF(audit);

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        `attachment; filename="jarvis-growth-audit-${creatorId}.pdf"`
    }
  });
}
