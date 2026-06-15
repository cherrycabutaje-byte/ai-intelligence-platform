'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import KPICards from '@/components/dashboard/KPICards';
import { ContentIntelligenceCard } from '@/components/dashboard/ContentIntelligenceCard';
import { ProductIntelligenceCard } from '@/components/dashboard/ProductIntelligenceCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { count: totalSources } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true });

      const { count: totalContent } = await supabase
        .from('content_analysis')
        .select('*', { count: 'exact', head: true });

      const { count: totalProducts } = await supabase
        .from('product_analysis')
        .select('*', { count: 'exact', head: true });

      const { data: latestContent } = await supabase
        .from('content_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: latestProduct } = await supabase
        .from('product_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: contentFeed } = await supabase
        .from('content_analysis')
        .select('id, created_at, video_title')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: productFeed } = await supabase
        .from('product_analysis')
        .select('id, created_at, product_title')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: contentScores } = await supabase
        .from('content_analysis')
        .select('opportunity_score');

      const scores = [
        ...(contentScores ?? []).map((x: any) => x.opportunity_score || 0),
      ];

      const averageOpportunityScore =
        scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0;

      const { data: lineRaw } = await supabase
        .from('content_analysis')
        .select('created_at, opportunity_score')
        .order('created_at', { ascending: true })
        .limit(30);

      const lineData = (lineRaw ?? []).map((item: any) => ({
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: item.opportunity_score ?? 0,
      }));

      const { data: contentByDay } = await supabase
        .from('content_analysis')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(50);

      const { data: productByDay } = await supabase
        .from('product_analysis')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(50);

      const barMap: Record<string, { content: number; product: number }> = {};

      (contentByDay ?? []).forEach((item: any) => {
        const d = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!barMap[d]) barMap[d] = { content: 0, product: 0 };
        barMap[d].content += 1;
      });

      (productByDay ?? []).forEach((item: any) => {
        const d = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!barMap[d]) barMap[d] = { content: 0, product: 0 };
        barMap[d].product += 1;
      });

      const barData = Object.entries(barMap)
        .slice(-10)
        .map(([date, val]) => ({ date, ...val }));

      const { data: growthRaw } = await supabase
        .from('growth_opportunities')
        .select('priority');

      const priorityMap: Record<string, number> = {};
      (growthRaw ?? []).forEach((item: any) => {
        const p = item.priority ?? 'unknown';
        priorityMap[p] = (priorityMap[p] ?? 0) + 1;
      });

      const pieData = Object.entries(priorityMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      setChartData({ lineData, barData, pieData });

      setData({
        kpis: {
          totalSources: totalSources ?? 0,
          totalContentAnalyses: totalContent ?? 0,
          totalProductAnalyses: totalProducts ?? 0,
          averageOpportunityScore,
        },
        latestContent,
        latestProduct,
        feed: [
          ...(contentFeed ?? []).map((item: any) => ({
            id: item.id,
            type: 'content',
            date: item.created_at,
            assetName: item.video_title,
          })),
          ...(productFeed ?? []).map((item: any) => ({
            id: item.id,
            type: 'product',
            date: item.created_at,
            assetName: item.product_title,
          })),
        ].sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      });
    }
    load();
  }, []);

  if (!data) return (
    <main className="min-h-screen bg-[#0f1117] p-6">
      <p className="text-white">Loading...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0f1117] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Intelligence Dashboard</h1>
          <p className="mt-2 text-zinc-400">Content & Product Intelligence Platform</p>
        </div>
        <KPICards kpis={data.kpis} />
        <DashboardCharts
          lineData={chartData?.lineData ?? []}
          barData={chartData?.barData ?? []}
          pieData={chartData?.pieData ?? []}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <ContentIntelligenceCard content={data.latestContent} />
          <ProductIntelligenceCard product={data.latestProduct} />
        </div>
        <ActivityFeed feed={data.feed} />
      </div>
    </main>
  );
}