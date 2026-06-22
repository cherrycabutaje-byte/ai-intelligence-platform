"use client";
import { useState } from "react";

const PLATFORMS = ["YouTube", "YouTube Shorts", "TikTok", "Instagram Reels", "Instagram Feed", "Facebook", "Pinterest"];

interface VideoData {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  likes: number;
  channelTitle: string;
  thumbnail: string;
}

interface BriefResult {
  hooks: string[];
  titles: string[];
  brief: string;
  keyInsights: string[];
}

export default function BriefPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [platform, setPlatform] = useState('YouTube');
  const [transcript, setTranscript] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleFetchVideo = async () => {
    if (!videoUrl.trim()) return;
    setFetchingVideo(true);
    setError(null);
    setVideoData(null);
    try {
      const res = await fetch('/api/jarvis/video-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? 'Could not fetch video');
      setVideoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch video');
    } finally {
      setFetchingVideo(false);
    }
  };

  const handleAnalyze = async () => {
    if (!videoData && !transcript) {
      setError('Please add a video URL or paste a transcript.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/jarvis/video-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData,
          platform,
          transcript,
          goal,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? 'Analysis failed');
      setResult(data.brief);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong'; console.error('Brief error:', errMsg); setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result || !videoData) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/jarvis/export-video-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoData, platform, result }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JARVIS-Video-Brief-${videoData.title.slice(0, 30).replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDF download failed');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🎬 Video Brief
          </div>
          <h1 className="text-3xl font-bold">Analyze any video</h1>
          <p className="text-gray-400">Paste a YouTube URL and JARVIS will generate hooks, titles, and a full content brief.</p>
        </div>

        {!result && (
          <div className="space-y-4">

            {/* Video URL */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">YouTube Video URL</label>
                <div className="flex gap-2">
                  <input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFetchVideo()}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={handleFetchVideo}
                    disabled={fetchingVideo || !videoUrl.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-3 rounded-xl transition-colors text-sm"
                  >
                    {fetchingVideo ? '...' : 'Fetch'}
                  </button>
                </div>
              </div>

              {/* Video preview */}
              {videoData && (
                <div className="bg-[#0f1117] rounded-xl p-4 flex gap-4">
                  {videoData?.thumbnail && (
                    <img src={videoData?.thumbnail} alt="" className="w-28 h-16 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{videoData?.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{videoData?.channelTitle}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-gray-400">{videoData?.views?.toLocaleString()} views</span>
                      <span className="text-xs text-gray-400">{videoData?.likes?.toLocaleString()} likes</span>
                    </div>
                  </div>
                  <button onClick={() => setVideoData(null)} className="text-gray-600 hover:text-gray-400 text-xs">✕</button>
                </div>
              )}
            </div>

            {/* Platform */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
              <label className="text-sm text-gray-300 font-medium">Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      platform === p
                        ? 'bg-cyan-500 text-black'
                        : 'bg-[#0f1117] text-gray-400 border border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
              <label className="text-sm text-gray-300 font-medium">What is this video trying to do? <span className="text-gray-600">(optional)</span></label>
              <input
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Drive subscribers, sell a product, go viral, educate my audience"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Transcript */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
              <label className="text-sm text-gray-300 font-medium">
                Transcript or script <span className="text-gray-600">(optional but improves analysis)</span>
              </label>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Paste your video transcript or script here..."
                rows={6}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || (!videoData && !transcript)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors text-base"
            >
              {loading ? 'Analyzing...' : 'Analyze This Video →'}
            </button>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl px-6 py-16 text-center space-y-3">
            <div className="text-4xl animate-pulse">🎬</div>
            <p className="text-white font-semibold text-lg">Analyzing your video...</p>
            <p className="text-gray-400 text-sm">Generating hooks, titles, and content brief. About 20 seconds.</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">

            {/* Video header */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 flex gap-4">
              {videoData?.thumbnail && (
                <img src={videoData?.thumbnail} alt="" className="w-32 h-20 object-cover rounded-xl shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{videoData?.title}</p>
                <p className="text-gray-500 text-sm mt-1">{videoData?.channelTitle} · {platform}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-cyan-400 font-bold">{videoData?.views?.toLocaleString()} views</span>
                  <span className="text-xs text-gray-400">{videoData?.likes?.toLocaleString()} likes</span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {result.keyInsights?.length > 0 && (
              <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 space-y-3">
                <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-wide">What JARVIS Noticed</h3>
                <div className="space-y-2">
                  {result.keyInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 text-xs mt-0.5">•</span>
                      <p className="text-gray-200 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hooks */}
            {result.hooks?.length > 0 && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wide">Hook Options</h3>
                <div className="space-y-2">
                  {result.hooks.map((hook, i) => (
                    <div key={i} className="bg-[#0f1117] rounded-xl p-4 flex items-start justify-between gap-3 group">
                      <div className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold text-xs w-5 shrink-0 mt-0.5">#{i + 1}</span>
                        <p className="text-gray-200 text-sm leading-relaxed">{hook}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(hook)}
                        className="text-gray-600 hover:text-gray-300 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Titles */}
            {result.titles?.length > 0 && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wide">Title Options</h3>
                <div className="space-y-2">
                  {result.titles.map((title, i) => (
                    <div key={i} className="bg-[#0f1117] rounded-xl p-4 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400 font-bold text-xs w-5 shrink-0">#{i + 1}</span>
                        <p className="text-gray-200 text-sm">{title}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(title)}
                        className="text-gray-600 hover:text-gray-300 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brief */}
            {result.brief && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wide">Content Brief</h3>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result.brief}</div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full bg-[#1a1d27] hover:bg-[#22263a] border border-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {downloadingPdf ? 'Generating PDF...' : '⬇ Download Brief as PDF'}
              </button>
              <button
                onClick={() => { setResult(null); setVideoData(null); setVideoUrl(''); setTranscript(''); setGoal(''); }}
                className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
              >
                Analyze another video
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}





