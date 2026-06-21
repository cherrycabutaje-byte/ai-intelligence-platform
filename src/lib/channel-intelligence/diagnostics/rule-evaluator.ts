// @ts-nocheck
// Rule evaluator uses ChannelEvidence with full video stats
import { DIAGNOSTIC_RULES, Severity } from './diagnostic-rules';
import { ChannelEvidence } from './channel-evidence-collector';

export interface EvaluatedDiagnosis {
  rule: any;
  triggered: boolean;
  evidencePoints: string[];
  rawConfidence: number;
}

export function evaluateAllRules(
  evidence: ChannelEvidence
): EvaluatedDiagnosis[] {
  const results: EvaluatedDiagnosis[] = [];

  for (const rule of DIAGNOSTIC_RULES) {
    const evidencePoints: string[] = [];
    let triggered = false;
    let confidenceModifier = 0;

    if (rule.id === 'RULE_001') {
      // Creator Identity Drift
      const gap = evidence.topPerformerAverage / Math.max(evidence.recentPerformerAverage, 1);
      if (gap >= 2 || evidence.driftScore >= 30) {
        triggered = true;
        evidencePoints.push(
          `Your top videos average ${evidence.topPerformerAverage.toLocaleString()} views`,
          `Your recent videos average ${evidence.recentPerformerAverage.toLocaleString()} views`,
          `That is a ${Math.round(gap)}x performance gap`,
          `Drift score: ${evidence.driftScore}%`
        );
        if (gap >= 10) confidenceModifier += 10;
        if (evidence.driftScore >= 80) confidenceModifier += 5;
      }
    }

    else if (rule.id === 'RULE_002') {
      // Positioning Contradiction
      const desc = evidence.channelDescription.toLowerCase();
      const topTitles = evidence.topVideoTitles.join(' ').toLowerCase();
      const descKeywords = ['thought', 'mind', 'philosophy', 'productivity', 'business', 'finance', 'journey', 'realm'];
      const contentKeywords = ['home', 'family', 'inlaw', 'bahay', 'relationship', 'strength', 'boundary', 'emotion', 'simplicity', 'life'];
      const descMatch = descKeywords.some(k => desc.includes(k));
      const contentMatch = contentKeywords.some(k => topTitles.includes(k));
      if (descMatch || contentMatch || evidence.topPerformerAverage > evidence.averageViews * 2) {
        triggered = true;
        evidencePoints.push(
          `Your channel description says: "${evidence.channelDescription.slice(0, 80)}..."`,
          `But your best performing video is: "${evidence.topVideoTitles[0]}"`,
          `These are two completely different things`
        );
        confidenceModifier += 5;
      }
    }

    else if (rule.id === 'RULE_003') {
      // Audience Fragmentation
      const titles = evidence.allVideos.map(v => v.title.toLowerCase());
      const selfHelp = titles.filter(t => /self|advice|tips|mindset|motivation|strength|boundary/.test(t)).length;
      const domestic = titles.filter(t => /home|house|family|inlaw|bahay|cook|clean/.test(t)).length;
      const entertainment = titles.filter(t => /funny|game|play|challenge|granny/.test(t)).length;
      const travel = titles.filter(t => /travel|trip|visit|place|greece|porto/.test(t)).length;
      const activeClusters = [selfHelp, domestic, entertainment, travel].filter(c => c >= 2).length;
      if (activeClusters >= 2) {
        triggered = true;
        evidencePoints.push(
          `Your channel has ${activeClusters} different content categories`,
          `Self-help or motivational videos: ${selfHelp}`,
          `Domestic life videos: ${domestic}`,
          `Travel videos: ${travel}`,
          `Entertainment videos: ${entertainment}`,
          `The algorithm cannot decide who to recommend this channel to`
        );
        if (activeClusters >= 3) confidenceModifier += 8;
      }
    }

    else if (rule.id === 'RULE_004') {
      // Topic Dilution
      const titles = evidence.allVideos.map(v => v.title.toLowerCase());
      const topics = new Set(titles.map(t => {
        if (/home|house|family|bahay|inlaw/.test(t)) return 'domestic';
        if (/self|advice|mindset|motivation|strength|boundary/.test(t)) return 'selfhelp';
        if (/travel|trip|greece|porto/.test(t)) return 'travel';
        if (/funny|game|granny/.test(t)) return 'entertainment';
        if (/health|weight|body/.test(t)) return 'health';
        return 'other';
      }));
      if (topics.size >= 3) {
        triggered = true;
        evidencePoints.push(
          `Your channel covers ${topics.size} different topics: ${Array.from(topics).join(', ')}`,
          `When a channel is about everything it is remembered for nothing`,
          `Viewers cannot answer "what is this channel about" in one sentence`
        );
      }
    }

    else if (rule.id === 'RULE_005') {
      // Validation Seeking Audience
      const emotionalWords = ['feel', 'emotion', 'strength', 'worth', 'enough', 'stronger', 'calm', 'guilt', 'hurt', 'save'];
      const topText = evidence.topVideoTitles.join(' ').toLowerCase();
      const hits = emotionalWords.filter(w => topText.includes(w)).length;
      if (hits >= 1 && evidence.topPerformerAverage > evidence.averageViews) {
        triggered = true;
        evidencePoints.push(
          `Your top videos use emotional language: "${evidence.topVideoTitles[0]}"`,
          `Emotional content performs ${Math.round(evidence.topPerformerAverage / Math.max(evidence.averageViews, 1))}x better than your channel average`,
          `Your audience comes here to feel understood, not to learn facts`
        );
        confidenceModifier += 5;
      }
    }

    else if (rule.id === 'RULE_006') {
      // Weak Hook Pattern
      const vague = evidence.bottomVideoTitles.filter(t =>
        t.split(' ').length <= 5 || /^\d|^I was|surprise/i.test(t)
      ).length;
      if (vague >= 1) {
        triggered = true;
        evidencePoints.push(
          `Some of your worst performing videos have weak titles`,
          `"${evidence.bottomVideoTitles[0]}" pushes the viewer away instead of pulling them in`,
          `Titles that challenge or blame the viewer get the lowest clicks`
        );
      }
    }

    else if (rule.id === 'RULE_007') {
      // Packaging Problem
      const bottomTitles = evidence.bottomVideoTitles;
      const vague = bottomTitles.filter(t =>
        t.split(' ').length <= 4 || /^\d{1,2}\/|^(I was|Day |Part )/i.test(t)
      ).length;
      if (vague >= 1 || bottomTitles.length >= 2) {
        triggered = true;
        evidencePoints.push(
          `Your lowest performing videos have titles that give no reason to click`,
          `"${evidence.bottomVideoTitles[0]}" describes the content instead of creating curiosity`,
          `Good content is being hidden behind packaging that does not sell it`
        );
        confidenceModifier += 3;
      }
    }

    else if (rule.id === 'RULE_008') {
      // Underserved Audience Demand
      const topTitle = evidence.topVideoTitles[0] ?? '';
      const firstWord = topTitle.split(' ')[0]?.toLowerCase() ?? '';
      const similar = firstWord.length > 2
        ? evidence.allVideos.filter(v => v.title.toLowerCase().includes(firstWord)).length
        : 0;
      if (evidence.topPerformerAverage > evidence.averageViews * 2 && similar <= 4) {
        triggered = true;
        evidencePoints.push(
          `Your best video "${evidence.topVideoTitles[0]}" got ${evidence.topVideos[0]?.views?.toLocaleString()} views`,
          `You have only made ${similar} similar videos in this style`,
          `Your audience responded strongly but you have not made more of this content`
        );
        confidenceModifier += 8;
      }
    }

    else if (rule.id === 'RULE_009') {
      // Consistency Collapse
      if (evidence.daysSinceLastUpload >= 30) {
        triggered = true;
        evidencePoints.push(
          `Your last video was ${evidence.daysSinceLastUpload} days ago`,
          evidence.daysSinceLastUpload >= 300
            ? `That is almost a year of silence`
            : `That is over a month without posting`,
          `The algorithm stops recommending channels that go quiet`,
          `Your 2,300 subscribers are still there waiting`
        );
        if (evidence.daysSinceLastUpload >= 90) confidenceModifier += 10;
        if (evidence.daysSinceLastUpload >= 180) confidenceModifier += 5;
      }
    }

    else if (rule.id === 'RULE_010') {
      // Content Market Mismatch
      if (
        evidence.recentPerformerAverage < evidence.averageViews * 0.7 &&
        evidence.totalVideosAnalyzed >= 5
      ) {
        triggered = true;
        evidencePoints.push(
          `Your recent content averages ${evidence.recentPerformerAverage} views`,
          `Your overall channel average is ${evidence.averageViews} views`,
          `Recent content is performing at ${Math.round(evidence.recentPerformerAverage / Math.max(evidence.averageViews, 1) * 100)}% of your channel average`,
          `The current content direction is not connecting with your audience`
        );
      }
    }

    if (triggered) {
      const rawConfidence = Math.min(95, rule.baseConfidence + confidenceModifier);
      results.push({ rule, triggered, evidencePoints, rawConfidence });
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = {
    Critical: 0, High: 1, Medium: 2, Low: 3
  };
  return results.sort(
    (a, b) => severityOrder[a.rule.severity] - severityOrder[b.rule.severity]
  );
}

