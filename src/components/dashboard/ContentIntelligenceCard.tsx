import React from "react";
import type { ContentAnalysis } from "@/types/database";

interface Props {
  content: ContentAnalysis | null;
}

export function ContentIntelligenceCard({ content }: Props) {
  if (!content) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Content Intelligence
        </h2>

        <p className="text-zinc-400">
          No content analysis available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Content Intelligence
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase text-zinc-500">
            Video Title
          </p>
          <p className="text-white">
            {content.video_title}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-zinc-500">
            Channel
          </p>
          <p className="text-white">
            {content.channel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-zinc-500">
              Viral Score
            </p>
            <p className="text-2xl font-bold text-cyan-400">
              {content.viral_score ?? 0}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-zinc-500">
              Opportunity Score
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {content.opportunity_score ?? 0}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase text-zinc-500">
            Next Content Idea
          </p>
          <p className="text-white">
            {content.next_content_idea}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-zinc-500">
            Content Gap
          </p>
          <p className="text-zinc-300">
            {content.content_gap}
          </p>
        </div>
      </div>
    </div>
  );
}