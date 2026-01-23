'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ChevronRight, Package, Globe, Check, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Vehicle Fitment Selector Component
 *
 * Selection component for choosing compatible vehicles when adding/editing a part.
 * Supports both universal parts (fits all vehicles) and individual vehicle selection.
 *
 * Features:
 * - Universal Parts Toggle with visual indicator
 * - Grouped accordion display by Make (same design as VehicleFitmentDisplay)
 * - Checkboxes for selecting all models from a Make
 * - Individual checkboxes on each vehicle badge
 * - Select All / Clear All buttons
 * - Inline search with debouncing
 * - Smart summary showing selected vehicles as removable badges
 * - Country/region flags
 * - Mobile-optimized responsive design
 * - Full keyboard navigation and ARIA support
 * - Performance optimized with React.memo
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompatibleVehicle {
  id: string
  make: string
  model: string
  years: number[]
  category?: string
}

export interface VehicleFitmentSelectorProps {
  /** All available vehicles in the catalog */
  vehicles: CompatibleVehicle[]
  /** Currently selected vehicle IDs */
  selectedVehicleIds: string[]
  /** Whether part is universal (fits all vehicles) */
  isUniversal: boolean
  /** Callback when selection changes */
  onSelectionChange: (ids: string[]) => void
  /** Callback when universal toggle changes */
  onUniversalChange: (isUniversal: boolean) => void
  /** Maximum number of models to show before "Show More" (default: 4) */
  maxVisible?: number
  /** Optional CSS class name */
  className?: string
}

// Country flag emoji mapping for major motorcycle manufacturing countries
const COUNTRY_FLAGS: Record<string, string> = {
  Japan: '🇯🇵',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  India: '🇮🇳',
  Italy: '🇮🇹',
  Germany: '🇩🇪',
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
  Austria: '🇦🇹',
  Spain: '🇪🇸',
  France: '🇫🇷',
  Sweden: '🇸🇪',
  Czech: '🇨🇿',
  'Czech Republic': '🇨🇿',
  Korea: '🇰🇷',
  'South Korea': '🇰🇷',
  China: '🇨🇳',
  Taiwan: '🇹🇼',
  Brazil: '🇧🇷',
  Thailand: '🇹🇭',
}

// Infer country from make name
const getMakeCountry = (make: string): string => {
  const countryMap: Record<string, string> = {
    Honda: 'Japan',
    Yamaha: 'Japan',
    Kawasaki: 'Japan',
    Suzuki: 'Japan',
    'Harley-Davidson': 'USA',
    Indian: 'USA',
    Buell: 'USA',
    Victory: 'USA',
    Bajaj: 'India',
    'Royal Enfield': 'India',
    TVS: 'India',
    Ducati: 'Italy',
    Piaggio: 'Italy',
    Vespa: 'Italy',
    BMW: 'Germany',
    Triumph: 'UK',
    Norton: 'UK',
    KTM: 'Austria',
    Husqvarna: 'Austria',
    'MV Agusta': 'Italy',
    Aprilia: 'Italy',
    'Moto Guzzi': 'Italy',
    Husaberg: 'Austria',
  }
  return countryMap[make] || 'Unknown'
}

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

/**
 * Universal part toggle component
 */
const UniversalToggle = React.memo<{
  isUniversal: boolean
  totalVehicles: number
  onToggle: () => void
}>(({ isUniversal, totalVehicles, onToggle }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
        isUniversal
          ? "bg-graphite-100 border-graphite-700"
          : "bg-gray-50 border-gray-200 hover:border-gray-300"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "relative w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
          isUniversal
            ? "bg-graphite-700 border-graphite-700"
            : "bg-white border-gray-300 hover:border-graphite-700"
        )}
        aria-checked={isUniversal}
        role="checkbox"
      >
        {isUniversal && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-900">Universal Part</span>
            <p className="text-xs text-gray-600">
              {isUniversal ? 'Fits all motorcycles' : 'Check to mark as universal fitment'}
            </p>
          </div>
          {isUniversal && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 bg-graphite-700 text-white rounded-full text-xs font-semibold flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              {totalVehicles} vehicles
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
})
UniversalToggle.displayName = 'UniversalToggle'

/**
 * Universal part display component
 */
