import { EvidenceRecord }
  from '@/types/evidence-record';

import { CreatorLearning }
  from '@/types/creator-learning';

export function createLearningFromEvidence(
  evidence: EvidenceRecord
): CreatorLearning {

  const now =
    new Date().toISOString();

  return {
    id:
      crypto.randomUUID(),

    statement:
      evidence.hypothesis,

    origin: {
      hypothesis:
        evidence.hypothesis,

      constraintType:
        evidence.constraintType,

      experimentId:
        evidence.experimentId
    },

    confidence:
      evidence.result === 'validated'
        ? 60
        : 40,

    status:
      evidence.result === 'validated'
        ? 'emerging'
        : 'rejected',

    supportingEvidenceCount:
      evidence.result === 'validated'
        ? 1
        : 0,

    contradictingEvidenceCount:
      evidence.result === 'rejected'
        ? 1
        : 0,

    createdAt: now,

    lastUpdated: now
  };
}