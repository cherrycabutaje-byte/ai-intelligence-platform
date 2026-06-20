import { AudienceSignal }
  from '@/types/audience-signal';

export function analyzeAudienceText(
  text: string
): AudienceSignal[] {

  const signals: AudienceSignal[] = [];

  const normalizedText =
    text.toLowerCase();

  if (
    normalizedText.includes('stuck')
  ) {
    signals.push({
      category: 'pain-point',

      statement:
        'Feeling stuck in life',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('change')
  ) {
    signals.push({
      category: 'goal',

      statement:
        'Desire for change',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('hope')
  ) {
    signals.push({
      category: 'desire',

      statement:
        'Seeking hope',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('afraid')
  ) {
    signals.push({
      category: 'fear',

      statement:
        'Fear of negative outcome',

      confidence: 70
    });
  }

  return signals;
}