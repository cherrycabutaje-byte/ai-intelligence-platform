import { createClient } from './supabase'
import type { GrowthOpportunity } from '@/types/database'

const TABLE = 'growth_opportunities' as const

export interface GetGrowthOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: keyof GrowthOpportunity
  sortOrder?: 'asc' | 'desc'
  status?: string
  priority?: string
}

export interface GetGrowthResult {
  data: GrowthOpportunity[]
  count: number
  totalPages: number
  currentPage: number
}

export interface GrowthQueryError {
  message: string
  code?: string
}

export type GrowthResult<T> =
  | { data: T; error: null }
  | { data: null; error: GrowthQueryError }

export async function getGrowthOpportunities(
  options: GetGrowthOptions = {}
): Promise<GrowthResult<GetGrowthResult>> {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    status = 'all',
    priority = 'all',
  } = options

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const supabase = createClient()
    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })

    if (search.trim()) {
      query = query.or(
        `opportunity_type.ilike.%${search}%,recommendation.ilike.%${search}%,monetization_potential.ilike.%${search}%`
      )
    }

    if (status !== 'all') query = query.eq('status', status)
    if (priority !== 'all') query = query.eq('priority', priority)

    query = query
      .order(sortBy as string, { ascending: sortOrder === 'asc' })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } }
    }

    const totalPages = Math.ceil((count ?? 0) / pageSize)
    return {
      data: {
        data: (data as GrowthOpportunity[]) ?? [],
        count: count ?? 0,
        totalPages,
        currentPage: page,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

export async function getGrowthById(
  id: number
): Promise<GrowthResult<GrowthOpportunity>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } }
    }
    return { data: data as GrowthOpportunity, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

export async function deleteGrowthOpportunity(
  id: number
): Promise<GrowthResult<null>> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } }
    }
    return { data: null, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}
