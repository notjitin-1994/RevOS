'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { cn } from '@/lib/utils'

interface ModelData {
  id: string
  name: string
  category: string
  years: number[]
  engine_displacement_cc?: number
  production_status?: 'In Production' | 'Discontinued' | 'Limited'
}

interface MakeData {
  id: string
  name: string
  country: string
  models: ModelData[]
  createdAt: string
}

interface ServiceScopeDetailClientProps {
  make: MakeData
}

type SortOption = 'name-asc' | 'name-desc' | 'category' | 'year-start' | 'year-end' | 'engine' | 'newest' | 'oldest'

export function ServiceScopeDetailClient({ make }: ServiceScopeDetailClientProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const modelsPerPage = 10

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')

  // Mobile filter/sort panel
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getYearRange = (years: number[]) => {
    if (!years || years.length === 0) return 'N/A'
    const min = Math.min(...years)
    const max = Math.max(...years)
    return min === max ? `${min}` : `${min} - ${max}`
  }

  const getStartYear = (years: number[]) => {
    if (!years || years.length === 0) return 0
    return Math.min(...years)
  }

  const getEndYear = (years: number[]) => {
    if (!years || years.length === 0) return 0
    return Math.max(...years)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${make.name} and all its models?`)) {
      router.push('/vehicle-catalog')
    }
  }

  const handleAddModel = () => {
    router.push(`/vehicle-catalog/${make.id}/add`)
  }

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(make.models.map((m) => m.category))
    return Array.from(cats).sort()
  }, [make.models])

  // Get unique production statuses
  const productionStatuses = useMemo(() => {
    const statuses = new Set(make.models.map((m) => m.production_status).filter(Boolean))
    return Array.from(statuses).sort()
  }, [make.models])

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = [...make.models]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((model) =>
        model.name.toLowerCase().includes(query) ||
        model.category.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((model) => model.category === selectedCategory)
    }

    // Apply production status filter
    if (selectedStatus) {
      filtered = filtered.filter((model) => model.production_status === selectedStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'year-start':
          return getStartYear(a.years) - getStartYear(b.years)
        case 'year-end':
          return getEndYear(a.years) - getEndYear(b.years)
        case 'engine':
          return (a.engine_displacement_cc || 0) - (b.engine_displacement_cc || 0)
        case 'newest':
          return getEndYear(b.years) - getEndYear(a.years)
        case 'oldest':
          return getStartYear(a.years) - getStartYear(b.years)
        default:
          return 0
      }
    })

    return filtered
  }, [make.models, searchQuery, selectedCategory, selectedStatus, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedModels.length / modelsPerPage)
  const startIndex = (currentPage - 1) * modelsPerPage
  const endIndex = startIndex + modelsPerPage
  const paginatedModels = filteredAndSortedModels.slice(startIndex, endIndex)

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedStatus, sortBy])

  // Scroll to top of models section when page changes
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }
  }, [currentPage])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSortBy('name-asc')
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus || sortBy !== 'name-asc'

  // Get sort label
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'name-asc':
        return 'Name (A-Z)'
      case 'name-desc':
        return 'Name (Z-A)'
      case 'category':
        return 'Category'
      case 'year-start':
        return 'Year Started'
      case 'year-end':
        return 'Year Ended'
      case 'engine':
        return 'Engine (CC)'
      case 'newest':
        return 'Newest First'
      case 'oldest':
        return 'Oldest First'
      default:
        return 'Sort'
    }
  }

  return (
    <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
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
                Make Details
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Service scope information
              </p>
            </div>
          </div>
        </motion.header>

        {/* Make Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-card"
        >
          <div className="relative p-6 md:p-10 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Make Icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mx-auto md:mx-0"
              >
                <div className="h-24 w-24 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <MotorcycleIcon className="h-12 w-12 text-gray-700" />
                </div>
              </motion.div>

              {/* Make Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-3">
                  {make.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg">
                    {make.country}
                  </span>
                  <span className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg">
                    {make.models.length} {make.models.length === 1 ? 'model' : 'models'}
                  </span>
                  {filteredAndSortedModels.length !== make.models.length && (
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg">
                      {filteredAndSortedModels.length} filtered
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Make Details */}
          <div className="p-6 md:p-10">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Make Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Make Name" value={make.name} />
              <DetailRow label="Country of Origin" value={make.country} />
              <DetailRow label="Total Models" value={make.models.length.toString()} />
              <DetailRow label="Added to Scope" value={formatDate(make.createdAt)} />
            </div>
          </div>
        </motion.div>

        {/* Models Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="font-display font-semibold text-xl text-gray-900">Models</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedModels.length === make.models.length
                ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredAndSortedModels.length)} of ${filteredAndSortedModels.length} models`
                : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredAndSortedModels.length)} of ${filteredAndSortedModels.length} (filtered from ${make.models.length} total)`
              }
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-card">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search models by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full md:w-56 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="category">Category</option>
                    <option value="year-start">Year Started</option>
                    <option value="year-end">Year Ended</option>
                    <option value="engine">Engine (CC)</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filter Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                    hasActiveFilters
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && <span className="ml-1">•</span>}
                </motion.button>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearFilters}
                    className="px-4 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </motion.button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category Filter */}
                      <div className="relative">
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all appearance-none cursor-pointer pr-10"
                        >
                          <option value="">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                      </div>

                      {/* Production Status Filter */}
                      <div className="relative">
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Production Status
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all appearance-none cursor-pointer pr-10"
                        >
                          <option value="">All Statuses</option>
                          {productionStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Models Grid */}
          {filteredAndSortedModels.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <MotorcycleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No models found</h3>
              <p className="text-gray-600">
                {hasActiveFilters
                  ? 'No models match your current filters. Try adjusting your search or filters.'
                  : 'This make doesn\'t have any models yet.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedModels.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-card hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Model Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                            <MotorcycleIcon className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{model.name}</h4>
                            <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              {model.category}
                            </span>
                          </div>
                        </div>

                        {/* Production Status Badge */}
                        {model.production_status && (
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            model.production_status === 'In Production'
                              ? "bg-green-100 text-green-700"
                              : model.production_status === 'Discontinued'
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          )}>
                            {model.production_status}
                          </span>
                        )}
                      </div>

                      {/* Year Range */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>{getYearRange(model.years)}</span>
                        {model.engine_displacement_cc && (
                          <span className="text-gray-400">• {model.engine_displacement_cc} CC</span>
                        )}
                      </div>

                      {/* Available Years */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Available Years:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {model.years.map((year) => (
                            <span
                              key={year}
                              className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200"
                            >
                              {year}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
                    <span className="font-medium text-gray-900">{totalPages}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
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
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </main>
  )
}

/**
 * DetailRow - Individual detail row
 */
interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="group flex items-start justify-between py-3 px-4 -mx-4 rounded-xl hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-right">{value}</span>
    </div>
  )
}
