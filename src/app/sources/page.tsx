"use client";

import { useEffect, useState, useCallback } from "react";
import type { Source } from "@/types/database";
import type { GetSourcesOptions, GetSourcesResult } from "@/lib/sources";
import { getSources } from "@/lib/sources";
import { exportToCSV } from "@/lib/exportCSV";
import AddSourceModal from "@/components/sources/AddSourceModal";
import EditSourceModal from "@/components/sources/EditSourceModal";
import DeleteSourceModal from "@/components/sources/DeleteSourceModal";
import { useJarvis } from "@/hooks/useJarvis";

const PAGE_SIZE = 10;

export default function SourcesPage() {
  const [result, setResult] = useState<GetSourcesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof Source>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<GetSourcesOptions["status"]>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [jarvisSource, setJarvisSource] = useState<Source | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const [jarvisForm, setJarvisForm] = useState({
    video_status: "already_uploaded",
    upload_timing: "this_week",
    main_keyword: "",
    target_audience: "",
    competitors: "",
    current_stats: "",
    unique_angle: "",
    video_description: "",
    goal: "",
  });

  const { analyze, loading: jarvisLoading } = useJarvis();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getSources({
      page, pageSize: PAGE_SIZE, search, sortBy, sortOrder, status: statusFilter,
    });
    if (fetchError) { setError(fetchError.message); setResult(null); }
    else { setResult(data); }
    setLoading(false);
  }, [page, search, sortBy, sortOrder, statusFilter]);

  useEffect(() => { fetchSources(); }, [fetchSources]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openJarvisPopup = (source: Source) => {
    if (!source.asset_url) { showToast("❌ This source has no URL."); return; }
    setJarvisSource(source);
    setActiveStep(1);
    setJarvisForm({
      video_status: "already_uploaded",
      upload_timing: "this_week",
      main_keyword: source.niche ?? "",
      target_audience: "",
      competitors: "",
      current_stats: "",
      unique_angle: source.notes ?? "",
      video_description: "",
      goal: "",
    });
  };

  const buildNotesContext = () => {
    return `
VIDEO STATUS: ${jarvisForm.video_status === "already_uploaded" ? "Already uploaded - " + jarvisForm.upload_timing + " ago. Give advice to BOOST existing content NOW, not pre-launch advice." : "Not uploaded yet - Give pre-launch optimization advice."}
MAIN KEYWORD TO RANK FOR: ${jarvisForm.main_keyword}
TARGET AUDIENCE: ${jarvisForm.target_audience}
TOP COMPETITORS: ${jarvisForm.competitors}
CURRENT STATS: ${jarvisForm.current_stats}
UNIQUE ANGLE / WHAT MAKES THIS DIFFERENT: ${jarvisForm.unique_angle}
GOAL: ${jarvisForm.goal}

FULL VIDEO/CONTENT DESCRIPTION:
${jarvisForm.video_description}
    `.trim();
  };

  const runJarvisAnalysis = async () => {
    if (!jarvisSource) return;
    setAnalyzingId(jarvisSource.id);
    setJarvisSource(null);

    const result = await analyze({
      id: String(jarvisSource.id),
      url: jarvisSource.asset_url!,
      platform: jarvisSource.platform,
      name: jarvisSource.asset_name,
      niche: jarvisSource.niche ?? undefined,
      category: jarvisSource.category ?? undefined,
      notes: buildNotesContext(),
      asset_type: jarvisSource.asset_type ?? undefined,
    });

    setAnalyzingId(null);

    if (result?.success) {
      showToast("✅ Analysis complete! Jarvis has updated all tables.");
      fetchSources();
    } else {
      showToast("❌ Analysis failed. Please try again.");
    }
  };

  const statusColor = (s: Source["status"]) => {
    if (s === "active") return "bg-green-500/20 text-green-400 border border-green-500/30";
    if (s === "inactive") return "bg-red-500/20 text-red-400 border border-red-500/30";
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  };

  const isContent = ["YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn"].includes(jarvisSource?.platform ?? "");

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Jarvis Popup */}
      {jarvisSource && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-purple-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">🤖 Jarvis Analysis</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {jarvisSource.asset_name} • {jarvisSource.platform}
                </p>
              </div>
              <button onClick={() => setJarvisSource(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800 shrink-0">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStep(step)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${activeStep === step ? "bg-purple-600 text-white" : activeStep > step ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"}`}
                  >
                    {activeStep > step ? "✓" : step}
                  </button>
                  <span className={`text-xs ${activeStep === step ? "text-white" : "text-gray-500"}`}>
                    {step === 1 ? "SEO Setup" : step === 2 ? "Audience & Competitors" : "Content Details"}
                  </span>
                  {step < 3 && <div className="w-8 h-px bg-gray-700 mx-1" />}
                </div>
              ))}
            </div>

            {/* Form content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">

              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-purple-300">
                      💡 <strong>Step 1:</strong> Tell Jarvis what keyword you want to rank for.
                      This is the most important input — everything else is built around this.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wide">
                      🎯 Main Keyword To Rank For *
                    </label>
                    <input
                      type="text"
                      value={jarvisForm.main_keyword}
                      onChange={e => setJarvisForm(p => ({ ...p, main_keyword: e.target.value }))}
                      placeholder="e.g. stoicism self deception, how to stop lying to yourself"
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">The exact phrase people type into YouTube/Google to find content like yours</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                      📊 Current Stats
                    </label>
                    <input
                      type="text"
                      value={jarvisForm.current_stats}
                      onChange={e => setJarvisForm(p => ({ ...p, current_stats: e.target.value }))}
                      placeholder="e.g. 1,456 subscribers, avg 245 views per video, 3.2% CTR"
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Jarvis gives realistic advice based on where you are NOW</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                      🏆 Your Goal
                    </label>
                    <input
                      type="text"
                      value={jarvisForm.goal}
                      onChange={e => setJarvisForm(p => ({ ...p, goal: e.target.value }))}
                      placeholder="e.g. reach 10,000 subscribers in 6 months and monetize"
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-cyan-300">
                      💡 <strong>Step 2:</strong> Tell Jarvis WHO you are targeting and WHO your competitors are.
                      This unlocks competitor analysis and audience-specific titles.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wide">
                      👥 Target Audience *
                    </label>
                    <input
                      type="text"
                      value={jarvisForm.target_audience}
                      onChange={e => setJarvisForm(p => ({ ...p, target_audience: e.target.value }))}
                      placeholder="e.g. men and women aged 25-40 feeling stuck in life, interested in self improvement"
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Be specific — age, gender, interests, pain points</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                      🥊 Top 3 Competitors
                    </label>
                    <input
                      type="text"
                      value={jarvisForm.competitors}
                      onChange={e => setJarvisForm(p => ({ ...p, competitors: e.target.value }))}
                      placeholder={isContent ? "e.g. Ryan Holiday, Einzelganger, Pursuit of Wonder" : "e.g. OXO, Totally Bamboo, Bamboozle"}
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Channels or brands winning in your exact niche right now</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                      ⚡ Your Unique Angle
                    </label>
                    <input
                      type="text"
                      value={jarvisForm.unique_angle}
                      onChange={e => setJarvisForm(p => ({ ...p, unique_angle: e.target.value }))}
                      placeholder="e.g. brutally honest, no fluff, stoicism for people who hate fake gurus"
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">What makes you different from every other channel in your niche</p>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-green-300">
                      💡 <strong>Step 3:</strong> Paste your full video description or content details.
                      The more you give, the more specific Jarvis gets with titles, tags, and thumbnails.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-green-400 font-semibold mb-1 uppercase tracking-wide">
                      📋 Full Video Description / Content Details *
                    </label>
                    <textarea
                      value={jarvisForm.video_description}
                      onChange={e => setJarvisForm(p => ({ ...p, video_description: e.target.value }))}
                      placeholder={`Paste your full YouTube description here, OR describe your video/product in detail:

Example:
"Most people spend their lives stuck — not because they're weak, 
but because they're afraid to face reality. This video is a wake-up call. 
A brutally honest message about self-deception, avoidance, and the power 
of finally confronting what's real..."

The more detail you give, the better Jarvis performs!`}
                      rows={8}
                      className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 resize-none"
                    />
                  </div>

                  {/* Summary of what was filled in */}
                  <div className="bg-[#0f1117] rounded-lg px-4 py-3 space-y-1">
                    <p className="text-xs text-gray-400 font-semibold mb-2">📝 Analysis Summary:</p>
                    {jarvisForm.main_keyword && <p className="text-xs text-gray-300">🎯 Keyword: <span className="text-white">{jarvisForm.main_keyword}</span></p>}
                    {jarvisForm.target_audience && <p className="text-xs text-gray-300">👥 Audience: <span className="text-white">{jarvisForm.target_audience}</span></p>}
                    {jarvisForm.competitors && <p className="text-xs text-gray-300">🥊 Competitors: <span className="text-white">{jarvisForm.competitors}</span></p>}
                    {jarvisForm.current_stats && <p className="text-xs text-gray-300">📊 Stats: <span className="text-white">{jarvisForm.current_stats}</span></p>}
                    {jarvisForm.goal && <p className="text-xs text-gray-300">🏆 Goal: <span className="text-white">{jarvisForm.goal}</span></p>}
                    {!jarvisForm.main_keyword && !jarvisForm.video_description && (
                      <p className="text-xs text-yellow-400">⚠️ Add at least a keyword or description for best results</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between px-6 py-4 border-t border-gray-800 shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setJarvisSource(null)}
                  className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                {activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep(p => p - 1)}
                    className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {activeStep < 3 ? (
                  <button
                    onClick={() => setActiveStep(p => p + 1)}
                    className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={runJarvisAnalysis}
                    className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    🚀 Run Jarvis Analysis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Source Management</h1>
            <p className="text-gray-400 text-sm mt-1">{result ? `${result.count} total sources` : "Loading..."}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(result?.data ?? [], "sources")} className="bg-[#1a1d27] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              ↓ Export CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm">
              + Add Source
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="flex-1 bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as GetSourcesOptions["status"]); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value as keyof Source); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="created_at">Sort: Date</option>
            <option value="asset_name">Sort: Name</option>
            <option value="platform">Sort: Platform</option>
            <option value="status">Sort: Status</option>
          </select>
          <button onClick={() => setSortOrder(p => p === "asc" ? "desc" : "asc")} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white hover:border-cyan-500 min-w-[80px]">
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">⚠️ {error}</div>}

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#13151f]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Asset Name</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Platform</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Niche</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : result?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📭</span>
                        <span>No sources found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result?.data.map(source => (
                    <tr key={source.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white truncate max-w-[200px]">{source.asset_name}</div>
                        <div className="text-cyan-400 text-xs truncate max-w-[200px]">{source.asset_url ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{source.platform ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{source.asset_type ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-300">{source.niche ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(source.status)}`}>{source.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(source.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditSource(source)} className="text-xs text-gray-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/10">Edit</button>
                          <button onClick={() => setDeleteTarget(source)} className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10">Delete</button>
                          <button
                            onClick={() => openJarvisPopup(source)}
                            disabled={analyzingId === source.id || jarvisLoading}
                            className="text-xs text-gray-400 hover:text-purple-400 px-2 py-1 rounded hover:bg-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {analyzingId === source.id ? "⏳ Analyzing..." : "🤖 Analyze"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-[#13151f]">
              <span className="text-xs text-gray-500">Page {result.currentPage} of {result.totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">«</button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">‹</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page === result.totalPages} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">›</button>
                <button onClick={() => setPage(result.totalPages)} disabled={page === result.totalPages} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">»</button>
              </div>
            </div>
          )}
        </div>

        {showAdd && <AddSourceModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchSources(); }} />}
        {editSource && <EditSourceModal source={editSource} onClose={() => setEditSource(null)} onSuccess={() => { setEditSource(null); fetchSources(); }} />}
        {deleteTarget && <DeleteSourceModal source={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={() => { setDeleteTarget(null); fetchSources(); }} />}
      </div>
    </div>
  );
}






