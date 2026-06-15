// src/lib/products.ts

import { createClient } from './supabase'
import type { ProductAnalysis } from '@/types/database'

const TABLE = 'product_analysis' as const

export interface GetProductsOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: keyof ProductAnalysis
  sortOrder?: 'asc' | 'desc'
}

export interface GetProductsResult {
  data: ProductAnalysis[]
  count: number
  totalPages: number
  currentPage: number
}

export interface ProductQueryError {
  message: string
  code?: string
}

export type ProductResult<T> =
  | { data: T; error: null }
  | { data: null; error: ProductQueryError }

/**
 * Fetch paginated, searchable, sortable list of product analyses.
 */
export async function getProductAnalyses(
  options: GetProductsOptions = {}
): Promise<ProductResult<GetProductsResult>> {
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
        `product_title.ilike.%${search}%,platform.ilike.%${search}%`
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
        data: (data as ProductAnalysis[]) ?? [],
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
 * Fetch a single product analysis by ID.
 */
export async function getProductById(
  id: number
): Promise<ProductResult<ProductAnalysis>> {
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

    return { data: data as ProductAnalysis, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    }
  }
}