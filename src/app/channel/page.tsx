"use client";
import { useState } from "react";
import Link from "next/link";

interface VideoStats {
  videoId: string;
  title: string;
  views: number;
  publishedAt: string;
}

interface ChannelDiagnosis {
  channelId: string;
  creatorId: string;
  generatedAt: string;
  channelStats: {
    channelTitle: string;
    description: string;
    subscribers: number;
    totalVideos: number;
    channelStartDate: string;
  };
  topVideos: VideoStats[];
  bottomVideos: VideoStats[];
  averageViews: number;
  gapRatio: number;
  recentVideos: VideoStats[];
  driftAlignmentScore: number;
  historicalAlignmentScore: number;
  diagnosis: {
    channelPositioning: {
      whatYouSayYouAre: string;
      whatAudienceRespondsTo: string;
      alignmentScore: number;
      interpretation: string;
    };
    creatorDNA: {
      creatorType: string;
      interpretation: string;
    };
    topPerformers: { pattern: string; interpretation: string };
    bottomPerformers: { pattern: string; interpretation: string };
    audienceLoves: string[];
    audienceIgnores: string[];
    channelDrift: { detected: boolean; explanation: string };
    whyPeopleFollowYou: string;
    contentAudienceRejects: Array<{ topic: string; averageViews: number; reason: string }>;
    costOfDrift: {
      alignedAverageViews: number;
      misalignedAverageViews: number;
      performanceLossPercent: number;
      interpretation: string;
    };
    biggestOpportunity: string;
  };
}

