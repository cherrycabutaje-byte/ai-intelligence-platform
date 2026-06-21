import { NextResponse } from 'next/server';
import { runChannelDiagnosis }
  from '@/lib/channel-intelligence/channel-diagnosis-engine';
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
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function buildBlockers(diagnoses: any[], evidence: any) {
  return diagnoses.map((d, index) => ({
    number: index + 1,
    name: d.rule.name,
    severity: d.rule.severity,
    category: d.rule.category,
    whatIsBroken: d.whatJarvisFound,
    whyItMatters: d.whyThisIsHappening,
    whatItMeansForYou: d.whatThisMeansForYou,
    cost: d.rule.id === 'RULE_001'
      ? `Your proven content averages ${evidence.topPerformerAverage.toLocaleString()} views. Your recent content averages ${evidence.recentPerformerAverage.toLocaleString()} views. That is a ${evidence.driftScore}% performance loss.`
      : d.rule.id === 'RULE_009'
      ? `Every week without posting is another week the algorithm deprioritizes your channel. You have been quiet for ${evidence.daysSinceLastUpload} days.`
      : d.whatThisMeansForYou,
    estimatedImpact: d.rule.severity === 'Critical' ? 'HIGH' : d.rule.severity === 'High' ? 'MEDIUM' : 'LOW',
    confidence: d.finalConfidence,
    evidencePoints: d.evidencePoints,
    recommendedAction: d.rule.recommendedAction
  }));
}

export async function POST(req: Request) {
  try {
    const { channelId, creatorId } = await req.json();

    if (!channelId || !creatorId) {
      return NextResponse.json(
        { success: false, message: 'channelId and creatorId are required' },
        { status: 400 }
      );
    }

    // Get user ID
    let userId = creatorId;
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            }
          }
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch {}

    // Run both engines in parallel
    const [fiveBrain, evidence] = await Promise.all([
      runChannelDiagnosis(channelId, creatorId),
      collectChannelEvidence(channelId)
    ]);

    // Run diagnostic engine
    const triggered = evaluateAllRules(evidence);
    const scored = calculateConfidence(triggered, evidence);
    const fullDiagnoses = await generateAllHypotheses(scored, evidence);
    const report = buildReport(fullDiagnoses, evidence, channelId, creatorId);

    // Build blockers for Growth page
    const blockers = buildBlockers(fullDiagnoses, evidence);

    // Build truths for Channel page
    const truths = {
      whyPeopleFollowYou: fiveBrain.diagnosis.whyPeopleFollowYou,
      creatorDNA: fiveBrain.diagnosis.creatorDNA,
      channelPositioning: fiveBrain.diagnosis.channelPositioning,
      topVideos: fiveBrain.topVideos,
      bottomVideos: fiveBrain.bottomVideos,
      audienceLoves: fiveBrain.diagnosis.audienceLoves,
      audienceIgnores: fiveBrain.diagnosis.audienceIgnores,
      channelDrift: fiveBrain.diagnosis.channelDrift,
      costOfDrift: fiveBrain.diagnosis.costOfDrift,
      biggestOpportunity: fiveBrain.diagnosis.biggestOpportunity,
      averageViews: fiveBrain.averageViews,
      gapRatio: fiveBrain.gapRatio
    };

    // Save to Supabase
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            }
          }
        }
      );

      await supabase
        .from('channel_diagnoses')
        .upsert({
          user_id: userId,
          channel_id: channelId,
          channel_name: evidence.channelStats.channelTitle,
          subscribers: evidence.channelStats.subscribers,
          total_videos: evidence.channelStats.totalVideos,
          last_upload_days: evidence.daysSinceLastUpload,
          overall_health: report.executiveSummary.overallHealth,
          one_line_summary: report.executiveSummary.oneLineSummary,
          truths,
          blockers,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,channel_id'
        });
    } catch (e) {
      console.error('[JARVIS] Save diagnosis failed:', e);
    }

    return NextResponse.json({
      success: true,
      channelName: evidence.channelStats.channelTitle,
      subscribers: evidence.channelStats.subscribers,
      totalVideos: evidence.channelStats.totalVideos,
      lastUploadDays: evidence.daysSinceLastUpload,
      overallHealth: report.executiveSummary.overallHealth,
      oneLineSummary: report.executiveSummary.oneLineSummary,
      truths,
      blockers,
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[JARVIS] Channel intelligence error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') ?? '';
    const channelId = searchParams.get('channelId') ?? '';

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          }
        }
      }
    );

    let query = supabase
      .from('channel_diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (channelId) {
      query = query.eq('channel_id', channelId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: false, message: 'No diagnosis found' });
    }

    const row = data[0];
    return NextResponse.json({
      success: true,
      channelName: row.channel_name,
      subscribers: row.subscribers,
      totalVideos: row.total_videos,
      lastUploadDays: row.last_upload_days,
      overallHealth: row.overall_health,
      oneLineSummary: row.one_line_summary,
      truths: row.truths,
      blockers: row.blockers,
      savedAt: row.created_at
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}


