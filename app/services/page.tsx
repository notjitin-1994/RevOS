'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Service Scope Management Page - Master Data
 *
 * Manages the universe of supported vehicles.
 * Defines makes, models, and applicable years.
 * Based on RevOS-features.md specification.
 */

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
  models: ModelData[]
  createdAt: string
}

// Mock data - Service scope master data
const mockMakes: MakeData[] = [
  {
    id: '1',
    name: 'Honda',
    country: 'Japan',
    models: [
      { id: '1-1', name: 'CBR650R', category: 'Sport', years: [2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '1-2', name: 'CBR600RR', category: 'Sport', years: [2021, 2022, 2023, 2024] },
      { id: '1-3', name: 'CBR1000RR-R Fireblade', category: 'Sport', years: [2022, 2023, 2024] },
      { id: '1-4', name: 'Africa Twin', category: 'Adventure', years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '1-5', name: 'NC750X', category: 'Dual-Sport', years: [2021, 2022, 2023, 2024] },
    ],
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Kawasaki',
    country: 'Japan',
    models: [
      { id: '2-1', name: 'Ninja 400', category: 'Sport', years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '2-2', name: 'Ninja 650', category: 'Sport', years: [2020, 2021, 2022, 2023, 2024] },
      { id: '2-3', name: 'Ninja ZX-10R', category: 'Sport', years: [2021, 2022, 2023, 2024] },
      { id: '2-4', name: 'Z900', category: 'Naked', years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '2-5', name: 'Versys 650', category: 'Adventure', years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] },
    ],
    createdAt: '2023-01-15',
  },
  {
    id: '3',
    name: 'Yamaha',
    country: 'Japan',
    models: [
      { id: '3-1', name: 'MT-07', category: 'Naked', years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '3-2', name: 'MT-09', category: 'Naked', years: [2021, 2022, 2023, 2024] },
      { id: '3-3', name: 'YZF-R1', category: 'Sport', years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '3-4', name: 'YZF-R6', category: 'Sport', years: [2019, 2020, 2021, 2022, 2023] },
      { id: '3-5', name: 'Tracer 900', category: 'Sport Touring', years: [2020, 2021, 2022, 2023, 2024] },
    ],
    createdAt: '2023-01-15',
  },
  {
    id: '4',
    name: 'BMW',
    country: 'Germany',
    models: [
      { id: '4-1', name: 'R 1250 GS', category: 'Adventure', years: [2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '4-2', name: 'R 1250 RT', category: 'Touring', years: [2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '4-3', name: 'S 1000 RR', category: 'Sport', years: [2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '4-4', name: 'M 1000 RR', category: 'Sport', years: [2023, 2024] },
      { id: '4-5', name: 'G 310 GS', category: 'Adventure', years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
    ],
    createdAt: '2023-01-15',
  },
  {
    id: '5',
    name: 'Royal Enfield',
    country: 'India',
    models: [
      { id: '5-1', name: 'Classic 350', category: 'Cruiser', years: [2021, 2022, 2023, 2024] },
      { id: '5-2', name: 'Classic 500', category: 'Cruiser', years: [2018, 2019, 2020, 2021, 2022] },
      { id: '5-3', name: 'Himalayan', category: 'Adventure', years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '5-4', name: 'Interceptor 650', category: 'Cruiser', years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { id: '5-5', name: 'Continental GT', category: 'Cruiser', years: [2018, 2019, 2020, 2021, 2022, 2023] },
    ],
    createdAt: '2023-01-15',
  },
]

export default function ServiceScopePage() {
  const router = useRouter()
  const [makes, setMakes] = useState<MakeData[]>(mockMakes)
  const [filteredMakes, setFilteredMakes] = useState<MakeData[]>(mockMakes)
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'models' | 'newest'>('name')

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
  }, [searchQuery, countryFilter, sortBy, makes])

  const handleViewMake = (id: string) => {
    router.push(`/services/${id}`)
  }

  const handleEditMake = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    router.push(`/services/${id}/edit`)
  }

  const handleDeleteMake = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this make and all its models?')) {
      setMakes(makes.filter((m) => m.id !== id))
    }
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-graphite-600 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                Service Scope Management
              </h1>
              <p className="text-sm md:text-base text-graphite-600 mt-1">
                Master data for supported makes, models, and years
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/services/add')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20"
          >
            <Plus className="h-5 w-5" />
            Add Make
          </motion.button>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Total Makes</p>
          <p className="text-2xl font-bold text-white">{makes.length}</p>
        </div>
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Total Models</p>
          <p className="text-2xl font-bold text-white">{makes.reduce((acc, m) => acc + m.models.length, 0)}</p>
        </div>
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Countries</p>
          <p className="text-2xl font-bold text-white">{countries.length - 1}</p>
        </div>
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Avg Models/Make</p>
          <p className="text-2xl font-bold text-brand">
            {Math.round(makes.reduce((acc, m) => acc + m.models.length, 0) / makes.length)}
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-graphite-800 rounded-xl border border-graphite-700 shadow-sm p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
            <input
              type="text"
              placeholder="Search by make or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Country Filter */}
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="models">Sort by Model Count</option>
                <option value="newest">Sort by Newest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400 pointer-events-none" />
            </div>
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
        {filteredMakes.length === 0 ? (
          <div className="bg-graphite-800 rounded-xl border border-graphite-700 shadow-sm p-12 text-center">
            <MotorcycleIcon className="h-16 w-16 text-graphite-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No makes found</h3>
            <p className="text-graphite-400 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setCountryFilter('all')
              }}
              className="text-brand font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {filteredMakes.map((make, index) => (
                <motion.div
                  key={make.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-graphite-800 backdrop-blur-sm rounded-xl border border-graphite-700 shadow-sm hover:shadow-lg hover:border-brand/50 transition-all duration-200 overflow-hidden"
                >
                  {/* Make Header */}
                  <div
                    onClick={() => handleViewMake(make.id)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Make Icon */}
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 shrink-0">
                        <MotorcycleIcon className="h-7 w-7 text-brand" />
                      </div>

                      {/* Make Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white">{make.name}</h3>
                            <p className="text-sm text-graphite-400">{make.country}</p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-3 py-1 bg-graphite-700 text-graphite-300 rounded-lg font-medium">
                              {make.models.length} {make.models.length === 1 ? 'model' : 'models'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewMake(make.id)
                          }}
                          className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => handleEditMake(e, make.id)}
                          className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                          title="Edit Make"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteMake(e, make.id)}
                          className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                          title="Delete Make"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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
                            className="flex items-center justify-between py-2 px-3 bg-graphite-900/50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm text-white font-medium">{model.name}</p>
                              <p className="text-xs text-graphite-400">{model.category}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-graphite-500">
                              <Calendar className="h-3 w-3" />
                              <span>{getYearRange(model.years)}</span>
                            </div>
                          </div>
                        ))}
                        {make.models.length > 4 && (
                          <div
                            onClick={() => handleViewMake(make.id)}
                            className="flex items-center justify-center py-2 px-3 bg-graphite-900/50 rounded-lg cursor-pointer hover:bg-graphite-700/50 transition-colors"
                          >
                            <p className="text-sm text-brand font-medium">
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
            <div className="hidden md:block bg-graphite-800 rounded-xl border border-graphite-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-graphite-700/50">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Make</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Country</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Models</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Sample Models</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-700/30">
                  {filteredMakes.map((make, index) => (
                    <motion.tr
                      key={make.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => handleViewMake(make.id)}
                      className="hover:bg-graphite-700/30 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Make Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0">
                            <MotorcycleIcon className="h-6 w-6 text-brand" />
                          </div>
                          <p className="text-base font-semibold text-white">{make.name}</p>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-graphite-300">{make.country}</p>
                      </td>

                      {/* Model Count */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-graphite-700 text-graphite-300 rounded-lg text-sm font-medium">
                          {make.models.length} {make.models.length === 1 ? 'model' : 'models'}
                        </span>
                      </td>

                      {/* Sample Models */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {make.models.slice(0, 3).map((model) => (
                            <span
                              key={model.id}
                              className="px-2 py-1 bg-graphite-900/50 text-graphite-300 text-xs font-medium rounded border border-graphite-700"
                            >
                              {model.name}
                            </span>
                          ))}
                          {make.models.length > 3 && (
                            <span className="px-2 py-1 bg-brand/20 text-brand text-xs font-medium rounded">
                              +{make.models.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewMake(make.id)
                            }}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditMake(e, make.id)
                            }}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                            title="Edit Make"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMake(e, make.id)
                            }}
                            className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                            title="Delete Make"
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
          </>
        )}
      </motion.div>
    </div>
  )
}
