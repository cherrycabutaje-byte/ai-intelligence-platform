import { RankedLearning } from '@/types/ranked-learning';
import { PatternMatch, GapSeverity } from '@/types/pattern-match';
import { EvidenceReasoning } from '@/types/evidence-reasoning';
import {
  StrategicReasoning,
  PrimaryGap
} from '@/types/strategic-reasoning';

// All possible signals per pattern type
const ALL_TRANSFORMATION_SIGNALS = [
  'beforeState', 'afterState', 'conflict', 'turningPoint', 'lesson'
];
const ALL_CURIOSITY_SIGNALS = [
  'unresolvedQuestion', 'futureReveal', 'mystery', 'contradiction'
];
const ALL_STAKES_SIGNALS = [
  'lossRisk', 'gainOpportunity', 'consequence', 'commitment'
];

function getSignalsForPattern(pattern: string): string[] {
  const lower = pattern.toLowerCase();
  if (
    lower.includes('transform') ||
    lower.includes('story') ||
    lower.includes('journey') ||
    lower.includes('personal') ||
    lower.includes('arc')
  ) return ALL_TRANSFORMATION_SIGNALS;
  if (
    lower.includes('curiosity') ||
    lower.includes('hook') ||
    lower.includes('question') ||
    lower.includes('discovery')
  ) return ALL_CURIOSITY_SIGNALS;
  if (
    lower.includes('stakes') ||
    lower.includes('risk') ||
    lower.includes('commit') ||
    lower.includes('consequence')
  ) return ALL_STAKES_SIGNALS;
  return ALL_TRANSFORMATION_SIGNALS;
}

function buildEvidenceReasoning(
  match: PatternMatch
): EvidenceReasoning {
  const alignment = match.alignmentScore;

  let conclusion: string;
  if (alignment >= 70) {
    conclusion = `This video strongly activates this pattern at ${alignment}% alignment. Keep doing this.`;
  } else if (alignment >= 40) {
    conclusion = `This video partially uses this pattern at ${alignment}% alignment. There is room to go deeper.`;
  } else {
    conclusion = `This video uses only ${alignment}% of this pattern. Your channel history shows this pattern drives your strongest results. The ${match.gapScore}-point gap explains the performance risk.`;
  }

  return {
    creatorLearning: match.pattern,
    confidence: match.confidence,
    evidencePoints: match.evidencePoints,
    currentVideoAlignment: match.alignmentScore,
    gapSeverity: match.severity,
    conclusion,
    recommendationConfidence: match.recommendationConfidence
  };
}

function selectPrimaryGap(
  matches: PatternMatch[]
): PrimaryGap | null {
  if (!matches || matches.length === 0) return null;

  const sorted = [...matches].sort(
    (a, b) => b.gapScore - a.gapScore
  );
  const top = sorted[0];

  if (top.gapScore === 0) return null;

  const allSignals = getSignalsForPattern(top.pattern);
  const missingSignals = allSignals.filter(
    s => !top.matchedSignals.includes(s)
  );

  const recommendation = missingSignals.length > 0
    ? `Add these missing signals: ${missingSignals.join(', ')}.`
    : `Strengthen this pattern — detected signals need more depth.`;

  return {
    pattern: top.pattern,
    historicalConfidence: top.confidence,
    currentAlignment: top.alignmentScore,
    gapScore: top.gapScore,
    severity: top.severity,
    recommendation,
    missingSignals
  };
}

function selectTopStrength(
  matches: PatternMatch[]
): string {
  if (!matches || matches.length === 0) {
    return 'No pattern history available';
  }
  const sorted = [...matches].sort(
    (a, b) => b.alignmentScore - a.alignmentScore
  );
  const top = sorted[0];
  if (top.alignmentScore < 20) {
    return 'No strong pattern detected in this video';
  }
  return top.pattern;
}

function calculateOverallConfidence(
  reasonings: EvidenceReasoning[]
): number {
  if (!reasonings || reasonings.length === 0) return 0;
  const total = reasonings.reduce(
    (sum, r) => sum + r.recommendationConfidence, 0
  );
  return Math.round(total / reasonings.length);
}

