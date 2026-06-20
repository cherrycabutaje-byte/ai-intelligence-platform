import { RankedLearning }
  from '@/types/ranked-learning';

export function synthesizeExperiment(
  learnings: RankedLearning[]
): string {
  if (!learnings || learnings.length === 0) {
    return 'No learnings available to synthesize an experiment.';
  }

  const primary = learnings[0];
  const supporting = learnings.slice(1);

  if (supporting.length === 0) {
    return `Test: ${primary.learning.statement}`;
  }

  const supportingStatements =
    supporting
      .map(r => r.learning.statement)
      .join(' and ');

  return (
    `Test: ${primary.learning.statement} - ` +
    `while also applying: ${supportingStatements}`
  );
}
