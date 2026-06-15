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

const SYSTEM_PROMPT = `You are Jarvis, an AI Business Manager. Speak directly to the owner. Be specific with numbers and timelines. Use real scraped data as PRIMARY source. Return ONLY valid JSON.

Schema:
{
  "executive_summary": "string",
  "opportunity_score": 0,
  "confidence": 0,
  "viral_score": 0,
  "market_score": 0,
  "scout_findings": "string",
  "content_gap": "string",
  "next_content_idea": "string",
  "viral_drivers": "string",
  "content_blueprint": "string",
  "content_action_plan": "string",
  "monetization_opportunity": "string",
  "content_report": "string",
  "product_gap": "string",
  "next_product_idea": "string",
  "product_action_plan": "string",
  "product_report": "string",
  "product_monetization_opportunities": "string",
  "product_growth_opportunities": "string",
  "revenue_projection_30_days": "string",
  "revenue_projection_60_days": "string",
  "revenue_projection_90_days": "string",
  "ceo_decision": "GO or WAIT",
  "ceo_reasoning": "string",
  "growth_opportunities": [{"opportunity_type": "string","recommendation": "string","priority": "high","estimated_impact": "string","monetization_potential": "string"}]
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
- Video Count: ${scraped.video_count ?? "Not found"}
- Sales: ${scraped.sales ?? "Not found"}
- Reviews: ${scraped.reviews ?? "Not found"}
- Rating: ${scraped.rating ?? "Not found"}`
      : "Note: URL could not be scraped. Base analysis on provided details only.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 3000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this source as their personal business manager:
Name: ${name ?? "Unknown"}
Platform: ${platform ?? "Unknown"}
Asset Type: ${asset_type ?? "Unknown"}
Niche: ${niche ?? "Not specified"}
Category: ${category ?? "Not specified"}
Notes: ${notes ?? "None"}
URL: ${url}

${scrapeContext}

Give specific plan and revenue projection. End with GO or WAIT. Return ONLY JSON.` },
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
    await supabase.from("content_analysis").insert({ user_id: user.id, source_id, platform: platform ?? null, viral_score: analysis.viral_score, opportunity_score: analysis.opportunity_score, content_gap: analysis.content_gap, next_content_idea: analysis.next_content_idea, action_plan: analysis.content_action_plan, report: analysis.content_report, monetization_opportunity: analysis.monetization_opportunity, viral_drivers: analysis.viral_drivers, content_blueprint: analysis.content_blueprint, status: "active" });
    await supabase.from("product_analysis").insert({ user_id: user.id, platform: platform ?? null, source_url: url, market_score: analysis.market_score, opportunity_score: analysis.opportunity_score, product_gap: analysis.product_gap, next_product_idea: analysis.next_product_idea, action_plan: analysis.product_action_plan, report: analysis.product_report, monetization_opportunities: analysis.product_monetization_opportunities, growth_opportunities: analysis.product_growth_opportunities });

    const growthRows = analysis.growth_opportunities as Array<{ opportunity_type: string; recommendation: string; priority: string; estimated_impact: string; monetization_potential: string; }>;
    if (Array.isArray(growthRows) && growthRows.length > 0) {
      await supabase.from("growth_opportunities").insert(growthRows.map((g) => ({ user_id: user.id, source_id, opportunity_type: g.opportunity_type, recommendation: g.recommendation, priority: g.priority, estimated_impact: g.estimated_impact, monetization_potential: g.monetization_potential, status: "active" })));
    }

    return NextResponse.json({ success: true, source_id, analysis, scraped });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}
