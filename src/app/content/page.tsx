"use client";

import { useEffect, useState, useCallback } from "react";
import type { ContentAnalysis } from "@/types/database";
import type { GetContentResult } from "@/lib/content";
import { getContentAnalyses, deleteContentAnalysis } from "@/lib/content";
import { exportToCSV } from "@/lib/exportCSV";

const PAGE_SIZE = 10;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Section({ label, value, color = "gray", copyable = false }: { label: string; value: string | null; color?: string; copyable?: boolean }) {
  if (!value) return null;
  const colors: Record<string, string> = {
    gray: "bg-[#0f1117]",
    cyan: "bg-cyan-500/10 border border-cyan-500/20",
    purple: "bg-purple-500/10 border border-purple-500/20",
    green: "bg-green-500/10 border border-green-500/20",
    yellow: "bg-yellow-500/10 border border-yellow-500/20",
    red: "bg-red-500/10 border border-red-500/20",
    blue: "bg-blue-500/10 border border-blue-500/20",
  };
  const labelColors: Record<string, string> = {
    gray: "text-gray-500",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };
  return (
    <div className={`rounded-lg px-4 py-3 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${labelColors[color]}`}>{label}</p>
        {copyable && <CopyButton text={value} />}
      </div>
      <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}

export default function ContentPage() {
  const [result, setResult] = useState<GetContentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof ContentAnalysis>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<ContentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getContentAnalyses({ page, pageSize: PAGE_SIZE, search, sortBy, sortOrder });
    if (fetchError) { setError(fetchError.message); setResult(null); }
    else { setResult(data); }
    setLoading(false);
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => { fetchContent(); }, [fetchContent]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this content analysis?")) return;
    setDeletingId(id);
    const { error } = await deleteContentAnalysis(id);
    setDeletingId(null);
    if (error) { showToast("Delete failed: " + error.message); }
    else { showToast("Deleted successfully!"); fetchContent(); setSelected(null); }
  };

  const scoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

 const tabs = [
    { id: "overview", label: "Overview" },
    { id: "seo", label: "SEO" },
    { id: "content", label: "Content" },
    { id: "growth", label: "Growth" },
    { id: "money", label: "Money" },
    { id: "viral", label: "Viral Formula" },
    { id: "readiness", label: "🎯 Readiness" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Analysis</h1>
            <p className="text-gray-400 text-sm mt-1">{result ? `${result.count} total analyses` : "Loading..."}</p>
          </div>
          <button onClick={() => exportToCSV(result?.data ?? [], "content_analysis")} className="bg-[#1a1d27] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="flex-1 bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
          <select value={sortBy} onChange={e => { setSortBy(e.target.value as keyof ContentAnalysis); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="created_at">Sort: Date</option>
            <option value="viral_score">Sort: Viral Score</option>
            <option value="opportunity_score">Sort: Opportunity</option>
            <option value="platform">Sort: Platform</option>
          </select>
          <button onClick={() => setSortOrder(p => p === "asc" ? "desc" : "asc")} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white hover:border-cyan-500 min-w-[80px]">
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#13151f]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Content Idea</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Platform</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Viral</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Opportunity</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">CEO</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
                        <span>No content analyses found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result?.data.map(item => (
                    <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => { setSelected(item); setActiveTab("overview"); }}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white truncate max-w-[220px]">{item.next_content_idea ?? item.content_gap ?? "—"}</div>
                        <div className="text-gray-500 text-xs">{item.platform ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{item.platform ?? "—"}</td>
                      <td className={`px-4 py-3 font-semibold ${scoreColor(item.viral_score)}`}>{item.viral_score ?? "—"}</td>
                      <td className={`px-4 py-3 font-semibold ${scoreColor(item.opportunity_score)}`}>{item.opportunity_score ?? "—"}</td>
                      <td className="px-4 py-3">
                        {item.ceo_decision ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.ceo_decision === "GO" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {item.ceo_decision}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={e => { e.stopPropagation(); setSelected(item); setActiveTab("overview"); }} className="text-xs text-gray-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/10">View</button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }} disabled={deletingId === item.id} className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 disabled:opacity-40">
                            {deletingId === item.id ? "..." : "Delete"}
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

        {selected && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d27] border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-white">Jarvis Coaching Report</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selected.platform ?? "Content"} • {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : ""}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">x</button>
              </div>

              <div className="grid grid-cols-4 gap-3 px-6 py-3 border-b border-gray-800 shrink-0">
                <div className="bg-[#0f1117] rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Viral</p>
                  <p className={`text-xl font-bold ${scoreColor(selected.viral_score)}`}>{selected.viral_score ?? "—"}</p>
                </div>
                <div className="bg-[#0f1117] rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Opportunity</p>
                  <p className={`text-xl font-bold ${scoreColor(selected.opportunity_score)}`}>{selected.opportunity_score ?? "—"}</p>
                </div>
                <div className="bg-[#0f1117] rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Platform</p>
                  <p className="text-sm font-semibold text-white">{selected.platform ?? "—"}</p>
                </div>
                <div className="bg-[#0f1117] rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Decision</p>
                  <p className={`text-sm font-bold ${selected.ceo_decision === "GO" ? "text-green-400" : "text-yellow-400"}`}>{selected.ceo_decision ?? "—"}</p>
                </div>
              </div>

              <div className="flex gap-1 px-6 py-2 border-b border-gray-800 shrink-0 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-cyan-500 text-black" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

                {activeTab === "overview" && (
                  <>
                    <Section label="Coaching Report" value={selected.report} color="gray" />
                    <Section label="Content Gap" value={selected.content_gap} color="cyan" />
                    <Section label="Next Content Idea" value={selected.next_content_idea} color="purple" copyable />
                    <Section label="Viral Drivers" value={selected.viral_drivers} color="gray" />
                    <Section label="CEO Decision and Reasoning" value={selected.ceo_reasoning} color="green" />
                  </>
                )}

                {activeTab === "seo" && (
                  <>
                    <Section label="Title Options - Copy and Test" value={selected.title_options} color="cyan" copyable />
                    <Section label="SEO Tags - Copy All 12" value={selected.seo_tags} color="purple" copyable />
                    <Section label="Description Template - Copy and Fill" value={selected.seo_description_template} color="gray" copyable />
                    <Section label="Thumbnail Formula" value={selected.thumbnail_strategy} color="yellow" copyable />
                  </>
                )}

                {activeTab === "content" && (
                  <>
                    <Section label="Hook Script - Read Word For Word" value={selected.hook_script} color="cyan" copyable />
                    <Section label="Content Blueprint" value={selected.content_blueprint} color="gray" />
                    <Section label="12-Week Content Roadmap" value={selected.content_roadmap} color="purple" copyable />
                    <Section label="Next 4 Video Titles - Ready To Film" value={selected.next_4_titles} color="cyan" copyable />
                    <Section label="Series Strategy" value={selected.series_strategy} color="yellow" />
                    <Section label="Posting Schedule" value={selected.posting_schedule} color="green" copyable />
                    <Section label="Consistency Score" value={selected.consistency_score} color="purple" />
                    <Section label="Action Plan" value={selected.action_plan} color="green" copyable />
                  </>
                )}

                {activeTab === "growth" && (
                  <>
                    <Section label="Organic Growth Playbook" value={selected.organic_growth_playbook} color="green" />
                    <Section label="Engagement Strategy - First 48 Hours" value={selected.engagement_strategy} color="cyan" copyable />
                    <Section label="Algorithm Tips" value={selected.algorithm_tips} color="purple" />
                    <Section label="Shorts Strategy" value={selected.shorts_strategy} color="yellow" />
                    <Section label="Collaboration Playbook" value={selected.collaboration_playbook} color="gray" copyable />
                  </>
                )}

                {activeTab === "viral" && (
                  <>
                    <Section label="Emotion Trigger — What Makes Your Audience Act" value={selected.emotion_trigger} color="purple" />
                    <Section label="Viral Formula For Your Niche" value={selected.viral_formula} color="cyan" copyable />
                    <Section label="Comment Trigger — Pin This To Get More Comments" value={selected.comment_trigger} color="green" copyable />
                    <Section label="Launch Strategy" value={selected.launch_strategy} color="yellow" copyable />
                    <Section label="Content To Sales Funnel" value={selected.sales_funnel} color="cyan" copyable />
                    <Section label="Compound Growth Plan — The Math" value={selected.compound_growth_plan} color="green" copyable />
                  </>
                )}

              {activeTab === "readiness" && (
                  <>
                    {selected.readiness_scores && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Monetization Readiness</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: "sponsorship_readiness", notes: "sponsorship_notes", label: "Sponsorship", color: "cyan" },
                            { key: "email_funnel_readiness", notes: "email_funnel_notes", label: "Email Funnel", color: "purple" },
                            { key: "monetization_readiness", notes: "monetization_notes", label: "Monetization", color: "green" },
                            { key: "product_launch_readiness", notes: "product_launch_notes", label: "Product Launch", color: "yellow" },
                          ].map(({ key, notes, label, color }) => {
                            const scores = selected.readiness_scores as Record<string, unknown>;
                            const score = scores?.[key] as number;
                            const note = scores?.[notes] as string;
                            if (!score) return null;
                            const colorMap: Record<string, string> = {
                              cyan: "border-cyan-500/30 bg-cyan-500/10",
                              purple: "border-purple-500/30 bg-purple-500/10",
                              green: "border-green-500/30 bg-green-500/10",
                              yellow: "border-yellow-500/30 bg-yellow-500/10",
                            };
                            const textMap: Record<string, string> = {
                              cyan: "text-cyan-400",
                              purple: "text-purple-400",
                              green: "text-green-400",
                              yellow: "text-yellow-400",
                            };
                            return (
                              <div key={key} className={`rounded-xl border p-4 ${colorMap[color]}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className={`text-xs font-semibold uppercase ${textMap[color]}`}>{label}</p>
                                  <p className={`text-2xl font-bold ${textMap[color]}`}>{score}%</p>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                                  <div className={`h-1.5 rounded-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'purple' ? 'bg-purple-500' : color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${score}%` }} />
                                </div>
                                {note && <p className="text-xs text-gray-400">{note}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {selected.platform_fit && (
                      <div className="space-y-3 mt-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Platform Fit Scores</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: "tiktok_fit", notes: "tiktok_notes", label: "TikTok", emoji: "🎵" },
                            { key: "instagram_fit", notes: null, label: "Instagram", emoji: "📸" },
                            { key: "youtube_shorts_fit", notes: "shorts_notes", label: "YouTube Shorts", emoji: "▶️" },
                            { key: "pinterest_fit", notes: null, label: "Pinterest", emoji: "📌" },
                          ].map(({ key, notes, label, emoji }) => {
                            const fits = selected.platform_fit as Record<string, unknown>;
                            const score = fits?.[key] as number;
                            const note = notes ? fits?.[notes] as string : null;
                            if (!score) return null;
                            const scoreColor = score >= 75 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
                            const barColor = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
                            return (
                              <div key={key} className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-gray-300">{emoji} {label}</p>
                                  <p className={`text-2xl font-bold ${scoreColor}`}>{score}</p>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                                  <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${score}%` }} />
                                </div>
                                {note && <p className="text-xs text-gray-400">{note}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {!selected.readiness_scores && !selected.platform_fit && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-3xl mb-2">🎯</p>
                        <p>Readiness scores will appear in new analyses</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "money" && (
                  <>
                    <Section label="Monetization Stack" value={selected.monetization_opportunity} color="yellow" />
                    <div className="grid grid-cols-3 gap-3">
                      {selected.revenue_projection_30 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-3 text-center">
                          <p className="text-xs text-green-400 font-semibold mb-1">30 Days</p>
                          <p className="text-xs text-white">{selected.revenue_projection_30}</p>
                        </div>
                      )}
                      {selected.revenue_projection_60 && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-3 text-center">
                          <p className="text-xs text-cyan-400 font-semibold mb-1">60 Days</p>
                          <p className="text-xs text-white">{selected.revenue_projection_60}</p>
                        </div>
                      )}
                      {selected.revenue_projection_90 && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-3 text-center">
                          <p className="text-xs text-purple-400 font-semibold mb-1">90 Days</p>
                          <p className="text-xs text-white">{selected.revenue_projection_90}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

              </div>

              <div className="flex justify-between px-6 py-4 border-t border-gray-800 shrink-0">
                <button onClick={() => handleDelete(selected.id)} className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Delete</button>
                <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



