"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface FeedbackRow {
  id: number;
  user_id: string;
  rating: number;
  what_you_loved: string | null;
  what_to_improve: string | null;
  would_recommend: boolean;
  created_at: string;
}

interface UserStat {
  user_id: string;
  email: string;
  sources: number;
  analyses: number;
  joined: string;
}

export default function AdminPage() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASSWORD = "jarvis2026admin";

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      loadData();
    } else {
      setError("Wrong password!");
    }
  };

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: feedbackData } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (feedbackData) setFeedback(feedbackData);

    const { data: sourcesData } = await supabase
      .from("sources")
      .select("user_id, created_at");

    const { data: contentData } = await supabase
      .from("content_analysis")
      .select("user_id, created_at");

    if (sourcesData && contentData) {
      const userMap = new Map<string, UserStat>();
      sourcesData.forEach(s => {
        if (!userMap.has(s.user_id)) {
          userMap.set(s.user_id, {
            user_id: s.user_id,
            email: s.user_id.slice(0, 8) + "...",
            sources: 0,
            analyses: 0,
            joined: s.created_at,
          });
        }
        userMap.get(s.user_id)!.sources++;
      });
      contentData.forEach(c => {
        if (!userMap.has(c.user_id)) {
          userMap.set(c.user_id, {
            user_id: c.user_id,
            email: c.user_id.slice(0, 8) + "...",
            sources: 0,
            analyses: 0,
            joined: c.created_at,
          });
        }
        userMap.get(c.user_id)!.analyses++;
      });
      setUsers(Array.from(userMap.values()));
    }

    setLoading(false);
  };

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "0";

  const recommendCount = feedback.filter(f => f.would_recommend).length;

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="bg-[#1a1d27] border border-gray-700 rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-white mb-6 text-center">🔐 Admin Access</h1>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-lg text-sm"
          >
            Enter Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🛡️ Jarvis Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Monitor users, feedback, and growth</p>
          </div>
          <button onClick={loadData} className="bg-[#1a1d27] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-cyan-500">
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: "👥", color: "cyan" },
            { label: "Total Analyses", value: users.reduce((s, u) => s + u.analyses, 0), icon: "🤖", color: "purple" },
            { label: "Avg Rating", value: `${avgRating}⭐`, icon: "⭐", color: "yellow" },
            { label: "Would Recommend", value: `${recommendCount}/${feedback.length}`, icon: "👍", color: "green" },
          ].map(card => (
            <div key={card.label} className="bg-[#1a1d27] border border-gray-800 rounded-xl px-4 py-4">
              <p className="text-xs text-gray-500 mb-1">{card.icon} {card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {["overview", "feedback", "users"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-cyan-500 text-black" : "bg-[#1a1d27] text-gray-400 hover:text-white border border-gray-700"}`}
            >
              {tab === "overview" ? "📊 Overview" : tab === "feedback" ? "⭐ Feedback" : "👥 Users"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">📈 Platform Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total registered users</span>
                      <span className="text-white font-semibold">{users.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total analyses run</span>
                      <span className="text-white font-semibold">{users.reduce((s, u) => s + u.analyses, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total sources added</span>
                      <span className="text-white font-semibold">{users.reduce((s, u) => s + u.sources, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Feedback submissions</span>
                      <span className="text-white font-semibold">{feedback.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Average rating</span>
                      <span className="text-yellow-400 font-semibold">{avgRating} / 5 ⭐</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Would recommend</span>
                      <span className="text-green-400 font-semibold">{feedback.length > 0 ? Math.round((recommendCount / feedback.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Latest Feedback Preview */}
                {feedback.length > 0 && (
                  <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">💬 Latest Feedback</h3>
                    <div className="space-y-3">
                      {feedback.slice(0, 3).map(f => (
                        <div key={f.id} className="bg-[#0f1117] rounded-lg px-4 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-yellow-400">{"⭐".repeat(f.rating)}</span>
                            <span className="text-xs text-gray-500">{new Date(f.created_at).toLocaleDateString()}</span>
                          </div>
                          {f.what_you_loved && <p className="text-sm text-green-300">❤️ {f.what_you_loved}</p>}
                          {f.what_to_improve && <p className="text-sm text-yellow-300">💡 {f.what_to_improve}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === "feedback" && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#13151f]">
                      <th className="text-left px-4 py-3 text-gray-400">Rating</th>
                      <th className="text-left px-4 py-3 text-gray-400">What They Loved</th>
                      <th className="text-left px-4 py-3 text-gray-400">What To Improve</th>
                      <th className="text-left px-4 py-3 text-gray-400">Recommend</th>
                      <th className="text-left px-4 py-3 text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">No feedback yet</td>
                      </tr>
                    ) : (
                      feedback.map(f => (
                        <tr key={f.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-yellow-400">{"⭐".repeat(f.rating)}</td>
                          <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{f.what_you_loved ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{f.what_to_improve ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${f.would_recommend ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {f.would_recommend ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#13151f]">
                      <th className="text-left px-4 py-3 text-gray-400">User ID</th>
                      <th className="text-left px-4 py-3 text-gray-400">Sources</th>
                      <th className="text-left px-4 py-3 text-gray-400">Analyses</th>
                      <th className="text-left px-4 py-3 text-gray-400">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500">No users yet</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.user_id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-gray-300 font-mono text-xs">{u.user_id.slice(0, 16)}...</td>
                          <td className="px-4 py-3 text-cyan-400 font-semibold">{u.sources}</td>
                          <td className="px-4 py-3 text-purple-400 font-semibold">{u.analyses}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.joined).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