const UniversalPartDisplay = React.memo<{
  totalVehicles: number
}>(({ totalVehicles }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-8 bg-gradient-to-br from-graphite-100 to-gray-50 rounded-xl border-2 border-graphite-700"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-graphite-700 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Universal Part</h3>
          <p className="text-sm text-gray-600 mt-1">
            Compatible with all {totalVehicles} motorcycles in catalog
          </p>
        </div>
        <div className="mt-2 px-4 py-2 bg-graphite-700 text-white rounded-full text-sm font-semibold">
          Fits All Makes & Models
        </div>
      </div>
    </motion.div>
  )
})
UniversalPartDisplay.displayName = 'UniversalPartDisplay'

/**
 * Individual vehicle selection badge component
 */
const VehicleSelectionBadge = React.memo<{
  vehicle: CompatibleVehicle
  isSelected: boolean
  onToggle: () => void
}>(({ vehicle, isSelected, onToggle }) => {
  const yearRange = vehicle.years && vehicle.years.length > 0
    ? vehicle.years.length === 1
      ? `${vehicle.years[0]}`
      : `${Math.min(...vehicle.years)}-${Math.max(...vehicle.years)}`
    : ''

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:ring-offset-2",
        "active:scale-95 transform",
        isSelected
          ? "bg-graphite-700 text-white border-graphite-700 shadow-sm"
          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
      )}
      aria-label={`${vehicle.make} ${vehicle.model} ${yearRange}`}
    >
      <div className={cn(
        "w-4 h-4 rounded border flex items-center justify-center",
        isSelected ? "bg-white border-white" : "border-gray-400"
      )}>
        {isSelected && <Check className="h-3 w-3 text-graphite-700" strokeWidth={3} />}
      </div>
      <span className="font-semibold">{vehicle.model}</span>
      {yearRange && (
        <span className="text-xs opacity-70">({yearRange})</span>
      )}
    </button>
  )
})
VehicleSelectionBadge.displayName = 'VehicleSelectionBadge'

/**
 * Selected vehicle badge (removable)
 */
