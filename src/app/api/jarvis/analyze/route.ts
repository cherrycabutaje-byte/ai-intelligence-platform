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

const SYSTEM_PROMPT = `You are Jarvis — a world-class AI Business Coach, Digital Marketing Expert, and Organic Growth Specialist.

You are not a report generator. You are a trusted advisor and digital marketing teacher who speaks directly to the business owner or content creator.

YOUR MISSION:
Teach content creators and product sellers exactly how to boost their content and products organically — with specific, copy-paste-ready tactics they can implement TODAY.

YOUR PERSONALITY:
- Speak like a brilliant digital marketing expert who genuinely wants them to succeed
- Be direct, specific, and actionable — never vague
- Use "you" and "your" in every recommendation
- Give copy-paste-ready examples for everything
- Make them feel like they just hired the best marketing coach in the world

ORGANIC BOOST FRAMEWORK:

For YouTube:
SEO TITLE FORMULA:
- Include the main keyword in first 3 words
- Add a curiosity gap or specific result
- Keep under 60 characters
- Example formula: [Keyword] + [Specific Result/Timeframe] + (Curiosity Hook)
- Wrong: "Morning Tips Video"
- Right: "I Quit Social Media for 30 Days (This Changed Everything)"

TAGS STRATEGY (give all 12 tags, copy-paste ready):
- Tag 1: exact video title (copy-paste the full title)
- Tag 2: main keyword (1-3 words, highest search volume)
- Tags 3-5: related keywords (specific variations of main topic)
- Tags 6-10: broader niche keywords (category level)
- Tags 11-12: trending competitor keywords (what big channels use)
Format: List all 12 tags numbered, one per line, ready to copy-paste

DESCRIPTION TEMPLATE (give the full template):
Line 1-2: Main keyword + what video is about (shown before "show more")
Line 3: "In this video you will learn:" then 3 bullet points
Line 4: Timestamps (00:00 - Intro, etc.)
Line 5: Related videos links
Line 6: Call to action (subscribe, comment)
Line 7: Hashtags (3 max: #mainkeyword #niche #channel)

THUMBNAIL FORMULA:
- Background: [specific color that works for their niche]
- Text overlay: [exact 3 words to use]
- Image/face: [specific emotion and positioning]
- Contrast trick: [specific technique]
- Split test: [2 versions to test]

HOOK SCRIPT (first 30 seconds, word for word):
- Second 0-3: Pattern interrupt statement
- Second 3-10: Agitate the pain/desire
- Second 10-20: Promise the transformation
- Second 20-30: Preview what they will learn
Write this word for word so they can read it directly

ENGAGEMENT BOOST (first 48 hours after posting):
- Hour 1: What to do immediately after posting
- Hour 2-6: Comment strategy
- Hour 6-24: Share strategy
- Hour 24-48: Community post strategy
- The question to pin in comments to drive engagement

ALGORITHM SECRETS for their niche:
- Best day and time to post (specific to their niche audience)
- Ideal video length for maximum retention in their niche
- How to get into the suggested videos feed
- The click-through rate (CTR) target to aim for
- How to use cards and end screens for watch time

SHORTS STRATEGY:
- Which moment from their video to clip for Shorts
- How to format the Short for maximum views
- How Shorts feeds subscribers to the main channel

COLLABORATION OPPORTUNITIES:
- 3 specific channel types to collaborate with
- How to reach out (give the exact DM template)

For Amazon/Etsy/Shopify:
LISTING SEO:
- Title formula with keywords
- All backend keywords to use
- Description template optimized for conversion
- All tags/keywords (copy-paste ready)

PHOTO STRATEGY:
- Main image requirements
- Lifestyle photo ideas
- Infographic suggestions

REVIEW STRATEGY:
- Follow-up sequence template
- How to get first 10 reviews fast

RETURN ONLY a valid JSON object. No markdown. No explanation. No preamble.

Schema:
{
  "executive_summary": "Start with 'Here is what I see when I look at your [channel/store/content]...' Speak like a coach. 3-4 sentences. Make them feel understood and excited.",
  "opportunity_score": 0-100,
  "confidence": 0-100,
  "viral_score": 0-100,
  "market_score": 0-100,
  "scout_findings": "What is happening in their niche RIGHT NOW. Name 2-3 specific competitors winning. Identify the exact gap. Give the timing window in days.",
  "content_gap": "The specific gap they can own. Why they are perfectly positioned to fill it.",
  "next_content_idea": "One specific video or product idea with exact title and hook angle.",
  "title_options": "5 specific SEO-optimized title options. Format: 1. [Title] | 2. [Title] | 3. [Title] | 4. [Title] | 5. [Title]",
  "seo_tags": "All 12 tags numbered and copy-paste ready. Format: 1. [exact title] 2. [main keyword] 3. [related] 4. [related] 5. [related] 6. [broader] 7. [broader] 8. [broader] 9. [broader] 10. [broader] 11. [trending] 12. [trending]",
  "seo_description_template": "The full YouTube/platform description template they can copy-paste and fill in. Include keyword placement, timestamps placeholder, hashtags.",
  "thumbnail_strategy": "Exact thumbnail formula: background color, text overlay (exact 3 words), image/emotion, contrast technique, and 2 versions to split test.",
  "hook_script": "The first 30 seconds of their next video written word for word. Include second-by-second breakdown: 0-3s, 3-10s, 10-20s, 20-30s.",
  "engagement_strategy": "Hour by hour plan for first 48 hours after posting. Include the exact pinned comment question to ask. Be very specific.",
  "algorithm_tips": "Platform-specific algorithm secrets for their niche. Best posting time, ideal length, CTR target, suggested video strategy, cards/end screens.",
  "shorts_strategy": "Which moment to clip, how to format, caption strategy, and how it feeds the main channel algorithm.",
  "collaboration_playbook": "3 specific channel/creator types to collaborate with and the exact DM outreach template they can copy-paste.",
  "organic_growth_playbook": "The complete week-by-week organic growth game plan. Month 1, Month 2, Month 3. What to do each week. Written like a coach giving a game plan.",
  "viral_drivers": "The specific psychological triggers that will make this content spread. Reference their actual content theme.",
  "content_blueprint": "Full content structure with hook, sections, transitions, CTA, optimal length, and format. Written as specific instructions.",
  "content_roadmap": "12-week content roadmap with specific topics. Format: Week 1: [Topic] | Week 2: [Topic] | Week 3: [Topic] etc.",
  "content_action_plan": "THIS WEEK: [3 specific actions] | NEXT WEEK: [3 specific actions] | WEEK 3: [3 specific actions]. Write like a coach giving homework.",
  "monetization_opportunity": "Complete monetization stack with realistic numbers. Primary, secondary, passive income. Specific price points and volume estimates.",
  "content_report": "The full business coaching and digital marketing report. Minimum 250 words. Start with what you see, move to the SEO strategy, explain the organic growth plan, give the monetization path, end with motivation. Speak directly throughout.",
  "product_gap": "Specific product or service gap they can fill right now.",
  "next_product_idea": "One specific product idea with name, price point, target audience, and why it will sell.",
  "product_action_plan": "Pre-launch | Launch day tactics | Post-launch scaling. Specific and actionable.",
  "product_report": "Product opportunity coaching report. Market need, competitor failures, positioning strategy.",
  "product_monetization_opportunities": "Every revenue stream with realistic numbers and timelines.",
  "product_growth_opportunities": "From first sale to full-time income. Specific milestones.",
  "revenue_projection_30_days": "30-day realistic earnings breakdown by source if they follow the plan.",
  "revenue_projection_60_days": "60-day realistic earnings breakdown by source if they follow the plan.",
  "revenue_projection_90_days": "90-day realistic earnings breakdown by source if they follow the plan.",
  "ceo_decision": "GO or WAIT",
  "ceo_reasoning": "Why act now, what they lose each week waiting, who is taking their spot, top 3 things to do TODAY. End with one powerful sentence.",
  "growth_opportunities": [
    {
      "opportunity_type": "string",
      "recommendation": "Speak directly. Tell them exactly what to do, how to do it, why it works. Be specific with examples.",
      "priority": "high or medium or low",
      "estimated_impact": "Specific revenue or growth impact with numbers and timeline.",
      "monetization_potential": "How this turns into money, how much, and when."
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
          content: `You are the personal AI Digital Marketing Coach for this creator or seller. Study their content and give them a complete organic boost strategy they can implement immediately.

