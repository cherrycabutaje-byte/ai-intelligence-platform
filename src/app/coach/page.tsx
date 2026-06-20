"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { getSources } from "@/lib/sources";
import type { Source } from "@/types/database";
import type { BottleneckResult, CommitmentResponse } from "@/types/bottleneck";
import BottleneckCard   from "@/components/coach/BottleneckCard";
import EvidenceBlock    from "@/components/coach/EvidenceBlock";
import DirectiveSteps   from "@/components/coach/DirectiveSteps";
import CommitmentPrompt from "@/components/coach/CommitmentPrompt";

type SessionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: BottleneckResult; sessionId: string | null }
  | { status: "error"; message: string };

export default function CoachPage() {
  const [sources, setSources]               = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [session, setSession]               = useState<SessionState>({ status: "idle" });
  const [committed, setCommitted]           = useState<CommitmentResponse | null>(null);
  const [loadingSources, setLoadingSources] = useState(true);

const fetchSources = useCallback(async () => {
  const { data, error } = await getSources({ pageSize: 100 });
  if (data && data.data.length > 0) {
    setSources(data.data);
    setSelectedSource(data.data[0]);
  }
  setLoadingSources(false);
}, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  async function runSession() {
    if (!selectedSource) return;

    setSession({ status: "loading" });
    setCommitted(null);

    try {
      const supabase = createClient();
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token ?? "";

      const res = await fetch("/api/jarvis/coach", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ source_id: selectedSource.id }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setSession({ status: "error", message: json.error ?? "Coaching session failed." });
        return;
      }

      setSession({
        status:    "done",
        result:    json.result as BottleneckResult,
        sessionId: json.session_id ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSession({ status: "error", message });
    }
  }

  function reset() {
    setSession({ status: "idle" });
    setCommitted(null);
  }

  if (loadingSources) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <p className="text-gray-400">Loading sources...</p>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">No sources found.</p>
          <p className="text-gray-400 text-sm">
            Add a source first, then return here for coaching.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Growth Coach</h1>
          <p className="text-gray-400 text-sm mt-1">
            One bottleneck. One directive. Execute in under 30 minutes.
          </p>
        </div>

        {(session.status === "idle" || session.status === "error") && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl px-6 py-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Select Source
            </p>
            <div className="flex flex-wrap gap-2">
              {sources.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSource(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSource?.id === s.id
                      ? "bg-cyan-500 text-black"
                      : "bg-[#0f1117] text-gray-400 hover:text-white border border-gray-700"
                  }`}
                >
                  {s.asset_name} · {s.platform}
                </button>
              ))}
            </div>

            {session.status === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{session.message}</p>
              </div>
            )}

            <button
              onClick={runSession}
              disabled={!selectedSource}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg text-sm transition-colors"
            >
              Run Coaching Session →
            </button>
          </div>
        )}

        {session.status === "loading" && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl px-6 py-12 text-center space-y-3">
            <div className="text-3xl">🔍</div>
            <p className="text-white font-semibold">Analysing your channel...</p>
            <p className="text-gray-400 text-sm">
              Scoring discoverability, retention, and niche positioning.
            </p>
          </div>
        )}

        {session.status === "done" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Coaching: <span className="text-gray-300 font-medium">
                  {selectedSource?.asset_name} · {selectedSource?.platform}
                </span>
              </p>
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Run again
              </button>
            </div>

            <BottleneckCard result={session.result} />
            <EvidenceBlock  evidence={session.result.evidence} />
            <DirectiveSteps directive={session.result.directive} />

            {!committed ? (
              <CommitmentPrompt
                sessionId={session.sessionId}
                onCommit={setCommitted}
              />
            ) : (
              <div className="pb-8" />
            )}
          </>
        )}

      </div>
    </div>
  );
}