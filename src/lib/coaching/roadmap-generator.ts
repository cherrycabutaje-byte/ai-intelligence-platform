import { Opportunity }
  from './opportunity-builder';
import { PrioritizedOpportunities }
  from './opportunity-prioritizer';
import { generateAction }
  from './action-generator';
import { generateSuccessMetric }
  from './success-metric-generator';

export interface RoadmapStep {
  step: number;
  priority: string;
  focus: string;
  action: string;
  successMetric: string;
}

function buildRoadmapStep(
  opportunity: Opportunity,
  step: number
): RoadmapStep {
  return {
    step,
    priority: opportunity.priorityLabel,
    focus: opportunity.statement,
    action: generateAction({
      learning: {
        id: '',
        statement: opportunity.statement,
        confidence: 0,
        status: 'tentative',
        supportingEvidenceCount: 0,
        contradictingEvidenceCount: 0,
        origin: { hypothesis: '' },
        createdAt: '',
        lastUpdated: ''
      },
      priorityScore: opportunity.priorityScore
    }),
    successMetric:
      generateSuccessMetric(opportunity)
  };
}

export function generateRoadmap(
  prioritized: PrioritizedOpportunities
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];

  if (prioritized.highestOpportunity) {
    steps.push(
      buildRoadmapStep(
        prioritized.highestOpportunity,
        1
      )
    );
  }

  prioritized.secondaryOpportunities
    .forEach((opportunity, index) => {
      steps.push(
        buildRoadmapStep(
          opportunity,
          index + 2
        )
      );
    });

  return steps;
}