const SelectedVehicleBadge = React.memo<{
  vehicle: CompatibleVehicle
  onRemove: () => void
}>(({ vehicle, onRemove }) => {
  const yearRange = vehicle.years && vehicle.years.length > 0
    ? vehicle.years.length === 1
      ? `${vehicle.years[0]}`
      : `${Math.min(...vehicle.years)}-${Math.max(...vehicle.years)}`
    : ''

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-graphite-700 text-white rounded-full text-sm font-medium border border-graphite-700"
    >
      <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
      {yearRange && (
        <span className="text-xs opacity-70">({yearRange})</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 hover:bg-gray-900/10 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${vehicle.make} ${vehicle.model}`}
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </motion.div>
  )
})
SelectedVehicleBadge.displayName = 'SelectedVehicleBadge'

/**
 * Accordion section for a single make with selection
 */
const MakeSelectionAccordion = React.memo<{
  make: string
  vehicles: CompatibleVehicle[]
  selectedIds: Set<string>
  isExpanded: boolean
  onToggle: () => void
  onVehicleToggle: (id: string) => void
  onSelectAllInMake: () => void
  maxVisible: number
}>(({ make, vehicles, selectedIds, isExpanded, onToggle, onVehicleToggle, onSelectAllInMake, maxVisible }) => {
  const country = getMakeCountry(make)
  const flag = COUNTRY_FLAGS[country] || '🌍'
  const selectedCount = vehicles.filter(v => selectedIds.has(v.id)).length
  const allSelected = selectedCount === vehicles.length
  const someSelected = selectedCount > 0 && selectedCount < vehicles.length
  const showMoreButton = vehicles.length > maxVisible

  const visibleVehicles = isExpanded ? vehicles : vehicles.slice(0, maxVisible)
  const hiddenCount = vehicles.length - maxVisible

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* Accordion Header with Make Selection Checkbox */}
      <div className="flex items-center">
        {/* Select All Checkbox for Make */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelectAllInMake()
          }}
          className={cn(
            "relative w-5 h-5 rounded border flex items-center justify-center ml-4 mr-3 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:ring-offset-2",
            allSelected
              ? "bg-graphite-700 border-graphite-700"
              : someSelected
              ? "bg-graphite-700 border-graphite-700"
              : "bg-white border-gray-300 hover:border-graphite-700"
          )}
          aria-checked={allSelected}
          role="checkbox"
        >
          {(allSelected || someSelected) && (
            <Check
              className={cn(
                "h-3 w-3 transition-colors duration-200",
                allSelected ? "text-white" : "text-white/50"
              )}
              strokeWidth={3}
            />
          )}
        </button>

        {/* Accordion Toggle Button */}
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
          aria-expanded={isExpanded}
          aria-controls={`make-${make.toLowerCase().replace(/\s+/g, '-')}-content`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-gray-500"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
            <span className="text-base font-semibold text-gray-900">{make}</span>
            <span className="text-sm text-gray-500">
              ({vehicles.length} model{vehicles.length !== 1 ? 's' : ''})
            </span>
            <span className="text-lg" aria-label={`Made in ${country}`}>
              {flag}
            </span>
          </div>

          {/* Selection indicator */}
          <div className="text-xs font-medium">
            {allSelected ? (
              <span className="text-graphite-700">All selected</span>
            ) : someSelected ? (
              <span className="text-gray-500">{selectedCount} selected</span>
            ) : null}
          </div>
        </button>
      </div>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`make-${make.toLowerCase().replace(/\s+/g, '-')}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-14">
              {/* Badge Grid */}
              <div className="flex flex-wrap gap-2">
                {visibleVehicles.map((vehicle) => (
                  <VehicleSelectionBadge
                    key={vehicle.id}
                    vehicle={vehicle}
                    isSelected={selectedIds.has(vehicle.id)}
                    onToggle={() => onVehicleToggle(vehicle.id)}
                  />
                ))}
              </div>

              {/* Show More Button */}
              {showMoreButton && hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggle()
                  }}
                  className="mt-3 text-sm font-medium text-graphite-700 hover:text-graphite-900 transition-colors focus:outline-none focus:underline"
                >
                  +{hiddenCount} more model{hiddenCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
MakeSelectionAccordion.displayName = 'MakeSelectionAccordion'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VehicleFitmentSelector({
  vehicles,
  selectedVehicleIds,
  isUniversal,
  onSelectionChange,
  onUniversalChange,
  maxVisible = 4,
  className,
}: VehicleFitmentSelectorProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMakes, setExpandedMakes] = useState<Set<string>>(new Set())
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Convert selected IDs to Set for O(1) lookups
  const selectedSet = useMemo(() => new Set(selectedVehicleIds), [selectedVehicleIds])

  // Group vehicles by make
  const groupedVehicles = useMemo(() => {
    const groups = vehicles.reduce((acc, vehicle) => {
      if (!acc[vehicle.make]) {
        acc[vehicle.make] = []
      }
      acc[vehicle.make].push(vehicle)
      return acc
    }, {} as Record<string, CompatibleVehicle[]>)

    // Sort vehicles within each make by model name
    Object.keys(groups).forEach((make) => {
      groups[make].sort((a, b) => a.model.localeCompare(b.model))
    })

    return groups
  }, [vehicles])

  // Filter vehicles based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedVehicles
    }

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, CompatibleVehicle[]> = {}

    Object.entries(groupedVehicles).forEach(([make, vehicles]) => {
      const matchingVehicles = vehicles.filter(
        (v) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          (v.category && v.category.toLowerCase().includes(query)) ||
          (v.years && v.years.some((year) => year.toString().includes(query)))
      )

      if (matchingVehicles.length > 0) {
        filtered[make] = matchingVehicles
      }
    })

    return filtered
  }, [groupedVehicles, searchQuery])

  // Calculate total vehicle count
  const totalVehicles = useMemo(() => vehicles.length, [vehicles])

  // Get sorted makes (alphabetically)
  const sortedMakes = useMemo(() => {
    return Object.keys(filteredGroups).sort((a, b) => a.localeCompare(b))
  }, [filteredGroups])

  // Get selected vehicles objects
  const selectedVehicles = useMemo(() => {
    return vehicles.filter(v => selectedSet.has(v.id))
  }, [vehicles, selectedSet])

  // Handle accordion toggle
  const toggleMake = useCallback((make: string) => {
    setExpandedMakes((prev) => {
      const next = new Set(prev)
      if (next.has(make)) {
        next.delete(make)
      } else {
        next.add(make)
      }
      return next
    })
  }, [])

  // Handle vehicle selection toggle
  const handleVehicleToggle = useCallback((vehicleId: string) => {
    const newSet = new Set(selectedSet)
    if (newSet.has(vehicleId)) {
      newSet.delete(vehicleId)
    } else {
      newSet.add(vehicleId)
    }
    onSelectionChange(Array.from(newSet))
  }, [selectedSet, onSelectionChange])

  // Handle select all vehicles in a make
  const handleSelectAllInMake = useCallback((make: string) => {
    const makeVehicles = filteredGroups[make]
    const makeIds = new Set(makeVehicles.map(v => v.id))
    const allSelected = makeVehicles.every(v => selectedSet.has(v.id))

    const newSet = new Set(selectedSet)

    if (allSelected) {
      // Deselect all in this make
      makeIds.forEach(id => newSet.delete(id))
    } else {
      // Select all in this make
      makeIds.forEach(id => newSet.add(id))
    }

    onSelectionChange(Array.from(newSet))
  }, [filteredGroups, selectedSet, onSelectionChange])

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const allIds = vehicles.map(v => v.id)
    onSelectionChange(allIds)
  }, [vehicles, onSelectionChange])

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  // Handle remove selected vehicle
  const handleRemoveVehicle = useCallback((vehicleId: string) => {
    const newSet = new Set(selectedSet)
    newSet.delete(vehicleId)
    onSelectionChange(Array.from(newSet))
  }, [selectedSet, onSelectionChange])

  // Handle universal toggle
  const handleUniversalToggle = useCallback(() => {
    const newUniversalState = !isUniversal
    onUniversalChange(newUniversalState)

    // If switching to universal, clear individual selections
    if (newUniversalState && selectedVehicleIds.length > 0) {
      onSelectionChange([])
    }
  }, [isUniversal, onUniversalChange, selectedVehicleIds, onSelectionChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, make: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleMake(make)
      }
    },
    [toggleMake]
  )

  return (
    <div className={cn("bg-white rounded-2xl shadow-card border border-gray-200", className)}>
      {/* Universal Toggle Section */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <UniversalToggle
          isUniversal={isUniversal}
          totalVehicles={totalVehicles}
          onToggle={handleUniversalToggle}
        />
      </div>

      {/* If Universal, show special display */}
      {isUniversal ? (
        <div className="p-6">
          <UniversalPartDisplay totalVehicles={totalVehicles} />
        </div>
      ) : (
        <>
          {/* Header Section with Summary */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Vehicles
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedVehicleIds.length > 0
                    ? `${selectedVehicleIds.length} vehicle${selectedVehicleIds.length !== 1 ? 's' : ''} selected`
                    : 'No vehicles selected'}
                </p>
              </div>

              {/* Select All / Clear All Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={selectedVehicleIds.length === totalVehicles}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:ring-offset-2",
                    selectedVehicleIds.length === totalVehicles
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-graphite-700 text-white hover:bg-graphite-800"
                  )}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={selectedVehicleIds.length === 0}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:ring-offset-2",
                    selectedVehicleIds.length === 0
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Selected Vehicles Summary */}
          {selectedVehicles.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {selectedVehicles.slice(0, 10).map((vehicle) => (
                    <SelectedVehicleBadge
                      key={vehicle.id}
                      vehicle={vehicle}
                      onRemove={() => handleRemoveVehicle(vehicle.id)}
                    />
                  ))}
                  {selectedVehicles.length > 10 && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      +{selectedVehicles.length - 10} more
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2",
                  "h-4 w-4 text-gray-400 pointer-events-none"
                )}
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles by make, model, category, or year..."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5",
                  "bg-white border border-gray-300 rounded-xl",
                  "text-sm text-gray-900 placeholder-gray-500",
                  "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent",
                  "transition-all duration-200"
                )}
                aria-label="Search vehicles"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Empty State - No vehicles in catalog */}
          {vehicles.length === 0 && (
            <div className="px-6 py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No vehicles in catalog</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add motorcycles to your vehicle catalog first
                </p>
              </div>
            </div>
          )}

          {/* No search results */}
          {searchQuery.trim() && sortedMakes.length === 0 && vehicles.length > 0 && (
            <div className="px-6 py-12">
              <div className="text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No vehicles match your search</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search terms
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-sm font-medium text-graphite-700 hover:text-graphite-900"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}

          {/* Accordion Sections */}
          {sortedMakes.length > 0 && (
            <div className="divide-y divide-gray-200">
              {sortedMakes.map((make) => (
                <MakeSelectionAccordion
                  key={make}
                  make={make}
                  vehicles={filteredGroups[make]}
                  selectedIds={selectedSet}
                  isExpanded={expandedMakes.has(make)}
                  onToggle={() => toggleMake(make)}
                  onVehicleToggle={handleVehicleToggle}
                  onSelectAllInMake={() => handleSelectAllInMake(make)}
                  maxVisible={maxVisible}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          {sortedMakes.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Showing {sortedMakes.length} manufacturers with {Object.values(filteredGroups).reduce((sum, v) => sum + v.length, 0)} models
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Display name for debugging
VehicleFitmentSelector.displayName = 'VehicleFitmentSelector'
