import { Opportunity }
  from './opportunity-builder';

export interface PrioritizedOpportunities {
  highestOpportunity: Opportunity | null;
  secondaryOpportunities: Opportunity[];
}

export function prioritizeOpportunities(
  opportunities: Opportunity[]
): PrioritizedOpportunities {
  if (!opportunities || opportunities.length === 0) {
    return {
      highestOpportunity: null,
      secondaryOpportunities: []
    };
  }

  return {
    highestOpportunity: opportunities[0],
    secondaryOpportunities: opportunities.slice(1)
  };
}
