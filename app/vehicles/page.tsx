'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  User,
  Hash,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { VehicleRegistrySkeleton } from '@/components/ui/skeleton/vehicle-registry-skeleton'

/**
 * Bike Management Page - Vehicle Registry
 *
 * Customer bike registry with ownership, VIN, and engine number tracking.
 * Based on RevOS-features.md specification.
 */

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  engineNumber: string
  chassisNumber: string
  licensePlate: string
  customerId: string
  customerName: string
  customerPhone?: string
  category?: string
  color?: string
  status?: string
  mileage?: number
  lastServiceDate?: string
  notes?: string
  createdAt: string
}

/**
 * Format license plate to Indian format (KA-03-LB-3232)
 * Handles various input formats and converts to standard format
 */
function formatLicensePlate(licensePlate: string): string {
  if (!licensePlate) return 'N/A'

  // Remove all spaces, hyphens, and special characters
  const cleaned = licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Indian license plate format: XX-XX-XX-XXXX
  // Example: KA03LB3232 -> KA-03-LB-3232

  // Check if it's the standard Indian format (10 characters: 2 letters + 2 digits + 2 letters + 4 digits)
  if (cleaned.length === 10) {
    const stateCode = cleaned.substring(0, 2)
    const districtCode = cleaned.substring(2, 4)
    const series = cleaned.substring(4, 6)
    const number = cleaned.substring(6, 10)
    return `${stateCode}-${districtCode}-${series}-${number}`
  }

  // Handle old format (9 characters): KA-3-LB-3232
  if (cleaned.length === 9) {
    const stateCode = cleaned.substring(0, 2)
    const districtCode = cleaned.substring(2, 3)
    const series = cleaned.substring(3, 5)
    const number = cleaned.substring(5, 9)
    return `${stateCode}-0${districtCode}-${series}-${number}`
  }

  // If it doesn't match expected formats, return as-is with hyphens between logical parts
  if (cleaned.length >= 8) {
    // Try to format by grouping
    if (/^[A-Z]{2}\d+[A-Z]+\d+$/.test(cleaned)) {
      const match = cleaned.match(/^([A-Z]{2})(\d+)([A-Z]+)(\d+)$/)
      if (match) {
        const [, state, district, series, number] = match
        // Pad district code to 2 digits if needed
        const paddedDistrict = district.length === 1 ? `0${district}` : district
        return `${state}-${paddedDistrict}-${series}-${number}`
      }
    }
  }

  // Return original if can't format
  return licensePlate
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [makeFilter, setMakeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'make' | 'customer'>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        setError('Invalid user session')
        setIsLoading(false)
        return
      }

      console.log('Fetching vehicles for garage ID:', garageId)

      // Fetch vehicles from API
      const response = await fetch(`/api/vehicles/list?garageId=${garageId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch vehicles')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch vehicles')
      }

      setVehicles(result.vehicles)
      setFilteredVehicles(result.vehicles)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading vehicles:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  // Extract unique makes and categories for filters
  const makes = ['all', ...Array.from(new Set(vehicles.map((v) => v.make)))]
  const categories = ['all', ...Array.from(new Set(vehicles.map((v) => v.category || 'Other').filter(Boolean)))]

  useEffect(() => {
    let filtered = [...vehicles]

    // Apply search filter - search by make, model, customer, VIN, engine
    if (searchQuery) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.engineNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply make filter
    if (makeFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.make === makeFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.category === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'make':
          return a.make.localeCompare(b.make)
        case 'customer':
          return a.customerName.localeCompare(b.customerName)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
    setCurrentPage(1) // Reset to page 1 when filters change
  }, [searchQuery, makeFilter, categoryFilter, sortBy, vehicles])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

  const handleViewVehicle = (id: string) => {
    router.push(`/vehicles/${id}`)
  }

  const handleEditVehicle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    router.push(`/vehicles/${id}/edit`)
  }

  const handleDeleteVehicle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to remove this bike from the registry?')) {
      setVehicles(vehicles.filter((v) => v.id !== id))
    }
  }

  // Loading State - return early with skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-gray-700 rounded-full" />
            <div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-64 mb-2" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2" />
              <div className="h-7 bg-gray-200 rounded animate-pulse w-12" />
            </div>
          ))}
        </motion.div>

        {/* Search and Filters Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex gap-3">
              <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Vehicle List Skeleton */}
        <VehicleRegistrySkeleton count={10} />
      </div>
    )
  }

  // Error State - return early with error message
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Failed to load vehicles</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gray-700 rounded-full" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Vehicle Registry
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Customer vehicle registry with ownership details
            </p>
          </div>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Total Bikes</p>
          <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Registered Owners</p>
          <p className="text-2xl font-bold text-gray-900">{new Set(vehicles.map(v => v.customerId)).size}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Makes</p>
          <p className="text-2xl font-bold text-gray-700">{makes.length - 1}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Sport Bikes</p>
          <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.category === 'Sport').length}</p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-xl border border-gray-200 shadow-card p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make, model, customer, VIN, or engine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Make Filter */}
            <div className="relative">
              <select
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer"
              >
                {makes.map((make) => (
                  <option key={make} value={make}>
                    {make === 'all' ? 'All Makes' : make}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="make">Sort by Make</option>
                <option value="customer">Sort by Customer</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vehicle List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-12 text-center">
            <MotorcycleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {vehicles.length === 0 ? 'No vehicles registered yet' : 'No bikes found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {vehicles.length === 0
                ? 'Add your first vehicle to get started'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {vehicles.length === 0 ? (
              <button
                onClick={() => router.push('/customer-management/add')}
                className="text-gray-700 font-medium hover:underline"
              >
                Add a customer with vehicle
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setMakeFilter('all')
                  setCategoryFilter('all')
                }}
                className="text-gray-700 font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {paginatedVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleViewVehicle(vehicle.id)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col gap-4">
                      {/* Vehicle Icon & Basic Info */}
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-gray-200 shrink-0">
                          <MotorcycleIcon className="h-7 w-7 text-gray-700" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                            {vehicle.make}
                          </h3>
                          <p className="text-gray-700 font-semibold text-base mb-1">
                            {vehicle.model}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{vehicle.year}</span>
                            {vehicle.category && (
                              <>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                  {vehicle.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">Owner</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {vehicle.customerName}
                          </p>
                          {vehicle.customerPhone && (
                            <p className="text-xs text-gray-500 mt-0.5">{vehicle.customerPhone}</p>
                          )}
                        </div>
                      </div>

                      {/* License Plate */}
                      <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Hash className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">License Plate</p>
                          <p className="text-sm font-semibold text-gray-900">{formatLicensePlate(vehicle.licensePlate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewVehicle(vehicle.id)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleEditVehicle(e, vehicle.id)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        title="Edit Bike"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteVehicle(e, vehicle.id)}
                        className="p-2 text-gray-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                        title="Remove Bike"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">License Plate</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedVehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => handleViewVehicle(vehicle.id)}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Vehicle Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200 flex-shrink-0">
                            <MotorcycleIcon className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{vehicle.make}</p>
                            <p className="text-sm font-semibold text-gray-700">{vehicle.model}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              <span>{vehicle.year}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-700 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{vehicle.customerName}</p>
                            {vehicle.customerPhone && (
                              <p className="text-xs text-gray-500">{vehicle.customerPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* License Plate */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900">{formatLicensePlate(vehicle.licensePlate)}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {vehicle.category ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-900 text-xs font-medium rounded-full inline-block">
                            {vehicle.category}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewVehicle(vehicle.id)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditVehicle(e, vehicle.id)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Edit Bike"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteVehicle(e, vehicle.id)
                            }}
                            className="p-2 text-gray-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                            title="Remove Bike"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {filteredVehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 flex items-center justify-between"
        >
          <div className="text-sm text-gray-600">
            Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
            <span className="font-medium text-gray-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </motion.button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages adjacent to current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                })
                .map((page, index, arr) => {
                  // Add ellipsis for gaps in page numbers
                  const prevPage = arr[index - 1]
                  const showEllipsis = prevPage && page > prevPage + 1

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <motion.button
                        whileHover={{ scale: currentPage !== page ? 1.05 : 1 }}
                        whileTap={{ scale: currentPage !== page ? 0.95 : 1 }}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gray-700 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </motion.button>
                    </React.Fragment>
                  )
                })}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