function buildAlignmentSummary(
  matches: PatternMatch[]
): string {
  if (!matches || matches.length === 0) {
    return 'No creator history available for comparison.';
  }
  const avgAlignment = Math.round(
    matches.reduce((sum, m) => sum + m.alignmentScore, 0) /
    matches.length
  );
  const highGaps = matches.filter(m => m.severity === 'High').length;
  const mediumGaps = matches.filter(m => m.severity === 'Medium').length;

  if (avgAlignment >= 70) {
    return `Current video aligns strongly with ${avgAlignment}% of your proven creator patterns.`;
  } else if (highGaps > 0) {
    return `Current video aligns with ${avgAlignment}% of your proven creator patterns. ${highGaps} high-severity gap${highGaps > 1 ? 's' : ''} detected.`;
  } else if (mediumGaps > 0) {
    return `Current video aligns with ${avgAlignment}% of your proven creator patterns. ${mediumGaps} medium-severity gap${mediumGaps > 1 ? 's' : ''} detected.`;
  }
  return `Current video aligns with ${avgAlignment}% of your proven creator patterns.`;
}

function generatePromptContext(
  reasoning: Omit<StrategicReasoning, 'promptContext'>
): string {
  if (!reasoning.creatorHasHistory) {
    return `CREATOR HISTORY\nNo channel history available yet.\nAnalysis based on current video only.`;
  }

  const lines: string[] = ['CREATOR HISTORY', ''];

  if (reasoning.topStrength) {
    lines.push(`Strongest Pattern: ${reasoning.topStrength}`);
    lines.push('');
  }

  if (reasoning.primaryGap) {
    lines.push(`Primary Gap: ${reasoning.primaryGap.pattern}`);
    lines.push(`Historical Confidence: ${reasoning.primaryGap.historicalConfidence}%`);
    lines.push(`Current Alignment: ${reasoning.primaryGap.currentAlignment}%`);
    lines.push(`Gap Score: ${reasoning.primaryGap.gapScore}`);
    lines.push(`Severity: ${reasoning.primaryGap.severity}`);
    if (reasoning.primaryGap.missingSignals && reasoning.primaryGap.missingSignals.length > 0) {
      lines.push(`Missing Signals: ${reasoning.primaryGap.missingSignals.join(', ')}`);
    }
    lines.push('');
  }

  if (reasoning.evidenceReasonings.length > 0) {
    lines.push('Evidence:');
    reasoning.evidenceReasonings.forEach(r => {
      lines.push(`- ${r.creatorLearning}`);
      lines.push(`  Confidence: ${r.confidence}% | Alignment: ${r.currentVideoAlignment}% | Gap: ${r.gapSeverity}`);
    });
    lines.push('');
  }

  lines.push(`Overall Recommendation Confidence: ${reasoning.overallRecommendationConfidence}%`);
  lines.push('');
  lines.push(reasoning.alignmentSummary);

  return lines.join('\n');
}

export function buildStrategicReasoning(
  matches: PatternMatch[],
  creatorHasHistory: boolean
): StrategicReasoning {
  if (!creatorHasHistory || matches.length === 0) {
    const empty: Omit<StrategicReasoning, 'promptContext'> = {
      creatorHasHistory: false,
      topStrength: 'No pattern history available',
      evidenceReasonings: [],
      patternMatches: [],
      primaryGap: null,
      alignmentSummary: 'No creator history available. Analysis based on current video only.',
      overallRecommendationConfidence: 0
    };
    return { ...empty, promptContext: generatePromptContext(empty) };
  }

  const evidenceReasonings = matches.map(buildEvidenceReasoning);
  const primaryGap = selectPrimaryGap(matches);
  const topStrength = selectTopStrength(matches);
  const alignmentSummary = buildAlignmentSummary(matches);
  const overallRecommendationConfidence =
    calculateOverallConfidence(evidenceReasonings);

  const partial: Omit<StrategicReasoning, 'promptContext'> = {
    creatorHasHistory: true,
    topStrength,
    evidenceReasonings,
    patternMatches: matches,
    primaryGap,
    alignmentSummary,
    overallRecommendationConfidence
  };

  return { ...partial, promptContext: generatePromptContext(partial) };
}
