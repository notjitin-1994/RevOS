'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useJobCardDraftStore } from '../stores/job-card-draft-store'

// ============================================================================
// TYPES
// ============================================================================

export interface JobCardDataForSubmit {
  garageId: string
  customerId: string
  vehicleId: string
  jobType: string
  priority: string
  status: 'draft' | 'queued'
  customerComplaint: string
  workRequested: string
  customerNotes?: string
  currentMileage?: number
  promisedDate?: string
  promisedTime?: string
  leadMechanicId?: string
  technicianNotes?: string
  checklistItems?: any[]
  parts?: any[]
  serviceAdvisorId?: string
  createdBy: string
}

// ============================================================================
// CONFIG
// ============================================================================

const AUTOSAVE_INTERVAL = 30000 // 30 seconds
const DEBOUNCE_DELAY = 2000 // 2 seconds
const MIN_DATA_FOR_AUTOSAVE = true // Require at least some data before auto-saving

// ============================================================================
// HOOK
// ============================================================================

interface UseJobCardAutosaveOptions {
  /**
   * Whether auto-save is enabled
   * @default true
   */
  enabled?: boolean

  /**
   * Callback when auto-save starts
   */
  onSaveStart?: () => void

  /**
   * Callback when auto-save completes successfully
   */
  onSaveSuccess?: (draftId: string) => void

  /**
   * Callback when auto-save fails
   */
  onSaveError?: (error: Error) => void

  /**
   * Garage ID for the draft
   */
  garageId: string

  /**
   * Current user ID
   */
  userId: string

  /**
   * Function that returns the current form data to save
   * This ensures we always save the latest form data from all tabs
   */
  getFormData: () => JobCardDataForSubmit | null

  /**
   * Function to check if there's a minimum amount of data to save
   */
  hasMinData?: () => boolean
}

export function useJobCardAutosave({
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
  garageId,
  userId,
  getFormData,
  hasMinData: externalHasMinData,
}: UseJobCardAutosaveOptions) {
  const isSavingRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get draft state for tracking draft ID and updating timestamps
  const draftId = useJobCardDraftStore((state) => state.draftId)
  const updateLastAutoSaved = useJobCardDraftStore((state) => state.updateLastAutoSaved)
  const updateLastSaved = useJobCardDraftStore((state) => state.updateLastSaved)
  const setDraftId = useJobCardDraftStore((state) => state.setDraftId)

  /**
   * Save draft to database
   */
  const saveDraftToDatabase = useCallback(async () => {
    // Don't save if already saving
    if (isSavingRef.current) {
      return
    }

    // Get current form data
    const formData = getFormData()
    if (!formData) {
      return
    }

    // Check if there's minimum data to save
    if (externalHasMinData && !externalHasMinData()) {
      return
    }

    try {
      isSavingRef.current = true
      onSaveStart?.()

      // Use the form data directly - it already has all data from all tabs
      const apiData = {
        ...formData,
        status: 'draft' as const,
      }

      // Determine if we're creating or updating
      const isUpdate = !!draftId
      const url = isUpdate
        ? `/api/job-cards/${draftId}`
        : '/api/job-cards'
      const method = isUpdate ? 'PUT' : 'POST'

      // Save to database
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to save draft'
        try {
          const error = await response.json()
          errorMessage = error.error || error.details || errorMessage
        } catch {
          // If parsing error fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError)
        throw new Error('Invalid response from server')
      }

      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to save draft')
      }

      // Update draft ID if this was a new draft
      if (!isUpdate && result.jobCard?.id) {
        setDraftId(result.jobCard.id)
      }

      // Update timestamps
      const now = new Date().toISOString()
      updateLastAutoSaved(now)
      updateLastSaved(now)

      onSaveSuccess?.(result.jobCard.id)
    } catch (error) {
      console.error('Auto-save failed:', error)
      onSaveError?.(error as Error)
    } finally {
      isSavingRef.current = false
    }
  }, [
    getFormData,
    externalHasMinData,
    draftId,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    updateLastAutoSaved,
    updateLastSaved,
    setDraftId,
  ])

  /**
   * Debounced save trigger
   */
  const triggerAutosave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraftToDatabase()
    }, DEBOUNCE_DELAY)
  }, [saveDraftToDatabase])

  // Effect: Periodic auto-save (every 30 seconds)
  useEffect(() => {
    if (!enabled) return

    intervalRef.current = setInterval(() => {
      saveDraftToDatabase()
    }, AUTOSAVE_INTERVAL)

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, saveDraftToDatabase])

  // Effect: Save on page unload (before user leaves)
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = () => {
      // Get current form data
      const formData = getFormData()
      if (!formData) return

      // Check if there's minimum data to save
      if (externalHasMinData && !externalHasMinData()) return

      // Use navigator.sendBeacon for more reliable saves on unload
      const apiData = {
        ...formData,
        status: 'draft' as const,
      }

      const isUpdate = !!draftId
      const url = isUpdate
        ? `/api/job-cards/${draftId}`
        : '/api/job-cards'

      // Use sendBeacon for reliable delivery during page unload
      const blob = new Blob([JSON.stringify(apiData)], {
        type: 'application/json',
      })

      navigator.sendBeacon(url, blob)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, getFormData, externalHasMinData, draftId])

  return {
    /**
     * Manually trigger an auto-save
     */
    saveNow: saveDraftToDatabase,

    /**
     * Whether an auto-save is currently in progress
     */
    isSaving: isSavingRef.current,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get formatted time since last save
 */
export function useTimeSinceLastSave() {
  const lastSaved = useJobCardDraftStore((state) => state.lastSaved)
  const lastAutoSaved = useJobCardDraftStore((state) => state.lastAutoSaved)

  const formatTimeAgo = (timestamp: string | null): string => {
    if (!timestamp) return 'Never'

    const now = new Date()
    const saved = new Date(timestamp)
    const diffMs = now.getTime() - saved.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return saved.toLocaleDateString()
  }

  return {
    lastSaved: formatTimeAgo(lastSaved),
    lastAutoSaved: formatTimeAgo(lastAutoSaved),
    lastSavedRaw: lastSaved,
    lastAutoSavedRaw: lastAutoSaved,
  }
}
