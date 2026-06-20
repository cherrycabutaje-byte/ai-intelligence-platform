import { CreatorLearning }
  from '@/types/creator-learning';

export function findMatchingLearning(
  statement: string,
  learnings: CreatorLearning[]
): CreatorLearning | null {

  const normalizedStatement =
    statement
      .trim()
      .toLowerCase();

  const match =
    learnings.find(
      learning =>
        learning.statement
          .trim()
          .toLowerCase() ===
        normalizedStatement
    );

  return match ?? null;
}