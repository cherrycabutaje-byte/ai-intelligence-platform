"use client";
import Link from "next/link";

export default function JarvisPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🎯 JARVIS — Creator Intelligence Platform
          </div>
          <h1 className="text-4xl font-bold text-white">
            Know What To Make Next.
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            JARVIS analyzes your ideas, scripts, and channel patterns
            to tell you what will give you the best chance of growth.
          </p>
        </div>

        {/* Three Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Card 1 — Idea Intelligence */}
          <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💡</span>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-medium">
                FREE
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Idea Intelligence
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Find your best next video before you waste time filming.
              </p>
            </div>
            <div className="space-y-2 flex-1">
              {[
                "Score your idea 0-10",
                "Find stronger angles",
                "3 title options",
                "Hook recommendations",
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
              className="block w-full text-center bg-[#0f1117] hover:bg-white/5 border border-gray-600 hover:border-cyan-500/30 text-white font-medium py-3 rounded-xl transition-colors mt-auto"
            >
              Analyze My Idea →
            </Link>
          </div>

          {/* Card 2 — Content Intelligence */}
          <div className="bg-[#1a1d27] border border-cyan-500/30 rounded-2xl p-6 space-y-4 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚡</span>
              <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full font-medium">
                CONTENT CODE
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Content Intelligence
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Find exactly why a video will win or lose before you publish.
              </p>
            </div>
            <div className="space-y-2 flex-1">
              {[
                "Viral Score 0-10",
                "Curiosity diagnosis",
                "Stakes diagnosis",
                "Strategic reasoning",
                "PDF export"
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-cyan-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>
            <Link
              href="/jarvis/brief"
              className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors mt-auto"
            >
              Analyze My Script →
            </Link>
          </div>

          {/* Card 3 — Creator DNA (Coming Soon) */}
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4 opacity-75 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🧬</span>
              <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-medium">
                COMING SOON
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Creator DNA
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Discover the patterns that consistently drive growth on your channel.
              </p>
            </div>
            <div className="space-y-2 flex-1">
              {[
                "Strongest creator patterns",
                "Channel positioning",
                "Growth opportunities",
                "Personalized coaching",
                "Weekly intelligence"
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-purple-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>
            <div className="block w-full text-center bg-[#0f1117] border border-gray-700 text-gray-500 font-medium py-3 rounded-xl cursor-not-allowed mt-auto">
              Coming in Phase 8B
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">The JARVIS Workflow</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                icon: "💡",
                title: "Start with an idea",
                desc: "Submit your video idea. JARVIS scores it and gives you the exact hook script and filming checklist before you press record.",
                color: "text-green-400"
              },
              {
                step: "2",
                icon: "⚡",
                title: "Analyze your script",
                desc: "Paste your transcript. JARVIS gives you a viral score, a full curiosity and stakes diagnosis, and a PDF brief before you upload.",
                color: "text-cyan-400"
              },
              {
                step: "3",
                icon: "🧬",
                title: "Understand your channel",
                desc: "JARVIS builds your creator DNA over time — your strongest patterns, your best angles, your growth opportunities.",
                color: "text-purple-400"
              }
            ].map(item => (
              <div key={item.step} className="space-y-2">
                <div className={`text-2xl`}>{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Content Code */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Powered by The Content Code</h3>
          <p className="text-gray-400 text-sm">
            Two frameworks combined into one system — the same mechanics behind the most viral content on every platform.
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
