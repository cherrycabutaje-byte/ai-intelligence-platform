"use client";
import { useEffect, useState, useCallback } from "react";
import type { GrowthOpportunity } from "@/types/database";
import type { GetGrowthResult } from "@/lib/growth";
import { getGrowthOpportunities, deleteGrowthOpportunity } from "@/lib/growth";

const PAGE_SIZE = 10;

export default function GrowthPage() {
  const [result, setResult] = useState<GetGrowthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GrowthOpportunity | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
                <h2 className="text-lg font-semibold text-white">{selected.opportunity_type ?? "Growth Action"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : ""}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">x</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
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

              {selected.monetization_potential && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-yellow-400 font-semibold mb-1 uppercase">Monetization Potential</p>
                  <p className="text-sm text-white">{selected.monetization_potential}</p>
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
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#13151f]">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Preview</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Money</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : result?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">🚀</span>
                      <span>No growth actions yet</span>
                      <span className="text-xs text-gray-600">Analyze a source to generate actions</span>
                    </div>
                  </td>
                </tr>
              ) : (
                result?.data.map(item => (
                  <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelected(item)}>
                    <td className="px-4 py-3 text-white font-medium max-w-[180px]">
                      <span className="truncate block">{item.opportunity_type ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[300px]">
                      <span className="truncate block">{item.recommendation?.substring(0, 80)}...</span>
                    </td>
                    <td className="px-4 py-3 text-yellow-400 text-xs max-w-[150px]">
                      <span className="truncate block">{item.monetization_potential ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setSelected(item); }} className="text-xs text-gray-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/10">View</button>
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
