"use client";
import Link from "next/link";

export default function ChannelPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🧬 Channel Diagnosis
          </div>
          <h1 className="text-4xl font-bold text-white">
            Who are you as a creator?
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Understand your Creator DNA, your strongest patterns,
            and exactly where your channel is drifting.
          </p>
        </div>

        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-4xl">🧬</div>
          <p className="text-white font-semibold text-xl">
            Channel Diagnosis is being built.
          </p>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            This will show your Creator DNA, audience patterns,
            top and bottom performing content, channel drift,
            and your biggest opportunity — all without advice.
            Just evidence.
          </p>
          <div className="pt-4">
            <Link
              href="/jarvis"
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Go to JARVIS →
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🧬", title: "Creator DNA", desc: "Your strongest proven patterns with confidence scores." },
            { icon: "❤️", title: "Audience Loves", desc: "Topics and formats your audience consistently responds to." },
            { icon: "📉", title: "Channel Drift", desc: "Whether your recent content is moving toward or away from your strongest patterns." }
          ].map(item => (
            <div key={item.title} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 space-y-2">
              <div className="text-2xl">{item.icon}</div>
              <p className="text-white font-semibold text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
