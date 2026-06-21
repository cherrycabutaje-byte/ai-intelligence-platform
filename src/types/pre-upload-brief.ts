export interface IdeaScore {
  score: number;
  label: string;
  gap: string;
}

export interface TrendCheck {
  isTrending: boolean;
  trendStrength: string;
  bestTimeToPost: string;
  whyThisTime: string;
}

export interface PreUploadBrief {
  version: string;
  creatorId: string;
  generatedAt: string;
  idea: string;
  ideaScore: IdeaScore;
  verdict: string;
  titleOptions: string[];
  hookScript: string;
  filmingChecklist: string[];
  timeBombs: string[];
  viralAngle: string;
  trendCheck: TrendCheck;
  warningIfAny: string;
}
