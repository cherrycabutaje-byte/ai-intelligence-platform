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

const SYSTEM_PROMPT = `You are Jarvis, the Executive Intelligence Agent. Return ONLY valid JSON. No markdown. No explanation.

Schema:
{
  "executive_summary": "string",
  "opportunity_score": 0,
  "confidence": 0,
  "viral_score": 0,
  "market_score": 0,
  "content_gap": "string",
  "next_content_idea": "string",
  "content_action_plan": "string",
  "content_report": "string",
  "monetization_opportunity": "string",
  "viral_drivers": "string",
  "content_blueprint": "string",
  "product_gap": "string",
  "next_product_idea": "string",
  "product_action_plan": "string",
  "product_report": "string",
  "product_monetization_opportunities": "string",
  "product_growth_opportunities": "string",
  "growth_opportunities": [{"opportunity_type": "string","recommendation": "string","priority": "high","estimated_impact": "string","monetization_potential": "string"}]
}`;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const supabase = getSupabase(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { source_id, url, platform, name } = await req.json();
    if (!source_id || !url) return NextResponse.json({ error: "source_id and url are required" }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze: Name: ${name ?? "Unknown"}, Platform: ${platform ?? "Unknown"}, URL: ${url}. Return ONLY JSON.` },
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

    return NextResponse.json({ success: true, source_id, analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}