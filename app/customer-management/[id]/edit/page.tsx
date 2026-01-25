'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  X,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { getMakesDataAction } from '@/app/actions/motorcycle-actions'

interface CustomerFormData {
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
  notes: string
}

interface VehicleFormData {
  id?: string
  category: string
  make: string
  model: string
  year: string
  licensePlate: string
  color: string
  vin: string
  engineNumber: string
  mileage: string
  notes: string
}

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
  logoUrl: string | null
  models: ModelData[]
  createdAt: string
}

interface CustomerDetail {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phoneNumber: string | null
  alternatePhone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  notes?: string | null
  vehicles?: VehicleFormData[]
}

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [originalData, setOriginalData] = useState<CustomerDetail | null>(null)
  const [makesData, setMakesData] = useState<MakeData[]>([])
  const [isLoadingMakes, setIsLoadingMakes] = useState(true)

  const [formData, setFormData] = useState<CustomerFormData>({
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
    notes: '',
  })

  const [vehicles, setVehicles] = useState<VehicleFormData[]>([])

  useEffect(() => {
    // Check authentication
    const sessionUser = sessionStorage.getItem('user')
    if (!sessionUser) {
      router.push('/login')
      return
    }

    // Load customer data and makes
    loadCustomerData()
    loadMakes()
  }, [customerId, router])

  const loadCustomerData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch customer')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer')
      }

      const customerData = result.customer
      setCustomer(customerData)
      setOriginalData(customerData)

      // Populate form data
      setFormData({
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        email: customerData.email || '',
        phoneNumber: customerData.phoneNumber || '',
        alternatePhone: customerData.alternatePhone || '',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        zipCode: customerData.zipCode || '',
        country: customerData.country || 'India',
        notes: customerData.notes || '',
      })

      // Populate vehicles
      const vehiclesData = (customerData.vehicles || []).map((v: any) => ({
        id: v.id,
        category: v.category || '',
        make: v.make,
        model: v.model,
        year: v.year.toString(),
        licensePlate: v.licensePlate,
        color: v.color || '',
        vin: v.vin || '',
        engineNumber: v.engineNumber || '',
        mileage: v.mileage?.toString() || '',
        notes: v.notes || '',
      }))
      setVehicles(vehiclesData.length > 0 ? vehiclesData : [{ category: '', make: '', model: '', year: '', licensePlate: '', color: '', vin: '', engineNumber: '', mileage: '', notes: '' }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMakes = async () => {
    try {
      const makes = await getMakesDataAction()
      setMakesData(makes)
    } catch (err) {
      console.error('Error loading makes:', err)
    } finally {
      setIsLoadingMakes(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getAvailableModels = (makeName: string): ModelData[] => {
    const makeData = makesData.find(m => m.name === makeName)
    return makeData?.models || []
  }

  const getAvailableYears = (makeName: string, modelName: string): number[] => {
    const models = getAvailableModels(makeName)
    const model = models.find(m => m.name === modelName)
    return model?.years || []
  }

  const handleVehicleChange = (index: number, field: keyof VehicleFormData, value: string) => {
    const newVehicles = [...vehicles]
    newVehicles[index][field] = value

    if (field === 'make') {
      newVehicles[index].category = ''
      newVehicles[index].model = ''
      newVehicles[index].year = ''
    }

    if (field === 'model') {
      newVehicles[index].year = ''
      if (newVehicles[index].make && value) {
        const models = getAvailableModels(newVehicles[index].make)
        const selectedModel = models.find(m => m.name === value)
        if (selectedModel) {
          newVehicles[index].category = selectedModel.category
        }
      }
    }

    setVehicles(newVehicles)
  }

  const handleAddVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        category: '',
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        vin: '',
        engineNumber: '',
        mileage: '',
        notes: '',
      },
    ])
  }

  const handleRemoveVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required'
    if (!formData.lastName.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.phoneNumber.trim()) return 'Phone number is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(formData.phoneNumber) || formData.phoneNumber.length < 10) {
      return 'Please enter a valid phone number (minimum 10 digits)'
    }

    const hasValidVehicle = vehicles.some(
      v => v.make && v.model && v.year && v.licensePlate.trim()
    )

    if (!hasValidVehicle) {
      return 'Please add at least one vehicle with make, model, year, and license plate'
    }

    return null
  }

  const hasVehicleChanged = (vehicle: VehicleFormData): boolean => {
    const original = originalData?.vehicles?.find(v => v.id === vehicle.id)
    if (!original) return false

    return (
      vehicle.licensePlate !== original.licensePlate ||
      vehicle.color !== (original.color || '') ||
      vehicle.vin !== (original.vin || '') ||
      vehicle.engineNumber !== (original.engineNumber || '') ||
      vehicle.mileage !== (original.mileage?.toString() || '') ||
      vehicle.notes !== (original.notes || '')
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      const currentUser = JSON.parse(sessionUser)

      // Update customer data
      const customerResponse = await fetch(`/api/customers/${customerId}`, {
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
          country: formData.country || null,
          notes: formData.notes || null,
        }),
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }

      // Sync vehicles
      await syncVehicles()

      setSuccess(true)

      setTimeout(() => {
        router.push(`/customer-management/${customerId}`)
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setIsSaving(false)
    }
  }

  const syncVehicles = async () => {
    const originalVehicles = originalData?.vehicles || []

    const newVehicles = vehicles.filter(v => !v.id)
    const updatedVehicles = vehicles.filter(v => v.id && hasVehicleChanged(v))
    const removedVehicleIds = originalVehicles
      .filter(ov => !vehicles.find(v => v.id === ov.id))
      .map(v => v.id)

    // Add new vehicles
    for (const vehicle of newVehicles) {
      if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.licensePlate.trim()) {
        continue
      }

      await fetch('/api/vehicles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          garageId: JSON.parse(sessionStorage.getItem('user')!).garageId,
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          licensePlate: vehicle.licensePlate,
          color: vehicle.color || undefined,
          vin: vehicle.vin || undefined,
          engineNumber: vehicle.engineNumber || undefined,
          category: vehicle.category || undefined,
          currentMileage: vehicle.mileage ? parseInt(vehicle.mileage) : undefined,
          notes: vehicle.notes || undefined,
        }),
      })
    }

    // Update existing vehicles
    for (const vehicle of updatedVehicles) {
      await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: vehicle.licensePlate,
          color: vehicle.color || undefined,
          vin: vehicle.vin || undefined,
          engineNumber: vehicle.engineNumber || undefined,
          category: vehicle.category || undefined,
          currentMileage: vehicle.mileage ? parseInt(vehicle.mileage) : undefined,
          notes: vehicle.notes || undefined,
        }),
      })
    }

    // Remove deleted vehicles
    for (const vehicleId of removedVehicleIds) {
      // Note: There's no DELETE endpoint for vehicles yet
      // We'll update the status to 'inactive' instead
      await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-700 mx-auto" />
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
              Edit Customer
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              {customer?.firstName} {customer?.lastName}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-status-success/10 border-b border-status-success/30"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-status-success" />
              <div>
                <p className="font-semibold text-status-success">Customer Updated Successfully!</p>
                <p className="text-sm text-status-success/80">Redirecting to customer details...</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-status-error/10 border-b border-status-error/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
              <p className="text-sm text-status-error/80">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Personal Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gray-700 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Alternate Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    placeholder="+91 98765 43211"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gray-700 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Apt 4B"
                    rows={2}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bangalore"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="560001"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gray-700 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about the customer..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Vehicles Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-gray-700 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddVehicle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </motion.button>
            </div>

            {isLoadingMakes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
              </div>
            ) : (
              <div className="space-y-6">
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id || `new-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5"
                  >
                    {vehicles.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleRemoveVehicle(index)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <MotorcycleIcon className="h-5 w-5 text-gray-700" />
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.id ? `Vehicle ${index + 1}` : 'New Vehicle'}
                      </h3>
                    </div>

                    {/* Make, Model, Year */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Make */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Make <span className="text-status-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicle.make}
                            onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                          >
                            <option value="">Select Make</option>
                            {makesData.map((make) => (
                              <option key={make.id} value={make.name}>
                                {make.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Model <span className="text-status-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicle.model}
                            onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                            disabled={!vehicle.make}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                          >
                            <option value="">Select Model</option>
                            {getAvailableModels(vehicle.make).map((model) => (
                              <option key={model.id} value={model.name}>
                                {model.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Year <span className="text-status-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicle.year}
                            onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                            disabled={!vehicle.model}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                          >
                            <option value="">Select Year</option>
                            {getAvailableYears(vehicle.make, vehicle.model)
                              .slice()
                              .reverse()
                              .map((year) => (
                                <option key={year} value={year.toString()}>
                                  {year}
                                </option>
                              ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Category, License Plate, Color, VIN, Engine Number, Mileage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Category
                        </label>
                        <input
                          type="text"
                          value={vehicle.category}
                          readOnly
                          placeholder="Auto-populated based on model selection"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 cursor-default"
                        />
                      </div>

                      {/* License Plate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          License Plate <span className="text-status-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicle.licensePlate}
                          onChange={(e) => handleVehicleChange(index, 'licensePlate', e.target.value)}
                          placeholder="KA 01 AB 1234"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Engine Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Engine Number
                        </label>
                        <input
                          type="text"
                          value={vehicle.engineNumber}
                          onChange={(e) => handleVehicleChange(index, 'engineNumber', e.target.value)}
                          placeholder="HC22E41001234"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-mono text-sm"
                        />
                      </div>

                      {/* VIN */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          VIN (Chassis Number)
                        </label>
                        <input
                          type="text"
                          value={vehicle.vin}
                          onChange={(e) => handleVehicleChange(index, 'vin', e.target.value)}
                          placeholder="MAL22H1A2M100001"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-mono text-sm"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Color
                        </label>
                        <input
                          type="text"
                          value={vehicle.color}
                          onChange={(e) => handleVehicleChange(index, 'color', e.target.value)}
                          placeholder="Pearl White"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Mileage */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Current Mileage (km)
                        </label>
                        <input
                          type="number"
                          value={vehicle.mileage}
                          onChange={(e) => handleVehicleChange(index, 'mileage', e.target.value)}
                          placeholder="12000"
                          min="0"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Vehicle Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Vehicle Notes
                        </label>
                        <textarea
                          value={vehicle.notes}
                          onChange={(e) => handleVehicleChange(index, 'notes', e.target.value)}
                          placeholder="Any additional notes about this vehicle..."
                          rows={2}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => router.back()}
              disabled={isSaving || success}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSaving || success}
              className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : success ? (
                <>
                  <Save className="h-4 w-4" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
