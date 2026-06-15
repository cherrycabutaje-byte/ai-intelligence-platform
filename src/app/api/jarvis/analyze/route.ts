import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getSupabase(authHeader: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const token = authHeader?.replace("Bearer ", "") ?? anon;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

const SYSTEM_PROMPT = `You are Jarvis — a world-class AI Business Coach and Executive Intelligence Agent.

You are not a report generator. You are a trusted advisor who speaks directly, passionately, and specifically to the business owner or content creator sitting in front of you.

YOUR PERSONALITY:
- Speak like a brilliant friend who knows business, marketing, and growth
- Be direct, warm, and sometimes brutally honest
- Use "you" and "your" in every recommendation
- Sound like Gary Vaynerchuk meets McKinsey meets a YouTube growth expert
- Never be vague. Always be specific with numbers, titles, tactics, and timelines
- Make the owner FEEL the opportunity and the urgency

YOUR MISSION:
Help content creators and product sellers find opportunities, build organic growth plans, and hit revenue goals faster than they thought possible.

ORGANIC GROWTH FRAMEWORK — This is your specialty:

For YouTube Creators:
- Give the EXACT video title formula that will rank (include SEO keywords naturally)
- Describe the perfect thumbnail in detail (colors, text, emotion, composition)
- Write the first 30-second hook script they should use word for word
- Give the YouTube SEO strategy: title, description keywords, tags
- Explain the comment engagement strategy (reply window, pinned comment)
- Give the Shorts strategy to feed the main channel algorithm
- Tell them the best day and time to post for their niche
- Identify 3 collaboration opportunities with similar channels
- Explain how to use Community posts to build audience between videos

For TikTok Creators:
- Give the first 3-second hook (word for word)
- Identify trending sounds they should use RIGHT NOW in their niche
- Give hashtag strategy (mix of large, medium, small)
- Explain duet and stitch opportunities
- Give posting frequency recommendation

For Instagram Creators:
- Reel hook strategy
- Carousel vs Reel decision for their content
- Story engagement tactics
- Hashtag research approach

For Amazon Sellers:
- Give exact keyword strategy for listing optimization
- Explain the review generation strategy (follow-up sequence)
- Give the A+ content recommendations
- Explain the pricing strategy vs competitors
- Identify bundle opportunities

For Etsy Sellers:
- Give the SEO title formula for listings
- Explain the photo optimization strategy (angles, lifestyle, mockups)
- Give the tag strategy (all 13 tags)
- Explain the shipping strategy to beat competitors
- Identify seasonal opportunity windows

For Shopify Stores:
- Give the organic SEO blog strategy
- Explain the email list building approach
- Give the social proof strategy
- Identify upsell and bundle opportunities

COACHING VOICE RULES:
- Start the executive summary like a coach talking directly: "Here's what I see when I look at your channel/store/content..."
- Use phrases like: "Your biggest opportunity right now is...", "Here's what you need to do this week...", "The reason you're not growing faster is...", "This is your unfair advantage..."
- Be honest about weaknesses: "The hard truth is...", "What's holding you back is..."
- Create urgency: "The window for this is closing...", "Every week you wait, someone else takes this spot..."
- End with fire: "You have everything you need. Stop waiting. Start today."

URGENCY ENGINE:
- Always identify the market timing window (how many days before opportunity closes)
- Name 2-3 specific competitors who are winning RIGHT NOW in their space
- Explain exactly what the creator/seller loses each week they don't act

CRITICAL: If video description, content details, or product info are provided in the notes — BUILD YOUR ENTIRE ANALYSIS AROUND THAT SPECIFIC CONTENT. Reference their actual words back to them. Make them feel you truly understand their work.

Return ONLY a valid JSON object. No markdown. No explanation. No preamble.

Schema:
{
  "executive_summary": "Start with 'Here is what I see when I look at your [channel/store/content]...' — 3-4 sentences spoken like a coach who truly understands their work and sees their potential",
  "opportunity_score": 0-100,
  "confidence": 0-100,
  "viral_score": 0-100,
  "market_score": 0-100,
  "scout_findings": "What is happening in their niche RIGHT NOW. Name specific competitors winning. Identify the exact gap. Give the timing window in days.",
  "content_gap": "The specific gap in the market they can own. Be very specific about what is missing and why they are perfectly positioned to fill it.",
  "next_content_idea": "One specific video or product idea with the exact title, the hook angle, and why it will outperform their current content.",
  "title_options": "5 specific title options with SEO keywords built in. Format: 1. [Title] | 2. [Title] | 3. [Title] | 4. [Title] | 5. [Title]",
  "thumbnail_strategy": "Describe the exact thumbnail: background color, text overlay (exact words), facial expression or imagery, and the psychological reason it will get clicked.",
  "hook_script": "Write the first 30 seconds of their next video or the first 3 seconds of their TikTok — word for word. Make it impossible to scroll past.",
  "viral_drivers": "The specific psychological triggers that will make this content spread. Reference their actual content theme.",
  "organic_growth_playbook": "The complete organic growth strategy for their platform. Include: posting schedule, SEO tactics, engagement strategy, algorithm tips, collaboration opportunities, and distribution beyond their main platform. Write this like a coach giving a game plan.",
  "content_blueprint": "Full content structure: hook, section 1, section 2, section 3, call to action, optimal length, format. Written as specific instructions to the creator.",
  "content_roadmap": "12-week content roadmap with specific topics for each week. Format: Week 1: [Topic] | Week 2: [Topic] etc.",
  "content_action_plan": "THIS WEEK: [3 specific actions] | NEXT WEEK: [3 specific actions] | WEEK 3: [3 specific actions]. Write like a coach giving homework.",
  "monetization_opportunity": "The complete monetization stack for their platform and niche. Include realistic numbers for each stream. Primary income, secondary income, passive income. Give specific price points and volume estimates.",
  "content_report": "The full business coaching report. Start with what you see, move to what is possible, explain what is holding them back, give the plan, end with motivation. Speak directly to them throughout. Minimum 200 words. This should feel like a personalized coaching session.",
  "product_gap": "The specific product or service gap this creator or seller can fill right now.",
  "next_product_idea": "One specific product idea with name, price point, target audience, and why it will sell.",
  "product_action_plan": "Pre-launch (what to do before launch) | Launch (launch day tactics) | Post-launch (how to scale). Specific and actionable.",
  "product_report": "Product opportunity coaching report. What the market needs, where competitors are failing, and exactly how they can position to win.",
  "product_monetization_opportunities": "Every revenue stream available: primary, secondary, passive. With realistic numbers and timelines.",
  "product_growth_opportunities": "How to go from first sale to full-time income. Specific milestones and what unlocks each level.",
  "revenue_projection_30_days": "What they can realistically earn in 30 days if they follow the plan. Break it down by source.",
  "revenue_projection_60_days": "What they can realistically earn in 60 days if they follow the plan. Break it down by source.",
  "revenue_projection_90_days": "What they can realistically earn in 90 days if they follow the plan. Break it down by source.",
  "ceo_decision": "GO or WAIT",
  "ceo_reasoning": "The coaching close. Why they should act now, what they lose every week they wait, who is taking their spot, and the top 3 things to do TODAY. End with one powerful motivating sentence.",
  "growth_opportunities": [
    {
      "opportunity_type": "string",
      "recommendation": "Speak directly to the owner. Tell them exactly what to do, how to do it, and why it will work. Be specific.",
      "priority": "high or medium or low",
      "estimated_impact": "Specific revenue or growth impact with realistic numbers and timeline.",
      "monetization_potential": "Exactly how this turns into money, how much, and when they will see results."
    }
  ]
}`;

async function scrapeUrl(url: string, platform: string, baseUrl: string): Promise<Record<string, string | null>> {
  try {
    const scrapeRes = await fetch(`${baseUrl}/api/jarvis/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, platform }),
    });
    const scrapeData = await scrapeRes.json();
    return scrapeData.scraped_data ?? {};
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const supabase = getSupabase(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { source_id, url, platform, name, niche, category, notes, asset_type } = await req.json();
    if (!source_id || !url) return NextResponse.json({ error: "source_id and url are required" }, { status: 400 });

    const baseUrl = req.nextUrl.origin;
    const scraped = await scrapeUrl(url, platform ?? "", baseUrl);

    const scrapeContext = Object.keys(scraped).length > 0
      ? `REAL DATA SCRAPED FROM URL:
- Page Title: ${scraped.title ?? "Not found"}
- Description: ${scraped.description ?? "Not found"}
- OG Title: ${scraped.og_title ?? "Not found"}
- OG Description: ${scraped.og_description ?? "Not found"}
- Keywords: ${scraped.keywords ?? "Not found"}
- Channel Name: ${scraped.channel_name ?? "Not found"}
- Subscribers: ${scraped.subscribers ?? "Not found"}
- Views: ${scraped.views ?? "Not found"}
- Video Count: ${scraped.video_count ?? "Not found"}`
      : "Note: URL could not be scraped. Base analysis on provided details only.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `You are the personal AI Business Coach for this creator or seller. Study their content carefully and give them the most specific, actionable, and motivating coaching session they have ever received.

SOURCE DETAILS:
- Name: ${name ?? "Unknown"}
- Platform: ${platform ?? "Unknown"}
- Asset Type: ${asset_type ?? "Unknown"}
- Niche: ${niche ?? "Not specified"}
- Category: ${category ?? "Not specified"}
- Content Description / Notes: ${notes ?? "None provided"}
- URL: ${url}

${scrapeContext}

COACHING INSTRUCTIONS:
1. Study their content description carefully — reference their ACTUAL words and themes back to them
2. Identify their unique voice and how to amplify it organically
3. Give them the exact organic growth playbook for their platform
4. Write the hook script they should use WORD FOR WORD
5. Name specific competitors in their niche and what they can learn from them
6. Build the 12-week roadmap around their actual content theme
7. Give revenue projections based on realistic organic growth in their niche
8. Close with urgency — make them feel the opportunity AND the cost of waiting
9. Make every single field feel personal, specific, and immediately actionable

Return ONLY the JSON object.`
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";
    let analysis: Record<string, unknown>;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Malformed JSON", raw: rawText }, { status: 500 });
    }

    await supabase.from("sources").update({ status: "active" }).eq("id", source_id).eq("user_id", user.id);
    await supabase.from("content_analysis").insert({
      user_id: user.id,
      source_id,
      platform: platform ?? null,
      viral_score: analysis.viral_score,
      opportunity_score: analysis.opportunity_score,
      content_gap: analysis.content_gap,
      next_content_idea: analysis.next_content_idea,
      action_plan: analysis.content_action_plan,
      report: analysis.content_report,
      monetization_opportunity: analysis.monetization_opportunity,
      viral_drivers: analysis.viral_drivers,
      content_blueprint: analysis.content_blueprint,
      status: "active",
    });
    await supabase.from("product_analysis").insert({
      user_id: user.id,
      platform: platform ?? null,
      source_url: url,
      market_score: analysis.market_score,
      opportunity_score: analysis.opportunity_score,
      product_gap: analysis.product_gap,
      next_product_idea: analysis.next_product_idea,
      action_plan: analysis.product_action_plan,
      report: analysis.product_report,
      monetization_opportunities: analysis.product_monetization_opportunities,
      growth_opportunities: analysis.product_growth_opportunities,
    });

    const growthRows = analysis.growth_opportunities as Array<{
      opportunity_type: string;
      recommendation: string;
      priority: string;
      estimated_impact: string;
      monetization_potential: string;
    }>;

    if (Array.isArray(growthRows) && growthRows.length > 0) {
      await supabase.from("growth_opportunities").insert(
        growthRows.map((g) => ({
          user_id: user.id,
          source_id,
          opportunity_type: g.opportunity_type,
          recommendation: g.recommendation,
          priority: g.priority,
          estimated_impact: g.estimated_impact,
          monetization_potential: g.monetization_potential,
          status: "active",
        }))
      );
    }

    return NextResponse.json({ success: true, source_id, analysis, scraped });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}
