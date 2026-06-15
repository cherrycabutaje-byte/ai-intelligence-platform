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
    id: string;
    url: string;
    platform?: string;
    name?: string;
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
          source_id: source.id,
          url: source.url,
          platform: source.platform,
          name: source.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
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