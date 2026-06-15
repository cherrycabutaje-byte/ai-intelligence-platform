import React from "react";
import type { FeedItem } from "@/types/database";

interface Props {
  feed: FeedItem[];
}

export function ActivityFeed({ feed }: Props) {
  if (feed.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Recent Activity
        </h2>
        <p className="text-zinc-400">No activity available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Recent Activity
      </h2>
      <div className="space-y-3">
        {feed.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="rounded-lg border border-zinc-700 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-zinc-500">{item.type}</span>
              <span className="text-xs text-zinc-500">{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 text-white">{item.assetName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
