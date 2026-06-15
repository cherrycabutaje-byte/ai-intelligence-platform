// src/lib/sources.ts

import { createClient } from './supabase'
import type { Source, SourceInsert, SourceUpdate } from '@/types/database'

const TABLE = 'sources' as const

export interface GetSourcesOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: keyof Source
  sortOrder?: 'asc' | 'desc'
  status?: Source['status'] | 'all'
}

export interface GetSourcesResult {
  data: Source[]
  count: number
  totalPages: number
  currentPage: number
}

export interface SourceQueryError {
  message: string
  code?: string
}

export type SourceResult<T> =
  | { data: T; error: null }
  | { data: null; error: SourceQueryError }

/**
 * Fetch paginated, searchable, sortable list of sources.
 * RLS ensures users only see their own rows.
 */
export async function getSources(
  options: GetSourcesOptions = {}
): Promise<SourceResult<GetSourcesResult>> {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    status = 'all',
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
        `asset_name.ilike.%${search}%,platform.ilike.%${search}%,niche.ilike.%${search}%,category.ilike.%${search}%`
      )
    }

    if (status !== 'all') {
      query = query.eq('status', status)
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
        data: (data as Source[]) ?? [],
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
 * Fetch a single source by ID.
 */
export async function getSourceById(
  id: string
): Promise<SourceResult<Source>> {
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

    return { data: data as Source, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

/**
 * Create a new source — automatically attaches the current user's ID.
 */
export async function createSource(
  payload: SourceInsert
): Promise<SourceResult<Source>> {
  try {
    const supabase = createClient()

    // Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } }
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...payload, user_id: user.id })
      .select()
      .single()

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } }
    }

    return { data: data as Source, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

/**
 * Update an existing source.
 */
export async function updateSource(
  id: string,
  payload: SourceUpdate
): Promise<SourceResult<Source>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } }
    }

    return { data: data as Source, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}

/**
 * Delete a source by ID.
 */
export async function deleteSource(
  id: string
): Promise<SourceResult<{ id: string }>> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } }
    }

    return { data: { id }, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}
