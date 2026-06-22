"use client";
import { useState } from "react";
import Link from "next/link";

interface VideoData {
  videoId: string;
  title: string;
  views: number;
  durationSeconds: number;
  tags: string[];
  publishedAt: string;
}

interface Diagnosis {
  title: string;
  category: string;
  severity: string;
  patternId: string;
  jarvisNoticed: string;
  pattern: string;
  turningPoint: string;
  whyItMatters: string;
  proof: string[];
  whatJarvisCannotIgnore: string;
  evidenceStrength: string;
}

interface Observation {
  id: string;
  statement: string;
  evidence: string[];
}

interface Pattern {
  id: string;
  title: string;
  observations: string[];
  explanation: string;
}

interface V2Result {
  channelName: string;
  subscribers: number;
  totalVideos: number;
  lastUploadDays: number;
  overallHealth: string;
  oneLineSummary: string;
  evidence: {
    averageViews: number;
    topPerformerAverage: number;
    recentPerformerAverage: number;
    gapRatio: number;
    driftScore: number;
    topVideos: VideoData[];
    bottomVideos: VideoData[];
    allTimeTopVideo: VideoData | null;
    firstVideo: VideoData | null;
    topTags: string[];
  };
  diagnoses: Diagnosis[];
  debug: {
    observations: Observation[];
    patterns: Pattern[];
  };
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

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[severity] ?? colors['Medium']}`}>
      {severity}
    </span>
  );
}

function DiagnosisCard({
  diagnosis,
  number,
  observations,
  patterns,
  devMode,
}: {
  diagnosis: Diagnosis;
  number: number;
  observations: Observation[];
  patterns: Pattern[];
  devMode: boolean;
}) {
  const categoryIcon = diagnosis.category === 'identity' ? '🧬'
    : diagnosis.category === 'audience' ? '👥'
    : diagnosis.category === 'momentum' ? '📉'
    : '🔍';

  const relatedPattern = patterns.find(p => p.id === diagnosis.patternId);
  const relatedObs = relatedPattern
    ? observations.filter(o =>
        Array.isArray(relatedPattern.observations)
          ? (relatedPattern.observations as string[]).includes(o.id)
          : String(relatedPattern.observations).includes(o.id)
      )
    : [];

  const borderColor = diagnosis.severity === 'Critical'
    ? 'border-red-500/20'
    : diagnosis.severity === 'High'
    ? 'border-orange-500/20'
    : 'border-gray-700';

  return (
    <div className={`bg-[#1a1d27] border ${borderColor} rounded-2xl p-6 space-y-5`}>

      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{categoryIcon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold">
              Diagnosis #{number} — {diagnosis.title}
            </p>
            <SeverityBadge severity={diagnosis.severity} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{diagnosis.evidenceStrength}</p>
        </div>
      </div>

      {/* JARVIS Noticed */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">JARVIS Noticed</p>
        <p className="text-white text-sm leading-relaxed">{diagnosis.jarvisNoticed}</p>
      </div>

      {/* Pattern Found */}
      <div className="border-l-2 border-gray-700 pl-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pattern Found</p>
        <p className="text-gray-300 text-sm leading-relaxed">
          {relatedPattern ? relatedPattern.title : diagnosis.pattern}
        </p>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{diagnosis.pattern}</p>
      </div>

      {/* Turning Point */}
      <div className="border-l-2 border-yellow-500/40 pl-4">
        <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">The Turning Point</p>
        <p className="text-gray-300 text-sm leading-relaxed">{diagnosis.turningPoint}</p>
      </div>

      {/* Why It Matters */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Why It Matters</p>
        <p className="text-gray-300 text-sm leading-relaxed">{diagnosis.whyItMatters}</p>
      </div>

      {/* Proof */}
      <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">The Proof</p>
        {diagnosis.proof.map((point, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-cyan-400 text-xs shrink-0 mt-0.5">•</span>
            <p className="text-gray-300 text-sm">{point}</p>
          </div>
        ))}
      </div>

      {/* What JARVIS Cannot Ignore */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
        <p className="text-xs text-cyan-400 uppercase tracking-wide mb-2">
          What JARVIS Cannot Ignore
        </p>
        <p className="text-white text-sm leading-relaxed font-medium">
          {diagnosis.whatJarvisCannotIgnore}
        </p>
      </div>

      {/* Dev Mode — Evidence Chain */}
      {devMode && relatedPattern && (
        <div className="border border-gray-700 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Evidence Chain</p>
          {relatedObs.map(obs => (
            <div key={obs.id} className="space-y-1">
              <p className="text-xs text-purple-400 font-mono">{obs.id}</p>
              <p className="text-gray-400 text-xs">{obs.statement}</p>
            </div>
          ))}
          <div className="text-xs text-gray-600">↓</div>
          <div>
            <p className="text-xs text-blue-400 font-mono">{relatedPattern.id}</p>
            <p className="text-gray-400 text-xs">{relatedPattern.title}</p>
          </div>
          <div className="text-xs text-gray-600">↓</div>
          <p className="text-xs text-green-400 font-mono">Diagnosis #{number}</p>
        </div>
      )}

    </div>
  );
}

export default function ChannelPage() {
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<V2Result | null>(null);
  const [devMode, setDevMode] = useState(false);

  const handleDiagnose = async () => {
    if (!channelId.trim()) {
      setError('Please enter your YouTube Channel ID.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/jarvis/channel-intelligence-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelId.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? 'Diagnosis failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const costOfDrift = result ? {
    aligned: result.evidence.topPerformerAverage,
    misaligned: result.evidence.recentPerformerAverage,
    loss: result.evidence.topPerformerAverage > 0
      ? Math.round((1 - result.evidence.recentPerformerAverage / result.evidence.topPerformerAverage) * 100)
      : 0,
  } : null;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🧬 Channel Diagnosis
          </div>
          <h1 className="text-3xl font-bold">What does the data keep showing?</h1>
          <p className="text-gray-400">
            JARVIS studies your channel evidence and identifies the patterns you cannot see from inside.
          </p>
        </div>

        {/* Input */}
        {!result && !loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">
                YouTube Channel ID <span className="text-red-400">*</span>
              </label>
              <input
                value={channelId}
                onChange={e => setChannelId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDiagnose()}
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
            <p className="text-white font-semibold text-lg">Studying your channel...</p>
            <p className="text-gray-400 text-sm">
              Collecting evidence. Generating observations. Detecting patterns. About 30 seconds.
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
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-2xl font-bold">{result.channelName}</h2>
                    <HealthBadge health={result.overallHealth} />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {result.subscribers.toLocaleString()} subscribers
                    · {result.totalVideos} total videos
                    {result.lastUploadDays > 0 && ` · Last upload: ${result.lastUploadDays} days ago`}
                  </p>
                  <p className="text-gray-300 text-sm mt-2 italic">
                    "{result.oneLineSummary}"
                  </p>
                </div>
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg views</p>
                    <p className="text-2xl font-bold">{result.evidence.averageViews.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gap ratio</p>
                    <p className="text-2xl font-bold text-yellow-400">{result.evidence.gapRatio}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Drift</p>
                    <p className="text-2xl font-bold text-red-400">{result.evidence.driftScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost of Drift */}
            {costOfDrift && costOfDrift.aligned > 0 && (
              <div className="bg-[#1a1d27] border border-red-500/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-red-400 font-semibold text-xs uppercase tracking-wide">Cost of Drift</p>
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">
                    -{costOfDrift.loss}% performance
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Best content average</p>
                    <p className="text-3xl font-bold text-green-400">{costOfDrift.aligned.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">views</p>
                  </div>
                  <div className="bg-[#0f1117] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Recent content average</p>
                    <p className="text-3xl font-bold text-red-400">{costOfDrift.misaligned.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">views</p>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnoses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">What JARVIS Found</p>
                <button
                  onClick={() => setDevMode(!devMode)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    devMode
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300'
                  }`}
                >
                  {devMode ? '🔬 Evidence Chain ON' : '🔬 Show Evidence Chain'}
                </button>
              </div>
              {result.diagnoses.map((diagnosis, i) => (
                <DiagnosisCard
                  key={i}
                  diagnosis={diagnosis}
                  number={i + 1}
                  observations={result.debug?.observations ?? []}
                  patterns={result.debug?.patterns ?? []}
                  devMode={devMode}
                />
              ))}
            </div>

            {/* Top / Bottom Videos */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
                <p className="text-white font-semibold text-xs uppercase tracking-wide">What Works</p>
                {result.evidence.topVideos.map((v, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold text-xs w-5 shrink-0 mt-0.5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{v.title}</p>
                      <p className="text-green-400 text-xs font-bold">{v.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
                <p className="text-white font-semibold text-xs uppercase tracking-wide">What Does Not Work</p>
                {result.evidence.bottomVideos.map((v, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-red-400 font-bold text-xs w-5 shrink-0 mt-0.5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{v.title}</p>
                      <p className="text-red-400 text-xs font-bold">{v.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 text-center space-y-3">
              <p className="text-white font-bold text-lg">Now you know what the data shows.</p>
              <p className="text-gray-400 text-sm">Ask JARVIS what to do about it.</p>
              <Link
                href="/jarvis"
                className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl transition-colors"
              >
                Ask JARVIS →
              </Link>
            </div>

            <button
              onClick={() => { setResult(null); setChannelId(''); }}
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

