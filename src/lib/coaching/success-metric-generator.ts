import { Opportunity }
  from './opportunity-builder';

const HIGH_PRIORITY_VIDEO_COUNT = 5;
const MEDIUM_PRIORITY_VIDEO_COUNT = 3;
const SUPPORTING_VIDEO_COUNT = 2;

export function generateSuccessMetric(
  opportunity: Opportunity
): string {
  switch (opportunity.priorityLabel) {
    case 'High Priority':
      return (
        `Measure click-through rate across next ${HIGH_PRIORITY_VIDEO_COUNT} videos applying: ` +
        opportunity.statement
      );
    case 'Medium Priority':
      return (
        `Track audience retention across next ${MEDIUM_PRIORITY_VIDEO_COUNT} videos applying: ` +
        opportunity.statement
      );
    default:
      return (
        `Observe engagement signals across next ${SUPPORTING_VIDEO_COUNT} videos applying: ` +
        opportunity.statement
      );
  }
}
