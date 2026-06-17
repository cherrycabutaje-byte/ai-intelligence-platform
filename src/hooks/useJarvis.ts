import { useState } from "react";
import { createClient } from "@/lib/supabase";
interface JarvisResult {
  success: boolean;
  source_id: string;
  analysis: Record<string, unknown>;
}
export function useJarvis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function analyze(source: {
    id?: string;
    sourceUrl?: string;
    url: string;
    platform?: string;
    name?: string;
    niche?: string;
    category?: string;
    notes?: string;
    asset_type?: string;
  }): Promise<JarvisResult | null> {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/jarvis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
         source_id: source.id ?? source.sourceUrl ?? "",
          url: source.url,
          platform: source.platform,
          name: source.name,
          niche: source.niche,
          category: source.category,
          notes: source.notes,
          asset_type: source.asset_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      // After main analysis — call viral formula API
      try {
        // Wait a moment for the DB to commit
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: latestAnalysis } = await supabase
          .from("content_analysis")
          .select("id")
          .eq("source_id", source.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Latest analysis found:", latestAnalysis?.id, "for source:", source.id);
        
        if (latestAnalysis?.id) {
          const viralResponse = await fetch("/api/jarvis/viral", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token ?? ""}`,
            },
            body: JSON.stringify({
             analysisId: latestAnalysis.id,
              platform: source.platform ?? "YouTube",
              niche: source.niche ?? "",
              channelName: data.scraped?.channelName ?? source.name ?? "",
              videoTitle: data.scraped?.title ?? source.name ?? "",
              views: data.scraped?.views ?? "",
              subscribers: data.scraped?.subscribers ?? "",
              days_since_posted: data.scraped?.published_at
                ? Math.floor((Date.now() - new Date(data.scraped.published_at).getTime()) / (1000 * 60 * 60 * 24))
                : "",
            }),
          });
          const viralData = await viralResponse.json();
          console.log("Viral API response:", viralData);
        } else {
          console.log("No analysis ID found for source:", source.id);
        }
      } catch (viralError) {
        console.log("Viral API error:", viralError);
      }

      return data as JarvisResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }
  return { analyze, loading, error };
}



