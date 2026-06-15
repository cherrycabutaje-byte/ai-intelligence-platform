// src/lib/queries.ts

import { createClient } from './supabase'

export async function fetchDashboardData() {
  const supabase = createClient()

  const { count: totalSources } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true })

  const { count: totalContent } = await supabase
    .from('content_analysis')
    .select('*', { count: 'exact', head: true })

  const { count: totalProducts } = await supabase
    .from('product_analysis')
    .select('*', { count: 'exact', head: true })

  const { data: latestContent } = await supabase
    .from('content_analysis')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: latestProduct } = await supabase
    .from('product_analysis')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: contentFeed } = await supabase
    .from('content_analysis')
    .select('id, created_at, video_title')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: productFeed } = await supabase
    .from('product_analysis')
    .select('id, created_at, product_title')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: contentScores } = await supabase
    .from('content_analysis')
    .select('opportunity_score')

  const { data: productScores } = await supabase
    .from('product_analysis')
    .select('opportunity_score')

  const scores = [
    ...(contentScores ?? []).map((x: any) => x.opportunity_score || 0),
    ...(productScores ?? []).map((x: any) => x.opportunity_score || 0),
  ]

  const averageOpportunityScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

  return {
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
        type: 'content' as const,
        date: item.created_at,
        assetName: item.video_title,
      })),
      ...(productFeed ?? []).map((item: any) => ({
        id: item.id,
        type: 'product' as const,
        date: item.created_at,
        assetName: item.product_title,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  }
}