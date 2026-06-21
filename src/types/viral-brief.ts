export interface CuriosityDiagnosis {
  title: string;
  hook: string;
  retention: string;
  payoff: string;
}

export interface StakesDiagnosis {
  whatIsAtStake: string;
  doesViewerCare: string;
  howToRaiseStakes: string;
  investmentMoments: string;
  overDeliver: string;
}

export interface ViralScore {
  titleCuriosity: number;
  hookCuriosity: number;
  stakesPresent: number;
  viewerInvestment: number;
  timeBombs: number;
  investmentMoments: number;
  total: number;
  label: string;
  gap: string;
}

export interface MostInterestingMoment {
  quote: string;
  whyItMatters: string;
}

export interface WhyJarvisBelievesThis {
  creatorHasHistory: boolean;
  strongestLearning: string;
  confidence: number;
  evidencePoints: number;
  currentVideoAlignment: number;
  gapSeverity: string;
  missingSignals: string[];
  conclusion: string;
  topStrength: string;
  overallRecommendationConfidence: number;
}

export interface ViralBrief {
  auditVersion: string;
  creatorId: string;
  generatedAt: string;
  overallScore: number;
  scoreLabel: string;
  viralScore: ViralScore;
  whyJarvisBelievesThis: WhyJarvisBelievesThis;
  verdict: string;
  creatorVoice: string;
  audienceFeelingDiagnosis: string;
  mostInterestingMoment: MostInterestingMoment | string;
  superpower: string;
  curiosityDiagnosis: CuriosityDiagnosis;
  stakesDiagnosis: StakesDiagnosis;
  titleFormula: string[];
  hookScript: string;
  openLoops: string[];
  shareableLine: string;
  viralBet: string;
  stopDoing: string;
  winCondition: string;
  coachingSignOff: string;
}
