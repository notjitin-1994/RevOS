import { createClient, createAdminClient } from './server'

export type Motorcycle = {
  id: string
  make: string
  model: string
  year_start: number
  year_end: number | null
  country_of_origin: string
  category: string
  engine_displacement_cc: number
  production_status: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type MakeData = {
  id: string
  name: string
  country: string
  logoUrl: string | null
  models: ModelData[]
  createdAt: string
}

export type ModelData = {
  id: string
  name: string
  category: string
  years: number[]
  engine_displacement_cc?: number
  production_status?: 'In Production' | 'Discontinued' | 'Limited'
}

/**
 * Fetches all motorcycles and groups them by make
 */
export async function getMotorcyclesGroupedByMake(): Promise<MakeData[]> {
  const supabase = await createClient()

  const { data: motorcycles, error } = await supabase
    .from('motorcycles')
    .select('*')
    .order('make', { ascending: true })
    .order('model', { ascending: true })

  if (error) {
    console.error('Error fetching motorcycles:', error)
    throw new Error(`Failed to fetch motorcycles: ${error.message}`)
  }

  // Group motorcycles by make
  const makeMap = new Map<string, Motorcycle[]>()

  motorcycles?.forEach((motorcycle: Motorcycle) => {
    if (!makeMap.has(motorcycle.make)) {
      makeMap.set(motorcycle.make, [])
    }
    makeMap.get(motorcycle.make)!.push(motorcycle)
  })

  // Convert to MakeData format
  const makesData: MakeData[] = []

  makeMap.forEach((bikes, makeName) => {
    // Generate years array for each model
    const models: ModelData[] = bikes.map((bike) => {
      const years: number[] = []
      if (bike.year_end) {
        // Create range from year_start to year_end
        for (let year = bike.year_start; year <= bike.year_end; year++) {
          years.push(year)
        }
      } else {
        // If year_end is null, use current year
        const currentYear = new Date().getFullYear()
        for (let year = bike.year_start; year <= currentYear; year++) {
          years.push(year)
        }
      }

      return {
        id: bike.id,
        name: bike.model,
        category: bike.category,
        years,
        engine_displacement_cc: bike.engine_displacement_cc,
        production_status: bike.production_status as 'In Production' | 'Discontinued' | 'Limited' | undefined,
      }
    })

    // Use the earliest created_at as the make's createdAt
    const sortedBikes = [...bikes].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    makesData.push({
      id: makeName.toLowerCase().replace(/\s+/g, '-'), // Generate ID from make name
      name: makeName,
      country: bikes[0].country_of_origin,
      logoUrl: bikes[0].logo_url,
      models,
      createdAt: sortedBikes[0]?.created_at || new Date().toISOString(),
    })
  })

  return makesData
}

/**
 * Fetches a single make with all its models by make name (exact match)
 */
export async function getMakeByName(makeName: string): Promise<MakeData | null> {
  const supabase = await createClient()

  // Convert slug format back to make name (e.g., "royal-enfield" -> "Royal Enfield")
  // The ID is stored as lowercase with hyphens, so we need to match accordingly
  const { data: motorcycles, error } = await supabase
    .from('motorcycles')
    .select('*')
    .eq('make', makeName)
    .order('model', { ascending: true })

  if (error) {
    console.error('Error fetching make by name:', error)
    return null
  }

  if (!motorcycles || motorcycles.length === 0) {
    return null
  }

  // Generate years array for each model
  const models: ModelData[] = motorcycles.map((bike: Motorcycle) => {
    const years: number[] = []
    if (bike.year_end) {
      // Create range from year_start to year_end
      for (let year = bike.year_start; year <= bike.year_end; year++) {
        years.push(year)
      }
    } else {
      // If year_end is null, use current year
      const currentYear = new Date().getFullYear()
      for (let year = bike.year_start; year <= currentYear; year++) {
        years.push(year)
      }
    }

    return {
      id: bike.id,
      name: bike.model,
      category: bike.category,
      years,
      engine_displacement_cc: bike.engine_displacement_cc,
      production_status: bike.production_status as 'In Production' | 'Discontinued' | 'Limited' | undefined,
    }
  })

  // Use the earliest created_at as the make's createdAt
  const sortedBikes = [...motorcycles].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    id: makeName.toLowerCase().replace(/\s+/g, '-'),
    name: makeName,
    country: motorcycles[0].country_of_origin,
    logoUrl: motorcycles[0].logo_url,
    models,
    createdAt: sortedBikes[0]?.created_at || new Date().toISOString(),
  }
}

/**
 * Fetches a single make by slug/id (format: "make-name" -> "Make Name")
 */
export async function getMakeBySlug(slug: string): Promise<MakeData | null> {
  const makes = await getMotorcyclesGroupedByMake()
  return makes.find((m) => m.id === slug) || null
}

/**
 * Fetches all unique countries from motorcycles
 */
export async function getMotorcycleCountries(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('motorcycles')
    .select('country_of_origin')

  if (error) {
    console.error('Error fetching countries:', error)
    return []
  }

  const countries = [...new Set(data?.map((d) => d.country_of_origin) || [])]
  return countries.sort()
}

/**
 * Fetches statistics about motorcycles
 */
