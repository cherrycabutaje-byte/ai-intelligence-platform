import { NextResponse } from 'next/server';
import { runChannelDiagnosis } from '@/lib/channel-intelligence/channel-diagnosis-engine';
import { collectChannelEvidence } from '@/lib/channel-intelligence/diagnostics/channel-evidence-collector';
import { generateThreeDiagnoses } from '@/lib/channel-intelligence/diagnostics/hypothesis-generator';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { channelId, creatorId } = await req.json();

    if (!channelId || !creatorId) {
      return NextResponse.json(
        { success: false, message: 'channelId and creatorId are required' },
        { status: 400 }
      );
    }

    // Get user ID from Supabase auth
    let userId = creatorId;
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch {}

    // Run both engines in parallel
    const [fiveBrain, evidence] = await Promise.all([
      runChannelDiagnosis(channelId, creatorId),
      collectChannelEvidence(channelId)
    ]);

    // Generate 3 root cause diagnoses
    const diagnoses = await generateThreeDiagnoses(evidence);

    // Build health and summary from evidence
    const overallHealth = evidence.driftScore > 80 ? 'At Risk'
      : evidence.driftScore > 50 ? 'Needs Attention'
      : evidence.driftScore > 20 ? 'Room to Improve'
      : 'On Track';

    const oneLineSummary = evidence.topPerformerAverage > 0 && evidence.recentPerformerAverage > 0
      ? `Your best content gets ${evidence.topPerformerAverage.toLocaleString()} views. Your recent content gets ${evidence.recentPerformerAverage.toLocaleString()}. That gap is the whole story.`
      : 'Your channel has a unique growth pattern. Channel Diagnosis will identify exactly what it is.';

    // Build truths for Channel page
    const truths = {
      whyPeopleFollowYou: fiveBrain.diagnosis.whyPeopleFollowYou,
      creatorDNA: fiveBrain.diagnosis.creatorDNA,
      channelPositioning: fiveBrain.diagnosis.channelPositioning,
      topVideos: evidence.topVideos,
      bottomVideos: evidence.bottomVideos,
      audienceLoves: fiveBrain.diagnosis.audienceLoves,
      audienceIgnores: fiveBrain.diagnosis.audienceIgnores,
      channelDrift: fiveBrain.diagnosis.channelDrift,
      costOfDrift: {
        alignedAverageViews: evidence.topPerformerAverage,
        misalignedAverageViews: evidence.recentPerformerAverage,
        performanceLossPercent: Math.round(
          (1 - evidence.recentPerformerAverage / Math.max(evidence.topPerformerAverage, 1)) * 100
        ),
        interpretation: fiveBrain.diagnosis.costOfDrift?.interpretation ?? ''
      },
      biggestOpportunity: fiveBrain.diagnosis.biggestOpportunity,
      averageViews: evidence.averageViews,
      gapRatio: evidence.gapRatio
    };

    // Save to Supabase
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
      );
      await supabase.from('channel_diagnoses').upsert({
        user_id: userId,
        channel_id: channelId,
        channel_name: evidence.channelStats.channelTitle,
        subscribers: evidence.channelStats.subscribers,
        total_videos: evidence.channelStats.totalVideos,
        last_upload_days: evidence.daysSinceLastUpload,
        overall_health: overallHealth,
        one_line_summary: oneLineSummary,
        truths,
        blockers: diagnoses,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,channel_id' });
    } catch (e) {
      console.error('[JARVIS] Save diagnosis failed:', e);
    }

    return NextResponse.json({
      success: true,
      channelName: evidence.channelStats.channelTitle,
      subscribers: evidence.channelStats.subscribers,
      totalVideos: evidence.channelStats.totalVideos,
      lastUploadDays: evidence.daysSinceLastUpload,
      overallHealth,
      oneLineSummary,
      truths,
      blockers: diagnoses,
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
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: row, error } = await supabase
      .from('channel_diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, message: 'No diagnosis found' });
    }

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
    console.error('[JARVIS] GET error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}
