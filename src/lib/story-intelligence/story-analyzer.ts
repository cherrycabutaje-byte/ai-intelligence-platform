import { StorySignal }
  from '@/types/story-signal';

export function analyzeStoryText(
  text: string
): StorySignal[] {

  const signals: StorySignal[] = [];

  const normalizedText =
    text.toLowerCase();

  if (
    normalizedText.includes('struggle') ||
    normalizedText.includes('stuck') ||
    normalizedText.includes('difficult')
  ) {
    signals.push({
      category: 'conflict',

      statement:
        'Personal conflict present',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('changed') ||
    normalizedText.includes('transformed') ||
    normalizedText.includes('new life')
  ) {
    signals.push({
      category: 'transformation',

      statement:
        'Transformation present',

      confidence: 75
    });
  }

  if (
    normalizedText.includes('risk') ||
    normalizedText.includes('lost') ||
    normalizedText.includes('everything')
  ) {
    signals.push({
      category: 'stakes',

      statement:
        'High stakes present',

      confidence: 70
    });
  }

  if (
    normalizedText.includes('who i was') ||
    normalizedText.includes('identity') ||
    normalizedText.includes('become') ||
    normalizedText.includes('became')
  ) {
    signals.push({
      category: 'identity',

      statement:
        'Identity shift present',

      confidence: 75
    });
  }

  return signals;
}