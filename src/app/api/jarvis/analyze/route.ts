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

const SYSTEM_PROMPT = `You are Jarvis, an AI Business Coach and Digital Marketing Expert. Speak directly to the creator or seller. Be specific, actionable, and copy-paste ready. Return ONLY valid JSON.

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
  "title_options": "1. [Title] | 2. [Title] | 3. [Title] | 4. [Title] | 5. [Title]",
  "seo_tags": "1. [exact title]\n2. [main keyword]\n3. [related]\n4. [related]\n5. [related]\n6. [broader]\n7. [broader]\n8. [broader]\n9. [broader]\n10. [broader]\n11. [trending]\n12. [trending]",
  "seo_description_template": "string",
  "thumbnail_strategy": "string",
  "hook_script": "0-3s: [words]\n3-10s: [words]\n10-20s: [words]\n20-30s: [words]",
  "engagement_strategy": "string",
  "algorithm_tips": "string",
  "shorts_strategy": "string",
  "collaboration_playbook": "string",
  "organic_growth_playbook": "string",
  "viral_drivers": "string",
  "content_blueprint": "string",
  "content_roadmap": "Week 1: [Topic] | Week 2: [Topic] | Week 3: [Topic] | Week 4: [Topic]",
  "content_action_plan": "THIS WEEK: [actions] | NEXT WEEK: [actions] | WEEK 3: [actions]",
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
      ? `REAL DATA: Title: ${scraped.title ?? "N/A"} | Description: ${scraped.og_description ?? scraped.description ?? "N/A"} | Channel: ${scraped.channel_name ?? "N/A"} | Subscribers: ${scraped.subscribers ?? "N/A"}`
      : "URL could not be scraped. Use provided details only.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Coach this creator/seller with specific organic growth strategy.

CRITICAL INSTRUCTION - READ FIRST:
If VIDEO STATUS says "Already uploaded" - you MUST give advice ONLY for boosting an existing live video. DO NOT give pre-launch advice. DO NOT say "film next video" or "before you upload". Instead say "update your title NOW", "fix your tags TODAY", "share to Reddit immediately", "pin this comment", "create a Short from this video".

If VIDEO STATUS says "Not uploaded yet" - give pre-launch optimization advice.

The action plan MUST match the video status!
Name: ${name ?? "Unknown"}
Platform: ${platform ?? "Unknown"}
Asset Type: ${asset_type ?? "Unknown"}
Niche: ${niche ?? "Not specified"}
Category: ${category ?? "Not specified"}
Content/Notes: ${notes ?? "None provided"}
URL: ${url}
${scrapeContext}

Give 12 copy-paste SEO tags, full description template, word-for-word hook script, thumbnail formula, 48-hour engagement plan, algorithm tips, 12-week roadmap, revenue projections. Return ONLY JSON.`
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



