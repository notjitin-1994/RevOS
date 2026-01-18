'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, AlertCircle, Loader2, User, Hash, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Vehicle Detail Page - Bike Registry
 *
 * Shows complete information about a customer's registered motorcycle.
 * Based on RevOS-features.md specification.
 */

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  category?: string
  engineNumber: string
  chassisNumber: string
  customerId: string
  customerName: string
  customerPhone?: string
  notes?: string
  createdAt: string
}

// Mock vehicle data
const mockVehicle: VehicleData = {
  id: '1',
  make: 'Honda',
  model: 'CBR650R',
  year: 2023,
  category: 'Sport',
  engineNumber: 'HC23E41001234',
  chassisNumber: 'MH2JC2323PK000001',
  customerId: 'cust-001',
  customerName: 'Rahul Sharma',
  customerPhone: '+91 98765 43210',
  notes: 'Regular servicing required. Customer prefers synthetic oil.',
  createdAt: '2023-06-15',
}

export default function VehicleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVehicle()
  }, [params])

  const loadVehicle = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // For now, use mock data
      setVehicle(mockVehicle)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading vehicle:', err)
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

  const handleEdit = () => {
    router.push(`/vehicles/${params.id}/edit`)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this bike from the registry?')) {
      router.push('/vehicles')
    }
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
              <div className="absolute inset-0 rounded-full border-4 border-t-brand border-r-transparent border-b-transparent animate-spin" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-gray-600 font-medium"
          >
            Loading bike details...
          </motion.p>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white backdrop-blur-sm rounded-2xl border border-status-error/50 p-8 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-status-error/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-status-error" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Error</h2>
              <p className="text-sm text-gray-600 mt-0.5">{error || 'Bike not found'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/vehicles')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-card mt-6 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bike Registry
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
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
              onClick={() => router.push('/vehicles')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </motion.button>
            <div className="h-10 w-1 bg-gray-700 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Bike Details
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Vehicle registry information
              </p>
            </div>
          </div>
        </motion.header>

        {/* Vehicle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white backdrop-blur-sm rounded-2xl shadow-card border border-gray-200 overflow-hidden"
        >
          {/* Vehicle Hero */}
          <div className="relative p-6 md:p-10 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Vehicle Icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mx-auto md:mx-0"
              >
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-2 border-gray-200 shadow-card">
                  <MotorcycleIcon className="h-12 w-12 text-gray-700" />
                </div>
              </motion.div>

              {/* Vehicle Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {vehicle.make}
                  </h2>
                  <p className="text-2xl md:text-3xl font-bold text-gray-700">
                    {vehicle.model}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-4 py-2 bg-gray-100 rounded-xl text-gray-900 font-semibold">
                    {vehicle.year}
                  </span>
                  {vehicle.category && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-xl">
                      {vehicle.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  title="Edit Bike"
                >
                  <Edit className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="p-3 bg-status-error/10 text-status-error rounded-xl hover:bg-status-error/20 transition-all"
                  title="Remove Bike"
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MotorcycleIcon className="h-5 w-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                </div>
                <div className="space-y-1">
                  <DetailRow label="Make" value={vehicle.make} />
                  <DetailRow label="Model" value={vehicle.model} />
                  <DetailRow label="Year" value={vehicle.year.toString()} />
                  {vehicle.category && <DetailRow label="Category" value={vehicle.category} />}
                  <DetailRow label="Registered On" value={formatDate(vehicle.createdAt)} />
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Owner Information</h3>
                </div>
                <div className="space-y-1">
                  <DetailRow label="Owner Name" value={vehicle.customerName} />
                  {vehicle.customerPhone && (
                    <DetailRow label="Phone Number" value={vehicle.customerPhone} />
                  )}
                  <DetailRow label="Customer ID" value={vehicle.customerId} />
                </div>
              </div>

              {/* Vehicle Identification */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <Hash className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Identification</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Engine Number</p>
                    <p className="text-base font-mono font-semibold text-gray-900 break-all">
                      {vehicle.engineNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Chassis Number (VIN)</p>
                    <p className="text-base font-mono font-semibold text-gray-900 break-all">
                      {vehicle.chassisNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {vehicle.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-700">{vehicle.notes}</p>
                  </div>
                </div>
              )}
            </div>
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
