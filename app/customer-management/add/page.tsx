'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Add Customer Page
 *
 * A comprehensive form for adding new customers to the garage.
 * Collects personal details, contact information, and address.
 */

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
  dateOfBirth: string
  notes: string
}

export default function AddCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    dateOfBirth: '',
    notes: '',
  })

  useEffect(() => {
    // Check authentication
    const sessionUser = sessionStorage.getItem('user')
    if (!sessionUser) {
      router.push('/login')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required'
    if (!formData.lastName.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.phoneNumber.trim()) return 'Phone number is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(formData.phoneNumber) || formData.phoneNumber.length < 10) {
      return 'Please enter a valid phone number (minimum 10 digits)'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        throw new Error('User not authenticated')
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        throw new Error('Invalid user session')
      }

      // TODO: Replace with actual API call when ready
      // const response = await fetch('/api/customers/create', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...formData,
      //     garageId,
      //   }),
      // })

      // const result = await response.json()

      // if (!response.ok || !result.success) {
      //   throw new Error(result.error || 'Failed to create customer')
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('Customer created successfully:', formData)

      setSuccess(true)

      // Redirect after short delay
      setTimeout(() => {
        router.push('/customer-management')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setIsLoading(false)
    }
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
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="p-2 bg-graphite-800 border border-graphite-700 rounded-xl text-white hover:bg-graphite-700 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
              Add New Customer
            </h1>
            <p className="text-sm md:text-base text-graphite-600 mt-1">
              Fill in the customer details below
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-graphite-200 overflow-hidden"
      >
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 border-b border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <Save className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Customer Added Successfully!</p>
                <p className="text-sm text-green-700">Redirecting to customer list...</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border-b border-red-200"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Personal Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-brand rounded-full" />
              <h2 className="text-lg font-semibold text-graphite-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  First Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Last Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Email Address <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Phone Number <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Alternate Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    placeholder="+91 98765 43211"
                    className="w-full pl-12 pr-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-brand rounded-full" />
              <h2 className="text-lg font-semibold text-graphite-900">Address Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-graphite-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Apt 4B"
                    rows={2}
                    className="w-full pl-12 pr-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-brand rounded-full" />
              <h2 className="text-lg font-semibold text-graphite-900">Additional Information</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about the customer..."
                rows={3}
                className="w-full px-4 py-3 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-graphite-200">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => router.back()}
              disabled={isLoading || success}
              className="flex-1 px-6 py-3 border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || success}
              className="flex-1 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding Customer...
                </>
              ) : success ? (
                <>
                  <Save className="h-4 w-4" />
                  Added Successfully!
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Customer
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
