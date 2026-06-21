"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Blocker {
  number: number;
  name: string;
  severity: string;
  category: string;
  whatIsBroken: string;
  whyItMatters: string;
  whatItMeansForYou: string;
  cost: string;
  estimatedImpact: string;
  confidence: number;
  evidencePoints: string[];
  recommendedAction: string;
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  const icons: Record<string, string> = {
    Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🔵'
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-bold ${styles[severity] ?? styles.Medium}`}>
      {icons[severity]} {severity}
    </span>
  );
}

export default function GrowthPage() {
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelName, setChannelName] = useState('');
  const [savedAt, setSavedAt] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    async function loadBlockers() {
      try {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id ?? "christine";
        const res = await fetch(
          `/api/jarvis/channel-intelligence?userId=${uid}`
        );
        const data = await res.json();
        if (data.success && data.blockers) {
          setBlockers(data.blockers);
          setChannelName(data.channelName ?? '');
          setSavedAt(data.savedAt ?? '');
        }
      } catch {}
      finally { setLoading(false); }
    }
    loadBlockers();
  }, []);

  const criticalCount = blockers.filter(b => b.severity === 'Critical').length;
  const highCount = blockers.filter(b => b.severity === 'High').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading your growth blockers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium">
            🚀 Growth Blockers
          </div>
          <h1 className="text-3xl font-bold text-white">What is holding you back?</h1>
          <p className="text-gray-400">
            These are the specific problems preventing your channel from growing.
            No solutions here — that is JARVIS's job.
          </p>
        </div>

        {/* No diagnosis yet */}
        {blockers.length === 0 && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <p className="text-white font-semibold text-lg">No blockers found yet.</p>
            <p className="text-gray-400 text-sm">
              Run a Channel Diagnosis first. Growth blockers are automatically
              identified from your channel data.
            </p>
            <Link
              href="/channel"
              className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Run Channel Diagnosis →
            </Link>
          </div>
        )}

        {/* Blockers exist */}
        {blockers.length > 0 && (
          <div className="space-y-6">

            {/* Summary */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-white font-bold text-lg">{channelName}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {blockers.length} growth blockers identified
                    {savedAt && ` · Diagnosed ${new Date(savedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  {criticalCount > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
                      <p className="text-xs text-gray-500">Critical</p>
                    </div>
                  )}
                  {highCount > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">{highCount}</p>
                      <p className="text-xs text-gray-500">High</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Blocker List */}
            {blockers.map(blocker => (
              <div
                key={blocker.number}
                className={`bg-[#1a1d27] border rounded-2xl overflow-hidden ${
                  blocker.severity === 'Critical' ? 'border-red-500/30' :
                  blocker.severity === 'High' ? 'border-orange-500/30' :
                  'border-gray-800'
                }`}
              >
                {/* Blocker Header */}
                <div
                  className="px-6 py-5 cursor-pointer"
                  onClick={() => setExpanded(expanded === blocker.number ? null : blocker.number)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-gray-500 font-bold text-lg w-8 shrink-0">
                        #{blocker.number}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="text-white font-bold text-base">{blocker.name}</p>
                          <SeverityBadge severity={blocker.severity} />
                        </div>
                        <p className="text-gray-400 text-sm">{blocker.whatItMeansForYou}</p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-lg shrink-0">
                      {expanded === blocker.number ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {expanded === blocker.number && (
                  <div className="border-t border-gray-800 p-6 space-y-5">

                    {/* What is broken */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        What is broken
                      </p>
                      <p className="text-white text-sm leading-relaxed">
                        {blocker.whatIsBroken}
                      </p>
                    </div>

                    {/* Why it matters */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Why it matters
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {blocker.whyItMatters}
                      </p>
                    </div>

                    {/* Cost */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-1">
                      <p className="text-xs text-red-400 uppercase tracking-wide font-medium">
                        The cost
                      </p>
                      <p className="text-white text-sm leading-relaxed">
                        {blocker.cost}
                      </p>
                    </div>

                    {/* Evidence */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        The evidence
                      </p>
                      <div className="space-y-1">
                        {blocker.evidencePoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-gray-600 shrink-0">•</span>
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500">JARVIS confidence:</p>
                      <p className="text-cyan-400 font-bold text-sm">{blocker.confidence}%</p>
                    </div>

                    {/* CTA */}
                    <div className="pt-2 border-t border-gray-800">
                      <Link
                        href="/jarvis"
                        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
                      >
                        Ask JARVIS how to fix this →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bottom CTA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 text-center space-y-3">
              <p className="text-white font-bold text-lg">
                Ready to fix these blockers?
              </p>
              <p className="text-gray-400 text-sm">
                JARVIS knows exactly what to do about each one.
              </p>
              <Link
                href="/jarvis"
                className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl transition-colors"
              >
                Ask JARVIS What To Do Next →
              </Link>
            </div>

            <Link
              href="/channel"
              className="block text-center text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Run a new Channel Diagnosis →
            </Link>

          </div>
        )}
      </div>
    </div>
  );
}


