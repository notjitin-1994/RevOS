'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import type { KanbanJobCard, KanbanRealtimeUpdate } from '../types/kanban.types'

interface UseJobCardsRealtimeOptions {
  garageId: string
  enabled?: boolean
}

/**
 * Real-time subscription hook for job cards
 * Listens to INSERT, UPDATE, and DELETE events on the job_cards table
 * and updates the React Query cache automatically
 */
export function useJobCardsRealtime({
  garageId,
  enabled = true,
}: UseJobCardsRealtimeOptions) {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled || !garageId) return

    console.log('🔄 Setting up real-time subscription for job cards')

    const supabase = createClient()

    // Subscribe to job_cards changes
    const subscription = supabase
      .channel(`job-cards-${garageId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'job_cards',
          filter: `garage_id=eq.${garageId}`,
        },
        async (payload) => {
          console.log('📡 Real-time update received:', payload.eventType, (payload.new as any)?.id)

          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
          const oldCard = payload.old as KanbanJobCard | undefined
          const newCard = payload.new as KanbanJobCard | undefined

          // Update the cache based on the event type
          switch (eventType) {
            case 'INSERT': {
              // New card created - add it to the cache
              queryClient.setQueryData<KanbanJobCard[]>(
                ['job-cards', garageId],
                (old = []) => {
                  // Check if card already exists (avoid duplicates)
                  if (old.some(card => card.id === newCard?.id)) {
                    return old
                  }
                  return [...old, newCard!]
                }
              )
              break
            }

            case 'UPDATE': {
              // Card updated - replace it in the cache
              queryClient.setQueryData<KanbanJobCard[]>(
                ['job-cards', garageId],
                (old = []) => {
                  return old.map(card =>
                    card.id === newCard?.id ? newCard! : card
                  )
                }
              )
              break
            }

            case 'DELETE': {
              // Card deleted - remove it from the cache
              queryClient.setQueryData<KanbanJobCard[]>(
                ['job-cards', garageId],
                (old = []) => {
                  return old.filter(card => card.id !== oldCard?.id)
                }
              )
              break
            }
          }

          // Invalidate queries to ensure data consistency
          // This is a lightweight invalidation that won't cause a full refetch
          // if the data is already up-to-date
          await queryClient.invalidateQueries({
            queryKey: ['job-cards', garageId],
            refetchType: 'none',
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active')
        } else if (status === 'CLOSED') {
          console.log('❌ Real-time subscription closed')
        }
      })

    subscriptionRef.current = subscription

    // Cleanup on unmount
    return () => {
      console.log('🔄 Cleaning up real-time subscription')
      subscription.unsubscribe()
    }
  }, [garageId, enabled, queryClient])

  return null
}

/**
 * Hook for real-time updates on a specific job card
 * Useful for detail views
 */
export function useJobCardRealtime(cardId: string, enabled = true) {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled || !cardId) return

    console.log(`🔄 Setting up real-time subscription for card ${cardId}`)

    const supabase = createClient()

    const subscription = supabase
      .channel(`job-card-${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_cards',
          filter: `id=eq.${cardId}`,
        },
        async (payload) => {
          console.log('📡 Card update received:', payload.eventType)

          const newCard = payload.new as KanbanJobCard | undefined

          // Update the specific card cache
          if (newCard) {
            queryClient.setQueryData(['job-card', cardId], newCard)

            // Also update in the list cache
            queryClient.setQueriesData<KanbanJobCard[]>(
              { queryKey: ['job-cards'] },
              (old = []) => {
                return old.map(card =>
                  card.id === newCard.id ? newCard : card
                )
              }
            )
          }
        }
      )
      .subscribe()

    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
    }
  }, [cardId, enabled, queryClient])

  return null
}

/**
 * Hook for real-time checklist item updates
 * Updates progress percentages on job cards
 */
export function useChecklistRealtime(garageId: string, enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !garageId) return

    console.log('🔄 Setting up real-time subscription for checklist items')

    const supabase = createClient()

    const subscription = supabase
      .channel(`checklist-${garageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_card_checklist_items',
        },
        async () => {
          console.log('📡 Checklist update received, invalidating queries')

          // Invalidate and refetch to get updated progress
          await queryClient.invalidateQueries({ queryKey: ['job-cards', garageId] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [garageId, enabled, queryClient])

  return null
}
