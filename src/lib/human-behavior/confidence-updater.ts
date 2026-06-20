import { EvidenceRecord } from '@/types/evidence-record';
import {
  KnowledgeCandidate,
  KnowledgeStatus
} from '@/types/knowledge-candidate';

export function updateConfidence(
  candidate: KnowledgeCandidate,
  evidence: EvidenceRecord
): KnowledgeCandidate {

  let supportingEvidenceCount =
    candidate.supportingEvidenceCount;

  let contradictingEvidenceCount =
    candidate.contradictingEvidenceCount;

  let confidence =
    candidate.confidence;

  if (evidence.result === 'validated') {
    supportingEvidenceCount += 1;
    confidence += 8;
  }

  if (evidence.result === 'rejected') {
    contradictingEvidenceCount += 1;
    confidence -= 10;
  }

  confidence = Math.max(
    0,
    Math.min(100, confidence)
  );

  let status: KnowledgeStatus =
    'emerging';

  if (confidence >= 90) {
    status = 'validated';
  } else if (confidence >= 75) {
    status = 'tentative';
  } else if (confidence < 40) {
    status = 'rejected';
  }

  return {
    ...candidate,

    supportingEvidenceCount,

    contradictingEvidenceCount,

    confidence,

    status,

    lastUpdated:
      new Date().toISOString()
  };
}