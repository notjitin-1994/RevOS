import { createAdminClient } from './server'

export type Part = {
  id: string
  partNumber: string
  partName: string
  category: string
  make: string | null
  model: string | null
  usedFor: string
  onHandStock: number
  warehouseStock: number
  lowStockThreshold: number
  purchasePrice: number
  sellingPrice: number
  margin: number
  location: string | null
  supplier: string | null
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  createdAt: string
  updatedAt: string
}

export type PartsListResponse = {
  parts: Part[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export type PartsFilters = {
  search?: string
  category?: string
  stockStatus?: string
  page?: number
  pageSize?: number
}

/**
 * Fetches all parts with optional filtering, search, and pagination
 */
export async function getParts(filters: PartsFilters = {}): Promise<PartsListResponse> {
  const supabase = createAdminClient()

  const {
    search = '',
    category = '',
    stockStatus = '',
    page = 1,
    pageSize = 10,
  } = filters

  // Apply pagination and ordering
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build the complete query with ordering, pagination, and count
  let query = supabase
    .from('parts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Apply search filter (searches across multiple fields)
  if (search) {
    query = query.or(`part_name.ilike.%${search}%,part_number.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%`)
  }

  // Apply category filter
  if (category) {
    query = query.eq('category', category)
  }

  // Apply stock status filter
  if (stockStatus) {
    // Map UI values to database values
    const statusMap: Record<string, string> = {
      'In Stock': 'in-stock',
      'Low Stock': 'low-stock',
      'Out of Stock': 'out-of-stock',
    }
    query = query.eq('stock_status', statusMap[stockStatus] || stockStatus)
  }

  // Execute query (returns both data and count)
  const { data: parts, count, error } = await query

  if (error) {
    console.error('Error fetching parts:', error)
    throw new Error(`Failed to fetch parts: ${error.message}`)
  }

  // Transform database rows to match frontend interface
  const transformedParts: Part[] = (parts || []).map((part) => ({
    id: part.id,
    partNumber: part.part_number,
    partName: part.part_name,
    category: part.category,
    make: part.make,
    model: part.model,
    usedFor: part.used_for,
    onHandStock: part.on_hand_stock,
    warehouseStock: part.warehouse_stock,
    lowStockThreshold: part.low_stock_threshold,
    purchasePrice: parseFloat(part.purchase_price),
    sellingPrice: parseFloat(part.selling_price),
    margin: parseFloat(part.profit_margin_pct || '0'),
    location: part.location,
    supplier: part.supplier,
    status: part.stock_status as 'in-stock' | 'low-stock' | 'out-of-stock',
    createdAt: part.created_at,
    updatedAt: part.updated_at,
  }))

  return {
    parts: transformedParts,
    totalCount: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Fetches a single part by ID
 */
export async function getPartById(partId: string): Promise<Part | null> {
  const supabase = createAdminClient()

  const { data: part, error } = await supabase
    .from('parts')
    .select('*')
    .eq('id', partId)
    .single()

  if (error) {
    console.error('Error fetching part:', error)
    throw new Error(`Failed to fetch part: ${error.message}`)
  }

  if (!part) {
    return null
  }

  return {
    id: part.id,
    partNumber: part.part_number,
    partName: part.part_name,
    category: part.category,
    make: part.make,
    model: part.model,
    usedFor: part.used_for,
    onHandStock: part.on_hand_stock,
    warehouseStock: part.warehouse_stock,
    lowStockThreshold: part.low_stock_threshold,
    purchasePrice: parseFloat(part.purchase_price),
    sellingPrice: parseFloat(part.selling_price),
    margin: parseFloat(part.profit_margin_pct || '0'),
    location: part.location,
    supplier: part.supplier,
    status: part.stock_status as 'in-stock' | 'low-stock' | 'out-of-stock',
    createdAt: part.created_at,
    updatedAt: part.updated_at,
  }
}

/**
 * Fetches unique categories from parts
 */
export async function getPartsCategories(): Promise<string[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('parts')
    .select('category')
    .not('category', 'is', null)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = [...new Set(data?.map((d) => d.category) || [])]
  return categories.sort()
}

/**
 * Fetches low stock parts (on_hand_stock <= low_stock_threshold)
 */
export async function getLowStockParts(): Promise<Part[]> {
  const supabase = createAdminClient()

  const { data: parts, error } = await supabase
    .from('parts')
    .select('*')
    .lte('on_hand_stock', 'low_stock_threshold')
    .order('on_hand_stock', { ascending: true })

  if (error) {
    console.error('Error fetching low stock parts:', error)
    throw new Error(`Failed to fetch low stock parts: ${error.message}`)
  }

  return (parts || []).map((part) => ({
    id: part.id,
    partNumber: part.part_number,
    partName: part.part_name,
    category: part.category,
    make: part.make,
    model: part.model,
    usedFor: part.used_for,
    onHandStock: part.on_hand_stock,
    warehouseStock: part.warehouse_stock,
    lowStockThreshold: part.low_stock_threshold,
    purchasePrice: parseFloat(part.purchase_price),
    sellingPrice: parseFloat(part.selling_price),
    margin: parseFloat(part.profit_margin_pct || '0'),
    location: part.location,
    supplier: part.supplier,
    status: part.stock_status as 'in-stock' | 'low-stock' | 'out-of-stock',
    createdAt: part.created_at,
    updatedAt: part.updated_at,
  }))
}
