import { EvidenceRecord } from '@/types/evidence-record';
import {
  KnowledgeCandidate
} from '@/types/knowledge-candidate';

export function buildKnowledgeCandidate(
  evidence: EvidenceRecord
): KnowledgeCandidate {

  const supportingEvidenceCount =
    evidence.result === 'validated'
      ? 1
      : 0;

  const contradictingEvidenceCount =
    evidence.result === 'rejected'
      ? 1
      : 0;

  return {
    statement: evidence.hypothesis,

    supportingEvidenceCount,

    contradictingEvidenceCount,

    confidence:
      evidence.result === 'validated'
        ? 60
        : 40,

    status:
      evidence.result === 'validated'
        ? 'emerging'
        : 'rejected',

    lastUpdated:
      new Date().toISOString()
  };
}