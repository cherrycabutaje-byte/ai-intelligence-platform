import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are JARVIS — a content intelligence analyst.

You analyze YouTube videos and generate actionable content briefs.

Your job:
1. Study the video data provided
2. Generate 5 hook options that would make people stop scrolling
3. Generate 5 title options optimized for clicks and SEO
4. Write a content brief with key insights
5. Identify what JARVIS noticed about this content

Rules:
- Hooks must be specific to this video — not generic
- Titles must be platform-appropriate
- Be direct and specific — no filler
- Use the actual video title, views, and tags in your analysis

Return valid JSON only:
{
  "keyInsights": [
    "Specific observation about this video",
    "Specific observation about this video",
    "Specific observation about this video"
  ],
  "hooks": [
    "Hook option 1 — specific and compelling",
    "Hook option 2",
    "Hook option 3",
    "Hook option 4",
    "Hook option 5"
  ],
  "titles": [
    "Title option 1",
    "Title option 2",
    "Title option 3",
    "Title option 4",
    "Title option 5"
  ],
  "brief": "2-3 paragraph content brief. What makes this video work or not work. What the creator should keep, change, or double down on. Specific and evidence-based."
}`;

export async function POST(req: Request) {
  try {
    const { videoData, platform, transcript, goal } = await req.json();

    const prompt = `VIDEO TITLE: "${videoData?.title ?? 'Unknown'}"
CHANNEL: ${videoData?.channelTitle ?? 'Unknown'}
PLATFORM: ${platform}
VIEWS: ${videoData?.views?.toLocaleString() ?? 'Unknown'}
LIKES: ${videoData?.likes?.toLocaleString() ?? 'Unknown'}
TAGS: ${videoData?.tags?.slice(0, 10)?.join(', ') ?? 'None'}
DESCRIPTION: ${videoData?.description?.slice(0, 300) ?? 'None'}
GOAL: ${goal || 'Not specified'}
TRANSCRIPT: ${transcript ? transcript.slice(0, 2000) : 'Not provided'}

Analyze this video and generate hooks, titles, and a content brief.
Be specific to this actual video — not generic advice.
Return valid JSON only.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ success: true, brief: parsed, videoData });

  } catch (error) {
    console.error('[Video Brief] Error:', error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

