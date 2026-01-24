'use client'

import React, { useEffect, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize zoom level from localStorage after client-side hydration
  useEffect(() => {
    initializeZoomLevel()
  }, [initializeZoomLevel])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus to zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        zoomIn()
      }
      // Ctrl/Cmd + Minus to zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        zoomOut()
      }
      // Ctrl/Cmd + 0 to reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetZoom()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomIn, zoomOut, resetZoom])

  // Mouse wheel zoom (Ctrl/Cmd + Scroll)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only zoom when Ctrl/Cmd key is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()

        // Determine scroll direction and zoom accordingly
        if (e.deltaY < 0) {
          zoomIn()
        } else if (e.deltaY > 0) {
          zoomOut()
        }
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [zoomIn, zoomOut])

  const canZoomIn = zoomLevel < 150
  const canZoomOut = zoomLevel > 50
  const canReset = zoomLevel !== 100

  return (
    <div ref={containerRef} className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
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
