'use server'

import { checkModelExists, addMotorcycleModel as addModel, getMotorcyclesGroupedByMake, type Motorcycle, type MakeData } from '@/lib/supabase/motorcycle-queries'

/**
 * Server action to fetch all motorcycles grouped by make
 */
export async function getMakesDataAction(): Promise<MakeData[]> {
  return await getMotorcyclesGroupedByMake()
}

/**
 * Server action to check if a model already exists for a given make
 */
export async function checkModelExistsAction(make: string, model: string): Promise<boolean> {
  return await checkModelExists(make, model)
}

/**
 * Server action to add a new motorcycle model to the database
 */
export async function addMotorcycleModelAction(motorcycle: Omit<Motorcycle, 'id' | 'created_at' | 'updated_at'>): Promise<{
  success: boolean
  error?: string
  data?: Motorcycle
}> {
  return await addModel(motorcycle)
}
