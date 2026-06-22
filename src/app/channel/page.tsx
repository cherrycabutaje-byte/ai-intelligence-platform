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

interface IntelligencePattern {
  id: string;
  observation: string;
  confidence: number;
}

interface Hypothesis {
  explanation: string;
  confidence: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
}

interface CoreMechanism {
  name: string;
  mechanismType: string;
  creatorTranslation: string;
  description: string;
  evidence: string[];
  confidence: number;
  mechanismStrength: number;
}

interface Contradiction {
  creatorBelief: string;
  audienceBehavior: string;
  insight: string;
}

interface BlindSpot {
  insight: string;
  confidence: number;
  reasoning: string;
  passesNonObvious: boolean;
  passesEvidenceBased: boolean;
  passesPerspectiveShift: boolean;
}

interface ChannelIntelligence {
  executiveSummary: string;
  evidence: string[];
  patterns: IntelligencePattern[];
  hypotheses: Hypothesis[];
  coreMechanisms: CoreMechanism[];
  contradictions: Contradiction[];
  blindSpots: BlindSpot[];
  missingEvidence: string[];
  strategicTension: string;
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
  intelligence: ChannelIntelligence;
  debug?: {
    observations: any[];
    patterns: any[];
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

function ConfidenceBar({ value, label }: { value: number; label?: string }) {
  const color = value >= 75 ? 'bg-green-400' : value >= 50 ? 'bg-yellow-400' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>}
      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{value}%</span>
    </div>
  );
}

