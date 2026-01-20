import React from 'react'
import { getMotorcyclesGroupedByMake } from '@/lib/supabase/motorcycle-queries'
import { ServiceScopeClient } from './components/service-scope-client'

/**
 * Service Scope Management Page - Master Data
 *
 * Manages the universe of supported vehicles.
 * Defines makes, models, and applicable years.
 * Based on RevvOs-features.md specification.
 */

export default async function ServiceScopePage() {
  // Fetch data from database on server
  const makes = await getMotorcyclesGroupedByMake()

  return <ServiceScopeClient initialMakes={makes} />
}
