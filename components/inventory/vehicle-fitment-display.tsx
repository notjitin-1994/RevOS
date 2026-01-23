'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ChevronRight, Package, Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Vehicle Fitment Display Component
 *
 * Modern, compact accordion-based display for compatible vehicles.
 * Groups vehicles by make with progressive disclosure via badges.
 *
 * Features:
 * - Grouped accordion by Make (collapsed by default)
 * - Badge cloud for models (first 4 visible, rest expandable)
 * - Inline search with debouncing
 * - Summary text with total vehicle count
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

export interface VehicleFitmentDisplayProps {
  /** Array of compatible vehicles to display */
  vehicles: CompatibleVehicle[]
  /** Maximum number of models to show before "Show More" (default: 4) */
  maxVisible?: number
  /** Optional CSS class name */
  className?: string
  /** Whether this is a universal part (fits all vehicles) */
  isUniversalPart?: boolean
  /** Total number of vehicles in catalog (for universal parts display) */
  totalVehicleCount?: number
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
 * Individual vehicle badge component
 * Memoized for performance when rendering many badges
 */
const VehicleBadge = React.memo<{
  vehicle: CompatibleVehicle
  onClick?: () => void
}>(({ vehicle, onClick }) => {
  const yearRange = vehicle.years && vehicle.years.length > 0
    ? vehicle.years.length === 1
      ? `${vehicle.years[0]}`
      : `${Math.min(...vehicle.years)}-${Math.max(...vehicle.years)}`
    : ''

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5",
        "bg-gray-50 text-gray-700 text-sm font-medium",
        "rounded-full border border-gray-200",
        "hover:bg-graphite-700 hover:text-white",
        "transition-colors duration-200 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:ring-offset-2",
        "active:scale-95 transform"
      )}
      aria-label={`${vehicle.make} ${vehicle.model} ${yearRange}`}
    >
      <span className="font-semibold">{vehicle.model}</span>
      {yearRange && (
        <span className="text-xs text-gray-500">({yearRange})</span>
      )}
    </button>
  )
})
VehicleBadge.displayName = 'VehicleBadge'

/**
 * Accordion section for a single make
 */
const MakeAccordion = React.memo<{
  make: string
  vehicles: CompatibleVehicle[]
  isExpanded: boolean
  onToggle: () => void
  maxVisible: number
}>(({ make, vehicles, isExpanded, onToggle, maxVisible }) => {
  const country = getMakeCountry(make)
  const flag = COUNTRY_FLAGS[country] || '🌍'
  const showMoreButton = vehicles.length > maxVisible

  const visibleVehicles = isExpanded ? vehicles : vehicles.slice(0, maxVisible)
  const hiddenCount = vehicles.length - maxVisible

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "hover:bg-gray-50 transition-colors duration-200",
          "focus:outline-none focus:bg-gray-50"
        )}
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
      </button>

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
            <div className="px-4 pb-4 pl-11">
              {/* Badge Grid */}
              <div className="flex flex-wrap gap-2">
                {visibleVehicles.map((vehicle) => (
                  <VehicleBadge key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>

              {/* Show More Button */}
              {showMoreButton && !isExpanded && hiddenCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggle()
                  }}
                  className={cn(
                    "mt-3 text-sm font-medium text-graphite-700",
                    "hover:text-graphite-900 transition-colors",
                    "focus:outline-none focus:underline"
                  )}
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
MakeAccordion.displayName = 'MakeAccordion'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VehicleFitmentDisplay({
  vehicles,
  maxVisible = 4,
  className,
  isUniversalPart = false,
  totalVehicleCount = 0,
}: VehicleFitmentDisplayProps) {
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
  const totalVehicles = useMemo(() => {
    return Object.values(filteredGroups).reduce((sum, vehicles) => sum + vehicles.length, 0)
  }, [filteredGroups])

  // Get sorted makes (alphabetically)
  const sortedMakes = useMemo(() => {
    return Object.keys(filteredGroups).sort((a, b) => a.localeCompare(b))
  }, [filteredGroups])

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

  // Empty state
  if (vehicles.length === 0 && !isUniversalPart) {
    return (
      <div className={cn("bg-white rounded-2xl shadow-card border border-gray-200 p-12", className)}>
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No compatible vehicles</p>
          <p className="text-sm text-gray-500 mt-1">
            This part has not been assigned to any vehicles yet
          </p>
        </div>
      </div>
    )
  }

  // Universal Part Display
  if (isUniversalPart) {
    return (
      <div className={cn("bg-white rounded-2xl shadow-card border border-gray-200 p-6", className)}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8 bg-gradient-to-br from-graphite-100 to-gray-50 rounded-xl border-2 border-graphite-700"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-graphite-700 flex items-center justify-center">
              <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Universal Part</h3>
              <p className="text-sm text-gray-600 mt-1">
                Compatible with all {totalVehicleCount || vehicles.length} motorcycles in catalog
              </p>
            </div>
            <div className="mt-2 px-4 py-2 bg-graphite-700 text-white rounded-full text-sm font-semibold">
              Fits All Makes & Models
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // No search results
  if (searchQuery.trim() && totalVehicles === 0) {
    return (
      <div className={cn("bg-white rounded-2xl shadow-card border border-gray-200 p-12", className)}>
        <div className="text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No vehicles match your search</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search terms
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-sm font-medium text-graphite-700 hover:text-graphite-900"
          >
            Clear search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-2xl shadow-card border border-gray-200", className)}>
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Vehicle Fitment
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Compatible with {totalVehicles} vehicle{totalVehicles !== 1 ? 's' : ''} across {sortedMakes.length} make{sortedMakes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

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
            placeholder="Search vehicles..."
            className={cn(
              "w-full pl-10 pr-4 py-2.5",
              "bg-white border border-gray-300 rounded-xl",
              "text-sm text-gray-900 placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent",
              "transition-all duration-200"
            )}
            aria-label="Search compatible vehicles"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-gray-200">
        {sortedMakes.map((make) => (
          <MakeAccordion
            key={make}
            make={make}
            vehicles={filteredGroups[make]}
            isExpanded={expandedMakes.has(make)}
            onToggle={() => toggleMake(make)}
            maxVisible={maxVisible}
          />
        ))}
      </div>

      {/* Footer */}
      {sortedMakes.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Showing {sortedMakes.length} manufacturers with {totalVehicles} compatible models
          </p>
        </div>
      )}
    </div>
  )
}

// Display name for debugging
VehicleFitmentDisplay.displayName = 'VehicleFitmentDisplay'
