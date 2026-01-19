'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Update job card status (client-side)
 * Uses API route that bypasses RLS policies
 */
export function useUpdateJobCardStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobCardId,
      newStatus,
      userId,
    }: {
      jobCardId: string
      newStatus: string
      userId: string
    }) => {
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

    onSuccess: () => {
      // Invalidate and refetch job cards query
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
    },
  })
}

/**
 * Update job card (client-side)
 */
export function useUpdateJobCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobCardId, updates }: { jobCardId: string; updates: any }) => {
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

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
    },
  })
}
