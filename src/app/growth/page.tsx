"use client";

import { useEffect, useState, useCallback } from "react";
import type { GrowthOpportunity } from "@/types/database";
import type { GetGrowthOptions, GetGrowthResult } from "@/lib/growth";
import { getGrowthOpportunities, deleteGrowthOpportunity } from "@/lib/growth";
import { exportToCSV } from "@/lib/exportCSV";

const PAGE_SIZE = 10;

export default function GrowthPage() {
  const [result, setResult] = useState<GetGrowthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof GrowthOpportunity>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState<GrowthOpportunity | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchGrowth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getGrowthOpportunities({ page, pageSize: PAGE_SIZE, search, sortBy, sortOrder, status: statusFilter, priority: priorityFilter });
    if (fetchError) { setError(fetchError.message); setResult(null); }
    else { setResult(data); }
    setLoading(false);
  }, [page, search, sortBy, sortOrder, statusFilter, priorityFilter]);

  useEffect(() => { fetchGrowth(); }, [fetchGrowth]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this growth opportunity?")) return;
    setDeletingId(id);
    const { error } = await deleteGrowthOpportunity(id);
    setDeletingId(null);
    if (error) { showToast("❌ Delete failed: " + error.message); }
    else { showToast("✅ Deleted successfully!"); fetchGrowth(); }
  };

  const priorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const statusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "completed": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

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
            <h1 className="text-2xl font-bold text-white">Growth Opportunities</h1>
            <p className="text-gray-400 text-sm mt-1">{result ? `${result.count} total opportunities` : "Loading..."}</p>
          </div>
          <button onClick={() => exportToCSV(result?.data ?? [], "growth_opportunities")} className="bg-[#1a1d27] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            ↓ Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search by type, recommendation..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="flex-1 bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value as keyof GrowthOpportunity); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
            <option value="created_at">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
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
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Recommendation</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Priority</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Impact</th>
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
                        <span className="text-3xl">🚀</span>
                        <span>No growth opportunities found</span>
                        <span className="text-xs text-gray-600">Analyze a source to generate growth opportunities</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result?.data.map(item => (
                    <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelected(item)}>
                      <td className="px-4 py-3 text-white font-medium capitalize">{item.opportunity_type ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-300 truncate max-w-[250px]">{item.recommendation ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColor(item.priority)}`}>{item.priority ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(item.status)}`}>{item.status ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 truncate max-w-[150px]">{item.estimated_impact ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
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
          </div>
          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-[#13151f]">
              <span className="text-xs text-gray-500">Page {result.currentPage} of {result.totalPages} — {result.count} total</span>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d27] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Growth Opportunity Detail</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${priorityColor(selected.priority)}`}>Priority: {selected.priority ?? "—"}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(selected.status)}`}>Status: {selected.status ?? "—"}</span>
                </div>
                <div className="bg-[#0f1117] rounded-lg px-4 py-3 space-y-2">
                  {[
                    { label: "Opportunity Type", value: selected.opportunity_type },
                    { label: "Estimated Impact", value: selected.estimated_impact },
                    { label: "Created", value: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : null },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-white text-right max-w-[60%]">{value ?? "—"}</span>
                    </div>
                  ))}
                </div>
                {selected.recommendation && <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3"><p className="text-xs text-cyan-400 mb-1">Recommendation</p><p className="text-sm text-white whitespace-pre-wrap">{selected.recommendation}</p></div>}
                {selected.monetization_potential && <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3"><p className="text-xs text-yellow-400 mb-1">Monetization Potential</p><p className="text-sm text-white whitespace-pre-wrap">{selected.monetization_potential}</p></div>}
              </div>
              <div className="flex justify-between px-6 py-4 border-t border-gray-800">
                <button onClick={() => { handleDelete(selected.id); setSelected(null); }} className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Delete</button>
                <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