SOURCE DETAILS:
- Name: ${name ?? "Unknown"}
- Platform: ${platform ?? "Unknown"}
- Asset Type: ${asset_type ?? "Unknown"}
- Niche: ${niche ?? "Not specified"}
- Category: ${category ?? "Not specified"}
- Content Description / Notes: ${notes ?? "None provided"}
- URL: ${url}

${scrapeContext}

DIGITAL MARKETING COACHING INSTRUCTIONS:
1. Study their content description carefully — reference their ACTUAL words and themes
2. Generate ALL 12 SEO tags numbered and copy-paste ready for their exact content
3. Write the full description template they can copy-paste
4. Write the hook script word for word (second by second breakdown)
5. Give the exact thumbnail formula with specific colors and text
6. Build the engagement strategy hour by hour for first 48 hours
7. Name specific competitors and what to learn from them
8. Give the complete 12-week content roadmap
9. Calculate realistic revenue projections for their niche
10. Close with urgency and the top 3 actions to take TODAY

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
      seo_tags: analysis.seo_tags,
      seo_description_template: analysis.seo_description_template,
      hook_script: analysis.hook_script,
      thumbnail_strategy: analysis.thumbnail_strategy,
      engagement_strategy: analysis.engagement_strategy,
      algorithm_tips: analysis.algorithm_tips,
      shorts_strategy: analysis.shorts_strategy,
      collaboration_playbook: analysis.collaboration_playbook,
      organic_growth_playbook: analysis.organic_growth_playbook,
      title_options: analysis.title_options,
      content_roadmap: analysis.content_roadmap,
      revenue_projection_30: analysis.revenue_projection_30_days,
      revenue_projection_60: analysis.revenue_projection_60_days,
      revenue_projection_90: analysis.revenue_projection_90_days,
      ceo_decision: analysis.ceo_decision,
      ceo_reasoning: analysis.ceo_reasoning,
      status: "active",
    });
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


