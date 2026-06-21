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

export interface TrendSignal {
  urgency: string;
  topic: string;
  whyNow: string;
  videoTitle: string;
  postBy: string;
}

export interface ViralBrief {
  auditVersion: string;
  creatorId: string;
  generatedAt: string;
  overallScore: number;
  scoreLabel: string;
  viralScore: ViralScore;
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
