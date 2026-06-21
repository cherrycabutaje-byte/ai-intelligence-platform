"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface VideoStats {
  videoId: string;
  title: string;
  views: number;
  publishedAt: string;
}

interface Blocker {
  number: number;
  name: string;
  severity: string;
  category: string;
  whatIsBroken: string;
  whyItMatters: string;
  whatItMeansForYou: string;
  cost: string;
  estimatedImpact: string;
  confidence: number;
  evidencePoints: string[] | string;
  recommendedAction: string;
}

interface DiagnosisResult {
  channelName: string;
  subscribers: number;
  totalVideos: number;
  lastUploadDays: number;
  overallHealth: string;
  oneLineSummary: string;
  savedAt: string;
  truths: {
    whyPeopleFollowYou: string;
    creatorDNA: { creatorType: string; interpretation: string };
    channelPositioning: {
      whatYouSayYouAre: string;
      whatAudienceRespondsTo: string;
      alignmentScore: number;
      interpretation: string;
    };
    topVideos: any[];
    bottomVideos: any[];
    audienceLoves: string[];
    audienceIgnores: string[];
    channelDrift: { detected: boolean; explanation: string };
    costOfDrift: {
      alignedAverageViews: number;
      misalignedAverageViews: number;
      performanceLossPercent: number;
      interpretation: string;
    };
    biggestOpportunity: string;
    averageViews: number;
    gapRatio: number;
  };
  blockers: Blocker[];
}

