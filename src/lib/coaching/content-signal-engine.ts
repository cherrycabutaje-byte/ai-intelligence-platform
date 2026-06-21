import {
  SignalDetectionResult,
  TransformationSignals,
  CuriositySignals,
  StakesSignals
} from '@/types/signal-detection';

export type SignalStrength = 'Strong' | 'Moderate' | 'Weak' | 'None';

export interface SignalEvidence {
  snippet: string;
  signal: string;
  weight: number;
}

export interface DetailedSignalResult {
  signals: SignalDetectionResult;
  evidence: SignalEvidence[];
  transformationStrength: SignalStrength;
  curiosityStrength: SignalStrength;
  stakesStrength: SignalStrength;
}

// Weighted signal patterns
const TRANSFORMATION_PATTERNS = [
  // Before state — high weight
  { pattern: /(\d+ years? ago|back then|at that time|before i|i used to|i was once|i remember when|i was struggling|i was stuck|i was afraid|i was lost|i had no|i didn.t know)/i, signal: 'beforeState', weight: 3 },
  // After state — high weight
  { pattern: /(now i|today i|i became|i am now|i have become|everything changed|my life changed|i transformed|i am different|i finally|i no longer)/i, signal: 'afterState', weight: 3 },
  // Turning point — highest weight
  { pattern: /(that moment|that day|that was when|everything shifted|turning point|i decided|i chose|i made a decision|i realized i had to|i knew i had to|the moment i)/i, signal: 'turningPoint', weight: 4 },
  // Conflict — medium weight
  { pattern: /(but i was|however i|except|despite|even though|although|i struggled|i failed|i was wrong|i made a mistake|it was hard|it was difficult|i almost gave up)/i, signal: 'conflict', weight: 2 },
  // Lesson — medium weight
  { pattern: /(i learned|i discovered|i realized|i found out|what i know now|the truth is|here is what|i want to share|this taught me|i understand now)/i, signal: 'lesson', weight: 2 }
];

const CURIOSITY_PATTERNS = [
  // Unresolved question — highest weight
  { pattern: /(what (if|happened|would|could|does|is the)|why (does|would|did|is)|how (did|does|can|could)|is it (possible|true)|can you|have you ever|do you (know|want|wonder))/i, signal: 'unresolvedQuestion', weight: 4 },
  // Future reveal — high weight
  { pattern: /(stay (with me|tuned)|i will (show|tell|reveal|explain)|coming up|you won.t believe|wait until|keep watching|by the end|i.ll get to|stick around|don.t go)/i, signal: 'futureReveal', weight: 3 },
  // Mystery — medium weight
  { pattern: /(secret|nobody (knows|talks about|tells you)|most people don.t|the truth about|what they don.t|hidden|surprising|unexpected|you.d be surprised|shocking)/i, signal: 'mystery', weight: 2 },
  // Contradiction — medium weight
  { pattern: /(but (here|wait|actually|the thing is)|however|on the other hand|the opposite|turns out|contrary to|instead|plot twist|ironically|paradox)/i, signal: 'contradiction', weight: 2 }
];

const STAKES_PATTERNS = [
  // Loss risk — highest weight
  { pattern: /(i (almost|nearly) lost|at risk|could (fail|lose|miss)|i was going to lose|everything on the line|i had nothing|i risked|i put it all|i bet everything|the cost was)/i, signal: 'lossRisk', weight: 4 },
  // Commitment — high weight
  { pattern: /(i (committed|dedicated|decided|promised|vowed|pledged)|i went all in|i gave everything|i sacrificed|i gave up|i quit|i left|i walked away|no turning back)/i, signal: 'commitment', weight: 3 },
  // Consequence — medium weight
  { pattern: /(if you don.t|what happens (if|when)|the cost of|what it (cost|took)|consequence|result was|impact was|because of this|this means|this changes)/i, signal: 'consequence', weight: 2 },
  // Gain opportunity — medium weight
  { pattern: /(opportunity|potential|could (win|gain|achieve|become)|chance to|possibility|what you could|imagine if|what if you|this could be)/i, signal: 'gainOpportunity', weight: 2 }
];

function getSignalStrength(score: number): SignalStrength {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 15) return 'Weak';
  return 'None';
}

function detectPatterns(
  text: string,
  patterns: typeof TRANSFORMATION_PATTERNS
): { signals: Record<string, boolean>; evidence: SignalEvidence[]; totalWeight: number; maxWeight: number } {
  const signals: Record<string, boolean> = {};
  const evidence: SignalEvidence[] = [];
  let totalWeight = 0;
  let maxWeight = 0;

  for (const { pattern, signal, weight } of patterns) {
    maxWeight += weight;
    const match = text.match(pattern);
    if (match) {
      signals[signal] = true;
      totalWeight += weight;
      // Extract snippet around the match
      const matchIndex = text.indexOf(match[0]);
      const start = Math.max(0, matchIndex - 20);
      const end = Math.min(text.length, matchIndex + match[0].length + 40);
      const snippet = text.slice(start, end).trim();
      evidence.push({ snippet, signal, weight });
    } else {
      signals[signal] = false;
    }
  }

  return { signals, evidence, totalWeight, maxWeight };
}

export function detectSignals(
  transcript: string
): DetailedSignalResult {
  const text = transcript.toLowerCase();

  // Detect transformation signals
  const transformResult = detectPatterns(text, TRANSFORMATION_PATTERNS);
  const transformScore = transformResult.maxWeight > 0
    ? Math.round((transformResult.totalWeight / transformResult.maxWeight) * 100)
    : 0;

  const transformation: TransformationSignals = {
    beforeState: transformResult.signals['beforeState'] ?? false,
    afterState: transformResult.signals['afterState'] ?? false,
    conflict: transformResult.signals['conflict'] ?? false,
    turningPoint: transformResult.signals['turningPoint'] ?? false,
    lesson: transformResult.signals['lesson'] ?? false,
    score: transformScore
  };

  // Detect curiosity signals
  const curiosityResult = detectPatterns(text, CURIOSITY_PATTERNS);
  const curiosityScore = curiosityResult.maxWeight > 0
    ? Math.round((curiosityResult.totalWeight / curiosityResult.maxWeight) * 100)
    : 0;

  const curiosity: CuriositySignals = {
    unresolvedQuestion: curiosityResult.signals['unresolvedQuestion'] ?? false,
    futureReveal: curiosityResult.signals['futureReveal'] ?? false,
    mystery: curiosityResult.signals['mystery'] ?? false,
    contradiction: curiosityResult.signals['contradiction'] ?? false,
    score: curiosityScore
  };

  // Detect stakes signals
  const stakesResult = detectPatterns(text, STAKES_PATTERNS);
  const stakesScore = stakesResult.maxWeight > 0
    ? Math.round((stakesResult.totalWeight / stakesResult.maxWeight) * 100)
    : 0;

  const stakes: StakesSignals = {
    lossRisk: stakesResult.signals['lossRisk'] ?? false,
    gainOpportunity: stakesResult.signals['gainOpportunity'] ?? false,
    consequence: stakesResult.signals['consequence'] ?? false,
    commitment: stakesResult.signals['commitment'] ?? false,
    score: stakesScore
  };

  const allEvidence = [
    ...transformResult.evidence,
    ...curiosityResult.evidence,
    ...stakesResult.evidence
  ].sort((a, b) => b.weight - a.weight);

  return {
    signals: { transformation, curiosity, stakes },
    evidence: allEvidence,
    transformationStrength: getSignalStrength(transformScore),
    curiosityStrength: getSignalStrength(curiosityScore),
    stakesStrength: getSignalStrength(stakesScore)
  };
}
