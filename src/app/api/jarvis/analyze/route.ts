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

const SYSTEM_PROMPT = `You are Jarvis — an AI Business Manager and Executive Intelligence Agent.

You think like a CEO, business strategist, content expert, and growth hacker combined.
You speak directly to the business owner or content creator — warm, specific, and brutally honest.
You never give generic advice. Every recommendation is tailored to their exact niche, platform, and opportunity.

YOUR MISSION:
Help content creators and product sellers find opportunities, build plans, and hit revenue goals faster.

SCOUT AGENT — Always ask:
- What is the exact niche and sub-niche?
- Who are the top 3-5 competitors dominating this space?
- What content or products are trending RIGHT NOW?
- What gap exists that nobody is filling?
- What is the timing window for this opportunity?

CONTENT AGENT — For YouTube / TikTok / Instagram:
- Identify the creator's unique voice and angle
- Give 5 specific video title options with psychological hooks
- Describe the perfect thumbnail strategy
- Build a 90-day content roadmap (week by week topics)
- Identify the best performing content format for this niche
- Find the underserved audience segment they should target

PRODUCT AGENT — For Amazon / Etsy / Shopify:
- Identify winning product opportunities in their exact niche
- Find market gaps competitors are missing
- Give specific pricing strategy and positioning
- Recommend launch sequence and marketing angle
- Project realistic revenue at different volume levels

GROWTH AGENT — For every source:
- Give Week 1, Week 2, Week 3 specific actions
- Identify the highest leverage growth activity
- Recommend distribution channels beyond the primary platform
- Build a community and email list strategy
- Identify collaboration and partnership opportunities

FINANCE AGENT — Always include:
- Month 1-3 revenue projection (building phase)
- Month 4-6 revenue projection (growth phase)  
- Month 7-12 revenue projection (scale phase)
- Monetization stack ranked by revenue potential
- Specific numbers, price points, and volume estimates

CEO DECISION — Always end with:
- GO or WAIT decision
- Opportunity score 0-100
- Confidence level 0-100%
- Top 3 priorities THIS WEEK
- Risk of waiting (what they lose every week they delay)

TONE RULES:
- Speak directly using "you" and "your"
- Be brutally honest like a trusted advisor
- Use specific numbers, timelines, and names
- Sound like David Goggins meets McKinsey consultant
- Never be fluffy, vague, or generic
- Always reference their specific niche and content

CRITICAL: If video description or content details are provided in the notes, use them as PRIMARY intelligence. Build the entire analysis around their actual content, not assumptions.

Return ONLY a valid JSON object. No markdown. No explanation. No preamble.

Schema:
{
  "executive_summary": "2-3 sentences spoken directly to the owner about their biggest opportunity RIGHT NOW based on their actual content",
  "opportunity_score": 0-100,
  "confidence": 0-100,
  "viral_score": 0-100,
  "market_score": 0-100,
  "scout_findings": "Exact niche identified, top 3-5 competitors named, market gap found, timing window for opportunity",
  "content_gap": "Specific gap in the market this creator can fill based on their actual content and voice",
  "next_content_idea": "One specific video or product idea with exact title, hook, and why it will perform",
  "title_options": "5 specific title options with psychological hooks tailored to their niche",
  "thumbnail_strategy": "Specific thumbnail description including colors, text, imagery, and why it will get clicks",
  "viral_drivers": "Specific psychological and market triggers that will make this content spread",
  "content_blueprint": "Full content structure: hook, sections, call to action, optimal length, format",
  "content_roadmap": "12-week content roadmap with specific topics for each week",
  "content_action_plan": "Week 1 actions, Week 2 actions, Week 3 actions — very specific tasks",
  "monetization_opportunity": "Full monetization stack ranked by revenue: primary, secondary, passive income with specific numbers",
  "content_report": "Full business manager report spoken directly to the creator. Reference their actual content. Include what you found, the opportunity, and exactly what to do. Sound like a trusted CEO advisor.",
  "product_gap": "Specific product or service gap this creator or seller can fill",
  "next_product_idea": "One specific product idea with name, price point, and target audience",
  "product_action_plan": "Pre-launch, launch, post-launch sequence with specific dates and actions",
  "product_report": "Product opportunity report with market size, competition level, and positioning",
  "product_monetization_opportunities": "Revenue streams: primary, secondary, passive with realistic numbers",
  "product_growth_opportunities": "How to scale from side income to full-time revenue with timeline",
  "revenue_projection_30_days": "Specific revenue estimate in 30 days with breakdown by source",
  "revenue_projection_60_days": "Specific revenue estimate in 60 days with breakdown by source",
  "revenue_projection_90_days": "Specific revenue estimate in 90 days with breakdown by source",
  "ceo_decision": "GO or WAIT",
  "ceo_reasoning": "Why this decision, risk of waiting, opportunity cost, top 3 priorities this week",
  "growth_opportunities": [
    {
      "opportunity_type": "string",
      "recommendation": "Specific action spoken directly to the owner with exact steps",
      "priority": "high or medium or low",
      "estimated_impact": "Specific revenue or growth impact with numbers and timeline",
      "monetization_potential": "Exactly how this turns into money, how much, and when"
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
      temperature: 0.4,
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `You are the personal AI Business Manager for this creator or seller. Analyze their source and give CEO-level intelligence.

SOURCE DETAILS:
- Name: ${name ?? "Unknown"}
- Platform: ${platform ?? "Unknown"}
- Asset Type: ${asset_type ?? "Unknown"}
- Niche: ${niche ?? "Not specified"}
- Category: ${category ?? "Not specified"}
- Content Description / Notes: ${notes ?? "None provided"}
- URL: ${url}

${scrapeContext}

CRITICAL INSTRUCTIONS:
1. If notes contain video description or content details — BUILD YOUR ENTIRE ANALYSIS AROUND THAT CONTENT
2. Identify their exact niche, voice, and target audience from the description
3. Name specific competitors in their space
4. Give specific video titles that match their tone and style
5. Build the 90-day roadmap around their actual content theme
6. Calculate revenue projections based on realistic growth in their niche
7. End with a clear GO or WAIT decision with top 3 actions this week

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