export default function ChannelPage() {
  const [channelId, setChannelId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChannelDiagnosis | null>(null);

  const handleDiagnose = async () => {
    if (!channelId || !creatorId) {
      setError("Channel ID and Creator ID are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/jarvis/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, creatorId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Diagnosis failed");
      setResult(data.diagnosis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const alignmentColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const alignmentBg = (score: number) => {
    if (score >= 70) return "border-green-500/30";
    if (score >= 40) return "border-yellow-500/30";
    return "border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🧬 Channel Diagnosis
          </div>
          <h1 className="text-3xl font-bold text-white">Who are you as a creator?</h1>
          <p className="text-gray-400">
            Your channel has a unique growth pattern. Channel Diagnosis will identify exactly what it is.
          </p>
        </div>

        {/* Input Form */}
        {!result && !loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                YouTube Channel ID <span className="text-red-400">*</span>
              </label>
              <input
                value={channelId}
                onChange={e => setChannelId(e.target.value)}
                placeholder="e.g. UCKzIKD_YEqELez3Y5Vl1-3A"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
              <p className="text-xs text-gray-600">
                YouTube Studio → Settings → Channel → Advanced settings
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                Your Creator Name <span className="text-red-400">*</span>
              </label>
              <input
                value={creatorId}
                onChange={e => setCreatorId(e.target.value)}
                placeholder="e.g. Cherry Vibes or your name"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleDiagnose}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors"
            >
              Run Channel Diagnosis →
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl px-6 py-16 text-center space-y-3">
            <div className="text-4xl animate-pulse">🧬</div>
            <p className="text-white font-semibold text-lg">Diagnosing your channel...</p>
            <p className="text-gray-400 text-sm">
              Fetching your videos, analyzing patterns, applying five intelligence lenses. About 20 seconds.
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">

            {/* Channel Header */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{result.channelStats.channelTitle}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {result.channelStats.subscribers.toLocaleString()} subscribers
                    · {result.channelStats.totalVideos} total videos
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg views</p>
                    <p className="text-2xl font-bold text-white">{result.averageViews}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gap ratio</p>
                    <p className="text-2xl font-bold text-yellow-400">{result.gapRatio}x</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why People Follow You — FIRST */}
            <div className="bg-[#1a1d27] border border-yellow-500/30 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-yellow-500/20">
                <p className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">
                  Why People Follow You
                </p>
              </div>
              <div className="p-6">
                <p className="text-white text-sm leading-relaxed">{result.diagnosis.whyPeopleFollowYou}</p>
              </div>
            </div>

            {/* Creator DNA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-cyan-500/20">
                <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wide">Creator DNA</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-6 py-3">
                  <p className="text-cyan-400 font-bold text-xl">{result.diagnosis.creatorDNA.creatorType}</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{result.diagnosis.creatorDNA.interpretation}</p>
              </div>
            </div>

            {/* Channel Positioning */}
            <div className={`bg-[#1a1d27] border rounded-2xl overflow-hidden ${alignmentBg(result.diagnosis.channelPositioning.alignmentScore)}`}>
              <div className="px-6 py-4 border-b border-gray-800">
                <p className="text-white font-semibold text-sm uppercase tracking-wide">Channel Positioning</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0f1117] rounded-xl p-4 space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">What you say you are</p>
                    <p className="text-white font-medium text-sm mt-2">{result.diagnosis.channelPositioning.whatYouSayYouAre}</p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4 space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">What audience responds to</p>
                    <p className="text-white font-medium text-sm mt-2">{result.diagnosis.channelPositioning.whatAudienceRespondsTo}</p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Alignment</p>
                    <p className={`text-4xl font-bold ${alignmentColor(result.diagnosis.channelPositioning.alignmentScore)}`}>
                      {result.diagnosis.channelPositioning.alignmentScore}%
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{result.diagnosis.channelPositioning.interpretation}</p>
              </div>
            </div>

            {/* Cost of Drift */}
            <div className="bg-[#1a1d27] border border-red-500/30 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
                <p className="text-red-400 font-semibold text-sm uppercase tracking-wide">Cost of Drift</p>
                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">
                  -{result.diagnosis.costOfDrift.performanceLossPercent}% performance loss
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">When aligned</p>
                    <p className="text-3xl font-bold text-green-400">
                      {result.diagnosis.costOfDrift.alignedAverageViews}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">avg views</p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">When misaligned</p>
                    <p className="text-3xl font-bold text-red-400">
                      {result.diagnosis.costOfDrift.misalignedAverageViews}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">avg views</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{result.diagnosis.costOfDrift.interpretation}</p>
              </div>
            </div>

            {/* Channel Drift */}
            <div className={`bg-[#1a1d27] border rounded-2xl overflow-hidden ${result.diagnosis.channelDrift.detected ? 'border-red-500/30' : 'border-green-500/30'}`}>
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <p className="text-white font-semibold text-sm uppercase tracking-wide">Channel Drift</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400 font-bold">{result.historicalAlignmentScore}%</span>
                    <span className="text-gray-500">→</span>
                    <span className={`font-bold ${alignmentColor(result.driftAlignmentScore)}`}>{result.driftAlignmentScore}%</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${result.diagnosis.channelDrift.detected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {result.diagnosis.channelDrift.detected ? '⚠️ CRITICAL DRIFT' : '✅ ON TRACK'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-300 text-sm leading-relaxed">{result.diagnosis.channelDrift.explanation}</p>
              </div>
            </div>

            {/* Top + Bottom Performers */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">Top 3 Videos</p>
                </div>
                <div className="p-6 space-y-3">
                  {result.topVideos.map((v, i) => (
                    <div key={v.videoId} className="flex items-start gap-3">
                      <span className="text-cyan-400 font-bold text-sm w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{v.title}</p>
                        <p className="text-green-400 text-xs font-bold">{v.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-gray-400 text-xs leading-relaxed italic">{result.diagnosis.topPerformers.pattern}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">Bottom 3 Videos</p>
                </div>
                <div className="p-6 space-y-3">
                  {result.bottomVideos.map((v, i) => (
                    <div key={v.videoId} className="flex items-start gap-3">
                      <span className="text-red-400 font-bold text-sm w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{v.title}</p>
                        <p className="text-red-400 text-xs font-bold">{v.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-gray-400 text-xs leading-relaxed italic">{result.diagnosis.bottomPerformers.pattern}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Loves + Ignores */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">❤️ Audience Loves</p>
                </div>
                <div className="p-6 space-y-3">
                  {result.diagnosis.audienceLoves.map((item, i) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-green-400 font-bold text-xs w-6">#{i + 1}</span>
                      <p className="text-white text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">❌ Audience Ignores</p>
                </div>
                <div className="p-6 space-y-3">
                  {result.diagnosis.audienceIgnores.map((item, i) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-red-400 font-bold text-xs w-6">#{i + 1}</span>
                      <p className="text-white text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Audience Rejects */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <p className="text-white font-semibold text-sm uppercase tracking-wide">
                  Content The Audience Rejects
                </p>
              </div>
              <div className="p-6 space-y-4">
                {result.diagnosis.contentAudienceRejects.map(item => (
                  <div key={item.topic} className="flex items-start gap-4 bg-[#0f1117] rounded-xl p-4">
                    <div className="text-center shrink-0">
                      <p className="text-red-400 font-bold text-lg">{item.averageViews}</p>
                      <p className="text-xs text-gray-500">avg views</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">✗ {item.topic}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biggest Opportunity */}
            <div className="bg-[#1a1d27] border border-purple-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20">
                <p className="text-purple-400 font-semibold text-sm uppercase tracking-wide">Biggest Opportunity</p>
              </div>
              <div className="p-6">
                <p className="text-white text-sm leading-relaxed">{result.diagnosis.biggestOpportunity}</p>
              </div>
            </div>

            {/* Ask JARVIS CTA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 text-center space-y-3">
              <p className="text-white font-bold text-lg">Now you know who you are.</p>
              <p className="text-gray-400 text-sm">Ask JARVIS what to do about it.</p>
              <Link
                href="/jarvis"
                className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl transition-colors"
              >
                Ask JARVIS What To Do Next →
              </Link>
            </div>

            <button
              onClick={() => { setResult(null); setChannelId(""); }}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Diagnose a different channel
            </button>

          </div>
        )}
      </div>
    </div>
  );
}



