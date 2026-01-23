'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { JobCardViewData } from '../types/job-card-view.types'

interface UpdateJobCardStatusVariables {
  jobCardId: string
  newStatus: string
  userId: string
  garageId: string
}

interface OptimisticContext {
  previousJobCards: JobCardViewData[] | undefined
}

/**
 * Update job card status (client-side)
 * Uses API route that bypasses RLS policies
 * Implements optimistic updates for immediate UI feedback
 */
export function useUpdateJobCardStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobCardId,
      newStatus,
      userId,
    }: UpdateJobCardStatusVariables) => {
      console.log(`🔄 [Mutation] Updating job card ${jobCardId} to status: ${newStatus}`)

      const response = await fetch(`/api/job-cards/${jobCardId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ [Mutation] Error updating status:', error)
        throw new Error(error.error || 'Failed to update status')
      }

      const result = await response.json()
      console.log(`✅ [Mutation] Status updated successfully`)
      return result
    },

    // Optimistic update: update cache immediately before API call
    onMutate: async ({ jobCardId, newStatus, garageId }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['job-cards', garageId] })

      // Snapshot previous value for rollback
      const previousJobCards = queryClient.getQueryData<JobCardViewData[]>(['job-cards', garageId])

      // Optimistically update cache
      queryClient.setQueryData<JobCardViewData[]>(['job-cards', garageId], (old) => {
        if (!old) return old

        return old.map((card) =>
          card.id === jobCardId
            ? {
                ...card,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : card
        )
      })

      // Return context with previous data for rollback
      return { previousJobCards }
    },

    // Rollback on error
    onError: (error, variables, context) => {
      console.error('❌ [Mutation] Rolling back due to error:', error)

      if (context?.previousJobCards) {
        queryClient.setQueryData(['job-cards', variables.garageId], context.previousJobCards)
      }
    },

    // Always refetch after error or success to ensure server state
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-cards', variables.garageId] })
    },
  })
}

interface UpdateJobCardVariables {
  jobCardId: string
  updates: {
    status?: string
    priority?: string
    promisedDate?: string
    leadMechanicId?: string
    customerComplaint?: string
    workRequested?: string
    currentMileage?: number
    finalAmount?: number
    paymentStatus?: string
  }
}

/**
 * Update job card (client-side)
 * Implements optimistic updates for immediate UI feedback
 */
export function useUpdateJobCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobCardId, updates }: UpdateJobCardVariables) => {
      const supabase = createClient()

      // Transform camelCase to snake_case for database
      const dbUpdates: Record<string, any> = {}

      if (updates.status !== undefined) {
        dbUpdates.status = updates.status
      }

      if (updates.priority !== undefined) {
        dbUpdates.priority = updates.priority
      }

      if (updates.promisedDate !== undefined) {
        dbUpdates.promised_date = updates.promisedDate
      }

      if (updates.leadMechanicId !== undefined) {
        dbUpdates.lead_mechanic_id = updates.leadMechanicId
      }

      if (updates.customerComplaint !== undefined) {
        dbUpdates.customer_complaint = updates.customerComplaint
      }

      if (updates.workRequested !== undefined) {
        dbUpdates.work_requested = updates.workRequested
      }

      if (updates.currentMileage !== undefined) {
        dbUpdates.current_mileage = updates.currentMileage
      }

      if (updates.finalAmount !== undefined) {
        dbUpdates.final_amount = updates.finalAmount
      }

      if (updates.paymentStatus !== undefined) {
        dbUpdates.payment_status = updates.paymentStatus
      }

      dbUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('job_cards')
        .update(dbUpdates)
        .eq('id', jobCardId)
        .select()
        .single()

      if (error) {
        console.error('Error updating job card:', error)
        throw new Error(`Failed to update job card: ${error.message}`)
      }

      return data
    },

    // Optimistic update: update cache immediately before API call
    onMutate: async ({ jobCardId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['job-cards'] })

      // Snapshot previous value
      const previousJobCards = queryClient.getQueryData<JobCardViewData[]>(['job-cards'])

      // Optimistically update cache
      queryClient.setQueryData<JobCardViewData[]>(['job-cards'], (old) => {
        if (!old) return old

        return old.map((card) =>
          card.id === jobCardId
            ? {
                ...card,
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.priority !== undefined && { priority: updates.priority }),
                ...(updates.promisedDate !== undefined && { promisedDate: updates.promisedDate }),
                ...(updates.leadMechanicId !== undefined && { leadMechanicId: updates.leadMechanicId }),
                ...(updates.customerComplaint !== undefined && { customerComplaint: updates.customerComplaint }),
                ...(updates.workRequested !== undefined && { workRequested: updates.workRequested }),
                ...(updates.currentMileage !== undefined && { currentMileage: updates.currentMileage }),
                ...(updates.finalAmount !== undefined && { finalAmount: updates.finalAmount }),
                ...(updates.paymentStatus !== undefined && { paymentStatus: updates.paymentStatus }),
                updatedAt: new Date().toISOString(),
              }
            : card
        )
      })

      return { previousJobCards }
    },

    // Rollback on error
    onError: (error, variables, context) => {
      console.error('❌ [Mutation] Rolling back job card update:', error)

      if (context?.previousJobCards) {
        queryClient.setQueryData(['job-cards'], context.previousJobCards)
      }
    },

    // Always refetch to ensure server state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
    },
  })
}
