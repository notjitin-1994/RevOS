'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  ChevronDown,
  Calendar,
  Mail,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { RequestMakeModelModal } from './request-make-model-modal'
import { VehicleCatalogSkeleton } from '@/components/ui/skeleton/vehicle-catalog-skeleton'

interface ModelData {
  id: string
  name: string
  category: string
  years: number[]
}

interface MakeData {
  id: string
  name: string
  country: string
  logoUrl: string | null
  models: ModelData[]
  createdAt: string
}

interface ServiceScopeClientProps {
  initialMakes: MakeData[]
}

function MakeLogo({ logoUrl, makeName }: { logoUrl: string | null; makeName: string }) {
  const [imageError, setImageError] = React.useState(false)

  if (logoUrl && !imageError) {
    // Check if it's a local SVG file
    if (logoUrl.startsWith('/logos/')) {
      return (
        <img
          src={logoUrl}
          alt={`${makeName} logo`}
          className="h-8 w-8 object-contain"
          onError={() => {
            console.log(`Failed to load logo for ${makeName}: ${logoUrl}`)
            setImageError(true)
          }}
        />
      )
    }

    // External URL
    return (
      <img
        src={logoUrl}
        alt={`${makeName} logo`}
        className="h-8 w-8 object-contain"
        onError={() => {
          console.log(`Failed to load logo for ${makeName}: ${logoUrl}`)
          setImageError(true)
        }}
      />
    )
  }

  return <MotorcycleIcon className="h-7 w-7 text-gray-700" />
}

export function ServiceScopeClient({ initialMakes }: ServiceScopeClientProps) {
  const router = useRouter()
  const [makes, setMakes] = useState<MakeData[]>(initialMakes)
  const [filteredMakes, setFilteredMakes] = useState<MakeData[]>(initialMakes)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'models' | 'newest'>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const itemsPerPage = 10

  // Extract unique countries
  const countries = ['all', ...Array.from(new Set(makes.map((m) => m.country)))]

  useEffect(() => {
    let filtered = [...makes]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (make) =>
          make.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          make.models.some((model) =>
            model.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // Apply country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter((make) => make.country === countryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'models':
          return b.models.length - a.models.length
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredMakes(filtered)
    setCurrentPage(1) // Reset to page 1 when filters change
  }, [searchQuery, countryFilter, sortBy, makes])

  // Pagination
  const totalPages = Math.ceil(filteredMakes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMakes = filteredMakes.slice(startIndex, endIndex)

  const handleViewMake = (id: string) => {
    router.push(`/vehicle-catalog/${id}`)
  }

  const getYearRange = (years: number[]) => {
    if (years.length === 0) return 'N/A'
    const min = Math.min(...years)
    const max = Math.max(...years)
    return min === max ? `${min}` : `${min} - ${max}`
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
          <div className="h-10 w-1 bg-gray-900 rounded-full" />
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
              Vehicle Catalog
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Master data for supported makes, models, and years
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
        <div className="bg-graphite-700 border border-graphite-700 rounded-xl p-4 md:p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80 mb-2">Total Makes</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{makes.length}</p>
        </div>
        <div className="bg-graphite-700 border border-graphite-700 rounded-xl p-4 md:p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80 mb-2">Total Models</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{makes.reduce((acc, m) => acc + m.models.length, 0)}</p>
        </div>
        <div className="bg-graphite-700 border border-graphite-700 rounded-xl p-4 md:p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80 mb-2">Countries</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{countries.length - 1}</p>
        </div>
        <div className="bg-graphite-700 border border-graphite-700 rounded-xl p-4 md:p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80 mb-2">Avg Models/Make</p>
          <p className="text-2xl md:text-3xl font-bold text-white">
            {makes.length > 0 ? Math.round(makes.reduce((acc, m) => acc + m.models.length, 0) / makes.length) : 0}
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-card mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-center w-full sm:w-auto">
            {/* Country Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all cursor-pointer text-sm"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all cursor-pointer text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="models">Sort by Model Count</option>
                <option value="newest">Sort by Newest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Request to Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-graphite-700 hover:bg-graphite-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Add Make/New Models</span>
              <span className="sm:hidden">Add Make/New Models</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Makes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {isLoading ? (
          <VehicleCatalogSkeleton count={10} />
        ) : filteredMakes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <MotorcycleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No makes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setCountryFilter('all')
              }}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {paginatedMakes.map((make, index) => (
                <motion.div
                  key={make.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-card hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
                >
                  {/* Make Header */}
                  <div
                    onClick={() => handleViewMake(make.id)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Make Logo/Icon */}
                      <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                        <MakeLogo logoUrl={make.logoUrl} makeName={make.name} />
                      </div>

                      {/* Make Info */}
                      <div className="flex-1 min-w-0">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{make.name}</h3>
                          <p className="text-sm text-gray-600">{make.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Models Preview (First 4 models) */}
                  {make.models.length > 0 && (
                    <div className="px-5 pb-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {make.models.slice(0, 4).map((model) => (
                          <div
                            key={model.id}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm text-gray-900 font-medium">{model.name}</p>
                              <p className="text-xs text-gray-600">{model.category}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{getYearRange(model.years)}</span>
                            </div>
                          </div>
                        ))}
                        {make.models.length > 4 && (
                          <div
                            onClick={() => handleViewMake(make.id)}
                            className="flex items-center justify-center py-2 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm text-gray-700 font-medium">
                              +{make.models.length - 4} more models
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Make</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Country</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600"># Models</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Models</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMakes.map((make, index) => (
                    <motion.tr
                      key={make.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => handleViewMake(make.id)}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Make Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                            <MakeLogo logoUrl={make.logoUrl} makeName={make.name} />
                          </div>
                          <p className="text-base font-semibold text-gray-900">{make.name}</p>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{make.country}</p>
                      </td>

                      {/* Model Count */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {make.models.length} {make.models.length === 1 ? 'model' : 'models'}
                        </span>
                      </td>

                      {/* Sample Models */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {make.models.slice(0, 3).map((model) => (
                            <span
                              key={model.id}
                              className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded border border-gray-200"
                            >
                              {model.name}
                            </span>
                          ))}
                          {make.models.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                              +{make.models.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {filteredMakes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center justify-between"
          >
            <div className="text-sm text-gray-700">
              Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, arr) => {
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
                          className={cn(
                            'min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            currentPage === page
                              ? 'bg-gray-700 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          )}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Request Make/Model Modal */}
      <RequestMakeModelModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  )
}
