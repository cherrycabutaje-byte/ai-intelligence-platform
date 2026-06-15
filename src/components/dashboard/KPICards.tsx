import React from "react";
import Link from "next/link";
import type { DashboardKPIs } from "@/types/database";

interface Props {
  kpis: DashboardKPIs;
}

function Card({
  title,
  value,
  href,
}: {
  title: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-cyan-500/50 hover:bg-zinc-800 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            {title}
          </p>
          <span className="text-gray-600 group-hover:text-cyan-400 transition-colors text-xs">
            →
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-white">
          {value}
        </p>
      </div>
    </Link>
  );
}

export default function KPICards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Total Sources"
        value={kpis.totalSources}
        href="/sources"
      />
      <Card
        title="Content Analyses"
        value={kpis.totalContentAnalyses}
        href="/content"
      />
      <Card
        title="Product Analyses"
        value={kpis.totalProductAnalyses}
        href="/products"
      />
      <Card
        title="Avg Opportunity Score"
        value={kpis.averageOpportunityScore}
        href="/growth"
      />
    </div>
  );
}