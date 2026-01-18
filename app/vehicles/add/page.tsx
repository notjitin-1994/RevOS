'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, User, Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { getMakesDataAction } from '@/app/actions/motorcycle-actions'

/**
 * Add Bike Page - Vehicle Registry
 *
 * Register a customer's motorcycle with ownership and identification details.
 * Based on RevOS-features.md specification.
 */

interface FormData {
  customerId: string
  customerName: string
  customerPhone: string
  make: string
  model: string
  year: string
  category: string
  engineNumber: string
  chassisNumber: string
  notes: string
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
}

interface CustomerData {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
}

function AddVehiclePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerIdParam = searchParams.get('customerId')

  const [makesData, setMakesData] = useState<MakeData[]>([])
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    customerId: customerIdParam || '',
    customerName: '',
    customerPhone: '',
    make: '',
    model: '',
    year: '',
    category: '',
    engineNumber: '',
    chassisNumber: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (customerIdParam && customers.length > 0) {
      const customer = customers.find((c) => c.id === customerIdParam)
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customerId: customerIdParam,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerPhone: customer.phoneNumber,
        }))
      }
    }
  }, [customerIdParam, customers])

  const loadData = async () => {
    try {
      setIsLoadingData(true)

      // Load makes data
      const makes = await getMakesDataAction()
      setMakesData(makes)

      // Load customers
      const garageId = sessionStorage.getItem('garageId')
      if (garageId) {
        const response = await fetch(`/api/customers/list?garageId=${garageId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.customers) {
            setCustomers(result.customers)
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Derived models based on selected make
  const availableModels = formData.make
    ? makesData.find((m) => m.name === formData.make)?.models || []
    : []

  // Available years based on selected model
  const availableYears = formData.model
    ? availableModels.find((m) => m.name === formData.model)?.years || []
    : []

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // If make changes, reset category, model and year
    if (field === 'make') {
      setFormData((prev) => ({
        ...prev,
        make: value,
        model: '',
        category: '',
        year: '',
      }))
    }

    // If model changes, auto-populate category and reset year
    if (field === 'model') {
      const newFormData = { ...formData, model: value, year: '' }

      // Auto-set category based on selected model
      if (formData.make && value) {
        const models = getAvailableModels(formData.make)
        const selectedModel = models.find((m) => m.name === value)
        if (selectedModel) {
          newFormData.category = selectedModel.category
        }
      }

      setFormData(newFormData)
    }

    // If customer is selected, auto-fill customer details
    if (field === 'customerId') {
      const customer = customers.find((c) => c.id === value)
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customerId: value,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerPhone: customer.phoneNumber,
        }))
      }
    }
  }

  const getAvailableModels = (makeName: string) => {
    const make = makesData.find((m) => m.name === makeName)
    return make?.models || []
  }

  const handleBack = () => {
    router.push('/vehicles')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.customerId || !formData.make || !formData.model || !formData.year) {
      alert('Please fill in all required fields')
      return
    }

    if (!formData.engineNumber || !formData.chassisNumber) {
      alert('Please provide both engine number and chassis number')
      return
    }

    setIsSubmitting(true)

    try {
      const garageId = sessionStorage.getItem('garageId')
      if (!garageId) {
        throw new Error('Garage ID not found')
      }

      // Create vehicle
      const response = await fetch('/api/vehicles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId,
          customerId: formData.customerId,
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          category: formData.category,
          engineNumber: formData.engineNumber,
          chassisNumber: formData.chassisNumber,
          licensePlate: formData.chassisNumber, // Using chassis as license plate for now
          notes: formData.notes || null,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to register vehicle')
      }

      setIsSubmitting(false)
      alert('Bike registered successfully!')
      router.push('/vehicles')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(error instanceof Error ? error.message : 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Register New Bike
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Add a customer motorcycle to the registry
            </p>
          </div>
        </div>
      </motion.header>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Customer Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                <p className="text-sm text-gray-600">Owner details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Customer Select */}
              <div>
                <label htmlFor="customer" className="block text-sm font-semibold text-gray-900 mb-2">
                  Customer <span className="text-red-400">*</span>
                </label>
                <select
                  id="customer"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name & Phone (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={formData.customerName}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none transition-all cursor-not-allowed opacity-75"
                    placeholder="Auto-filled from customer selection"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="customerPhone"
                    value={formData.customerPhone}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none transition-all cursor-not-allowed opacity-75"
                    placeholder="Auto-filled from customer selection"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <MotorcycleIcon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
                <p className="text-sm text-gray-600">Make, model, and year from motorcycle catalog</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Make */}
              <div>
                <label htmlFor="make" className="block text-sm font-semibold text-gray-900 mb-2">
                  Make <span className="text-red-400">*</span>
                </label>
                <select
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Make</option>
                  {makesData.map((make) => (
                    <option key={make.id} value={make.name}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label htmlFor="model" className="block text-sm font-semibold text-gray-900 mb-2">
                  Model <span className="text-red-400">*</span>
                </label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  disabled={!formData.make}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Model</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-semibold text-gray-900 mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  disabled={!formData.model}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Year</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                readOnly
                placeholder="Auto-populated based on model selection"
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 cursor-default"
              />
            </div>
          </div>

          {/* Vehicle Identification */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gray-200 rounded-xl flex items-center justify-center">
                <Hash className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Identification</h2>
                <p className="text-sm text-gray-600">Engine and chassis numbers</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Engine Number */}
              <div>
                <label htmlFor="engineNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                  Engine Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="engineNumber"
                  value={formData.engineNumber}
                  onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                  placeholder="e.g., HC23E41001234"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all font-mono"
                  required
                />
              </div>

              {/* Chassis Number */}
              <div>
                <label htmlFor="chassisNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                  VIN (Chassis Number) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                  placeholder="e.g., MH2JC2323PK000001"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all font-mono"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this bike..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-0">
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
                className="px-6 py-3 bg-white/80 backdrop-blur-sm text-graphite-900 font-semibold rounded-xl hover:bg-white transition-all duration-200 shadow-md border-2 border-graphite-200"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <MotorcycleIcon className="h-5 w-5" />
                    Register Bike
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.form>
    </div>
  )
}

// Wrapper component with Suspense boundary
export default function AddVehiclePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-700" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AddVehiclePageContent />
    </Suspense>
  )
}
