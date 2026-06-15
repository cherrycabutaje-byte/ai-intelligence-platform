// src/lib/content.ts

import { createClient } from './supabase'
import type { ContentAnalysis } from '@/types/database'

const TABLE = 'content_analysis' as const

export interface GetContentOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ContentResult<T> {
  data: T | null
  error: { message: string; code?: string } | null
}

export interface GetContentResult {
  data: ContentAnalysis[]
  count: number
  totalPages: number
  currentPage: number
}

/**
 * Fetch paginated, searchable, sortable list of content analyses.
 */
export async function getContentAnalyses(
  options: GetContentOptions = {}
): Promise<ContentResult<GetContentResult>> {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
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
        `video_title.ilike.%${search}%,channel.ilike.%${search}%,platform.ilike.%${search}%`
      )
    }

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
        data: (data as ContentAnalysis[]) ?? [],
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

/**
 * Fetch a single content analysis by ID.
 */
export async function getContentById(
  id: number
): Promise<ContentResult<ContentAnalysis>> {
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

    return { data: data as ContentAnalysis, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}