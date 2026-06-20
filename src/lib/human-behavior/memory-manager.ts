import { EvidenceRecord }
  from '@/types/evidence-record';

import {
  getLearningsByCreator,
  saveLearning,
  updateLearning
} from './creator-learning-repository';

import {
  createLearningFromEvidence
} from './learning-builder';

import {
  findMatchingLearning
} from './learning-matcher';

import {
  updateLearningFromEvidence
} from './learning-updater';

export async function processEvidence(
  creatorId: string,
  evidence: EvidenceRecord
) {

  const learnings =
    await getLearningsByCreator(
      creatorId
    );

  const matchingLearning =
    findMatchingLearning(
      evidence.hypothesis,
      learnings
    );

  if (matchingLearning) {

    const updatedLearning =
      updateLearningFromEvidence(
        matchingLearning,
        evidence
      );

    const persistedLearning =
      await updateLearning(
        updatedLearning
      );

    return persistedLearning;
  }

  const newLearning =
    createLearningFromEvidence(
      evidence
    );

  await saveLearning(
    creatorId,
    newLearning
  );

  return newLearning;
}