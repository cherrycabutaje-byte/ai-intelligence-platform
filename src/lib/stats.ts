import { createClient } from './supabase'

const TABLE = 'source_stats' as const

export interface SourceStat {
  id: number
  user_id: string
  source_id: number
  recorded_date: string
  subscribers: number
  followers: number
  views: number
  likes: number
  comments: number
  shares: number
  watch_time_percent: number
  ctr_percent: number
  total_sales: number
  monthly_revenue: number
  units_sold: number
  reviews_count: number
  rating: number
  store_visitors: number
  notes: string | null
  created_at: string
}

export type SourceStatInsert = Omit<SourceStat, 'id' | 'created_at' | 'user_id'>

export interface StatQueryError {
  message: string
  code?: string
}

export type StatResult<T> =
  | { data: T; error: null }
  | { data: null; error: StatQueryError }

export async function upsertStat(
  stat: SourceStatInsert
): Promise<StatResult<SourceStat>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: { message: 'Not authenticated' } }
    const { data, error } = await supabase
      .from(TABLE)
      .upsert(
        { ...stat, user_id: user.id },
        { onConflict: 'user_id,source_id,recorded_date' }
      )
      .select()
      .single()
    if (error) return { data: null, error: { message: error.message } }
    return { data: data as SourceStat, error: null }
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : 'Unknown error' } }
  }
}

export async function getStats(
  source_id: number,
  days: number = 30
): Promise<StatResult<SourceStat[]>> {
  try {
    const supabase = createClient()
    const from = new Date()
    from.setDate(from.getDate() - days)
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('source_id', source_id)
      .gte('recorded_date', from.toISOString().split('T')[0])
      .order('recorded_date', { ascending: true })
    if (error) return { data: null, error: { message: error.message } }
    return { data: data as SourceStat[], error: null }
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : 'Unknown error' } }
  }
}

export async function getAllSourcesLatestStats(): Promise<StatResult<SourceStat[]>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('recorded_date', { ascending: false })
    if (error) return { data: null, error: { message: error.message } }
    const latest = new Map<number, SourceStat>()
    for (const stat of (data as SourceStat[])) {
      if (!latest.has(stat.source_id)) {
        latest.set(stat.source_id, stat)
      }
    }
    return { data: Array.from(latest.values()), error: null }
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : 'Unknown error' } }
  }
}

export function computeGrowth(stats: SourceStat[]) {
  if (stats.length < 2) return null
  const first = stats[0]
  const last = stats[stats.length - 1]
  const pct = (current: number, previous: number) =>
    previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100)
  return {
    subscribers: { value: last.subscribers, change: last.subscribers - first.subscribers, pct: pct(last.subscribers, first.subscribers) },
    followers: { value: last.followers, change: last.followers - first.followers, pct: pct(last.followers, first.followers) },
    views: { value: last.views, change: last.views - first.views, pct: pct(last.views, first.views) },
    likes: { value: last.likes, change: last.likes - first.likes, pct: pct(last.likes, first.likes) },
    comments: { value: last.comments, change: last.comments - first.comments, pct: pct(last.comments, first.comments) },
    total_sales: { value: last.total_sales, change: last.total_sales - first.total_sales, pct: pct(last.total_sales, first.total_sales) },
    monthly_revenue: { value: last.monthly_revenue, change: last.monthly_revenue - first.monthly_revenue, pct: pct(last.monthly_revenue, first.monthly_revenue) },
  }
}

export function getMilestones(stats: SourceStat[], platform: string) {
  if (stats.length === 0) return []
  const last = stats[stats.length - 1]
  const milestones = []
  if (platform === 'YouTube') {
    const subs = last.subscribers
    const targets = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000]
    for (const target of targets) {
      milestones.push({
        label: `${target.toLocaleString()} Subscribers`,
        target,
        current: subs,
        achieved: subs >= target,
        special: target === 1000 ? 'YouTube Partner eligibility!' : target === 10000 ? 'YouTube Partner Program!' : null
      })
    }
  }
  if (platform === 'TikTok') {
    const followers = last.followers
    const targets = [100, 1000, 5000, 10000, 50000, 100000]
    for (const target of targets) {
      milestones.push({
        label: `${target.toLocaleString()} Followers`,
        target,
        current: followers,
        achieved: followers >= target,
        special: target === 1000 ? 'TikTok Live access!' : null
      })
    }
  }
  if (platform === 'Instagram') {
    const followers = last.followers
    const targets = [100, 1000, 5000, 10000, 50000, 100000]
    for (const target of targets) {
      milestones.push({
        label: `${target.toLocaleString()} Followers`,
        target,
        current: followers,
        achieved: followers >= target,
        special: target === 10000 ? 'Instagram Swipe Up links!' : null
      })
    }
  }
  if (['Amazon', 'Etsy', 'Shopify'].includes(platform)) {
    const sales = last.total_sales
    const targets = [10, 50, 100, 500, 1000, 5000]
    for (const target of targets) {
      milestones.push({
        label: `${target.toLocaleString()} Sales`,
        target,
        current: sales,
        achieved: sales >= target,
        special: target === 100 ? 'Top Seller potential!' : null
      })
    }
  }
  return milestones
}
