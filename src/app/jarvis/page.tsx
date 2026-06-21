"use client";
import Link from "next/link";

export default function JarvisPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🎯 JARVIS — Organic Growth Coach
          </div>
          <h1 className="text-4xl font-bold text-white">
            Stop guessing.<br />
            <span className="text-cyan-400">Start growing.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            JARVIS analyzes your content using the same frameworks behind the most viral videos on YouTube and TikTok.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Card 1 - Pre Upload - Free */}
          <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎬</span>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-medium">
                FREE
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pre-Upload Analysis</h2>
              <p className="text-gray-400 text-sm mt-1">
                Analyze your idea BEFORE you film. Get your hook script, title options, and filming checklist in 30 seconds.
              </p>
            </div>
            <div className="space-y-2">
              {[
                "Idea score 0-10",
                "3 title options using the Content Code",
                "Hook script ready to film",
                "Filming checklist",
                "Trend check for your niche"
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>
            <Link
              href="/jarvis/analyze"
              className="block w-full text-center bg-[#0f1117] hover:bg-white/5 border border-gray-600 hover:border-cyan-500/30 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Analyze My Idea →
            </Link>
          </div>

          {/* Card 2 - Content Code - Paid */}
          <div className="bg-[#1a1d27] border border-cyan-500/30 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚡</span>
              <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full font-medium">
                CONTENT CODE
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Full Video Brief</h2>
              <p className="text-gray-400 text-sm mt-1">
                Paste your transcript and get a complete coaching brief before you upload. Viral score, diagnosis, and PDF download.
              </p>
            </div>
            <div className="space-y-2">
              {[
                "Viral Score 0-10 (Jenny + MrBeast)",
                "Curiosity Stack diagnosis",
                "Stakes diagnosis",
                "Hook script rewrite",
                "Time bombs and open loops",
                "The line they will screenshot",
                "PDF download"
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-cyan-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>
            <Link
              href="/jarvis/brief"
              className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors"
            >
              Get My Content Code Brief →
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">How JARVIS Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Before You Film",
                desc: "Submit your idea. JARVIS scores it and gives you the exact hook script and filming checklist.",
                icon: "🎬",
                color: "text-green-400"
              },
              {
                step: "2",
                title: "Before You Upload",
                desc: "Paste your transcript. JARVIS gives you a viral score and tells you exactly what to fix.",
                icon: "⚡",
                color: "text-cyan-400"
              },
              {
                step: "3",
                title: "Watch Your Score Grow",
                desc: "Every week your viral score improves. JARVIS tracks your progress and unlocks new coaching.",
                icon: "📈",
                color: "text-purple-400"
              }
            ].map(item => (
              <div key={item.step} className="space-y-2">
                <div className={`text-2xl ${item.color}`}>{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Content Code */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">The Content Code</h3>
          <p className="text-gray-400 text-sm">
            JARVIS uses two frameworks combined into one system — the same mechanics behind the most viral content on every platform.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold text-sm">🔵 The Curiosity Code</p>
              <p className="text-gray-400 text-xs">Jenny Hoyos framework. Every second must earn the next second. Curiosity gets the click. Open loops keep them watching. Revelation makes them share.</p>
            </div>
            <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold text-sm">🔴 The Stakes Code</p>
              <p className="text-gray-400 text-xs">MrBeast framework. Nobody cares about content. People care about what is at risk. Stakes create investment. Investment creates loyalty.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
