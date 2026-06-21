// @ts-nocheck
import { CreatorMemory } from '@/types/creator-memory';
import { KnowledgeCandidate } from '@/types/knowledge-candidate';

export function updateCreatorMemory(
  memory: CreatorMemory,
  candidate: KnowledgeCandidate
): CreatorMemory {

  const existingLearning =
    memory.learnings.find(
      learning =>
        learning.statement === candidate.statement
    );

  if (existingLearning) {

    const updatedLearnings =
      memory.learnings.map(learning =>
        learning.statement === candidate.statement
          ? candidate
          : learning
      );

    return {
      ...memory,

      learnings: updatedLearnings,

      lastUpdated:
        new Date().toISOString()
    };
  }

  return {
    ...memory,

    learnings: [
      ...memory.learnings,
      candidate
    ],

    lastUpdated:
      new Date().toISOString()
  };
}
