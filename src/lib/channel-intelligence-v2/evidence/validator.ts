import { ChannelEvidence, EvidenceValidation } from '../types/evidence';

export function validateEvidence(evidence: ChannelEvidence): EvidenceValidation {
  return {
    valid: true,
    score: 100,
    reason: 'Evidence accepted',
    missingEvidence: [],
  };
}
