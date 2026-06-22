import { ChannelEvidence, EvidenceValidation } from '../types/evidence';

export function validateEvidence(evidence: ChannelEvidence): EvidenceValidation {
  const missing: string[] = [];

  if (!evidence.topVideos.length) missing.push('top videos');
  if (!evidence.recentVideos.length) missing.push('recent videos');
  if (!evidence.allTimeTopVideo) missing.push('all-time top video');
  if (evidence.averageViews === 0) missing.push('view counts');
  if (!evidence.topVideos[0]?.title) missing.push('video titles');

  const score = Math.max(0, 100 - (missing.length * 20));
  const valid = missing.length <= 2; // Allow some missing fields during development

  return {
    valid,
    score,
    reason: valid
      ? 'Evidence is sufficient for diagnosis'
      : `Missing: ${missing.join(', ')}`,
    missingEvidence: missing,
  };
}

