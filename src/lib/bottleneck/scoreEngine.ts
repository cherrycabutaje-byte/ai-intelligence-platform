import type { BottleneckInputs, BottleneckResult, BottleneckCategory, LayerScore, Evidence, Directive, GrowthStage } from "@/types/bottleneck";
import { deriveGrowthStage } from "@/types/bottleneck";

const NORMALIZATION = 26;
const CRISIS_THRESHOLD = 9.5;

const BENCHMARKS = { ctr_percent: 4.5, avg_view_duration_percent: 42, sub_view_ratio_percent: 4.0 };

const STAGE_SEVERITY_MULTIPLIER = { seed: 1.3, early_growth: 1.2, mid_growth: 1.0, scaling: 0.9 };

const STAGE_WEIGHTS = {
  seed: { discoverability: 0.10 },
  early_growth: { discoverability: 0.20, retention: 0.10 },
  mid_growth: { niche_positioning: 0.20, retention: 0.10 },
  scaling: { niche_positioning: 0.10 },
};

const BASE_LEVERAGE = { discoverability: 1.7, retention: 1.3, niche_positioning: 2.0 };

const SOURCE_RELIABILITY_SCORE = { api: 1.0, screenshot: 0.90, manual_verified: 0.75, manual: 0.55, inferred: 0.40 };

function recencyScore(days) {
  if (days <= 7) return 1.00;
  if (days <= 30) return 0.90;
  if (days <= 90) return 0.70;
  if (days <= 180) return 0.50;
  return 0.35;
}

function directionWeight(trend) {
  if (trend === "declining") return 1.25;
  if (trend === "improving") return 0.80;
  return 1.00;
}

function velocityScore(trend) {
  if (trend === "declining") return 0.5;
  if (trend === "improving") return -0.5;
  return 0.0;
}

function computeSeverity(actual, benchmark, stageMult, directionWt) {
  const gapRatio = Math.max(0, Math.min(1, (benchmark - actual) / benchmark));
  return Math.min(10, gapRatio * 10 * stageMult * directionWt);
}

function computeConfidence(sourceReliability, completeness, dataAgeDays) {
  const raw = sourceReliability * completeness * recencyScore(dataAgeDays);
  return Math.max(0.4, Math.min(1.0, raw));
}

function computeLeverage(category, inputs) {
  let leverage = BASE_LEVERAGE[category];
  if (category === "discoverability" && inputs.ctr_trend === "flat" && inputs.ctr_percent < BENCHMARKS.ctr_percent) leverage += 0.2;
  if (category === "niche_positioning" && inputs.channel_age_months > 12 && !inputs.niche_defined) leverage += 0.2;
  return Math.max(0.5, Math.min(2.0, leverage));
}

function computeMomentumModifier(velocity) {
  return Math.max(0.8, Math.min(1.3, 1.0 + velocity * 0.3));
}

function computeBaseIS(severity, confidence, leverage, momentum) {
  return Math.min(100, (severity * confidence * leverage * momentum / NORMALIZATION) * 100);
}

function scoreLayer(category, actual, benchmark, inputs, stage) {
  const trend = category === "discoverability" ? (inputs.ctr_trend || "flat") : "flat";
  const severity = category === "niche_positioning"
    ? Math.min(10, computeSeverity(actual, benchmark, STAGE_SEVERITY_MULTIPLIER[stage], 1.0) + (inputs.niche_defined ? 0 : 2.0))
    : computeSeverity(actual, benchmark, STAGE_SEVERITY_MULTIPLIER[stage], directionWeight(trend));
  const completeness = actual > 0 ? 1.0 : (category === "niche_positioning" ? 0.6 : 0.5);
  const confidence = computeConfidence(SOURCE_RELIABILITY_SCORE[inputs.source_reliability], completeness, inputs.data_age_days);
  const leverage = computeLeverage(category, inputs);
  const momentum = computeMomentumModifier(category === "discoverability" ? velocityScore(trend) : 0);
  const base = computeBaseIS(severity, confidence, leverage, momentum);
  const stageWeight = (STAGE_WEIGHTS[stage] && STAGE_WEIGHTS[stage][category]) || 0;
  return { category, severity, confidence, leverage, momentum_modifier: momentum, base_impact_score: base, stage_weight: stageWeight, final_impact_score: base * (1 + stageWeight), selected: false };
}

