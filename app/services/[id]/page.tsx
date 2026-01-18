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
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-4 border-t-gray-600 border-r-transparent border-b-transparent animate-spin" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-gray-600 font-medium"
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
              <h2 className="text-xl font-semibold text-gray-900">Error</h2>
              <p className="text-sm text-gray-600 mt-0.5">{error || 'Make not found'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/services')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg mt-6 flex items-center justify-center gap-2"
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </motion.button>
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
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  title="Edit Make"
                >
                  <Edit className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                  title="Delete Make"
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
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
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-xl text-gray-900">Models</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddModel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
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
                  </div>

                  {/* Year Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{getYearRange(model.years)}</span>
                  </div>

                  {/* Available Years */}
                  <div className="mt-3">
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
