"use client";

import { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { Source } from "@/types/database";
import { getSources } from "@/lib/sources";
import { getStats, upsertStat, computeGrowth, getMilestones, type SourceStat } from "@/lib/stats";

export default function DashboardPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [stats, setStats] = useState<SourceStat[]>([]);
  const [growth, setGrowth] = useState<ReturnType<typeof computeGrowth>>(null);
  const [milestones, setMilestones] = useState<ReturnType<typeof getMilestones>>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    subscribers: "", followers: "", views: "", likes: "",
    comments: "", shares: "", watch_time_percent: "", ctr_percent: "",
    total_sales: "", monthly_revenue: "", units_sold: "",
    reviews_count: "", rating: "", store_visitors: "", notes: "",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchSources = useCallback(async () => {
    const { data } = await getSources({ pageSize: 100 });
    if (data?.data) {
      setSources(data.data);
      if (data.data.length > 0 && !selectedSource) {
        setSelectedSource(data.data[0]);
      }
    }
    setLoading(false);
  }, [selectedSource]);

  const fetchStats = useCallback(async () => {
    if (!selectedSource) return;
    const { data } = await getStats(selectedSource.id, 30);
    if (data) {
      setStats(data);
      setGrowth(computeGrowth(data));
      setMilestones(getMilestones(data, selectedSource.platform));
    }
  }, [selectedSource]);

  useEffect(() => { fetchSources(); }, [fetchSources]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSave = async () => {
    if (!selectedSource) return;
    setSaving(true);
    const { error } = await upsertStat({
      source_id: selectedSource.id,
      recorded_date: new Date().toISOString().split("T")[0],
      subscribers: Number(form.subscribers) || 0,
      followers: Number(form.followers) || 0,
      views: Number(form.views) || 0,
      likes: Number(form.likes) || 0,
      comments: Number(form.comments) || 0,
      shares: Number(form.shares) || 0,
      watch_time_percent: Number(form.watch_time_percent) || 0,
      ctr_percent: Number(form.ctr_percent) || 0,
      total_sales: Number(form.total_sales) || 0,
      monthly_revenue: Number(form.monthly_revenue) || 0,
      units_sold: Number(form.units_sold) || 0,
      reviews_count: Number(form.reviews_count) || 0,
      rating: Number(form.rating) || 0,
      store_visitors: Number(form.store_visitors) || 0,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { showToast("❌ Failed to save: " + error.message); }
    else { showToast("✅ Stats saved!"); setShowInput(false); fetchStats(); }
  };

  const isContent = ["YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn"].includes(selectedSource?.platform ?? "");
  const isProduct = ["Amazon", "Etsy", "Shopify"].includes(selectedSource?.platform ?? "");

  const StatCard = ({ label, value, change, pct, prefix = "" }: { label: string; value: number; change: number; pct: number; prefix?: string }) => (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl px-4 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{prefix}{value.toLocaleString()}</p>
      {change !== 0 && (
        <p className={`text-xs mt-1 font-medium ${change > 0 ? "text-green-400" : "text-red-400"}`}>
          {change > 0 ? "+" : ""}{change.toLocaleString()} ({pct}%) since start
        </p>
      )}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="text-gray-400">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1d27] border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">📊 Growth Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Track your progress and see Jarvis working</p>
          </div>
          <button
            onClick={() => setShowInput(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Update Today's Stats
          </button>
        </div>

        {/* Source Selector */}
        {sources.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {sources.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSource(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSource?.id === s.id ? "bg-cyan-500 text-black" : "bg-[#1a1d27] text-gray-400 hover:text-white border border-gray-700"}`}
              >
                {s.asset_name} • {s.platform}
              </button>
            ))}
          </div>
        )}

        {stats.length === 0 ? (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl px-6 py-16 text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-white font-semibold text-lg mb-2">No stats yet for {selectedSource?.asset_name}</h3>
            <p className="text-gray-400 text-sm mb-6">Start tracking your growth by adding today's stats. Takes 2 minutes!</p>
            <button onClick={() => setShowInput(true)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-2 rounded-lg text-sm">
              + Add First Stats Entry
            </button>
          </div>
        ) : (
          <>
            {/* Growth Cards */}
            {growth && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isContent && <>
                  <StatCard label="Subscribers" value={growth.subscribers.value} change={growth.subscribers.change} pct={growth.subscribers.pct} />
                  <StatCard label="Followers" value={growth.followers.value} change={growth.followers.change} pct={growth.followers.pct} />
                  <StatCard label="Total Views" value={growth.views.value} change={growth.views.change} pct={growth.views.pct} />
                  <StatCard label="Engagement" value={growth.likes.value} change={growth.likes.change} pct={growth.likes.pct} />
                </>}
                {isProduct && <>
                  <StatCard label="Total Sales" value={growth.total_sales.value} change={growth.total_sales.change} pct={growth.total_sales.pct} />
                  <StatCard label="Monthly Revenue" value={growth.monthly_revenue.value} change={growth.monthly_revenue.change} pct={growth.monthly_revenue.pct} prefix="$" />
                  <StatCard label="Units Sold" value={growth.views.value} change={growth.views.change} pct={growth.views.pct} />
                  <StatCard label="Reviews" value={growth.comments.value} change={growth.comments.change} pct={growth.comments.pct} />
                </>}
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscribers/Followers Chart */}
              <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  {isContent ? "📈 Subscribers Growth" : "📈 Sales Growth"}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.map(s => ({
                    date: s.recorded_date,
                    value: isContent ? s.subscribers : s.total_sales,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                    <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#1a1d27", border: "1px solid #374151", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Views/Revenue Chart */}
              <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  {isContent ? "👀 Daily Views" : "💰 Monthly Revenue"}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.map(s => ({
                    date: s.recorded_date,
                    value: isContent ? s.views : s.monthly_revenue,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                    <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#1a1d27", border: "1px solid #374151", borderRadius: "8px" }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">🎯 Milestones</h3>
                <div className="space-y-3">
                  {milestones.slice(0, 6).map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${m.achieved ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"}`}>
                        {m.achieved ? "✓" : "○"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${m.achieved ? "text-green-400" : "text-gray-400"}`}>
                            {m.label} {m.special && <span className="text-yellow-400 ml-1">⭐ {m.special}</span>}
                          </span>
                          <span className="text-xs text-gray-500">{m.current.toLocaleString()} / {m.target.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${m.achieved ? "bg-green-500" : "bg-cyan-500"}`}
                            style={{ width: `${Math.min((m.current / m.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Input Modal */}
        {showInput && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d27] border border-cyan-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">📊 Today's Stats</h2>
                  <p className="text-xs text-gray-400">{selectedSource?.asset_name} • {new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setShowInput(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {isContent && (
                  <>
                    <p className="text-xs text-cyan-400 font-semibold uppercase">Content Stats</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "subscribers", label: "Subscribers", placeholder: "e.g. 1456" },
                        { key: "followers", label: "Followers", placeholder: "e.g. 2300" },
                        { key: "views", label: "Total Views", placeholder: "e.g. 45000" },
                        { key: "likes", label: "Likes", placeholder: "e.g. 1200" },
                        { key: "comments", label: "Comments", placeholder: "e.g. 89" },
                        { key: "shares", label: "Shares", placeholder: "e.g. 45" },
                        { key: "watch_time_percent", label: "Watch Time %", placeholder: "e.g. 62" },
                        { key: "ctr_percent", label: "CTR %", placeholder: "e.g. 4.5" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                          <input
                            type="number"
                            placeholder={f.placeholder}
                            value={form[f.key as keyof typeof form]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {isProduct && (
                  <>
                    <p className="text-xs text-purple-400 font-semibold uppercase">Product Stats</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "total_sales", label: "Total Sales", placeholder: "e.g. 47" },
                        { key: "monthly_revenue", label: "Monthly Revenue $", placeholder: "e.g. 1250" },
                        { key: "units_sold", label: "Units Sold", placeholder: "e.g. 23" },
                        { key: "reviews_count", label: "Reviews Count", placeholder: "e.g. 12" },
                        { key: "rating", label: "Rating", placeholder: "e.g. 4.8" },
                        { key: "store_visitors", label: "Store Visitors", placeholder: "e.g. 340" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                          <input
                            type="number"
                            placeholder={f.placeholder}
                            value={form[f.key as keyof typeof form]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                  <textarea
                    placeholder="Any notes about today's performance..."
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-cyan-300">💡 Update daily for the most accurate growth charts and milestone tracking.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-800">
                <button onClick={() => setShowInput(false)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg disabled:opacity-50">
                  {saving ? "Saving..." : "Save Stats"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
