'use client'

import { useQuery } from '@tanstack/react-query'
import type { KanbanJobCard, KanbanFilters } from '../types/kanban.types'
import type { JobCardViewData } from '../types/job-card-view.types'

interface UseJobCardsOptions {
  enabled?: boolean
  refetchInterval?: number
}

/**
 * Transform KanbanJobCard to JobCardViewData for backward compatibility
 */
function transformKanbanToViewData(card: KanbanJobCard): JobCardViewData {
  return {
    id: card.id,
    jobCardNumber: card.jobCardNumber,
    customerId: card.customerId,
    vehicleId: card.vehicleId,
    jobType: card.jobType,
    priority: card.priority,
    status: card.status,
    customerComplaint: card.customerComplaint,
    workRequested: card.workRequested,
    customerNotes: card.customerNotes,
    currentMileage: card.currentMileage,
    reportedIssue: null,
    promisedDate: card.promisedDate,
    promisedTime: card.promisedTime,
    actualCompletionDate: card.actualCompletionDate,
    leadMechanicId: card.leadMechanicId,
    laborHours: 0,
    laborCost: card.estimatedLaborCost,
    partsCost: card.estimatedPartsCost,
    totalCost: card.finalAmount || (card.estimatedLaborCost + card.estimatedPartsCost),
    totalChecklistItems: card.totalChecklistItems || 0,
    completedChecklistItems: card.completedChecklistItems || 0,
    progressPercentage: card.progressPercentage || 0,
    internalNotes: card.technicianNotes,
    mechanicNotes: null,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    deletedAt: null,
    garageId: card.garageId,
    customerName: card.customerName,
    customerPhone: card.customerPhone,
    customerEmail: card.customerEmail,
    vehicleMake: card.vehicleMake,
    vehicleModel: card.vehicleModel,
    vehicleYear: card.vehicleYear,
    vehicleLicensePlate: card.vehicleLicensePlate,
    vehicleVin: card.vehicleVin,
  }
}

/**
 * Client-side hook for fetching job cards using React Query
 * Uses API route that fetches real data from Supabase
 *
 * Returns JobCardViewData for backward compatibility with existing components
 */
export function useJobCards(
  garageId: string,
  filters?: KanbanFilters,
  options?: UseJobCardsOptions
) {
  return useQuery<JobCardViewData[]>({
    queryKey: ['job-cards', garageId, filters],
    queryFn: async () => {
      console.log('🔍 Fetching job cards for garage:', garageId)

      // Build query params
      const params = new URLSearchParams()
      params.append('garageId', garageId)

      // Status filters
      if (filters?.statuses && filters.statuses.length > 0) {
        params.append('status', filters.statuses.join(','))
      }

      // Priority filters
      if (filters?.priorities && filters.priorities.length > 0) {
        params.append('priority', filters.priorities.join(','))
      }

      // Job type filters
      if (filters?.jobTypes && filters.jobTypes.length > 0) {
        params.append('jobType', filters.jobTypes.join(','))
      }

      // Mechanic filter
      if (filters?.mechanicId !== undefined) {
        if (filters.mechanicId === null) {
          params.append('unassigned', 'true')
        } else {
          params.append('mechanicId', filters.mechanicId)
        }
      }

      // Service advisor filter
      if (filters?.serviceAdvisorId) {
        params.append('serviceAdvisorId', filters.serviceAdvisorId)
      }

      // Customer filter
      if (filters?.customerId) {
        params.append('customerId', filters.customerId)
      }

      // Date range filters
      if (filters?.promisedDateFrom) {
        params.append('promisedDateFrom', filters.promisedDateFrom)
      }
      if (filters?.promisedDateTo) {
        params.append('promisedDateTo', filters.promisedDateTo)
      }
      if (filters?.createdDateFrom) {
        params.append('createdDateFrom', filters.createdDateFrom)
      }
      if (filters?.createdDateTo) {
        params.append('createdDateTo', filters.createdDateTo)
      }

      // Search query
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery)
      }

      // Fetch from API route
      const response = await fetch(`/api/job-cards?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Error fetching job cards:', error)
        throw new Error(error.error || 'Failed to fetch job cards')
      }

      const result = await response.json()
      const data: KanbanJobCard[] = result.data || []

      // Transform to JobCardViewData for backward compatibility
      const transformedData: JobCardViewData[] = data.map(transformKanbanToViewData)

      console.log(`✅ Fetched ${data.length} job cards (total: ${result.meta?.total || 0})`)

      return transformedData
    },
    enabled: !!garageId && (options?.enabled !== false),
    // For collaborative kanban board, data should be considered stale immediately
    // This ensures real-time updates when other users make changes
    staleTime: 0,
    refetchInterval: options?.refetchInterval,
  })
}

/**
 * Hook that returns the raw KanbanJobCard data
 * Use this for new components that need the full kanban data structure
 */
export function useKanbanJobCards(
  garageId: string,
  filters?: KanbanFilters,
  options?: UseJobCardsOptions
) {
  return useQuery<KanbanJobCard[]>({
    queryKey: ['job-cards-kanban', garageId, filters],
    queryFn: async () => {
      console.log('🔍 Fetching kanban job cards for garage:', garageId)

      // Build query params
      const params = new URLSearchParams()
      params.append('garageId', garageId)

      // Status filters
      if (filters?.statuses && filters.statuses.length > 0) {
        params.append('status', filters.statuses.join(','))
      }

      // Priority filters
      if (filters?.priorities && filters.priorities.length > 0) {
        params.append('priority', filters.priorities.join(','))
      }

      // Job type filters
      if (filters?.jobTypes && filters.jobTypes.length > 0) {
        params.append('jobType', filters.jobTypes.join(','))
      }

      // Mechanic filter
      if (filters?.mechanicId !== undefined) {
        if (filters.mechanicId === null) {
          params.append('unassigned', 'true')
        } else {
          params.append('mechanicId', filters.mechanicId)
        }
      }

      // Service advisor filter
      if (filters?.serviceAdvisorId) {
        params.append('serviceAdvisorId', filters.serviceAdvisorId)
      }

      // Customer filter
      if (filters?.customerId) {
        params.append('customerId', filters.customerId)
      }

      // Date range filters
      if (filters?.promisedDateFrom) {
        params.append('promisedDateFrom', filters.promisedDateFrom)
      }
      if (filters?.promisedDateTo) {
        params.append('promisedDateTo', filters.promisedDateTo)
      }
      if (filters?.createdDateFrom) {
        params.append('createdDateFrom', filters.createdDateFrom)
      }
      if (filters?.createdDateTo) {
        params.append('createdDateTo', filters.createdDateTo)
      }

      // Search query
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery)
      }

      // Fetch from API route
      const response = await fetch(`/api/job-cards?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Error fetching job cards:', error)
        throw new Error(error.error || 'Failed to fetch job cards')
      }

      const result = await response.json()
      const data = result.data || []

      console.log(`✅ Fetched ${data.length} kanban job cards (total: ${result.meta?.total || 0})`)

      return data
    },
    enabled: !!garageId && (options?.enabled !== false),
    staleTime: 0,
    refetchInterval: options?.refetchInterval,
  })
}
