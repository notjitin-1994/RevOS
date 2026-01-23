'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useDraftSummary, useHasDraftData } from '../lib/stores/job-card-draft-store'
import { useTimeSinceLastSave } from '../lib/hooks/use-job-card-autosave'

interface DraftStatusIndicatorProps {
  /**
   * Whether an auto-save is currently in progress
   */
  isSaving?: boolean

  /**
   * Whether to show the indicator
   * @default true
   */
  show?: boolean

  /**
   * Additional class names
   */
  className?: string
}

export function DraftStatusIndicator({
  isSaving = false,
  show = true,
  className = '',
}: DraftStatusIndicatorProps) {
  const { hasDraft, isDirty, lastSaved, lastAutoSaved, draftId } = useDraftSummary()
  const hasDraftData = useHasDraftData()
  const { lastSaved: lastSavedFormatted, lastAutoSaved: lastAutoSavedFormatted } =
    useTimeSinceLastSave()

  // Don't show if there's no draft data
  if (!show || !hasDraftData) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
        isSaving
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : isDirty
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-green-50 text-green-700 border border-green-200'
      } ${className}`}
    >
      {/* Status Icon */}
      <AnimatePresence mode="wait">
        {isSaving ? (
          <motion.div
            key="saving"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : isDirty ? (
          <motion.div
            key="dirty"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <AlertCircle className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Text */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold">
          {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <span className="text-xs opacity-75">
          {lastSavedFormatted !== 'Never' && `Saved ${lastSavedFormatted}`}
          {lastAutoSavedFormatted !== 'Never' &&
            lastAutoSavedFormatted !== lastSavedFormatted &&
            ` • Auto-saved ${lastAutoSavedFormatted}`}
        </span>
      </div>

      {/* Draft ID Badge */}
      {draftId && (
        <div className="ml-auto">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 font-mono">
            DRAFT-{draftId.slice(-6)}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Compact version of the draft status indicator for use in smaller spaces
 */
export function DraftStatusBadge({ isSaving = false }: { isSaving?: boolean }) {
  const { isDirty } = useDraftSummary()
  const hasDraftData = useHasDraftData()

  if (!hasDraftData) return null

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        isSaving
          ? 'bg-blue-100 text-blue-700'
          : isDirty
          ? 'bg-amber-100 text-amber-700'
          : 'bg-green-100 text-green-700'
      }`}
    >
      {isSaving ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isDirty ? (
        <AlertCircle className="h-3 w-3" />
      ) : (
        <CheckCircle2 className="h-3 w-3" />
      )}
      <span>{isSaving ? 'Saving' : isDirty ? 'Unsaved' : 'Saved'}</span>
    </motion.div>
  )
}

/**
 * Draft status text with time since last save
 */
export function DraftStatusText({ isSaving = false }: { isSaving?: boolean }) {
  const { isDirty, lastSaved } = useDraftSummary()
  const hasDraftData = useHasDraftData()
  const { lastSaved: lastSavedFormatted } = useTimeSinceLastSave()

  if (!hasDraftData) return null

  return (
    <div className="text-xs text-gray-500">
      {isSaving ? (
        <span className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving draft...
        </span>
      ) : isDirty ? (
        <span className="flex items-center gap-1 text-amber-600">
          <AlertCircle className="h-3 w-3" />
          Unaved changes
        </span>
      ) : (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Saved {lastSavedFormatted !== 'Never' ? lastSavedFormatted : ''}
        </span>
      )}
    </div>
  )
}