function Section({ title, icon, children, accent }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={`bg-[#1a1d27] border ${accent ?? 'border-gray-800'} rounded-2xl p-6 space-y-4`}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="text-white font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ChannelPage() {
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<V2Result | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!result) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch("/api/jarvis/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JARVIS-${result.channelName.replace(/\s+/g, "-")}-Intelligence-Report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDiagnose = async () => {
    if (!channelId.trim()) { setError('Please enter your YouTube Channel ID.'); return; }
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
      if (!data.success) throw new Error(data.message ?? 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const intel = result?.intelligence;
  const ev = result?.evidence;

  const costOfDrift = ev ? {
    aligned: ev.topPerformerAverage,
    misaligned: ev.recentPerformerAverage,
    loss: ev.topPerformerAverage > 0
      ? Math.round((1 - ev.recentPerformerAverage / ev.topPerformerAverage) * 100)
      : 0,
  } : null;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🧬 Channel Intelligence
          </div>
          <h1 className="text-3xl font-bold">What is your channel actually doing?</h1>
          <p className="text-gray-400">JARVIS studies the evidence and finds what you cannot see from inside.</p>
        </div>

        {/* Input */}
        {!result && !loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">YouTube Channel ID <span className="text-red-400">*</span></label>
              <input
                value={channelId}
                onChange={e => setChannelId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDiagnose()}
                placeholder="e.g. UCKzIKD_YEqELez3Y5Vl1-3A"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
              <p className="text-xs text-gray-600">YouTube Studio → Settings → Channel → Advanced → Channel ID</p>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
            <button onClick={handleDiagnose} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors">
              Run Channel Intelligence →
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl px-6 py-16 text-center space-y-3">
            <div className="text-4xl animate-pulse">🧬</div>
            <p className="text-white font-semibold text-lg">Studying your channel...</p>
            <p className="text-gray-400 text-sm">Collecting evidence. Detecting patterns. Finding mechanisms. About 45 seconds.</p>
          </div>
        )}

        {/* Results */}
        {result && intel && ev && (
          <div className="space-y-5">

            {/* Channel Header */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-2xl font-bold">{result.channelName}</h2>
                    <HealthBadge health={result.overallHealth} />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {result.subscribers.toLocaleString()} subscribers · {result.totalVideos} videos
                    {result.lastUploadDays > 0 && ` · ${result.lastUploadDays} days since last upload`}
                  </p>
                </div>
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg views</p>
                    <p className="text-2xl font-bold">{ev.averageViews.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gap ratio</p>
                    <p className="text-2xl font-bold text-yellow-400">{ev.gapRatio}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Drift</p>
                    <p className="text-2xl font-bold text-red-400">{ev.driftScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dev mode toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setDevMode(!devMode)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${devMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
              >
                {devMode ? '🔬 Analyst Mode ON' : '🔬 Analyst Mode'}
              </button>
            </div>

            {/* Executive Summary */}
            <Section title="What JARVIS Found" icon="🧠" accent="border-cyan-500/20">
              <p className="text-gray-200 text-base leading-relaxed">{intel.executiveSummary}</p>
            </Section>

            {/* Cost of Drift */}
            {costOfDrift && costOfDrift.aligned > 0 && (
              <Section title="Cost of Drift" icon="📉" accent="border-red-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">
                    -{costOfDrift.loss}% performance gap
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
              </Section>
            )}

            {/* Evidence */}
            {devMode && (
              <Section title="Evidence" icon="📊">
                <div className="space-y-2">
                  {intel.evidence.map((fact, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 text-xs shrink-0 mt-0.5 font-mono">E{i + 1}</span>
                      <p className="text-gray-300 text-sm">{fact}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Patterns */}
            {devMode && intel.patterns.length > 0 && (
              <Section title="Patterns Detected" icon="🔁">
                <div className="space-y-3">
                  {intel.patterns.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-gray-300 text-sm">{p.observation}</p>
                      <ConfidenceBar value={p.confidence} label={p.id} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Hypotheses */}
            {intel.hypotheses.length > 0 && (
              <Section title="Possible Explanations" icon="🔍">
                <div className="space-y-4">
                  {intel.hypotheses.map((h, i) => (
                    <div key={i} className="border border-gray-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-white text-sm font-medium">{h.explanation}</p>
                        <span className="text-xs text-gray-500 shrink-0">{h.confidence}%</span>
                      </div>
                      <ConfidenceBar value={h.confidence} />
                      {devMode && (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="text-xs text-green-400 mb-1">Evidence For</p>
                            {h.evidenceFor.map((e, j) => (
                              <p key={j} className="text-gray-400 text-xs">• {e}</p>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-red-400 mb-1">Evidence Against</p>
                            {h.evidenceAgainst.map((e, j) => (
                              <p key={j} className="text-gray-400 text-xs">• {e}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Core Mechanisms */}
            {intel.coreMechanisms.length > 0 && (
              <Section title="What Your Content Is Actually Doing" icon="⚙️" accent="border-purple-500/20">
                <div className="space-y-4">
                  {[...intel.coreMechanisms]
                    .sort((a, b) => b.mechanismStrength - a.mechanismStrength)
                    .map((m, i) => (
                      <div key={i} className="bg-[#0f1117] rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
                              {m.mechanismType}
                            </span>
                            {devMode && <span className="text-xs text-gray-500 font-mono">{m.name}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Strength</span>
                            <span className="text-sm font-bold text-purple-400">{m.mechanismStrength}%</span>
                          </div>
                        </div>
                        <p className="text-white text-base leading-relaxed">{m.creatorTranslation}</p>
                        {devMode && (
                          <>
                            <p className="text-gray-400 text-sm leading-relaxed">{m.description}</p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Evidence</p>
                              {m.evidence.map((e, j) => (
                                <p key={j} className="text-gray-400 text-xs">• {e}</p>
                              ))}
                            </div>
                            <ConfidenceBar value={m.confidence} label="Confidence" />
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </Section>
            )}

            {/* Contradictions */}
            {intel.contradictions.length > 0 && (
              <Section title="What The Data Contradicts" icon="⚡" accent="border-yellow-500/20">
                <div className="space-y-4">
                  {intel.contradictions.map((c, i) => (
                    <div key={i} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#0f1117] rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">What the channel says</p>
                          <p className="text-gray-300 text-sm">{c.creatorBelief}</p>
                        </div>
                        <div className="bg-[#0f1117] rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">What the data shows</p>
                          <p className="text-gray-300 text-sm">{c.audienceBehavior}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-yellow-300 text-sm font-medium">{c.insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Blind Spots */}
            {intel.blindSpots.length > 0 && (
              <Section title="What JARVIS Cannot Ignore" icon="🔦" accent="border-cyan-500/20">
                <div className="space-y-4">
                  {intel.blindSpots.map((b, i) => (
                    <div key={i} className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5 space-y-3">
                      <p className="text-white text-base font-medium leading-relaxed">{b.insight}</p>
                      {devMode && (
                        <>
                          <p className="text-gray-400 text-sm leading-relaxed">{b.reasoning}</p>
                          <ConfidenceBar value={b.confidence} label="Confidence" />
                          <div className="flex gap-3 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${b.passesNonObvious ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30'}`}>
                              Non-Obvious
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${b.passesEvidenceBased ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30'}`}>
                              Evidence-Based
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${b.passesPerspectiveShift ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30'}`}>
                              Perspective Shift
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Strategic Tension */}
            {intel.strategicTension && (
              <Section title="The Strategic Tension" icon="⚖️">
                <p className="text-gray-300 text-base leading-relaxed">{intel.strategicTension}</p>
              </Section>
            )}

            {/* Missing Evidence */}
            {devMode && intel.missingEvidence.length > 0 && (
              <Section title="What JARVIS Cannot Determine" icon="❓">
                <div className="space-y-2">
                  {intel.missingEvidence.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gray-600 text-xs shrink-0 mt-0.5">•</span>
                      <p className="text-gray-400 text-sm">{m}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Top / Bottom Videos */}
            <div className="grid md:grid-cols-2 gap-5">
              <Section title="What Works" icon="✅">
                <div className="space-y-3">
                  {ev.topVideos.map((v, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-cyan-400 font-bold text-xs w-5 shrink-0 mt-0.5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{v.title}</p>
                        <p className="text-green-400 text-xs font-bold">{v.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="What Does Not Work" icon="❌">
                <div className="space-y-3">
                  {ev.bottomVideos.map((v, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-red-400 font-bold text-xs w-5 shrink-0 mt-0.5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{v.title}</p>
                        <p className="text-red-400 text-xs font-bold">{v.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* CTA */}
            <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 text-center space-y-3">
              <p className="text-white font-bold text-lg">Now you know what the data shows.</p>
              <p className="text-gray-400 text-sm">Ask JARVIS what to do about it.</p>
              <Link href="/jarvis" className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl transition-colors">
                Ask JARVIS →
              </Link>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full bg-[#1a1d27] hover:bg-[#22263a] border border-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {downloadingPdf ? "Generating PDF..." : "⬇ Download Intelligence Report (PDF)"}
            </button>
            <button
              onClick={() => { setResult(null); setChannelId(''); }}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Analyze a different channel
            </button>

          </div>
        )}
      </div>
    </div>
  );
}



