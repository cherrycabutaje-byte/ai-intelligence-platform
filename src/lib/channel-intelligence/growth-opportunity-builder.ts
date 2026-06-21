import { createClient } from '@/lib/supabase';
import { ChannelDiagnosis } from './channel-diagnosis-engine';

interface GrowthAction {
  opportunity_type: string;
  recommendation: string;
  priority: string;
  priority_rank: number;
  confidence_score: number;
  evidence: string;
  impact_score: string;
  effort_level: string;
  estimated_impact: string;
}

function buildGrowthActions(
  diagnosis: ChannelDiagnosis
): GrowthAction[] {
  const actions: GrowthAction[] = [];
  const d = diagnosis.diagnosis;
  const rank = { count: 0 };

  // Action 1 — Fix channel drift if detected
  if (d.channelDrift.detected) {
    rank.count++;
    actions.push({
      opportunity_type: 'Fix Channel Drift',
      recommendation: `Your aligned content averages ${diagnosis.diagnosis.costOfDrift.alignedAverageViews} views. Your recent content averages ${diagnosis.diagnosis.costOfDrift.misalignedAverageViews} views. That is a ${diagnosis.diagnosis.costOfDrift.performanceLossPercent}% performance loss. Return to your proven content pattern immediately. ${d.channelDrift.explanation}`,
      priority: 'High',
      priority_rank: rank.count,
      confidence_score: 92,
      evidence: `Historical alignment: ${diagnosis.historicalAlignmentScore}% → Recent alignment: ${diagnosis.driftAlignmentScore}%. Cost of drift: -${d.costOfDrift.performanceLossPercent}% performance.`,
      impact_score: 'High',
      effort_level: 'Low',
      estimated_impact: `Returning to aligned content could restore average views from ${d.costOfDrift.misalignedAverageViews} to ${d.costOfDrift.alignedAverageViews} per video.`
    });
  }

  // Action 2 — Double down on top performing content
  if (diagnosis.topVideos.length > 0) {
    rank.count++;
    const topVideo = diagnosis.topVideos[0];
    actions.push({
      opportunity_type: 'Double Down On What Works',
      recommendation: `Your best video "${topVideo.title}" got ${topVideo.views.toLocaleString()} views. That is ${Math.round(topVideo.views / diagnosis.averageViews)}x your channel average. Make 3 more videos in this exact format and tone. ${d.topPerformers.interpretation}`,
      priority: 'High',
      priority_rank: rank.count,
      confidence_score: 85,
      evidence: `Top video: ${topVideo.views.toLocaleString()} views vs channel average: ${diagnosis.averageViews.toLocaleString()} views. Pattern: ${d.topPerformers.pattern}`,
      impact_score: 'High',
      effort_level: 'Low',
      estimated_impact: `3 videos in your proven format could generate ${(topVideo.views * 0.5).toLocaleString()} additional views based on historical performance.`
    });
  }

  // Action 3 — Fix channel positioning
  if (d.channelPositioning.alignmentScore < 50) {
    rank.count++;
    actions.push({
      opportunity_type: 'Fix Channel Description',
      recommendation: `Your channel description says "${d.channelPositioning.whatYouSayYouAre}" but your audience responds to "${d.channelPositioning.whatAudienceRespondsTo}". Update your description to match what actually works. Alignment is currently ${d.channelPositioning.alignmentScore}%. ${d.channelPositioning.interpretation}`,
      priority: 'Medium',
      priority_rank: rank.count,
      confidence_score: 75,
      evidence: `Channel says: ${d.channelPositioning.whatYouSayYouAre}. Audience responds to: ${d.channelPositioning.whatAudienceRespondsTo}. Alignment: ${d.channelPositioning.alignmentScore}%.`,
      impact_score: 'Medium',
      effort_level: 'Low',
      estimated_impact: 'Better channel description helps the algorithm recommend your content to the right audience.'
    });
  }

  // Action 4 — Stop making rejected content
  if (d.contentAudienceRejects && d.contentAudienceRejects.length > 0) {
    rank.count++;
    const rejected = d.contentAudienceRejects[0];
    actions.push({
      opportunity_type: 'Stop Making This Content',
      recommendation: `Stop making "${rejected.topic}" content immediately. It averages only ${rejected.averageViews} views. ${rejected.reason} Every video in this category is costing you time with near-zero return.`,
      priority: 'Medium',
      priority_rank: rank.count,
      confidence_score: 80,
      evidence: `"${rejected.topic}" averages ${rejected.averageViews} views vs channel average of ${diagnosis.averageViews} views.`,
      impact_score: 'Medium',
      effort_level: 'Low',
      estimated_impact: 'Stopping low-performing content frees up time for content that actually works.'
    });
  }

  // Action 5 — Why people follow you insight
  rank.count++;
  actions.push({
    opportunity_type: 'Own Your Real Identity',
    recommendation: `${d.whyPeopleFollowYou} Lean into this in your next 5 videos. Make content that speaks directly to the person who follows you for this reason.`,
    priority: 'High',
    priority_rank: rank.count,
    confidence_score: 88,
    evidence: `Creator DNA: ${d.creatorDNA.creatorType}. ${d.creatorDNA.interpretation}`,
    impact_score: 'High',
    effort_level: 'Medium',
    estimated_impact: 'Owning your real identity creates the consistency the algorithm needs to recommend your channel.'
  });

  return actions;
}

export async function saveGrowthOpportunities(
  diagnosis: ChannelDiagnosis,
  userId: string
): Promise<void> {
  const supabase = createClient();
  const actions = buildGrowthActions(diagnosis);

  // Delete old opportunities for this user first
  await supabase
    .from('growth_opportunities')
    .delete()
    .eq('user_id', userId);

  // Insert new ones
  const rows = actions.map(action => ({
    ...action,
    user_id: userId,
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('growth_opportunities')
    .insert(rows);

  if (error) {
    console.error('[JARVIS] Failed to save growth opportunities:', error.message);
  } else {
    console.log(`[JARVIS] Saved ${rows.length} growth opportunities for user ${userId}`);
  }
}
