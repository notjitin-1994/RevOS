'use client'

import React, { useEffect } from 'react'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { useJobCardStore } from '../../lib/stores/job-card-store'

/**
 * ZoomControls Component
 *
 * Provides zoom controls for the kanban board.
 * Hidden on mobile devices, visible on desktop/tablet.
 *
 * Features:
 * - Zoom in/out buttons
 * - Zoom percentage display
 * - Reset zoom button
 * - Keyboard shortcuts (Ctrl/Cmd + Plus/Minus/0)
 * - Mouse wheel zoom (Ctrl/Cmd + Scroll)
 */
export function ZoomControls() {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, initializeZoomLevel } = useJobCardStore()

  // Initialize zoom level from localStorage after client-side hydration
  useEffect(() => {
    initializeZoomLevel()
  }, [initializeZoomLevel])

  const canZoomIn = zoomLevel < 150
  const canZoomOut = zoomLevel > 50
  const canReset = zoomLevel !== 100

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Zoom Out Button */}
      <button
        onClick={zoomOut}
        disabled={!canZoomOut}
        className={`p-1.5 rounded-md transition-all ${
          canZoomOut
            ? 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 active:scale-95'
            : 'opacity-40 cursor-not-allowed text-gray-400'
        }`}
        title="Zoom Out (Ctrl/Cmd + Minus)"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>

      {/* Zoom Percentage Display */}
      <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-md min-w-[70px] justify-center">
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          {zoomLevel}%
        </span>
      </div>

      {/* Zoom In Button */}
      <button
        onClick={zoomIn}
        disabled={!canZoomIn}
        className={`p-1.5 rounded-md transition-all ${
          canZoomIn
            ? 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 active:scale-95'
            : 'opacity-40 cursor-not-allowed text-gray-400'
        }`}
        title="Zoom In (Ctrl/Cmd + Plus)"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Reset Button */}
      <button
        onClick={resetZoom}
        disabled={!canReset}
        className={`p-1.5 rounded-md transition-all ${
          canReset
            ? 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 active:scale-95'
            : 'opacity-40 cursor-not-allowed text-gray-400'
        }`}
        title="Reset Zoom (Ctrl/Cmd + 0)"
        aria-label="Reset zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}