function HealthBadge({ health }: { health: string }) {
  const colors: Record<string, string> = {
    'At Risk': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Needs Attention': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Room to Improve': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'On Track': 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-bold ${colors[health] ?? colors['Needs Attention']}`}>
      {health}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'Critical') return <span>🔴</span>;
  if (severity === 'High') return <span>🟠</span>;
  if (severity === 'Medium') return <span>🟡</span>;
  return <span>🔵</span>;
}

function BlockerCard({ blocker }: { blocker: Blocker }) {
  const [expanded, setExpanded] = useState(false);

  const borderColor = blocker.severity === 'Critical'
    ? 'border-red-500/30'
    : blocker.severity === 'High'
    ? 'border-orange-500/30'
    : 'border-gray-700';

  const evidenceArray = Array.isArray(blocker.evidencePoints)
    ? blocker.evidencePoints
    : typeof blocker.evidencePoints === 'string'
    ? blocker.evidencePoints.split('\n').filter(Boolean)
    : [];

  return (
    <div className={`bg-[#1a1d27] border ${borderColor} rounded-2xl overflow-hidden`}>
      {/* Header — always visible */}
      <div
        className="px-6 py-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <SeverityIcon severity={blocker.severity} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-bold">
                  #{blocker.number} {blocker.name}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  blocker.severity === 'Critical'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {blocker.severity}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {blocker.whatIsBroken}
              </p>
            </div>
          </div>
          <span className="text-gray-500 shrink-0">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded — five brain analysis */}
      {expanded && (
        <div className="border-t border-gray-800 p-6 space-y-5">

          {/* Why This Is Happening — THE FIVE BRAINS */}
          <div className="space-y-2">
            <p className="text-xs text-cyan-400 uppercase tracking-wide font-bold">
              Why This Is Happening
            </p>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
              {blocker.whyItMatters}
            </p>
          </div>

          {/* The Cost */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-red-400 uppercase tracking-wide font-bold mb-1">
              What This Is Costing You
            </p>
            <p className="text-white text-sm leading-relaxed">
              {blocker.whatItMeansForYou}
            </p>
          </div>

          {/* Evidence */}
          {evidenceArray.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                The Evidence
              </p>
              <div className="space-y-1">
                {evidenceArray.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-gray-600 shrink-0 mt-0.5">•</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">JARVIS confidence:</p>
              <p className="text-cyan-400 font-bold text-sm">{blocker.confidence}%</p>
            </div>
            <Link
              href="/growth"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              See full breakdown in Growth →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChannelPage() {
  const [channelId, setChannelId] = useState("");
  const [creatorId] = useState("christine");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch(
          `/api/jarvis/channel-intelligence?userId=${creatorId}`
        );
        const data = await res.json();
        if (data.success) setResult(data);
      } catch {}
      finally { setLoadingExisting(false); }
    }
    loadExisting();
  }, []);

  const handleDiagnose = async () => {
    if (!channelId) {
      setError("Please enter your YouTube Channel ID.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jarvis/channel-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, creatorId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Diagnosis failed");
      setResult(data);
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

  const parseVideo = (v: any) => {
    if (typeof v === 'string') {
      const title = v.match(/title=([^;]+)/)?.[1] ?? '';
      const views = parseInt(v.match(/views=(\d+)/)?.[1] ?? '0');
      return { title, views };
    }
    return { title: v.title ?? '', views: v.views ?? 0 };
  };

  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading your diagnosis...</div>
      </div>
    );
  }

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
                YouTube Studio → Settings → Channel → Advanced settings → Channel ID
              </p>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleDiagnose}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors"
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
              Fetching videos, analyzing tags and descriptions, applying five intelligence lenses.
              About 30 seconds.
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
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-white">{result.channelName}</h2>
                    <HealthBadge health={result.overallHealth} />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {result.subscribers.toLocaleString()} subscribers
                    · {result.totalVideos} total videos
                    · Last upload: {result.lastUploadDays} days ago
                  </p>
                  <p className="text-white text-sm mt-2 italic">
                    "{result.oneLineSummary}"
                  </p>
                </div>
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg views</p>
                    <p className="text-2xl font-bold text-white">
                      {result.truths.averageViews}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gap ratio</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {result.truths.gapRatio}x
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why People Follow You */}
            <div className="bg-[#1a1d27] border border-yellow-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-yellow-500/20">
                <p className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">
                  Why People Follow You
                </p>
              </div>
              <div className="p-6">
                <p className="text-white text-sm leading-relaxed">
                  {result.truths.whyPeopleFollowYou}
                </p>
              </div>
            </div>

            {/* Creator DNA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-cyan-500/20">
                <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wide">
                  Creator DNA
                </p>
              </div>
              <div className="p-6 space-y-3">
                <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-6 py-3">
                  <p className="text-cyan-400 font-bold text-xl">
                    {result.truths.creatorDNA.creatorType}
                  </p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {result.truths.creatorDNA.interpretation}
                </p>
              </div>
            </div>

            {/* Channel Positioning */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <p className="text-white font-semibold text-sm uppercase tracking-wide">
                  Channel Positioning
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0f1117] rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">What you say you are</p>
                    <p className="text-white text-sm font-medium">
                      {result.truths.channelPositioning.whatYouSayYouAre}
                    </p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">What audience responds to</p>
                    <p className="text-white text-sm font-medium">
                      {result.truths.channelPositioning.whatAudienceRespondsTo}
                    </p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase mb-2">Alignment</p>
                    <p className={`text-4xl font-bold ${alignmentColor(result.truths.channelPositioning.alignmentScore)}`}>
                      {result.truths.channelPositioning.alignmentScore}%
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {result.truths.channelPositioning.interpretation}
                </p>
              </div>
            </div>

            {/* Problems Found — FIVE BRAIN DIAGNOSIS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">
                  {result.blockers.filter(b => b.severity === 'Critical').length} Critical Problems Found
                </p>
                <span className="text-xs text-gray-500">
                  Click any problem to see why it is happening
                </span>
              </div>
              {result.blockers.map((blocker: Blocker) => (
                <BlockerCard key={blocker.number} blocker={blocker} />
              ))}
            </div>

            {/* Cost of Drift */}
            <div className="bg-[#1a1d27] border border-red-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
                <p className="text-red-400 font-semibold text-sm uppercase tracking-wide">
                  Cost of Drift
                </p>
                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">
                  -{result.truths.costOfDrift.performanceLossPercent}% performance
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">When aligned</p>
                    <p className="text-3xl font-bold text-green-400">
                      {result.truths.costOfDrift.alignedAverageViews}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">avg views</p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">When misaligned</p>
                    <p className="text-3xl font-bold text-red-400">
                      {result.truths.costOfDrift.misalignedAverageViews}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">avg views</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {result.truths.costOfDrift.interpretation}
                </p>
              </div>
            </div>

            {/* Top + Bottom Videos */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">Top 3 Videos</p>
                </div>
                <div className="p-6 space-y-3">
                  {result.truths.topVideos.map((v: any, i: number) => {
                    const parsed = parseVideo(v);
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold text-sm w-5 shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{parsed.title}</p>
                          <p className="text-green-400 text-xs font-bold">{parsed.views.toLocaleString()} views</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">Bottom 3 Videos</p>
                </div>
                <div className="p-6 space-y-3">
                  {result.truths.bottomVideos.map((v: any, i: number) => {
                    const parsed = parseVideo(v);
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-red-400 font-bold text-sm w-5 shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{parsed.title}</p>
                          <p className="text-red-400 text-xs font-bold">{parsed.views.toLocaleString()} views</p>
                        </div>
                      </div>
                    );
                  })}
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
                  {(Array.isArray(result.truths.audienceLoves)
                    ? result.truths.audienceLoves
                    : String(result.truths.audienceLoves).split('\n').filter(Boolean)
                  ).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-green-400 font-bold text-xs">#{i + 1}</span>
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
                  {(Array.isArray(result.truths.audienceIgnores)
                    ? result.truths.audienceIgnores
                    : String(result.truths.audienceIgnores).split('\n').filter(Boolean)
                  ).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-red-400 font-bold text-xs">#{i + 1}</span>
                      <p className="text-white text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channel Drift */}
            <div className={`bg-[#1a1d27] border rounded-2xl overflow-hidden ${result.truths.channelDrift.detected ? 'border-red-500/30' : 'border-green-500/30'}`}>
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <p className="text-white font-semibold text-sm uppercase tracking-wide">Channel Drift</p>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${result.truths.channelDrift.detected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {result.truths.channelDrift.detected ? '⚠️ CRITICAL DRIFT' : '✅ ON TRACK'}
                </span>
              </div>
              <div className="p-6">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {result.truths.channelDrift.explanation}
                </p>
              </div>
            </div>

            {/* Biggest Opportunity */}
            <div className="bg-[#1a1d27] border border-purple-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20">
                <p className="text-purple-400 font-semibold text-sm uppercase tracking-wide">
                  Biggest Opportunity
                </p>
              </div>
              <div className="p-6">
                <p className="text-white text-sm leading-relaxed">
                  {result.truths.biggestOpportunity}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 text-center space-y-3">
              <p className="text-white font-bold text-lg">Now you know what is wrong.</p>
              <p className="text-gray-400 text-sm">
                See the full breakdown of every blocker — then ask JARVIS to fix them.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/growth"
                  className="inline-block bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  See All Blockers →
                </Link>
                <Link
                  href="/jarvis"
                  className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Ask JARVIS →
                </Link>
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Run diagnosis for a different channel
            </button>

            <p className="text-center text-xs text-gray-600">
              Last diagnosed: {new Date(result.savedAt).toLocaleDateString()}
            </p>

          </div>
        )}
      </div>
    </div>
  );
}
