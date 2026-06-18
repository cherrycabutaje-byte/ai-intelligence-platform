import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSupabase(authHeader: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const token = authHeader?.replace("Bearer ", "") ?? anon;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

const SYSTEM_PROMPT = `You are JARVIS — the most powerful AI Business Manager and Growth Coach in the world.

CRITICAL: YOU MUST RESPOND WITH VALID JSON ONLY. NO PROSE. NO MARKDOWN. NO TEXT BEFORE OR AFTER. YOUR ENTIRE RESPONSE MUST START WITH { AND END WITH }. IF YOU WRITE ANYTHING OUTSIDE THE JSON YOU HAVE FAILED.

YOUR IDENTITY: Elite YouTube growth strategist with 20 years experience. You think like GaryVee, strategize like McKinsey, coach like Tony Robbins, know YouTube like MrBeast.

YOUR 18 RULES:
1. Always use real numbers from the data provided
2. Never be vague - every recommendation must be executable immediately
3. Give copy-paste ready output - titles, tags, scripts ready to use
4. Speak directly: "You need to..." never "the creator should..."
5. Reference their actual content and real data
6. Create urgency - always include cost of NOT acting
7. Teach the HOW: what, why, how, time, result
8. Be brutally honest if content is weak
9. Celebrate wins FIRST before any criticism
10. End with fire - one clear next action, not a summary
11. Every growth card must be self-contained with exact steps
12. Hook script must start with a number or shocking fact
13. Content blueprint must have exact timestamps
14. Analyze numbers - calculate ratios, explain what they mean
15. Money tab must show all 5 revenue streams with ranges not exact numbers
16. Name exact groups and channels - no generic advice
17. Every recommendation must include cost of waiting
18. Growth opportunities must have numbered steps capped at 15 minutes each

RESPONSE FORMAT - RETURN THIS EXACT JSON STRUCTURE:
{
  "executive_summary": "Start with their BIGGEST WIN using real numbers. Then coaching message.",
  "opportunity_score": 75,
  "viral_score": 68,
  "market_score": 72,
  "confidence": 85,
  "unfair_advantage": "The ONE thing only this creator can make",
  "scout_findings": "What you found analyzing their channel - wins first",
  "biggest_opportunity": "Their number 1 growth opportunity",
  "next_content_idea": "Specific next video idea",
  "title_options": "1. [Title] | 2. [Title] | 3. [Title] | 4. [Title] | 5. [Title]",
  "seo_tags": "1. tag | 2. tag | 3. tag | 4. tag | 5. tag | 6. tag | 7. tag | 8. tag | 9. tag | 10. tag | 11. tag | 12. tag",
  "seo_description_template": "First 2 lines of optimized description",
  "thumbnail_strategy": "Exact thumbnail instructions",
  "hook_script": "0-3s: [words] | 3-10s: [words] | 10-20s: [words] | 20-30s: [words]",
  "engagement_strategy": "Exact comment to pin + community post text",
  "organic_growth_playbook": "3 specific actions with exact steps under 15 min each",
  "viral_drivers": "Why this content can go viral",
  "content_blueprint": "0:00 - Hook | 0:30 - Context | 2:00 - Main | 5:00 - Tips | 7:00 - CTA",
  "content_roadmap": "Week 1: [Topic] | Week 2: [Topic] | Week 3: [Topic] | Week 4: [Topic]",
  "next_4_titles": "Title 1: [title] | Title 2: [title] | Title 3: [title] | Title 4: [title]",
  "consistency_score": "72 out of 100",
  "content_action_plan": "TODAY: [action] | THIS WEEK: [action] | NEXT WEEK: [action]",
  "monetization_opportunity": "Specific monetization with Low/Expected/High ranges",
  "content_report": "Full coaching report - wins first",
  "revenue_projection_30_days": "Low: $X | Expected: $Y | High: $Z | Math shown",
  "revenue_projection_60_days": "Low: $X | Expected: $Y | High: $Z",
  "revenue_projection_90_days": "Low: $X | Expected: $Y | High: $Z",
  "ceo_decision": "GO",
  "ceo_reasoning": "Why GO or WAIT with specific reasoning",
  "readiness_scores": {
    "sponsorship_readiness": 72,
    "sponsorship_notes": "What they need",
    "email_funnel_readiness": 65,
    "email_funnel_notes": "What they need",
    "monetization_readiness": 58,
    "monetization_notes": "What they need",
    "product_launch_readiness": 70,
    "product_launch_notes": "What they need"
  },
  "platform_fit": {
    "tiktok_fit": 85,
    "instagram_fit": 78,
    "youtube_shorts_fit": 90,
    "pinterest_fit": 45,
    "tiktok_notes": "TikTok specific caption",
    "shorts_notes": "Shorts hook idea"
  },
  "growth_opportunities": [
    {
      "priority_rank": 1,
      "opportunity_type": "Fix Video Title",
      "recommendation": "QUICK START (2 min): Open YouTube Studio now. STEP 1 [5 min]: Go to youtube.com/studio then Content then click your video then Details. Change title to [exact title]. STEP 2 [5 min]: Update tags. STEP 3 [3 min]: Copy description. Total Time: 13 minutes. Cost of waiting: 30 views per day lost.",
      "priority": "high",
      "estimated_impact": "From X views to Y views in 7 days",
      "monetization_potential": "Low: $X | Expected: $Y | High: $Z in 30 days",
      "confidence_score": 85,
      "confidence_level": "High",
      "evidence": "reason 1 | reason 2 | reason 3",
      "impact_score": "High",
      "effort_level": "Low",
      "forecast_low": "500 views in 14 days",
      "forecast_expected": "2000 views in 14 days",
      "forecast_high": "5000 views in 14 days",
      "forecast_confidence": 65
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

function parseJSON(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response");
  }
  const jsonStr = cleaned.slice(start, end + 1);
  return JSON.parse(jsonStr);
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
      ? `REAL YOUTUBE DATA:
Video Title: ${scraped.title ?? "N/A"}
Description: ${scraped.description ?? "N/A"}
Current Tags: ${scraped.tags ?? "N/A"}
Views: ${scraped.views ?? "N/A"}
Likes: ${scraped.likes ?? "N/A"}
Comments: ${scraped.comments ?? "N/A"}
Subscribers: ${scraped.subscribers ?? "N/A"}
Channel Name: ${scraped.channel_name ?? "N/A"}
Published: ${scraped.published_at ?? "N/A"}
Video Transcript (first 3000 chars): ${scraped.transcript ?? "No transcript available"}`
      : "URL could not be scraped. Use provided details only.";

    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `RESPOND WITH JSON ONLY. START WITH { END WITH }. NO OTHER TEXT.

Analyze this creator:
Name: ${name ?? "Unknown"}
Platform: ${platform ?? "Unknown"}
Niche: ${niche ?? "Not specified"}
URL: ${url}
${scrapeContext}

Return the complete JSON now. CRITICAL JSON RULES: 1) Maximum 100 words per field 2) No apostrophes - use "you are" not "you're" 3) No special characters inside strings 4) Use pipe | not newlines inside strings 5) Total response must be under 15000 characters`
        },
      ],
    });

    const rawText = completion.content[0]?.type === "text" ? completion.content[0].text : "";
    console.log("RAW CLAUDE RESPONSE LENGTH:", rawText.length);
    console.log("RAW CLAUDE RESPONSE START:", rawText.substring(0, 200));
    console.log("RAW CLAUDE RESPONSE END:", rawText.substring(rawText.length - 200));

    let analysis: Record<string, unknown>;
    try {
      analysis = parseJSON(rawText);
      console.log("JSON PARSED SUCCESSFULLY");
    } catch (parseErr) {
      console.log("JSON PARSE ERROR:", String(parseErr));
      return NextResponse.json({ error: "JSON parse failed", detail: String(parseErr) }, { status: 500 });
    }

    await supabase.from("sources").update({ status: "active" }).eq("id", source_id).eq("user_id", user.id);

    const { data: contentInsert } = await supabase.from("content_analysis").insert({
      user_id: user.id,
      source_id,
      platform: platform ?? null,
      viral_score: analysis.viral_score,
      opportunity_score: analysis.opportunity_score,
      content_gap: analysis.biggest_opportunity ?? analysis.content_gap,
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
      organic_growth_playbook: analysis.organic_growth_playbook,
      title_options: analysis.title_options,
      content_roadmap: analysis.content_roadmap,
      next_4_titles: analysis.next_4_titles,
      series_strategy: analysis.series_strategy ?? null,
      consistency_score: analysis.consistency_score,
      revenue_projection_30: analysis.revenue_projection_30_days,
      revenue_projection_60: analysis.revenue_projection_60_days,
      revenue_projection_90: analysis.revenue_projection_90_days,
      ceo_decision: analysis.ceo_decision,
      ceo_reasoning: analysis.ceo_reasoning,
      readiness_scores: analysis.readiness_scores ?? null,
      platform_fit: analysis.platform_fit ?? null,
      status: "active",
    }).select();

    const growthRows = (analysis.growth_opportunities as Array<Record<string, unknown>>) ?? [];

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
          priority_rank: g.priority_rank ?? null,
          confidence_score: g.confidence_score ?? null,
          confidence_level: g.confidence_level ?? null,
          evidence: g.evidence ?? null,
          impact_score: g.impact_score ?? null,
          effort_level: g.effort_level ?? null,
          forecast_low: g.forecast_low ?? null,
          forecast_expected: g.forecast_expected ?? null,
          forecast_high: g.forecast_high ?? null,
          forecast_confidence: g.forecast_confidence ?? null,
          status: "active",
        }))
      );
    }

    try {
      await fetch(`${baseUrl}/api/jarvis/viral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          analysisId: contentInsert && contentInsert[0] ? contentInsert[0].id : null,
          channelName: scraped.channel_name ?? name ?? "",
          videoTitle: scraped.title ?? name ?? "",
          niche: niche ?? "",
          viewCount: scraped.views ?? "",
          subscriberCount: scraped.subscribers ?? "",
        }),
      });
    } catch {
      // Viral formula failed silently
    }

    return NextResponse.json({ success: true, source_id, analysis, scraped });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}