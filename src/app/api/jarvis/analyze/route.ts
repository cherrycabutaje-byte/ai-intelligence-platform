import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function extractJSON(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch (_) {}
  const s = raw.indexOf("{");
  const e = raw.lastIndexOf("}");
  if (s !== -1 && e > s) {
    try { return JSON.parse(raw.slice(s, e + 1)); } catch (_) {}
  }
  throw new Error("JSON_PARSE_FAILED: " + raw.slice(0, 300));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisId, channelName, videoTitle, niche, viewCount, subscriberCount } = body;
    console.log("[JARVIS viral] analysisId:", analysisId);
    if (!analysisId) return NextResponse.json({ error: "analysisId is required" }, { status: 400 });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: "You are JARVIS Viral Intelligence. Respond ONLY with valid JSON. No prose. No markdown. Raw JSON only.",
      messages: [{ role: "user", content: "Analyze viral potential for " + channelName + ", video: " + videoTitle + ", niche: " + niche + ", subs: " + subscriberCount + ". Return JSON with exactly these keys: emotion_trigger, viral_formula, comment_trigger, launch_strategy, sales_funnel, compound_growth_plan. All must be detailed strings." }],
    });

    const rawText = message.content.filter((c) => c.type === "text").map((c) => (c as { type: "text"; text: string }).text).join("");
    const parsed = extractJSON(rawText);

    const { error } = await supabase
      .from("content_analysis")
      .update({
        emotion_trigger: parsed.emotion_trigger || null,
        viral_formula: parsed.viral_formula || null,
        comment_trigger: parsed.comment_trigger || null,
        launch_strategy: parsed.launch_strategy || null,
        sales_funnel: parsed.sales_funnel || null,
        compound_growth_plan: parsed.compound_growth_plan || null,
      })
      .eq("id", analysisId);

    if (error) {
      console.error("[JARVIS viral] DB error:", error);
      return NextResponse.json({ success: false, dbError: error.message }, { status: 500 });
    }

    console.log("[JARVIS viral] Updated row:", analysisId);
    return NextResponse.json({ success: true, id: analysisId, viral: parsed });

  } catch (err) {
    console.error("[JARVIS viral] ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}