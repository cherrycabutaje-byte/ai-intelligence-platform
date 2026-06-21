import { NextResponse } from 'next/server';
import { collectChannelEvidence }
  from '@/lib/channel-intelligence/diagnostics/channel-evidence-collector';
import { evaluateAllRules }
  from '@/lib/channel-intelligence/diagnostics/rule-evaluator';
import { calculateConfidence }
  from '@/lib/channel-intelligence/diagnostics/confidence-calculator';
import { generateAllHypotheses }
  from '@/lib/channel-intelligence/diagnostics/hypothesis-generator';
import { buildReport }
  from '@/lib/channel-intelligence/diagnostics/channel-intelligence-report-builder';

export async function POST(req: Request) {
  const { channelId, creatorId } = await req.json();

  if (!channelId || !creatorId) {
    return NextResponse.json(
      { success: false, message: 'channelId and creatorId are required' },
      { status: 400 }
    );
  }

  // Phase 2 — Collect evidence
  const evidence = await collectChannelEvidence(channelId);

  // Phase 3 — Evaluate rules
  const triggered = evaluateAllRules(evidence);

  // Phase 4 — Calculate confidence
  const scored = calculateConfidence(triggered, evidence);

  // Phase 5 — Generate hypotheses
  const fullDiagnoses = await generateAllHypotheses(scored, evidence);

  // Phase 6 — Build report
  const report = buildReport(fullDiagnoses, evidence, channelId, creatorId);

  return NextResponse.json({ success: true, report });
}
