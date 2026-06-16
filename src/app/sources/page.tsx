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
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [videoData, setVideoData] = useState<Record<string, string | null> | null>(null);
  const [jarvisForm, setJarvisForm] = useState({
    goal: "",
    extra_context: "",
    video_status: "already_uploaded",
    upload_timing: "this_week",
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

  const openJarvisPopup = async (source: Source) => {
    if (!source.asset_url) { showToast("This source has no URL."); return; }
    setJarvisSource(source);
    setVideoData(null);
    setFetchingVideo(false);
    setJarvisForm({ goal: "", extra_context: "", video_status: "already_uploaded", upload_timing: "this_week" });

    if (source.platform === "YouTube" || source.asset_url.includes("youtube") || source.asset_url.includes("youtu.be")) {
      setFetchingVideo(true);
      try {
        const res = await fetch("/api/jarvis/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: source.asset_url, platform: source.platform }),
        });
        const scraped = await res.json();
        if (scraped.scraped_data && Object.keys(scraped.scraped_data).length > 2) {
          setVideoData(scraped.scraped_data);
        }
      } catch {
        // continue without data
      } finally {
        setFetchingVideo(false);
      }
    }
  };

  const buildNotesContext = () => {
    const videoContext = videoData ? `
REAL VIDEO DATA FROM YOUTUBE API:
- Title: ${videoData.title ?? "N/A"}
- Description: ${videoData.description ?? "N/A"}
- Current Tags: ${videoData.tags ?? "N/A"}
- Views: ${videoData.views ?? "N/A"}
- Likes: ${videoData.likes ?? "N/A"}
- Comments: ${videoData.comments ?? "N/A"}
- Subscribers: ${videoData.subscribers ?? "N/A"}
- Channel: ${videoData.channel_name ?? "N/A"}
` : "";
    return `
VIDEO STATUS: ${jarvisForm.video_status === "already_uploaded" ? "Already uploaded - " + jarvisForm.upload_timing : "Not uploaded yet"}
GOAL: ${jarvisForm.goal}
ADDITIONAL CONTEXT: ${jarvisForm.extra_context}
${videoContext}
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
      showToast("Analysis complete! Check Content and Growth pages.");
      fetchSources();
    } else {
      showToast("Analysis failed. Please try again.");
    }
  };

  const statusColor = (s: Source["status"]) => {
    if (s === "active") return "bg-green-500/20 text-green-400 border border-green-500/30";
    if (s === "inactive") return "bg-red-500/20 text-red-400 border border-red-500/30";
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {jarvisSource && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-purple-500/30 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Jarvis Analysis</h2>
                <p className="text-xs text-gray-400 mt-0.5">{jarvisSource.asset_name} - {jarvisSource.platform}</p>
              </div>
              <button onClick={() => setJarvisSource(null)} className="text-gray-400 hover:text-white text-xl">x</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {fetchingVideo && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-purple-300">Fetching video data from YouTube...</p>
                </div>
              )}

              {videoData && !fetchingVideo && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 space-y-1">
                  <p className="text-xs text-green-400 font-semibold">Video data fetched automatically!</p>
                  {videoData.title && <p className="text-xs text-gray-300">Title: <span className="text-white">{videoData.title}</span></p>}
                  {videoData.views && <p className="text-xs text-gray-300">Views: <span className="text-white">{Number(videoData.views).toLocaleString()}</span></p>}
                  {videoData.likes && <p className="text-xs text-gray-300">Likes: <span className="text-white">{Number(videoData.likes).toLocaleString()}</span></p>}
                  {videoData.comments && <p className="text-xs text-gray-300">Comments: <span className="text-white">{Number(videoData.comments).toLocaleString()}</span></p>}
                  {videoData.subscribers && <p className="text-xs text-gray-300">Subscribers: <span className="text-white">{Number(videoData.subscribers).toLocaleString()}</span></p>}
                </div>
              )}

              {!fetchingVideo && !videoData && jarvisSource.platform === "YouTube" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-yellow-300">Could not fetch video data automatically. Please add context below.</p>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">Content Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "already_uploaded", label: "Already uploaded", desc: "Boost existing content" },
                    { value: "not_uploaded", label: "Not uploaded yet", desc: "Pre-launch optimization" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setJarvisForm(p => ({ ...p, video_status: opt.value }))}
                      className={`px-3 py-2.5 rounded-lg text-left text-xs border transition-colors ${jarvisForm.video_status === opt.value ? "bg-purple-600/20 border-purple-500 text-white" : "bg-[#0f1117] border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-gray-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {jarvisForm.video_status === "already_uploaded" && (
                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">When did you upload?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "today", label: "Today / Yesterday", desc: "Golden window!" },
                      { value: "this_week", label: "2-7 days ago", desc: "Still time to boost" },
                      { value: "this_month", label: "1-4 weeks ago", desc: "Need Shorts strategy" },
                      { value: "old", label: "1+ month ago", desc: "Revival strategy" },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setJarvisForm(p => ({ ...p, upload_timing: opt.value }))}
                        className={`px-3 py-2 rounded-lg text-left text-xs border transition-colors ${jarvisForm.upload_timing === opt.value ? "bg-cyan-600/20 border-cyan-500 text-white" : "bg-[#0f1117] border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-gray-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Your Goal</label>
                <input type="text" value={jarvisForm.goal} onChange={e => setJarvisForm(p => ({ ...p, goal: e.target.value }))}
                  placeholder="e.g. reach 10,000 subscribers in 6 months"
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Anything else Jarvis should know? (optional)</label>
                <textarea value={jarvisForm.extra_context} onChange={e => setJarvisForm(p => ({ ...p, extra_context: e.target.value }))}
                  placeholder="e.g. My target audience is men 25-40 interested in stoicism. My competitors are Ryan Holiday and Einzelganger."
                  rows={3} className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
            </div>

            <div className="flex justify-between px-6 py-4 border-t border-gray-800">
              <button onClick={() => setJarvisSource(null)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500">
                Cancel
              </button>
              <button onClick={runJarvisAnalysis} disabled={jarvisLoading || fetchingVideo}
                className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg disabled:opacity-50">
                {fetchingVideo ? "Fetching data..." : jarvisLoading ? "Analyzing..." : "Run Jarvis Analysis"}
              </button>
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
              Export CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm">
              + Add Source
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
            className="flex-1 bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as GetSourcesOptions["status"]); setPage(1); }}
            className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value as keyof Source); setPage(1); }}
            className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="created_at">Sort: Date</option>
            <option value="asset_name">Sort: Name</option>
            <option value="platform">Sort: Platform</option>
            <option value="status">Sort: Status</option>
          </select>
          <button onClick={() => setSortOrder(p => p === "asc" ? "desc" : "asc")}
            className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white hover:border-cyan-500 min-w-[80px]">
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

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
                        <span className="text-3xl">No sources found</span>
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
                      <td className="px-4 py-3 text-gray-300">{source.platform ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{source.asset_type ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-300">{source.niche ?? "-"}</td>
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
                          <button onClick={() => openJarvisPopup(source)} disabled={analyzingId === source.id || jarvisLoading}
                            className="text-xs text-gray-400 hover:text-purple-400 px-2 py-1 rounded hover:bg-purple-500/10 disabled:opacity-40">
                            {analyzingId === source.id ? "Analyzing..." : "Analyze"}
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
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">First</button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page === result.totalPages} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">Next</button>
                <button onClick={() => setPage(result.totalPages)} disabled={page === result.totalPages} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">Last</button>
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
