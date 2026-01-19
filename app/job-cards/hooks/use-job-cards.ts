'use client'

import { useQuery } from '@tanstack/react-query'
import type { JobCardViewData, JobCardViewFilters } from '../types/job-card-view.types'

/**
 * Client-side hook for fetching job cards using React Query
 * Uses API route that bypasses RLS policies
 */
export function useJobCards(garageId: string, filters?: JobCardViewFilters) {
  return useQuery<JobCardViewData[]>({
    queryKey: ['job-cards', garageId, filters],
    queryFn: async () => {
      console.log('🔍 Fetching job cards for garage:', garageId)

      // Build query params
      const params = new URLSearchParams()
      params.append('garageId', garageId)

      if (filters?.status) {
        params.append('status', filters.status)
      }
      if (filters?.mechanicId) {
        params.append('mechanicId', filters.mechanicId)
      }
      if (filters?.customerId) {
        params.append('customerId', filters.customerId)
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom)
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo)
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }

      // Fetch from API route (uses server-side client, bypasses RLS)
      const response = await fetch(`/api/job-cards?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Error fetching job cards:', error)
        throw new Error(error.error || 'Failed to fetch job cards')
      }

      const data = await response.json()
      console.log(`✅ Fetched ${data.length || 0} job cards`)

      return data
    },
    enabled: !!garageId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
