"use client";
import { useState } from "react";
import Link from "next/link";

const PLATFORMS = [
  "YouTube", "YouTube Shorts", "TikTok",
  "Instagram Reels", "Instagram Feed",
  "Facebook", "Pinterest"
];

export default function BriefPage() {
  const [form, setForm] = useState({
    videoTitle: "",
    transcript: "",
    platform: "YouTube",
    followers: "",
    avgViews: ""
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.videoTitle || !form.transcript) {
      setError("Video title and transcript are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit/viral-direct-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: "user",
          videoTitle: form.videoTitle,
          transcript: form.transcript
        })
      });

      if (!res.ok) throw new Error("Brief generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jarvis-content-code-brief.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/jarvis" className="text-gray-500 hover:text-gray-300 text-sm">← Back</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">⚡ Content Code Brief</h1>
            <p className="text-gray-400 text-sm mt-0.5">Paste your transcript. Get your viral score and full PDF brief.</p>
          </div>
        </div>

        {/* What you get */}
        <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-5">
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wide mb-3">What you get</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Viral Score 0-10",
              "Curiosity Stack diagnosis",
              "Stakes diagnosis",
              "Title rewrite (3 options)",
              "Hook script ready to record",
              "Time bombs to plant",
              "The line they will screenshot",
              "PDF download"
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="text-cyan-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        {!done && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-5">

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">Platform</label>
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
                Video title or caption <span className="text-red-400">*</span>
              </label>
              <input
                value={form.videoTitle}
                onChange={e => setForm(f => ({ ...f, videoTitle: e.target.value }))}
                placeholder="e.g. 10 Indoor Plants That Bring Good Luck"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                Transcript or script <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.transcript}
                onChange={e => setForm(f => ({ ...f, transcript: e.target.value }))}
                placeholder="Paste your full video transcript or script here. The more detail the better."
                rows={8}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <p className="text-xs text-gray-600">
                No transcript? Write out roughly what you say in the video.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Followers/Subscribers</label>
                <input
                  value={form.followers}
                  onChange={e => setForm(f => ({ ...f, followers: e.target.value }))}
                  placeholder="e.g. 2300"
                  type="number"
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Average views</label>
                <input
                  value={form.avgViews}
                  onChange={e => setForm(f => ({ ...f, avgViews: e.target.value }))}
                  placeholder="e.g. 150"
                  type="number"
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
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
              {loading ? "Generating your brief..." : "Get My Content Code Brief →"}
            </button>

            <p className="text-center text-xs text-gray-600">
              Your PDF will download automatically in about 15 seconds.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl px-6 py-12 text-center space-y-3">
            <div className="text-3xl animate-pulse">⚡</div>
            <p className="text-white font-semibold">JARVIS is analyzing your content...</p>
            <p className="text-gray-400 text-sm">Applying the Jenny Hoyos and MrBeast frameworks. About 15 seconds.</p>
          </div>
        )}

        {/* Done */}
        {done && (
          <div className="space-y-4">
            <div className="bg-[#1a1d27] border border-green-500/20 rounded-2xl p-6 text-center space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-white font-bold text-xl">Your brief is ready!</p>
              <p className="text-gray-400 text-sm">
                Your Content Code Brief has downloaded as a PDF.
                Open it and follow the coaching inside.
              </p>
            </div>

            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 space-y-3">
              <p className="text-white font-semibold text-sm">What to do now:</p>
              <div className="space-y-2">
                {[
                  "Open your PDF and read the Viral Score first",
                  "Apply the hook script before uploading",
                  "Use one of the three title options",
                  "Plant the time bombs during editing",
                  "Come back next week to track your improvement"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setDone(false); setForm({ videoTitle: "", transcript: "", platform: "YouTube", followers: "", avgViews: "" }); }}
                className="bg-[#1a1d27] border border-gray-700 hover:border-gray-500 text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Analyze another video
              </button>
              <Link
                href="/jarvis/analyze"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors text-sm text-center"
              >
                Pre-analyze next idea
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
