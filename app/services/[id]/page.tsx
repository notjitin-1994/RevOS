'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, AlertCircle, Loader2, Calendar, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Service Scope Detail Page
 *
 * Shows details of a motorcycle manufacturer (make) and all its models.
 * This is master data for the service scope.
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

// Mock make data
const mockMake: MakeData = {
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
}

export default function ServiceScopeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [make, setMake] = useState<MakeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMake()
  }, [params])

  const loadMake = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // For now, use mock data
      setMake(mockMake)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading make:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getYearRange = (years: number[]) => {
    if (years.length === 0) return 'N/A'
    const min = Math.min(...years)
    const max = Math.max(...years)
    return min === max ? `${min}` : `${min} - ${max}`
  }

  const handleEdit = () => {
    router.push(`/services/${params.id}/edit`)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${make?.name} and all its models?`)) {
      router.push('/services')
    }
  }

  const handleAddModel = () => {
    // TODO: Implement add model functionality
    alert('Add model functionality coming soon!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="inline-block h-16 w-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-brand/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-brand border-r-transparent border-b-transparent animate-spin" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-graphite-600 font-medium"
          >
            Loading make details...
          </motion.p>
        </div>
      </div>
    )
  }

  if (error || !make) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-graphite-900">Error</h2>
              <p className="text-sm text-graphite-600 mt-0.5">{error || 'Make not found'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/services')}
            className="w-full bg-brand text-graphite-900 font-semibold py-3.5 px-4 rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20 mt-6 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Service Scope
          </motion.button>
        </motion.div>
      </div>
    )
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/services')}
              className="p-2 hover:bg-white/50 rounded-xl transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-graphite-700" />
            </motion.button>
            <div className="h-10 w-1 bg-graphite-600 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                Make Details
              </h1>
              <p className="text-sm md:text-base text-graphite-600 mt-1">
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
          className="bg-graphite-800 backdrop-blur-sm rounded-2xl shadow-2xl border border-graphite-700 overflow-hidden mb-6"
        >
          <div className="relative p-6 md:p-10 bg-gradient-to-br from-graphite-900 to-graphite-800 border-b border-graphite-700">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Make Icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mx-auto md:mx-0"
              >
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border-2 border-brand/30 shadow-lg shadow-brand/20">
                  <MotorcycleIcon className="h-12 w-12 text-brand" />
                </div>
              </motion.div>

              {/* Make Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {make.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-4 py-2 bg-brand/20 text-brand font-medium rounded-xl">
                    {make.country}
                  </span>
                  <span className="px-4 py-2 bg-graphite-700/50 text-white font-medium rounded-xl">
                    {make.models.length} {make.models.length === 1 ? 'model' : 'models'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="p-3 bg-brand/20 text-brand rounded-xl hover:bg-brand/30 transition-all"
                  title="Edit Make"
                >
                  <Edit className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="p-3 bg-status-error/20 text-status-error rounded-xl hover:bg-status-error/30 transition-all"
                  title="Delete Make"
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Make Details */}
          <div className="p-6 md:p-10">
            <h3 className="text-lg font-semibold text-white mb-4">Make Information</h3>
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
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Models</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddModel}
              className="flex items-center gap-2 px-4 py-2 bg-brand/20 text-brand font-medium rounded-xl hover:bg-brand/30 transition-all duration-200 border border-brand/30"
            >
              <Plus className="h-4 w-4" />
              Add Model
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {make.models.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-graphite-800 backdrop-blur-sm rounded-xl border border-graphite-700 shadow-sm hover:shadow-lg hover:border-brand/50 transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  {/* Model Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20">
                        <MotorcycleIcon className="h-6 w-6 text-brand" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{model.name}</h4>
                        <span className="inline-block mt-1 px-3 py-1 bg-brand/20 text-brand text-xs font-medium rounded-full">
                          {model.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Year Range */}
                  <div className="flex items-center gap-2 text-sm text-graphite-400">
                    <Calendar className="h-4 w-4" />
                    <span>{getYearRange(model.years)}</span>
                  </div>

                  {/* Available Years */}
                  <div className="mt-3">
                    <p className="text-xs text-graphite-500 mb-2">Available Years:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {model.years.map((year) => (
                        <span
                          key={year}
                          className="px-2 py-1 bg-graphite-900 text-graphite-300 text-xs font-medium rounded-lg"
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
    <div className="group flex items-start justify-between py-3 px-4 -mx-4 rounded-xl hover:bg-graphite-700/30 transition-colors">
      <span className="text-sm text-graphite-400 font-medium">{label}</span>
      <span className="text-sm text-white font-semibold text-right">{value}</span>
    </div>
  )
}
