'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  // Requester Info
  requesterName: string
  requesterEmail: string
  requesterPhone: string

  // Make/Model Info
  make: string
  model: string
  category: string
  yearStart: string
  yearEnd: string
  countryOfOrigin: string
  engineDisplacement: string
  productionStatus: string

  // Additional Info
  website: string
  notes: string
}

interface RequestMakeModelModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES = [
  'Commuter',
  'Sport',
  'Cruiser',
  'Standard',
  'Touring',
  'Adventure',
  'Dual-sport',
  'Scrambler',
  'Cafe Racer',
  'Scooter',
  'Moped',
  'Electric',
  'Naked',
]

const PRODUCTION_STATUSES = [
  'In Production',
  'Discontinued',
  'Limited',
]

const COUNTRIES = [
  'India',
  'Japan',
  'Taiwan',
  'Italy',
  'UK',
  'USA',
  'Germany',
  'Austria',
  'South Korea',
  'China',
  'Indonesia',
  'Thailand',
  'Other',
]

export function RequestMakeModelModal({ isOpen, onClose }: RequestMakeModelModalProps) {
  const [formData, setFormData] = useState<FormData>({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    make: '',
    model: '',
    category: 'Commuter',
    yearStart: '',
    yearEnd: '',
    countryOfOrigin: 'India',
    engineDisplacement: '',
    productionStatus: 'In Production',
    website: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Required fields
    if (!formData.requesterName.trim()) {
      newErrors.requesterName = 'Name is required'
    }
    if (!formData.requesterEmail.trim()) {
      newErrors.requesterEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requesterEmail)) {
      newErrors.requesterEmail = 'Invalid email format'
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Make name is required'
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model name is required'
    }
    if (!formData.yearStart) {
      newErrors.yearStart = 'Start year is required'
    } else {
      const year = parseInt(formData.yearStart)
      const currentYear = new Date().getFullYear()
      if (year < 1900 || year > currentYear + 5) {
        newErrors.yearStart = `Please enter a year between 1900 and ${currentYear + 5}`
      }
    }
    if (formData.yearEnd) {
      const startYear = parseInt(formData.yearStart)
      const endYear = parseInt(formData.yearEnd)
      if (endYear < startYear) {
        newErrors.yearEnd = 'End year cannot be before start year'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const constructEmailBody = (): string => {
    const body = `
NEW MAKE/MODEL REQUEST
========================

REQUESTER INFORMATION
----------------------
Name: ${formData.requesterName}
Email: ${formData.requesterEmail}
Phone: ${formData.requesterPhone || 'Not provided'}

MAKE/MODEL INFORMATION
-----------------------
Make: ${formData.make}
Model: ${formData.model}
Category: ${formData.category}
Year Start: ${formData.yearStart}
${formData.yearEnd ? `Year End: ${formData.yearEnd}` : 'Year End: Currently in production'}
Country of Origin: ${formData.countryOfOrigin}
Engine Displacement: ${formData.engineDisplacement || 'N/A'} CC
Production Status: ${formData.productionStatus}
${formData.website ? `Website: ${formData.website}` : ''}

ADDITIONAL NOTES
----------------
${formData.notes || 'No additional notes provided'}

---
This request was submitted via the RevOS Service Scope Management portal.
Timestamp: ${new Date().toISOString()}
    `.trim()

    return body
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Construct mailto link
      const subject = encodeURIComponent(`New Make/Model Request: ${formData.make} ${formData.model}`)
      const body = encodeURIComponent(constructEmailBody())
      const email = process.env.NEXT_PUBLIC_REQUEST_EMAIL || 'admin@revos.com'

      // Open email client
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`

      // Show success message
      setSubmitStatus('success')

      // Reset form after delay
      setTimeout(() => {
        setSubmitStatus('idle')
        onClose()
        // Reset form
        setFormData({
          requesterName: '',
          requesterEmail: '',
          requesterPhone: '',
          make: '',
          model: '',
          category: 'Commuter',
          yearStart: '',
          yearEnd: '',
          countryOfOrigin: 'India',
          engineDisplacement: '',
          productionStatus: 'In Production',
          website: '',
          notes: '',
        })
        setErrors({})
      }, 2000)
    } catch (error) {
      console.error('Error submitting request:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request to Add Make/Model</h2>
                  <p className="text-sm text-gray-600">Submit a request to add a new motorcycle or scooter</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {submitStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
                  >
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Initiated!</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Your email client has been opened with the request details. Please send the email to complete your submission.
                  </p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4"
                  >
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Something went wrong. Please try again or contact us directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Requester Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                      Your Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.requesterName}
                          onChange={(e) => handleChange('requesterName', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                            errors.requesterName ? "border-red-300 bg-red-50" : "border-gray-300"
                          )}
                          placeholder="John Doe"
                        />
                        {errors.requesterName && (
                          <p className="text-sm text-red-600 mt-1">{errors.requesterName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.requesterEmail}
                          onChange={(e) => handleChange('requesterEmail', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                            errors.requesterEmail ? "border-red-300 bg-red-50" : "border-gray-300"
                          )}
                          placeholder="john@example.com"
                        />
                        {errors.requesterEmail && (
                          <p className="text-sm text-red-600 mt-1">{errors.requesterEmail}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={formData.requesterPhone}
                          onChange={(e) => handleChange('requesterPhone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Make/Model Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                      Make & Model Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Make <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.make}
                          onChange={(e) => handleChange('make', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                            errors.make ? "border-red-300 bg-red-50" : "border-gray-300"
                          )}
                          placeholder="e.g., Royal Enfield"
                        />
                        {errors.make && (
                          <p className="text-sm text-red-600 mt-1">{errors.make}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => handleChange('model', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                            errors.model ? "border-red-300 bg-red-50" : "border-gray-300"
                          )}
                          placeholder="e.g., Classic 350"
                        />
                        {errors.model && (
                          <p className="text-sm text-red-600 mt-1">{errors.model}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country of Origin
                        </label>
                        <select
                          value={formData.countryOfOrigin}
                          onChange={(e) => handleChange('countryOfOrigin', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          {COUNTRIES.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year Start <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.yearStart}
                          onChange={(e) => handleChange('yearStart', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                            errors.yearStart ? "border-red-300 bg-red-50" : "border-gray-300"
                          )}
                          placeholder="e.g., 2020"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                        />
                        {errors.yearStart && (
                          <p className="text-sm text-red-600 mt-1">{errors.yearStart}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year End (if discontinued)
                        </label>
                        <input
                          type="number"
                          value={formData.yearEnd}
                          onChange={(e) => handleChange('yearEnd', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                            errors.yearEnd ? "border-red-300 bg-red-50" : "border-gray-300"
                          )}
                          placeholder="Leave blank if still in production"
                          min="1900"
                        />
                        {errors.yearEnd && (
                          <p className="text-sm text-red-600 mt-1">{errors.yearEnd}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Engine Displacement (CC)
                        </label>
                        <input
                          type="number"
                          value={formData.engineDisplacement}
                          onChange={(e) => handleChange('engineDisplacement', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="e.g., 350 (0 for electric)"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Production Status
                        </label>
                        <select
                          value={formData.productionStatus}
                          onChange={(e) => handleChange('productionStatus', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          {PRODUCTION_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website (Optional)
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleChange('website', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="https://www.example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                      Additional Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        placeholder="Any additional details about this make/model..."
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {submitStatus === 'idle' && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Opening Email...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
