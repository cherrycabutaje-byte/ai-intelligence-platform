"use client";
import { useState } from "react";
import Link from "next/link";

const PLATFORMS = [
  "YouTube", "YouTube Shorts", "TikTok",
  "Instagram Reels", "Instagram Feed",
  "Facebook", "Pinterest"
];

interface PreUploadBrief {
  ideaScore: { score: number; label: string; gap: string };
  verdict: string;
  titleOptions: string[];
  hookScript: string;
  filmingChecklist: string[];
  timeBombs: string[];
  viralAngle: string;
  trendCheck: { isTrending: boolean; trendStrength: string; bestTimeToPost: string; whyThisTime: string };
  warningIfAny: string;
}

export default function AnalyzePage() {
  const [form, setForm] = useState({
    idea: "",
    audience: "",
    bestMoment: "",
    platform: "YouTube",
    niche: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreUploadBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.idea || !form.audience || !form.bestMoment) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/jarvis/pre-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: "user",
          idea: form.idea,
          audience: form.audience,
          bestMoment: form.bestMoment,
          platform: form.platform,
          niche: form.niche
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Analysis failed");
      setResult(data.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/jarvis" className="text-gray-500 hover:text-gray-300 text-sm">← Back</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">🎬 Pre-Upload Analysis</h1>
            <p className="text-gray-400 text-sm mt-0.5">Analyze your idea before you film. Free.</p>
          </div>
        </div>

        {/* Form */}
        {!result && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-5">

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                Platform <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, platform: p }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      form.platform === p
                        ? "bg-cyan-500 text-black"
                        : "bg-[#0f1117] text-gray-400 border border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                Your niche <span className="text-gray-500">(optional)</span>
              </label>
              <input
                value={form.niche}
                onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                placeholder="e.g. lucky plants and feng shui"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                What is your video idea? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.idea}
                onChange={e => setForm(f => ({ ...f, idea: e.target.value }))}
                placeholder="e.g. 10 lucky plants that change the energy of your home"
                rows={2}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                Who is this for? <span className="text-red-400">*</span>
              </label>
              <input
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                placeholder="e.g. people who want to improve the energy in their home"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                What is the most interesting moment in this video? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.bestMoment}
                onChange={e => setForm(f => ({ ...f, bestMoment: e.target.value }))}
                placeholder="e.g. placing the jade plant near the front door as a ritual to invite wealth"
                rows={2}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Analyzing your idea..." : "Analyze My Idea →"}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl px-6 py-12 text-center space-y-3">
            <div className="text-3xl animate-pulse">🎯</div>
            <p className="text-white font-semibold">JARVIS is analyzing your idea...</p>
            <p className="text-gray-400 text-sm">Applying the Content Code. This takes about 10 seconds.</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">

            {/* Score */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 text-center space-y-2">
              <p className="text-gray-400 text-sm">Idea Score</p>
              <p className={`text-6xl font-bold ${scoreColor(result.ideaScore.score)}`}>
                {result.ideaScore.score}/10
              </p>
              <p className="text-white font-semibold">{result.ideaScore.label}</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">{result.ideaScore.gap}</p>
            </div>

            {/* Verdict */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">The Verdict</p>
              <p className="text-white font-medium">{result.verdict}</p>
            </div>

            {/* Title Options */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Title Options — Use One of These</p>
              {result.titleOptions.map((title, i) => (
                <div key={i} className="bg-[#0f1117] rounded-xl px-4 py-3 text-sm text-white border border-gray-800">
                  {title}
                </div>
              ))}
            </div>

            {/* Hook Script */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-5 space-y-3">
              <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">Hook Script — Record This</p>
              <p className="text-white text-sm leading-relaxed">{result.hookScript}</p>
            </div>

            {/* Filming Checklist */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Filming Checklist</p>
              {result.filmingChecklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </div>
              ))}
            </div>

            {/* Time Bombs */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Time Bombs — Say These During Filming</p>
              {result.timeBombs.map((bomb, i) => (
                <div key={i} className="bg-[#0f1117] rounded-xl px-4 py-3 text-sm text-gray-300 border border-gray-800">
                  {bomb}
                </div>
              ))}
            </div>

            {/* Viral Angle */}
            <div className="bg-[#1a1d27] border border-purple-500/20 rounded-2xl p-5 space-y-2">
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">The Viral Angle</p>
              <p className="text-white text-sm">{result.viralAngle}</p>
            </div>

            {/* Trend Check */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Trend Check</p>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${result.trendCheck.isTrending ? 'text-green-400' : 'text-yellow-400'}`}>
                  {result.trendCheck.isTrending ? '🔥 Trending' : '⚡ Not trending'}
                </span>
                <span className="text-xs text-gray-500">Strength: {result.trendCheck.trendStrength}</span>
              </div>
              <p className="text-white text-sm font-medium">Best time to post: {result.trendCheck.bestTimeToPost}</p>
              <p className="text-gray-400 text-sm">{result.trendCheck.whyThisTime}</p>
            </div>

            {/* Warning */}
            {result.warningIfAny && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-2">
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wide">⚠️ Warning</p>
                <p className="text-white text-sm">{result.warningIfAny}</p>
              </div>
            )}

            {/* CTA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-5 space-y-3 text-center">
              <p className="text-white font-semibold">Ready to film?</p>
              <p className="text-gray-400 text-sm">After filming paste your transcript for the full Content Code Brief.</p>
              <Link
                href="/jarvis/brief"
                className="block bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors"
              >
                Get My Full Content Code Brief →
              </Link>
            </div>

            {/* Analyze Again */}
            <button
              onClick={() => { setResult(null); setForm({ idea: "", audience: "", bestMoment: "", platform: "YouTube", niche: "" }); }}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Analyze a different idea
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
