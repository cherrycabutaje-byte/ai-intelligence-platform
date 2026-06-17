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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const supabase = getSupabase(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content_analysis_id, platform, niche, title, views, subscribers, days_since_posted } = await req.json();

    const prompt = `You are JARVIS — expert viral content strategist with 20 years experience.

Analyze this creator and give the VIRAL FORMULA:

Platform: ${platform ?? "YouTube"}
Niche: ${niche ?? "General"}
Video Title: ${title ?? "Unknown"}
Views: ${views ?? "Unknown"}
Subscribers: ${subscribers ?? "Unknown"}
Days Since Posted: ${days_since_posted ?? "Unknown"}

Return ONLY this JSON with NO extra text:
{
  "emotion_trigger": "The PRIMARY emotion driving this audience (aspiration/fear/curiosity/anger/joy). Give 3 SPECIFIC examples with exact words to use in content.",
  "viral_formula": "The complete viral formula: hook formula with example, thumbnail formula with exact colors and text, best posting time, content style that works in this niche.",
  "comment_trigger": "The EXACT comment to pin to generate maximum debate. Give 3 alternative options. Explain why each works for this specific audience.",
  "launch_strategy": "Week -2 tease strategy, Week -1 anticipation building, Launch day urgency tactics, Week +1 social proof amplification. All specific to this niche.",
  "sales_funnel": "Awareness content idea, Interest content idea, Desire trigger strategy, Action CTA exact words, Retention follow up, Referral strategy. All specific to this creator.",
  "compound_growth_plan": "Current posting frequency vs recommended. Subscriber projections at 1x, 2x, 4x per week with specific numbers. Revenue at each level. The exact month when growth becomes exponential."
}`;

    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = completion.content[0]?.type === "text" ? completion.content[0].text : "";
    
    let viral: Record<string, unknown>;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      viral = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Malformed JSON", raw: rawText }, { status: 500 });
    }

    if (content_analysis_id) {
      await supabase.from("content_analysis").update({
        emotion_trigger: viral.emotion_trigger,
        viral_formula: viral.viral_formula,
        comment_trigger: viral.comment_trigger,
        launch_strategy: viral.launch_strategy,
        sales_funnel: viral.sales_funnel,
        compound_growth_plan: viral.compound_growth_plan,
      }).eq("id", content_analysis_id).eq("user_id", user.id);
    }

    return NextResponse.json({ success: true, viral });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
