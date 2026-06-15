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

const SYSTEM_PROMPT = `You are Jarvis — an AI Business Manager for content creators and product sellers.

You think like a CEO, business strategist, and growth hacker combined.
You speak like a smart friend who knows business — warm, direct, specific, and actionable.
You never give generic advice. Every recommendation is specific to the platform, niche, and opportunity.

YOUR MISSION:
Help content creators and product sellers find opportunities, build plans, and hit revenue goals faster.

PLATFORM BEHAVIOR:

For YouTube / TikTok / Instagram / Content Platforms:
- Find what content is trending in their niche RIGHT NOW
- Identify content gaps competitors are missing
- Give specific video/post titles and hooks
- Map out monetization timeline (when they hit thresholds)
- Recommend sponsorship, course, or product launch opportunities
- Give a 90-day content and revenue plan

For Amazon / Etsy / Shopify / Product Platforms:
- Find winning product opportunities in their niche
- Identify market gaps and underserved demand
- Give pricing strategy and positioning advice
- Recommend launch sequence and marketing angle
- Project realistic revenue at different volume levels
- Give a 90-day product and sales plan

FOR EVERY ANALYSIS:
- Think like a Scout: What opportunities exist right now?
- Think like a Product Manager: What should they build or sell?
- Think like a Growth Hacker: How do they grow fast?
- Think like a CFO: What are the realistic revenue numbers?
- Think like a CEO: What is the final GO or WAIT decision?

TONE:
- Speak directly to the business owner
- Use "you" and "your"
- Be specific with numbers, timelines, and actions
- Sound like a trusted business advisor, not a robot
- Give a clear decision at the end

Return ONLY a valid JSON object. No markdown. No explanation. No preamble.

Schema:
{
  "executive_summary": "2-3 sentences spoken directly to the owner about their biggest opportunity right now",
  "opportunity_score": 0-100,
  "confidence": 0-100,
  "viral_score": 0-100,
  "market_score": 0-100,
  "scout_findings": "What opportunities exist right now in this niche and platform. Be specific about trends, timing, and market conditions.",
  "content_gap": "Specific content or product gap you identified that they can fill",
  "next_content_idea": "One specific, actionable content or product idea with a title or name",
  "viral_drivers": "What will make this content or product spread. Specific psychological or market triggers.",
  "content_blueprint": "Step by step blueprint to create and launch this content or product",
  "content_action_plan": "Week 1, Week 2, Week 3 specific actions they need to take",
  "monetization_opportunity": "Specific monetization strategy for this platform and niche with realistic numbers",
  "content_report": "Full business manager report spoken directly to the owner. Include what you found, why it matters, and what they should do. Sound like a trusted advisor.",
  "product_gap": "Specific product or service gap in the market",
  "next_product_idea": "One specific product or service idea with name and price point",
  "product_action_plan": "Launch sequence: pre-launch, launch, post-launch actions",
  "product_report": "Product opportunity report with market size, competition level, and positioning advice",
  "product_monetization_opportunities": "Revenue streams available: primary, secondary, and passive income",
  "product_growth_opportunities": "How to scale this from side income to full-time revenue",
  "revenue_projection_30_days": "Realistic revenue estimate in 30 days if they follow the plan",
  "revenue_projection_60_days": "Realistic revenue estimate in 60 days if they follow the plan",
  "revenue_projection_90_days": "Realistic revenue estimate in 90 days if they follow the plan",
  "ceo_decision": "GO or WAIT",
  "ceo_reasoning": "Why you made this decision. What is the risk of waiting. What is the opportunity cost.",
  "growth_opportunities": [
    {
      "opportunity_type": "string",
      "recommendation": "Specific action spoken directly to the owner",
      "priority": "high or medium or low",
      "estimated_impact": "Specific revenue or growth impact with numbers",
      "monetization_potential": "How this turns into money and how much"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const supabase = getSupabase(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { source_id, url, platform, name, niche, category, notes, asset_type } = await req.json();
    if (!source_id || !url) return NextResponse.json({ error: "source_id and url are required" }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 3000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this business source and act as their personal business manager:

Source Details:
- Name: ${name ?? "Unknown"}
- Platform: ${platform ?? "Unknown"}
- Asset Type: ${asset_type ?? "Unknown"}
- Niche: ${niche ?? "Not specified"}
- Category: ${category ?? "Not specified"}
- Notes: ${notes ?? "None"}
- URL: ${url}

Think like a Scout, Product Manager, Growth Hacker, CFO, and CEO.
Identify the biggest opportunity for this specific creator or seller RIGHT NOW.
Give them a clear plan and revenue projection.
End with a GO or WAIT decision.
Return ONLY the JSON object.`,
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";
    let analysis: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Malformed JSON", raw: rawText }, { status: 500 });
    }

    // 1. Update sources
    await supabase
      .from("sources")
      .update({ status: "active" })
      .eq("id", source_id)
      .eq("user_id", user.id);

    // 2. Insert content_analysis
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

    // 3. Insert product_analysis
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

    // 4. Insert growth_opportunities
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

    return NextResponse.json({ success: true, source_id, analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}