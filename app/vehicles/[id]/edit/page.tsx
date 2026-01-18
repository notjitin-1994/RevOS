'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Loader2,
  User,
  Hash,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { getMakesDataAction } from '@/app/actions/motorcycle-actions'

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
  vin: string
  engineNumber: string
  chassisNumber: string
  category: string
  currentMileage: number | null
  lastServiceDate: string | null
  status: 'active' | 'inactive' | 'in-repair'
  notes: string
  customerId: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phoneNumber: string
    alternatePhone: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    country: string | null
    notes: string | null
  }
}

interface FormData {
  // Vehicle fields
  make: string
  model: string
  year: string
  licensePlate: string
  color: string
  vin: string
  engineNumber: string
  chassisNumber: string
  category: string
  currentMileage: string
  status: 'active' | 'inactive' | 'in-repair'
  notes: string
  // Customer fields
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  alternatePhone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  customerNotes: string
}

interface MakeData {
  id: string
  name: string
  country: string
  logoUrl: string | null
  models: {
    id: string
    name: string
    category: string
    years: number[]
  }[]
  createdAt: string
}

const vehicleStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'in-repair', label: 'In Repair' },
]

const countries = ['India', 'Nepal', 'Bangladesh', 'Sri Lanka', 'Bhutan', 'Maldives']

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [makesData, setMakesData] = useState<MakeData[]>([])
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    vin: '',
    engineNumber: '',
    chassisNumber: '',
    category: '',
    currentMileage: '',
    status: 'active',
    notes: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    customerNotes: '',
  })

  useEffect(() => {
    loadVehicleAndCustomer()
    loadCategories()
  }, [params.id])

  const loadCategories = async () => {
    try {
      const makes = await getMakesDataAction()
      setMakesData(makes)

      // Extract unique categories from all models
      const uniqueCategories = new Set<string>()
      makes.forEach(make => {
        make.models.forEach(model => {
          uniqueCategories.add(model.category)
        })
      })

      setCategories(Array.from(uniqueCategories).sort())
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadVehicleAndCustomer = async () => {
    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/vehicles/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle details')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch vehicle')
      }

      const v = result.vehicle
      setVehicle(v)

      setFormData({
        make: v.make,
        model: v.model,
        year: v.year.toString(),
        licensePlate: v.licensePlate,
        color: v.color || '',
        vin: v.vin || '',
        engineNumber: v.engineNumber || '',
        chassisNumber: v.chassisNumber || '',
        category: v.category || 'Other',
        currentMileage: v.currentMileage?.toString() || '',
        status: v.status || 'active',
        notes: v.notes || '',
        firstName: '', // Will fetch from customer endpoint
        lastName: '',
        email: v.customerEmail || '',
        phoneNumber: v.customerPhone || '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        customerNotes: '',
      })

      // Fetch customer details if customerId exists
      if (v.customerId) {
        const customerResponse = await fetch(`/api/customers/${v.customerId}`)
        if (customerResponse.ok) {
          const customerResult = await customerResponse.json()
          if (customerResult.success && customerResult.customer) {
            const c = customerResult.customer
            setFormData((prev) => ({
              ...prev,
              firstName: c.firstName || '',
              lastName: c.lastName || '',
              email: c.email || '',
              phoneNumber: c.phoneNumber || '',
              alternatePhone: c.alternatePhone || '',
              address: c.address || '',
              city: c.city || '',
              state: c.state || '',
              zipCode: c.zipCode || '',
              country: c.country || 'India',
              customerNotes: c.notes || '',
            }))
          }
        }
      }

      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading vehicle:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBack = () => {
    router.push(`/vehicles/${params.id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Update vehicle
      const vehicleResponse = await fetch(`/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: formData.licensePlate,
          color: formData.color,
          vin: formData.vin,
          engineNumber: formData.engineNumber,
          chassisNumber: formData.chassisNumber,
          category: formData.category,
          currentMileage: formData.currentMileage ? parseInt(formData.currentMileage) : null,
          status: formData.status,
          notes: formData.notes,
        }),
      })

      if (!vehicleResponse.ok) {
        throw new Error('Failed to update vehicle')
      }

      const vehicleResult = await vehicleResponse.json()
      if (!vehicleResult.success) {
        throw new Error(vehicleResult.error || 'Failed to update vehicle')
      }

      // Update customer if customerId exists
      if (vehicle?.customerId) {
        const customerResponse = await fetch(`/api/customers/${vehicle.customerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            alternatePhone: formData.alternatePhone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zipCode: formData.zipCode || null,
            country: formData.country || 'India',
            notes: formData.customerNotes || null,
          }),
        })

        if (!customerResponse.ok) {
          throw new Error('Vehicle updated but failed to update customer')
        }

        const customerResult = await customerResponse.json()
        if (!customerResult.success) {
          throw new Error(customerResult.error || 'Failed to update customer')
        }
      }

      setSuccessMessage('Vehicle and customer updated successfully!')
      setTimeout(() => {
        router.push(`/vehicles/${params.id}`)
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error saving:', err)
      setError(message)
      setSuccessMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (error && !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Vehicle</h2>
          <p className="text-sm text-gray-600 text-center">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Edit Vehicle & Customer
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Update vehicle and owner information
          </p>
        </div>
      </motion.header>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-900 font-medium">{successMessage}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && vehicle && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-900 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <MotorcycleIcon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
                <p className="text-sm text-gray-600">Make, model, and identification details</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Make, Model, Year */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>

            {/* License Plate, Color, Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  License Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="KA 01 AB 1234"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Pearl White"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* VIN, Engine Number, Chassis Number */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">VIN / Chassis Number</label>
                <input
                  type="text"
                  value={formData.chassisNumber}
                  onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                  placeholder="MBL21PNSM2100002"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Engine Number</label>
                <input
                  type="text"
                  value={formData.engineNumber}
                  onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                  placeholder="HC22E41001234"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            {/* Current Mileage, Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Current Mileage (km)</label>
                <input
                  type="number"
                  value={formData.currentMileage}
                  onChange={(e) => handleInputChange('currentMileage', e.target.value)}
                  placeholder="12500"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                  >
                    {vehicleStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Vehicle Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Vehicle Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this vehicle..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                <p className="text-sm text-gray-600">Owner contact details</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Rajesh"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Kumar"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  placeholder="+91 98765 43211"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="rajesh.kumar@email.com"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123, Indiranagar 100ft Road"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Bangalore"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Karnataka"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="560038"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Customer Notes</label>
              <textarea
                value={formData.customerNotes}
                onChange={(e) => handleInputChange('customerNotes', e.target.value)}
                placeholder="Any additional notes about this customer..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-end"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            disabled={isSaving}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </motion.button>

          <motion.button
            type="submit"
            disabled={isSaving}
            whileHover={{ scale: isSaving ? 1 : 1.02 }}
            whileTap={{ scale: isSaving ? 1 : 0.98 }}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  )
}
