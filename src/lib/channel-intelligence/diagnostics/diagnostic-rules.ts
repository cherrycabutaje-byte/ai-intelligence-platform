export type DiagnosticCategory =
  | 'positioning'
  | 'audience'
  | 'content'
  | 'growth'
  | 'opportunity';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DiagnosticRule {
  id: string;
  category: DiagnosticCategory;
  name: string;
  whatJarvisLooksFor: string;
  diagnosis: string;
  rootCause: string;
  baseConfidence: number;
  severity: Severity;
  recommendedAction: string;
}

export const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  {
    id: 'RULE_001',
    category: 'positioning',
    name: 'Creator Identity Drift',
    whatJarvisLooksFor: 'Top performing content category differs significantly from recent upload category',
    diagnosis: 'You stopped making the content your audience came for.',
    rootCause: 'The creator moved away from their proven identity toward content the audience never asked for.',
    baseConfidence: 88,
    severity: 'Critical',
    recommendedAction: 'Go back to your top performing content format. Make 5 videos in that style and measure the response.'
  },
  {
    id: 'RULE_002',
    category: 'positioning',
    name: 'Positioning Contradiction',
    whatJarvisLooksFor: 'Channel description topic does not match top performing video topics',
    diagnosis: 'Your channel says one thing but your audience watches something completely different.',
    rootCause: 'The creator built an audience around one content type but describes themselves as something else entirely.',
    baseConfidence: 91,
    severity: 'Critical',
    recommendedAction: 'Update your channel description to match what your audience actually responds to. Stop sending mixed signals.'
  },
  {
    id: 'RULE_003',
    category: 'audience',
    name: 'Audience Fragmentation',
    whatJarvisLooksFor: 'More than 3 unrelated content categories with large performance gaps between them',
    diagnosis: 'You are trying to reach too many different types of people at once.',
    rootCause: 'The channel has no clear focus so the algorithm cannot figure out who to recommend it to.',
    baseConfidence: 83,
    severity: 'High',
    recommendedAction: 'Pick one audience. Make content only for that person for the next 90 days. Everything else stops.'
  },
  {
    id: 'RULE_004',
    category: 'positioning',
    name: 'Topic Dilution',
    whatJarvisLooksFor: 'More than 4 unrelated topics across uploads with no single topic dominating',
    diagnosis: 'Your channel talks about too many things. Nobody knows what you stand for.',
    rootCause: 'Without a dominant topic the algorithm has nothing consistent to recommend and viewers have no reason to subscribe.',
    baseConfidence: 80,
    severity: 'High',
    recommendedAction: 'Choose your one topic. The topic your best videos are about. Make that your whole channel for 60 days.'
  },
  {
    id: 'RULE_005',
    category: 'audience',
    name: 'Validation Seeking Audience',
    whatJarvisLooksFor: 'Emotional and personal content significantly outperforms informational or educational content',
    diagnosis: 'Your audience does not come to learn. They come to feel understood.',
    rootCause: 'The audience uses this content for emotional validation not information. They want to feel seen not educated.',
    baseConfidence: 78,
    severity: 'Medium',
    recommendedAction: 'Stop explaining. Start acknowledging. Your audience wants you to name what they are feeling, not teach them something new.'
  },
  {
    id: 'RULE_006',
    category: 'content',
    name: 'Weak Hook Pattern',
    whatJarvisLooksFor: 'Video openings start with greetings, channel introductions, or topic explanations instead of tension',
    diagnosis: 'You are losing most of your viewers in the first 10 seconds.',
    rootCause: 'The opening does not create tension or curiosity. Viewers have no reason to stay past the first few seconds.',
    baseConfidence: 85,
    severity: 'High',
    recommendedAction: 'Never open with a greeting. Open with the most interesting or surprising thing in the video. Drop the viewer into the middle of something.'
  },
  {
    id: 'RULE_007',
    category: 'content',
    name: 'Packaging Problem',
    whatJarvisLooksFor: 'Videos with strong content patterns but weak titles — generic, vague, or question-less titles',
    diagnosis: 'Your content is probably better than your titles suggest. People are not clicking because the title gives them no reason to.',
    rootCause: 'The titles describe the content instead of creating curiosity about it. Description kills clicks.',
    baseConfidence: 82,
    severity: 'High',
    recommendedAction: 'Every title needs a curiosity gap. Something unresolved. Something the viewer has to watch to find out. Never describe — intrigue.'
  },
  {
    id: 'RULE_008',
    category: 'opportunity',
    name: 'Underserved Audience Demand',
    whatJarvisLooksFor: 'Top performing content belongs to a specific niche with very few other videos on the channel in that niche',
    diagnosis: 'Your best content is the one you make the least. Your audience is asking for more of it and you are not listening.',
    rootCause: 'The creator underestimates or ignores the content that performs best and keeps experimenting with other formats.',
    baseConfidence: 86,
    severity: 'High',
    recommendedAction: 'Look at your top performing video. Make 10 more videos on that exact topic in that exact format. You have already proven it works.'
  },
  {
    id: 'RULE_009',
    category: 'growth',
    name: 'Consistency Collapse',
    whatJarvisLooksFor: 'Large gap between last upload date and current date, or irregular upload pattern',
    diagnosis: 'You went quiet. The algorithm forgot you. Your audience moved on.',
    rootCause: 'Inconsistent posting breaks the algorithm recommendation cycle and trains the audience not to expect new content.',
    baseConfidence: 90,
    severity: 'Critical',
    recommendedAction: 'Post one video this week. Not a perfect video. Just a video. Consistency matters more than quality right now. Show up every week for 8 weeks.'
  },
  {
    id: 'RULE_010',
    category: 'growth',
    name: 'Content Market Mismatch',
    whatJarvisLooksFor: 'Channel content does not match what the identified audience typically searches for on the platform',
    diagnosis: 'You are making content for an audience that is not looking for it on YouTube.',
    rootCause: 'The content format or topic does not match what viewers in this niche typically search for or expect to find.',
    baseConfidence: 77,
    severity: 'High',
    recommendedAction: 'Research what your target audience actually searches for on YouTube. Make content that answers those exact searches.'
  }
];
