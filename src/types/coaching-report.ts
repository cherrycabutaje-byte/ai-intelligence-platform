import { CoachingRecommendation }
  from './coaching-recommendation';

export interface CoachingReport {

  primaryConstraint: string;

  recommendations:
    CoachingRecommendation[];

  coachDirective: string;
}