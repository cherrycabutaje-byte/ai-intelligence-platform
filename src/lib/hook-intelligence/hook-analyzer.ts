import { HookSignal }
  from '@/types/hook-signal';

export function analyzeHookText(
  text: string
): HookSignal[] {

  const signals: HookSignal[] = [];

  const normalizedText =
    text.toLowerCase();

  if (
    normalizedText.includes('what happened') ||
    normalizedText.includes('you wont believe') ||
    normalizedText.includes('guess what')
  ) {
    signals.push({
      category: 'curiosity',

      statement:
        'Curiosity hook present',

      confidence: 75
    });
  }

  if (
    normalizedText.includes('suddenly') ||
    normalizedText.includes('unexpected') ||
    normalizedText.includes('shock')
  ) {
    signals.push({
      category: 'surprise',

      statement:
        'Surprise hook present',

      confidence: 75
    });
  }

  if (
    normalizedText.includes('problem') ||
    normalizedText.includes('struggle') ||
    normalizedText.includes('stuck')
  ) {
    signals.push({
      category: 'problem',

      statement:
        'Problem hook present',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('how to') ||
    normalizedText.includes('i will show you') ||
    normalizedText.includes('solution')
  ) {
    signals.push({
      category: 'promise',

      statement:
        'Promise hook present',

      confidence: 70
    });
  }

  return signals;
}