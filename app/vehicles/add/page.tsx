'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, User, Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

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

// Service scope data
const serviceScope = {
  makes: {
    Honda: ['CBR650R', 'CBR600RR', 'CBR1000RR-R Fireblade', 'Africa Twin', 'NC750X'],
    Kawasaki: ['Ninja 400', 'Ninja 650', 'Ninja ZX-10R', 'Z900', 'Versys 650'],
    Yamaha: ['MT-07', 'MT-09', 'YZF-R1', 'YZF-R6', 'Tracer 900'],
    BMW: ['R 1250 GS', 'R 1250 RT', 'S 1000 RR', 'M 1000 RR', 'G 310 GS'],
    'Royal Enfield': ['Classic 350', 'Classic 500', 'Himalayan', 'Interceptor 650', 'Continental GT'],
    Suzuki: ['GSX-R1000', 'GSX-R750', 'Hayabusa', 'V-Strom 650', 'Katana'],
    Ducati: ['Panigale V4', 'Streetfighter V4', 'Multistrada V4', 'SuperSport 950', 'Scrambler'],
    KTM: ['Duke 390', 'Duke 790', 'Duke 890', 'RC 390', 'Adventure 390'],
  },
  years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
}

const categories = [
  'Sport',
  'Naked',
  'Cruiser',
  'Adventure',
  'Touring',
  'Dual-Sport',
  'Scooter',
  'Other',
]

// Mock customers
const mockCustomers = [
  { id: 'cust-001', name: 'Rahul Sharma', phone: '+91 98765 43210' },
  { id: 'cust-002', name: 'Priya Patel', phone: '+91 98765 43211' },
  { id: 'cust-003', name: 'Amit Kumar', phone: '+91 98765 43212' },
  { id: 'cust-004', name: 'Suresh Reddy', phone: '+91 98765 43213' },
  { id: 'cust-005', name: 'Anjali Desai', phone: '+91 98765 43214' },
]

export default function AddVehiclePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    customerId: '',
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

  // Derived models based on selected make
  const availableModels = formData.make ? serviceScope.makes[formData.make as keyof typeof serviceScope.makes] || [] : []

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // If make changes, reset model
    if (field === 'make') {
      setFormData((prev) => ({
        ...prev,
        make: value,
        model: '',
      }))
    }

    // If customer is selected, auto-fill customer details
    if (field === 'customerId') {
      const customer = mockCustomers.find((c) => c.id === value)
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customerId: value,
          customerName: customer.name,
          customerPhone: customer.phone,
        }))
      }
    }
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log('Vehicle data:', formData)

      setIsSubmitting(false)
      alert('Bike registered successfully!')
      router.push('/vehicles')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center justify-center h-10 w-10 bg-graphite-800 text-white rounded-xl hover:bg-graphite-700 transition-all duration-200 shadow-md border border-graphite-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
              Register New Bike
            </h1>
            <p className="text-sm md:text-base text-graphite-600 mt-1">
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
        <div className="bg-graphite-800 backdrop-blur-sm rounded-xl shadow-lg border border-graphite-700">
          {/* Customer Information */}
          <div className="p-6 border-b border-graphite-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-brand/20 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Customer Information</h2>
                <p className="text-sm text-graphite-400">Owner details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Customer Select */}
              <div>
                <label htmlFor="customer" className="block text-sm font-semibold text-white mb-2">
                  Customer <span className="text-red-400">*</span>
                </label>
                <select
                  id="customer"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Customer</option>
                  {mockCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name & Phone (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-semibold text-white mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={formData.customerName}
                    readOnly
                    className="w-full px-4 py-3 bg-graphite-900/50 border-2 border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none transition-all cursor-not-allowed opacity-75"
                    placeholder="Auto-filled from customer selection"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-semibold text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="customerPhone"
                    value={formData.customerPhone}
                    readOnly
                    className="w-full px-4 py-3 bg-graphite-900/50 border-2 border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none transition-all cursor-not-allowed opacity-75"
                    placeholder="Auto-filled from customer selection"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="p-6 border-b border-graphite-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-brand/20 rounded-xl flex items-center justify-center">
                <MotorcycleIcon className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Vehicle Information</h2>
                <p className="text-sm text-graphite-400">Make, model, and year from service scope</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Make */}
              <div>
                <label htmlFor="make" className="block text-sm font-semibold text-white mb-2">
                  Make <span className="text-red-400">*</span>
                </label>
                <select
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Make</option>
                  {Object.keys(serviceScope.makes).map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label htmlFor="model" className="block text-sm font-semibold text-white mb-2">
                  Model <span className="text-red-400">*</span>
                </label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  disabled={!formData.make}
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Model</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-semibold text-white mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Year</option>
                  {serviceScope.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-2">
                Category (Optional)
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Identification */}
          <div className="p-6 border-b border-graphite-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-graphite-700 rounded-xl flex items-center justify-center">
                <Hash className="h-5 w-5 text-graphite-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Vehicle Identification</h2>
                <p className="text-sm text-graphite-400">Engine and chassis numbers</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Engine Number */}
              <div>
                <label htmlFor="engineNumber" className="block text-sm font-semibold text-white mb-2">
                  Engine Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="engineNumber"
                  value={formData.engineNumber}
                  onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                  placeholder="e.g., HC23E41001234"
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-mono"
                  required
                />
              </div>

              {/* Chassis Number */}
              <div>
                <label htmlFor="chassisNumber" className="block text-sm font-semibold text-white mb-2">
                  Chassis Number (VIN) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                  placeholder="e.g., MH2JC2323PK000001"
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-mono"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-white mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this bike..."
                  rows={3}
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
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
                className="flex items-center justify-center gap-2 px-8 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
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
