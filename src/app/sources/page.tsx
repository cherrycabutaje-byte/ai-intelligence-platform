'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Source } from '@/types/database';
import type { GetSourcesOptions, GetSourcesResult } from '@/lib/sources';
import { getSources } from '@/lib/sources';
import { exportToCSV } from '@/lib/exportCSV';
import AddSourceModal from '@/components/sources/AddSourceModal';
import EditSourceModal from '@/components/sources/EditSourceModal';
import DeleteSourceModal from '@/components/sources/DeleteSourceModal';
import { useJarvis } from '@/hooks/useJarvis';

const PAGE_SIZE = 10;

export default function SourcesPage() {
  const [result, setResult] = useState<GetSourcesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof Source>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<GetSourcesOptions['status']>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const handleAnalyze = async (source: Source) => {
    if (!source.asset_url) {
      showToast('❌ This source has no URL.');
      return;
    }
    setAnalyzingId(source.id);
    const result = await analyze({
   id: String(source.id),
      url: source.asset_url ?? "",
      platform: source.platform,
      name: source.asset_name,
      niche: source.niche ?? undefined,
      category: source.category ?? undefined,
      notes: source.notes ?? undefined,
      asset_type: source.asset_type ?? undefined,
    });
    setAnalyzingId(null);
    if (result?.success) {
      showToast('✅ Analysis complete! Jarvis has updated all tables.');
      fetchSources();
    } else {
      showToast('❌ Analysis failed. Please try again.');
    }
  };

  const statusColor = (s: Source['status']) => {
    if (s === 'active') return 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (s === 'inactive') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Source Management</h1>
            <p className="text-gray-400 text-sm mt-1">{result ? `${result.count} total sources` : 'Loading...'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(result?.data ?? [], 'sources')}
              className="bg-[#1a1d27] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm"
            >
              + Add Source
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as GetSourcesOptions['status']); setPage(1); }} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
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
          <button onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white hover:border-cyan-500 min-w-[80px]">
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">⚠️ {error}</div>
        )}

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
                        <div className="text-cyan-400 text-xs truncate max-w-[200px]">{source.asset_url ?? ''}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{source.platform ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{source.asset_type ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{source.niche ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(source.status)}`}>{source.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(source.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditSource(source)} className="text-xs text-gray-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/10">Edit</button>
                          <button onClick={() => setDeleteTarget(source)} className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10">Delete</button>
                          <button
                            onClick={() => handleAnalyze(source)}
                            disabled={analyzingId === source.id || jarvisLoading}
                            className="text-xs text-gray-400 hover:text-purple-400 px-2 py-1 rounded hover:bg-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {analyzingId === source.id ? '⏳ Analyzing...' : '🤖 Analyze'}
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

        {showAdd && (
          <AddSourceModal
            onClose={() => setShowAdd(false)}
            onSuccess={() => { setShowAdd(false); fetchSources(); }}
          />
        )}

        {editSource && (
          <EditSourceModal
            source={editSource}
            onClose={() => setEditSource(null)}
            onSuccess={() => { setEditSource(null); fetchSources(); }}
          />
        )}

        {deleteTarget && (
          <DeleteSourceModal
            source={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onSuccess={() => { setDeleteTarget(null); fetchSources(); }}
          />
        )}

      </div>
    </div>
  );
}