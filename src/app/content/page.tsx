'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ContentAnalysis } from '@/types/database';
import type { GetContentOptions, GetContentResult } from '@/lib/content';
import { getContentAnalyses } from '@/lib/content';
import { exportToCSV } from '@/lib/exportCSV';

const PAGE_SIZE = 10;

export default function ContentPage() {
  const [result, setResult] = useState<GetContentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof ContentAnalysis>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<ContentAnalysis | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getContentAnalyses({
      page, pageSize: PAGE_SIZE, search, sortBy, sortOrder,
    });
    if (fetchError) { setError(fetchError.message); setResult(null); }
    else { setResult(data); }
    setLoading(false);
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Analysis</h1>
            <p className="text-gray-400 text-sm mt-1">
              {result ? `${result.count} total analyses` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => exportToCSV(result?.data ?? [], 'content_analysis')}
            className="bg-[#1a1d27] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ↓ Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by title, channel, platform..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value as keyof ContentAnalysis); setPage(1); }}
            className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="created_at">Sort: Date</option>
            <option value="video_title">Sort: Title</option>
            <option value="viral_score">Sort: Viral Score</option>
            <option value="opportunity_score">Sort: Opportunity</option>
            <option value="channel">Sort: Channel</option>
          </select>
          <button
            onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')}
            className="bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white hover:border-cyan-500 min-w-[80px]"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">⚠️ {error}</div>
        )}

        {/* Table */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#13151f]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Video Title</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Channel</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Platform</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Viral Score</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Opportunity</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : result?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📭</span>
                        <span>No analyses found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result?.data.map(item => (
                    <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelected(item)}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white truncate max-w-[220px]">{item.video_title ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 truncate max-w-[120px]">{item.channel ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{item.platform ?? '—'}</td>
                      <td className={`px-4 py-3 font-semibold ${scoreColor(item.viral_score)}`}>
                        {item.viral_score ?? '—'}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${scoreColor(item.opportunity_score)}`}>
                        {item.opportunity_score ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(item); }}
                          className="text-xs text-gray-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/10"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-[#13151f]">
              <span className="text-xs text-gray-500">
                Page {result.currentPage} of {result.totalPages} — {result.count} total
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">«</button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30">‹</button>
                {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === result.totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`e-${idx}`} className="px-2 text-gray-600 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${page === p ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
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
                <h2 className="text-lg font-semibold text-white">Content Analysis Detail</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1117] rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Viral Score</p>
                    <p className={`text-2xl font-bold ${scoreColor(selected.viral_score)}`}>{selected.viral_score ?? '—'}</p>
                  </div>
                  <div className="bg-[#0f1117] rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Opportunity Score</p>
                    <p className={`text-2xl font-bold ${scoreColor(selected.opportunity_score)}`}>{selected.opportunity_score ?? '—'}</p>
                  </div>
                </div>
                <div className="bg-[#0f1117] rounded-lg px-4 py-3 space-y-2">
                  {[
                    { label: 'Video Title', value: selected.video_title },
                    { label: 'Channel', value: selected.channel },
                    { label: 'Platform', value: selected.platform },
                    { label: 'Publish Date', value: selected.publish_date },
                    { label: 'Created', value: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : null },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-white text-right max-w-[60%]">{value ?? '—'}</span>
                    </div>
                  ))}
                </div>
                {selected.content_gap && (
                  <div className="bg-[#0f1117] rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Content Gap</p>
                    <p className="text-sm text-white">{selected.content_gap}</p>
                  </div>
                )}
                {selected.next_content_idea && (
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-cyan-400 mb-1">Next Content Idea</p>
                    <p className="text-sm text-white">{selected.next_content_idea}</p>
                  </div>
                )}
                {selected.action_plan && (
                  <div className="bg-[#0f1117] rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Action Plan</p>
                    <p className="text-sm text-white whitespace-pre-wrap">{selected.action_plan}</p>
                  </div>
                )}
                {selected.report && (
                  <div className="bg-[#0f1117] rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Report</p>
                    <p className="text-sm text-white whitespace-pre-wrap">{selected.report}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end px-6 py-4 border-t border-gray-800">
                <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}