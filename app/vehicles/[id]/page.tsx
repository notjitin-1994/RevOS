'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  User,
  Clock,
  Wrench,
  CheckCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
  vin?: string
  engineNumber?: string
  chassisNumber?: string
  category?: string
  currentMileage?: number
  customerId?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  lastServiceDate?: string
  status: 'active' | 'inactive' | 'in-repair'
  notes?: string
  createdAt: string
  updatedAt?: string
}

// Utility function to format dates - shared across components
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      // Fetch vehicle data from API
      const response = await fetch(`/api/vehicles/${params.id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch vehicle details')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch vehicle details')
      }

      setVehicle(result.vehicle)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading vehicle:', err)
      setError(message)
      setIsLoading(false)
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading vehicle details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Vehicle</h2>
          <p className="text-sm text-gray-600 text-center">{error || 'Vehicle not found'}</p>
        </motion.div>
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
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
            Vehicle Details
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            View vehicle information and service history
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle & Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vehicle Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Vehicle Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <MotorcycleIcon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">
                    {vehicle.year} {vehicle.make}
                  </h2>
                  <p className="text-lg text-gray-200">{vehicle.model}</p>
                  <p className="text-sm text-gray-300 mt-1">{vehicle.licensePlate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
                    title="Edit vehicle"
                  >
                    <Edit className="h-5 w-5 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-lg transition-colors"
                    title="Delete vehicle"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Vehicle Information
              </h3>

              <DetailRow label="Color" value={vehicle.color} />
              <DetailRow label="Category" value={vehicle.category || 'Other'} />
              <DetailRow label="Status" value={vehicle.status.replace('-', ' ').toUpperCase()} />
              {vehicle.currentMileage && (
                <DetailRow
                  label="Mileage"
                  value={`${vehicle.currentMileage.toLocaleString()} km`}
                />
              )}
              {vehicle.lastServiceDate && (
                <DetailRow label="Last Service" value={formatDate(vehicle.lastServiceDate)} />
              )}
              {vehicle.chassisNumber && <DetailRow label="Chassis Number" value={vehicle.chassisNumber} />}
              {vehicle.engineNumber && <DetailRow label="Engine Number" value={vehicle.engineNumber} />}
              <DetailRow label="Registered" value={formatDate(vehicle.createdAt)} />

              {vehicle.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{vehicle.notes}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Customer Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Owner Information</h3>
                  <p className="text-sm text-gray-600">Vehicle owner details</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <DetailRow label="Name" value={vehicle.customerName} />
              {vehicle.customerPhone && <DetailRow label="Phone" value={vehicle.customerPhone} />}
              {vehicle.customerEmail && <DetailRow label="Email" value={vehicle.customerEmail} />}
              {vehicle.customerAddress && <DetailRow label="Address" value={vehicle.customerAddress} />}
              {vehicle.customerId && <DetailRow label="Customer ID" value={vehicle.customerId} />}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Service History Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-gray-700" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Service History</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track all services, repairs, and maintenance records
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder */}
            <div className="p-6">
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-gray-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Service History Coming Soon</h4>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  This section will display all service records, maintenance history, and repair logs for this vehicle.
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Service Records</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Parts Used</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Cost History</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Mechanic Notes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-all">
        {value}
      </span>
    </div>
  )
}
