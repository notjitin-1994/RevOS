'use client'

import { useEffect, useRef } from 'react'

/**
 * Auto-save hook for form data with debouncing
 *
 * Features:
 * - Debounced saves to avoid excessive localStorage writes
 * - Silent background operation (no visual indicators)
 * - Persists across page refreshes and browser sessions
 * - Auto-clears after successful form submission
 *
 * @param formData - The form data to auto-save
 * @param storageKey - Unique key for localStorage
 * @param isSubmitting - Whether form is currently submitting (to pause saves)
 * @param shouldSave - Optional callback to determine if data should be saved
 * @param debounceMs - Debounce delay in milliseconds (default: 2000ms)
 */

interface AutoSaveOptions {
  formData: Record<string, any>
  storageKey: string
  isSubmitting?: boolean
  shouldSave?: (data: Record<string, any>) => boolean
  debounceMs?: number
  onSave?: () => void
}

export function useFormAutoSave({
  formData,
  storageKey,
  isSubmitting = false,
  shouldSave,
  debounceMs = 2000,
  onSave,
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<Record<string, any>>({})

  /**
   * Save data to localStorage
   */
  const saveToStorage = (data: Record<string, any>) => {
    try {
      const dataToSave = {
        ...data,
        _lastSaved: new Date().toISOString(),
        _version: '1.0',
      }
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      lastSavedRef.current = data

      // Optional callback when save occurs
      if (onSave) {
        onSave()
      }

      // Development logging (silent in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 Auto-save: Saved draft for "${storageKey}" (${new Date().toLocaleTimeString()})`)
      }
    } catch (error) {
      // Silent fail - localStorage might be full or disabled
      console.warn('Auto-save failed:', error)
    }
  }

  /**
   * Clear saved data from localStorage
   */
  const clearSavedData = () => {
    try {
      const existed = localStorage.getItem(storageKey) !== null
      localStorage.removeItem(storageKey)
      lastSavedRef.current = {}

      if (existed) {
        console.log(`✓ Auto-save: Cleared draft for "${storageKey}"`)
      } else {
        console.log(`ℹ Auto-save: No draft to clear for "${storageKey}"`)
      }
    } catch (error) {
      console.warn('Failed to clear saved data:', error)
    }
  }

  /**
   * Load saved data from localStorage
   */
  const loadSavedData = (): Record<string, any> | null => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return null

      const parsed = JSON.parse(saved)

      // Remove metadata before returning
      const { _lastSaved, _version, ...data } = parsed
      return data
    } catch (error) {
      console.warn('Failed to load saved data:', error)
      return null
    }
  }

  /**
   * Check if there's saved data available
   */
  const hasSavedData = (): boolean => {
    try {
      return localStorage.getItem(storageKey) !== null
    } catch {
      return false
    }
  }

  /**
   * Get last saved timestamp
   */
  const getLastSavedTime = (): Date | null => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return null

      const parsed = JSON.parse(saved)
      return parsed._lastSaved ? new Date(parsed._lastSaved) : null
    } catch {
      return null
    }
  }

  // Auto-save effect with debouncing
  useEffect(() => {
    // Don't save if form is submitting
    if (isSubmitting) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Check if we should save this data
    if (shouldSave && !shouldSave(formData)) {
      return
    }

    // Skip if data hasn't changed (shallow comparison)
    const hasChanged = Object.keys(formData).some(
      (key) => formData[key] !== lastSavedRef.current[key]
    )

    if (!hasChanged) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveToStorage(formData)
    }, debounceMs)

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [formData, isSubmitting, debounceMs, shouldSave])

  return {
    clearSavedData,
    loadSavedData,
    hasSavedData,
    getLastSavedTime,
  }
}
