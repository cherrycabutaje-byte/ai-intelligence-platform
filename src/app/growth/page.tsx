"use client";
import { useEffect, useState, useCallback } from "react";
import type { GrowthOpportunity } from "@/types/database";
import type { GetGrowthResult } from "@/lib/growth";
import { getGrowthOpportunities, deleteGrowthOpportunity } from "@/lib/growth";
import { createClient } from "@/lib/supabase";

const PAGE_SIZE = 10;

export default function GrowthPage() {
  const [result, setResult] = useState<GetGrowthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GrowthOpportunity | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchGrowth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getGrowthOpportunities({ page, pageSize: PAGE_SIZE, search: "", sortBy: "created_at", sortOrder: "desc", status: "all", priority: "all" });
    if (fetchError) { setError(fetchError.message); setResult(null); }
    else { setResult(data); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchGrowth(); }, [fetchGrowth]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this action?")) return;
    setDeletingId(id);
    const { error } = await deleteGrowthOpportunity(id);
    setDeletingId(null);
    if (error) { showToast("Delete failed: " + error.message); }
    else { showToast("Deleted!"); fetchGrowth(); setSelected(null); }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("growth_opportunities")
      .update({
        execution_status: status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    console.log("[updateStatus] id:", id, "status:", status, "session:", !!session, "error:", error);
    setUpdatingId(null);
    if (error) {
      showToast("Update failed: " + error.message);
    } else {
      showToast(status === "completed" ? "✅ Marked as completed!" : "Updated!");
      fetchGrowth();
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, execution_status: status } : null);
      }
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">✅ Completed</span>;
      case "in_progress":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🔄 In Progress</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">☐ Not Started</span>;
    }
  };

  const formatRecommendation = (text: string) => {
    return text
      .replace(/STEP (\d+):/g, '\nSTEP $1:')
      .replace(/Time:/g, '\nTime:')
      .replace(/Expected result:/g, '\nExpected result:')
      .replace(/Cost of waiting:/g, '\nCost of waiting:')
      .trim();
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied!");
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getImpactColor = (impact: string) => {
    if (impact === "High") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (impact === "Medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getEffortColor = (effort: string) => {
    if (effort === "Low") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (effort === "Medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  // Calculate execution score
  const executionScore = result?.data ? Math.round(
    (result.data.filter(i => i.execution_status === "completed").length / result.data.length) * 100
  ) : 0;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Popup Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  {selected.priority_rank && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                      #{selected.priority_rank}
                    </span>
                  )}
                  <h2 className="text-lg font-semibold text-white">{selected.opportunity_type ?? "Growth Action"}</h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : ""}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">x</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

              {/* Execution Status Buttons */}
              <div className="bg-[#0f1117] rounded-lg p-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Execution Status</p>
                <div className="flex gap-2">
                  {[
                    { value: "not_started", label: "☐ Not Started", color: "border-gray-600 text-gray-400 hover:border-gray-400" },
                    { value: "in_progress", label: "🔄 In Progress", color: "border-yellow-500/50 text-yellow-400 hover:border-yellow-400" },
                    { value: "completed", label: "✅ Completed", color: "border-green-500/50 text-green-400 hover:border-green-400" },
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => updateStatus(selected.id, value)}
                      disabled={updatingId === selected.id}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${color} ${selected.execution_status === value ? "bg-white/10" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Layer Badges */}
              <div className="flex flex-wrap gap-2">
                {selected.impact_score && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(selected.impact_score)}`}>
                    Impact: {selected.impact_score}
                  </span>
                )}
                {selected.effort_level && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${getEffortColor(selected.effort_level)}`}>
                    Effort: {selected.effort_level}
                  </span>
                )}
                {selected.confidence_score && (
                  <span className={`text-xs px-2 py-1 rounded-full border border-gray-600 ${getConfidenceColor(selected.confidence_score)}`}>
                    Confidence: {selected.confidence_score}%
                  </span>
                )}
              </div>

              {/* Evidence */}
              {selected.evidence && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-blue-400 font-semibold mb-2 uppercase">Evidence</p>
                  <div className="space-y-1">
                    {selected.evidence.split('|').map((e, i) => (
                      <p key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span> {e.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Plan */}
              {selected.recommendation && (
                <div className="bg-[#0f1117] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">Step-by-Step Action Plan</p>
                    <button onClick={() => copyText(selected.recommendation ?? "")} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded">Copy</button>
                  </div>
                  <div className="space-y-1.5">
                    {formatRecommendation(selected.recommendation).split('\n').map((line, i) => (
                      line.trim() ? (
                        <p key={i} className={`text-sm leading-relaxed ${
                          line.startsWith('STEP') ? 'text-white font-semibold mt-2' :
                          line.startsWith('Time:') ? 'text-yellow-300' :
                          line.startsWith('Expected') ? 'text-green-300' :
                          line.startsWith('Cost') ? 'text-red-300' :
                          'text-gray-300'
                        }`}>{line.trim()}</p>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Forecast */}
              {selected.forecast_expected && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-purple-400 font-semibold mb-2 uppercase">
                    Forecast {selected.forecast_confidence ? `— ${selected.forecast_confidence}% confidence` : ""}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Low</p>
                      <p className="text-sm text-gray-300">{selected.forecast_low ?? "—"}</p>
                    </div>
                    <div className="text-center border-x border-purple-500/20">
                      <p className="text-xs text-purple-400 mb-1">Expected</p>
                      <p className="text-sm text-white font-medium">{selected.forecast_expected}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">High</p>
                      <p className="text-sm text-gray-300">{selected.forecast_high ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Monetization */}
              {selected.monetization_potential && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-yellow-400 font-semibold mb-1 uppercase">Monetization Potential</p>
                  <p className="text-sm text-white">{selected.monetization_potential}</p>
                </div>
              )}

              {/* Estimated Impact */}
              {selected.estimated_impact && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-green-400 font-semibold mb-1 uppercase">Estimated Impact</p>
                  <p className="text-sm text-white">{selected.estimated_impact}</p>
                </div>
              )}

              {/* Completed date */}
              {selected.completed_at && (
                <div className="text-xs text-green-400 text-center">
                  ✅ Completed on {new Date(selected.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex justify-between px-6 py-4 border-t border-gray-800 shrink-0">
              <button onClick={() => handleDelete(selected.id)} className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10">Delete</button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Growth Actions</h1>
            <p className="text-gray-400 text-sm mt-1">{result ? `${result.count} actions ready` : "Loading..."}</p>
          </div>
          {/* Execution Score */}
          {result && result.data.length > 0 && (
            <div className="bg-[#1a1d27] border border-gray-700 rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Execution Score</p>
              <p className={`text-2xl font-bold ${executionScore >= 70 ? 'text-green-400' : executionScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {executionScore}%
              </p>
              <p className="text-xs text-gray-500">
                {result.data.filter(i => i.execution_status === "completed").length} of {result.data.length} done
              </p>
            </div>
          )}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#13151f]">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">#</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Impact</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Confidence</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : result?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">🚀</span>
                      <span>No growth actions yet</span>
                      <span className="text-xs text-gray-600">Analyze a source to generate actions</span>
                    </div>
                  </td>
                </tr>
              ) : (
                result?.data.map(item => (
                  <tr key={item.id} className={`border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer ${item.execution_status === 'completed' ? 'opacity-60' : ''}`} onClick={() => setSelected(item)}>
                    <td className="px-4 py-3">
                      {item.priority_rank ? (
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                          #{item.priority_rank}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[180px]">
                      <span className={`truncate block ${item.execution_status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {item.opportunity_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.impact_score ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getImpactColor(item.impact_score)}`}>
                          {item.impact_score}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {item.confidence_score ? (
                        <span className={`text-sm font-bold ${getConfidenceColor(item.confidence_score)}`}>
                          {item.confidence_score}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.execution_status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setSelected(item); }} className="text-xs text-gray-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/10">View</button>
                        <button
                          onClick={e => { e.stopPropagation(); updateStatus(item.id, item.execution_status === 'completed' ? 'not_started' : 'completed'); }}
                          disabled={updatingId === item.id}
                          className="text-xs text-gray-400 hover:text-green-400 px-2 py-1 rounded hover:bg-green-500/10 disabled:opacity-40"
                        >
                          {item.execution_status === 'completed' ? '↩ Undo' : '✓ Done'}
                        </button>
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

          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-[#13151f]">
              <span className="text-xs text-gray-500">Page {result.currentPage} of {result.totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page === result.totalPages} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}