function breakTie(a, b) {
  if (Math.abs(a.confidence - b.confidence) > 0.01) return a.confidence > b.confidence ? a : b;
  if (Math.abs(a.leverage - b.leverage) > 0.01) return a.leverage > b.leverage ? a : b;
  if (Math.abs(a.momentum_modifier - b.momentum_modifier) > 0.01) return a.momentum_modifier > b.momentum_modifier ? a : b;
  return a.category === "discoverability" ? a : b;
}

function buildEvidence(category, inputs, confidence) {
  const label = confidence >= 0.75 ? "HIGH" : confidence >= 0.55 ? "MEDIUM" : "LOW";
  if (category === "discoverability") {
    const lost = Math.round((inputs.subscribers * (BENCHMARKS.ctr_percent - inputs.ctr_percent)) / 100);
    return { signal: "Your CTR is " + inputs.ctr_percent + "%. For every 100 impressions, only " + inputs.ctr_percent + " people click.", benchmark: "Average CTR at your channel stage is " + BENCHMARKS.ctr_percent + "%. Healthy channels convert 4-6 impressions per 100.", cost: "At benchmark CTR you would earn roughly " + (lost > 0 ? lost : "significantly more") + " additional clicks per month from impressions you already have.", confidence: label };
  }
  if (category === "retention") {
    const gap = (BENCHMARKS.avg_view_duration_percent - inputs.avg_view_duration_percent).toFixed(1);
    return { signal: "Your average view duration is " + inputs.avg_view_duration_percent + "% of video length.", benchmark: "YouTubes algorithm treats 42% average view duration as the healthy midpoint. Below this, distribution slows.", cost: "You are " + gap + " percentage points below the threshold where the algorithm actively recommends content.", confidence: label };
  }
  return { signal: (inputs.niche_defined ? "Your sub-to-view conversion rate is " : "You have no defined niche and your sub-to-view conversion rate is ") + inputs.sub_view_ratio_percent.toFixed(1) + "%.", benchmark: "Channels with clear positioning convert 4-8% of viewers to subscribers. Your current rate is " + inputs.sub_view_ratio_percent.toFixed(1) + "%.", cost: "People are watching but not subscribing. Without a clear reason to follow your channel, every view is a one-time transaction.", confidence: label };
}

