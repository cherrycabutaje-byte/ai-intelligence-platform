"use client";

export default function ChannelPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium">
            🧬 Channel Diagnosis
          </div>
          <h1 className="text-3xl font-bold text-white">
            Who are you as a creator?
          </h1>
          <p className="text-gray-400">
            Your channel has a unique growth pattern.
            Channel Diagnosis will identify exactly what it is.
          </p>
        </div>

        {/* What this will show */}
        <div className="bg-[#1a1d27] border border-cyan-500/20 rounded-2xl p-6 space-y-3">
          <p className="text-white font-semibold">Channel Diagnosis will identify:</p>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              "What your audience loves",
              "What your audience ignores",
              "Which videos create growth",
              "Which videos create drift",
              "Your strongest creator pattern",
              "Your biggest growth opportunity"
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Channel Positioning */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">
              Channel Positioning
            </p>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0f1117] rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">What you say your channel is</p>
                <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3 mt-2" />
              </div>
              <div className="bg-[#0f1117] rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">What your audience responds to</p>
                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4 mt-2" />
              </div>
              <div className="bg-[#0f1117] rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Alignment</p>
                <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2 mt-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Creator DNA */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">
              Creator DNA
            </p>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="p-6 space-y-3">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase">Creator Type</p>
                <div className="h-6 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase">Confidence</p>
                <div className="h-6 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="bg-[#0f1117] rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase">Evidence Points</p>
                <div className="h-6 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Top + Bottom Performers */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Top Performers */}
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <p className="text-white font-semibold text-sm uppercase tracking-wide">
                Top 3 Videos
              </p>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm font-bold w-4">{i}</span>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 bg-gray-800 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Performers */}
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <p className="text-white font-semibold text-sm uppercase tracking-wide">
                Bottom 3 Videos
              </p>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm font-bold w-4">{i}</span>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 bg-gray-800 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audience Loves + Ignores */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <p className="text-white font-semibold text-sm uppercase tracking-wide">
                Audience Loves
              </p>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-3 bg-gray-800 rounded animate-pulse" style={{ width: `${85 - i * 12}%` }} />
              ))}
            </div>
          </div>

          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <p className="text-white font-semibold text-sm uppercase tracking-wide">
                Audience Ignores
              </p>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-3 bg-gray-800 rounded animate-pulse" style={{ width: `${85 - i * 12}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Channel Drift */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">
              Channel Drift
            </p>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
          </div>
        </div>

        {/* Biggest Opportunity */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">
              Biggest Opportunity
            </p>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3" />
          </div>
        </div>

      </div>
    </div>
  );
}
