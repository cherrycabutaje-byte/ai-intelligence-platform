import { RetentionSignal }
  from '@/types/retention-signal';

export function analyzeRetentionText(
  text: string
): RetentionSignal[] {

  const signals: RetentionSignal[] = [];

  const normalizedText =
    text.toLowerCase();

  if (
    normalizedText.includes('but') ||
    normalizedText.includes('however') ||
    normalizedText.includes('later')
  ) {
    signals.push({
      category: 'open_loop',

      statement:
        'Open loop present',

      confidence: 75
    });
  }

  if (
    normalizedText.includes('finally') ||
    normalizedText.includes('eventually') ||
    normalizedText.includes('in the end')
  ) {
    signals.push({
      category: 'payoff',

      statement:
        'Payoff present',

      confidence: 75
    });
  }

  if (
    normalizedText.includes('too long') ||
    normalizedText.includes('boring')
  ) {
    signals.push({
      category: 'attention_drop',

      statement:
        'Potential attention drop',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('step') ||
    normalizedText.includes('lesson') ||
    normalizedText.includes('tip')
  ) {
    signals.push({
      category: 'information_density',

      statement:
        'High information density',

      confidence: 70
    });
  }

  return signals;
}