function buildDirective(category, inputs) {
  if (category === "discoverability") return { title: "Rewrite the titles of your 3 lowest-CTR videos right now", rationale: "Your CTR of " + inputs.ctr_percent + "% means most people who see your content choose not to click. Title rewrites are the fastest way to fix this.", time_estimate_minutes: 20, steps: [{ step_number: 1, action: "Open YouTube Studio and go to Content. Sort by impressions click-through rate (lowest first).", tool_or_location: "studio.youtube.com - Content - Sort by CTR" }, { step_number: 2, action: "Write down the current titles of your 3 lowest-CTR videos.", tool_or_location: null }, { step_number: 3, action: "Rewrite each title using this structure: [Specific Outcome] + [Surprising Frame]. Example: My Video Tips becomes I Posted Every Day for 30 Days and This Happened.", tool_or_location: null }, { step_number: 4, action: "Click into each video in YouTube Studio, go to Details, and update the title. Save each one.", tool_or_location: "studio.youtube.com - Content - click video - Details" }, { step_number: 5, action: "Return to the Content tab and confirm all three titles are updated.", tool_or_location: "studio.youtube.com - Content" }], success_condition: "All three video titles are saved and visible in your Content tab." };
  if (category === "retention") return { title: "Find your drop-off point and fix your opening 30 seconds", rationale: "Your average view duration of " + inputs.avg_view_duration_percent + "% tells you viewers are leaving early. Find where they leave and cut what causes it.", time_estimate_minutes: 25, steps: [{ step_number: 1, action: "Open YouTube Studio and go to Analytics. Click on your most recent video.", tool_or_location: "studio.youtube.com - Analytics" }, { step_number: 2, action: "Click the Engagement tab. Find the Audience retention graph. Note the timestamp of the steepest drop in the first 60 seconds.", tool_or_location: "Analytics - Engagement - Audience retention" }, { step_number: 3, action: "Watch your video from 0:00 to that drop-off timestamp. Identify what is happening - slow intro, title card, background music.", tool_or_location: null }, { step_number: 4, action: "Write down one specific change for your NEXT video opening 30 seconds. Example: I will cut the intro logo, I will start with the result first.", tool_or_location: null }, { step_number: 5, action: "Add that change as the first item in your script for your next video before closing this tab.", tool_or_location: null }], success_condition: "You have identified your drop-off timestamp and written one specific opening change for your next video." };
  return { title: "Write your channel one-sentence positioning statement and add it everywhere", rationale: "A sub-to-view rate of " + inputs.sub_view_ratio_percent.toFixed(1) + "% means viewers are watching but not subscribing. A positioning statement fixes this at the root.", time_estimate_minutes: 25, steps: [{ step_number: 1, action: "Write one sentence: I help [specific person] achieve [specific result] without [specific frustration]. Example: I help first-time YouTube creators get 1000 subscribers without buying equipment.", tool_or_location: null }, { step_number: 2, action: "Open YouTube Studio and go to Customization - Basic info. Update your channel description to start with that sentence.", tool_or_location: "studio.youtube.com - Customization - Basic info" }, { step_number: 3, action: "Check your channel banner communicates the same message. Note what needs to change - do not redesign now.", tool_or_location: "studio.youtube.com - Customization - Branding" }, { step_number: 4, action: "Go to your last 3 video descriptions. Add your positioning sentence as the last line followed by a subscribe call to action.", tool_or_location: "studio.youtube.com - Content - each video - Details" }], success_condition: "Your positioning sentence is written, saved in your channel description, and added to your last 3 video descriptions." };
}

export function runBottleneckEngine(inputs) {
  const stage = deriveGrowthStage(inputs.subscribers);
  const layers = [
    scoreLayer("discoverability", inputs.ctr_percent, BENCHMARKS.ctr_percent, inputs, stage),
    scoreLayer("retention", inputs.avg_view_duration_percent, BENCHMARKS.avg_view_duration_percent, inputs, stage),
    scoreLayer("niche_positioning", inputs.sub_view_ratio_percent, BENCHMARKS.sub_view_ratio_percent, inputs, stage),
  ];
  const sorted = [...layers].sort((a, b) => b.final_impact_score - a.final_impact_score);
  const tieDetected = (sorted[0].final_impact_score - sorted[1].final_impact_score) < 5.0;
  const winner = tieDetected ? breakTie(sorted[0], sorted[1]) : sorted[0];
  const crisisLayer = layers.find(l => l.severity > CRISIS_THRESHOLD);
  const overrideTriggered = !!crisisLayer && crisisLayer.category !== winner.category;
  const selected = overrideTriggered && crisisLayer ? crisisLayer : winner;
  const finalLayers = layers.map(l => ({ ...l, selected: l.category === selected.category }));
  const runnerUpLayer = sorted.find(l => l.category !== selected.category) || null;
  const evidence = buildEvidence(selected.category, inputs, selected.confidence);
  const directive = buildDirective(selected.category, inputs);
  return { growth_stage: stage, layers: finalLayers, selected_bottleneck: selected.category, selected_impact_score: selected.final_impact_score, runner_up: runnerUpLayer ? { category: runnerUpLayer.category, score: runnerUpLayer.final_impact_score } : null, tie_detected: tieDetected, override_triggered: overrideTriggered, override_type: overrideTriggered ? "crisis" : null, evidence, directive };
}