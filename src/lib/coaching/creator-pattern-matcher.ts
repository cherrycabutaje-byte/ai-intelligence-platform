import { RankedLearning } from '@/types/ranked-learning';
import { PatternMatch, GapSeverity } from '@/types/pattern-match';
import { SignalDetectionResult } from '@/types/signal-detection';
import { DetailedSignalResult } from './content-signal-engine';

// Pattern taxonomy — maps learning statements to signal types
type PatternType =
  | 'transformation'
  | 'curiosity'
  | 'stakes'
  | 'identity'
  | 'vulnerability'
  | 'journey';

interface TaxonomyRule {
  type: PatternType;
  keywords: string[];
  signalTypes: Array<keyof SignalDetectionResult>;
}

const TAXONOMY: TaxonomyRule[] = [
  {
    type: 'transformation',
    keywords: [
      'transform', 'change', 'journey', 'before', 'after',
      'growth', 'evolution', 'shift', 'personal', 'arc',
      'story', 'experience', 'became', 'different'
    ],
    signalTypes: ['transformation']
  },
  {
    type: 'curiosity',
    keywords: [
      'hook', 'curiosity', 'curious', 'question', 'mystery',
      'reveal', 'surprise', 'secret', 'discovery', 'discover',
      'unknown', 'intrigue', 'wonder'
    ],
    signalTypes: ['curiosity']
  },
  {
    type: 'stakes',
    keywords: [
      'risk', 'stakes', 'bet', 'commit', 'cost', 'consequence',
      'loss', 'gain', 'decision', 'sacrifice', 'invest',
      'commitment', 'result'
    ],
    signalTypes: ['stakes']
  },
  {
    type: 'identity',
    keywords: [
      'identity', 'who i am', 'became', 'reinvention',
      'self', 'purpose', 'meaning', 'values', 'belief',
      'authenticity', 'true self'
    ],
    signalTypes: ['transformation', 'stakes']
  },
  {
    type: 'vulnerability',
    keywords: [
      'vulnerable', 'honest', 'real', 'afraid', 'embarrassed',
      'admit', 'confession', 'raw', 'truth', 'fear',
      'struggle', 'difficult'
    ],
    signalTypes: ['transformation', 'stakes']
  },
  {
    type: 'journey',
    keywords: [
      'journey', 'path', 'process', 'adventure', 'travel',
      'move', 'start', 'begin', 'chapter', 'phase',
      'transition', 'step'
    ],
    signalTypes: ['transformation']
  }
];

function classifyLearning(
  statement: string
): PatternType | null {
  const lower = statement.toLowerCase();

  let bestMatch: PatternType | null = null;
  let bestScore = 0;

  for (const rule of TAXONOMY) {
    const matchCount = rule.keywords.filter(
      keyword => lower.includes(keyword)
    ).length;

    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestMatch = rule.type;
    }
  }

  return bestMatch;
}

function getSignalScore(
  patternType: PatternType,
  signals: SignalDetectionResult
): number {
  switch (patternType) {
    case 'transformation':
    case 'journey':
      return signals.transformation.score;
    case 'curiosity':
      return signals.curiosity.score;
    case 'stakes':
      return signals.stakes.score;
    case 'identity':
    case 'vulnerability':
      // Average of transformation and stakes
      return Math.round(
        (signals.transformation.score +
          signals.stakes.score) / 2
      );
    default:
      return 0;
  }
}

function getMatchedSignals(
  patternType: PatternType,
  signals: SignalDetectionResult
): string[] {
  const matched: string[] = [];

  if (
    patternType === 'transformation' ||
    patternType === 'journey' ||
    patternType === 'identity' ||
    patternType === 'vulnerability'
  ) {
    const t = signals.transformation;
    if (t.beforeState) matched.push('beforeState');
    if (t.afterState) matched.push('afterState');
    if (t.conflict) matched.push('conflict');
    if (t.turningPoint) matched.push('turningPoint');
    if (t.lesson) matched.push('lesson');
  }

  if (
    patternType === 'curiosity'
  ) {
    const c = signals.curiosity;
    if (c.unresolvedQuestion) matched.push('unresolvedQuestion');
    if (c.futureReveal) matched.push('futureReveal');
    if (c.mystery) matched.push('mystery');
    if (c.contradiction) matched.push('contradiction');
  }

  if (
    patternType === 'stakes' ||
    patternType === 'identity' ||
    patternType === 'vulnerability'
  ) {
    const s = signals.stakes;
    if (s.lossRisk) matched.push('lossRisk');
    if (s.gainOpportunity) matched.push('gainOpportunity');
    if (s.consequence) matched.push('consequence');
    if (s.commitment) matched.push('commitment');
  }

  return matched;
}

function getGapSeverity(gap: number): GapSeverity {
  if (gap >= 70) return 'High';
  if (gap >= 40) return 'Medium';
  return 'Low';
}

function getRecommendationConfidence(
  historicalConfidence: number,
  alignmentScore: number
): number {
  // Higher confidence when historical strength is high
  // and alignment is low — JARVIS is more certain about the gap
  const gapWeight = (100 - alignmentScore) / 100;
  return Math.round(historicalConfidence * gapWeight);
}

export function matchPatterns(
  learnings: RankedLearning[],
  detailedSignals: DetailedSignalResult
): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const ranked of learnings) {
    const patternType = classifyLearning(
      ranked.learning.statement
    );

    if (!patternType) continue;

    const alignmentScore = getSignalScore(
      patternType,
      detailedSignals.signals
    );

    const gapScore = Math.max(
      0,
      ranked.learning.confidence - alignmentScore
    );

    const matchedSignals = getMatchedSignals(
      patternType,
      detailedSignals.signals
    );

    const recommendationConfidence =
      getRecommendationConfidence(
        ranked.learning.confidence,
        alignmentScore
      );

    matches.push({
      pattern: ranked.learning.statement,
      confidence: ranked.learning.confidence,
      evidencePoints:
        ranked.learning.supportingEvidenceCount,
      presentInVideo: alignmentScore >= 40,
      alignmentScore,
      gapScore,
      severity: getGapSeverity(gapScore),
      matchedSignals,
      recommendationConfidence
    });
  }

  // Sort by gap score descending — highest gap first
  return matches.sort((a, b) => b.gapScore - a.gapScore);
}