export async function getMotorcycleStats() {
  const supabase = await createClient()

  const { data: motorcycles, error } = await supabase
    .from('motorcycles')
    .select('*')

  if (error) {
    console.error('Error fetching stats:', error)
    return {
      totalMakes: 0,
      totalModels: 0,
      totalCountries: 0,
      avgModelsPerMake: 0,
    }
  }

  const makes = new Set(motorcycles?.map((m) => m.make) || [])
  const countries = new Set(motorcycles?.map((m) => m.country_of_origin) || [])

  return {
    totalMakes: makes.size,
    totalModels: motorcycles?.length || 0,
    totalCountries: countries.size,
    avgModelsPerMake: makes.size > 0
      ? Math.round((motorcycles?.length || 0) / makes.size)
      : 0,
  }
}

/**
 * Checks if a model already exists for a given make
 */
export async function checkModelExists(make: string, model: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('motorcycles')
    .select('id')
    .eq('make', make)
    .eq('model', model)
    .limit(1)

  if (error) {
    console.error('Error checking if model exists:', error)
    return false
  }

  return (data?.length || 0) > 0
}

/**
 * Adds a new motorcycle model to the database
 * Uses admin client to bypass RLS policies for server-side operations
 */
export async function addMotorcycleModel(motorcycle: Omit<Motorcycle, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: Motorcycle }> {
  // Use admin client to bypass RLS
  const supabase = createAdminClient()

  // VALIDATION 1: Check if model name contains other manufacturer names (data integrity check)
  const knownManufacturers = [
    'Ather', 'Hero', 'Honda', 'Bajaj', 'TVS', 'Yamaha', 'Suzuki', 'Ola',
    'Royal Enfield', 'KTM', 'Ducati', 'Kawasaki', 'Jawa', 'Yezdi',
    'Kinetic', 'LML', 'Vespa', 'Bounce', 'Okinawa', 'Ampere', 'Revolt',
    'Simple', 'Benling', 'Pure', 'Komaki', 'Hop', 'BGauss', 'Matter'
  ]

  const modelLower = motorcycle.model.toLowerCase()
  for (const manufacturer of knownManufacturers) {
    // Skip if the manufacturer is the actual make of this model
    if (motorcycle.make.toLowerCase().includes(manufacturer.toLowerCase())) continue

    // Check if model contains the manufacturer name
    if (modelLower.includes(manufacturer.toLowerCase())) {
      return {
        success: false,
        error: `Model name "${motorcycle.model}" contains manufacturer name "${manufacturer}". This appears to be a misclassification - the model should likely belong to "${manufacturer}" make instead of "${motorcycle.make}". Please verify the correct make before adding.`,
      }
    }
  }

  // VALIDATION 2: Check if model already exists using exact match (case-insensitive)
  const { data: existingModels, error: checkError } = await supabase
    .from('motorcycles')
    .select('make, model')
    .ilike('make', motorcycle.make)
    .ilike('model', motorcycle.model)
    .limit(1)

  if (checkError) {
    console.error('Error checking for duplicate model:', checkError)
    return {
      success: false,
      error: 'Failed to validate model uniqueness. Please try again.',
    }
  }

  // If a duplicate exists, return a clear error message
  if (existingModels && existingModels.length > 0) {
    return {
      success: false,
      error: `Model "${motorcycle.model}" already exists for ${motorcycle.make}. Each model name must be unique within a make.`,
    }
  }

  // VALIDATION 3: Check year range validity
  if (motorcycle.year_end && motorcycle.year_end < motorcycle.year_start) {
    return {
      success: false,
      error: `Invalid year range: year_end (${motorcycle.year_end}) cannot be before year_start (${motorcycle.year_start}).`,
    }
  }

  // VALIDATION 4: Validate electric vehicles have zero engine displacement
  if (motorcycle.category.toLowerCase() === 'electric' && motorcycle.engine_displacement_cc !== 0) {
    return {
      success: false,
      error: `Electric vehicles must have engine_displacement_cc set to 0, not ${motorcycle.engine_displacement_cc}.`,
    }
  }

  // VALIDATION 5: Validate production status matches year_end
  if (motorcycle.production_status === 'Discontinued' && !motorcycle.year_end) {
    return {
      success: false,
      error: `Model marked as "Discontinued" must have a year_end value. Please set the last production year.`,
    }
  }

  // Insert the new model
  const { data, error } = await supabase
    .from('motorcycles')
    .insert([{
      make: motorcycle.make,
      model: motorcycle.model,
      year_start: motorcycle.year_start,
      year_end: motorcycle.year_end,
      country_of_origin: motorcycle.country_of_origin,
      category: motorcycle.category,
      engine_displacement_cc: motorcycle.engine_displacement_cc,
      production_status: motorcycle.production_status,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding motorcycle model:', error)

    // Provide user-friendly error messages
    if (error.code === '23505') {
      return {
        success: false,
        error: `Model "${motorcycle.model}" already exists for ${motorcycle.make}. Please use a different model name.`,
      }
    }

    if (error.code === '23503') {
      return {
        success: false,
        error: 'Invalid country or category. Please check your selections.',
      }
    }

    if (error.code === '23514') {
      return {
        success: false,
        error: 'Invalid year range or engine displacement. Please check your values.',
      }
    }

    return {
      success: false,
      error: `Failed to add model: ${error.message}. Please try again or contact support if the issue persists.`,
    }
  }

  return {
    success: true,
    data: data as Motorcycle,
  }
}
