'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Info, AlertTriangle, CheckCircle, ChevronDown, AlertCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { cn } from '@/lib/utils'
import { addMotorcycleModelAction } from '@/app/actions/motorcycle-actions'
import type { MakeData } from '@/lib/supabase/motorcycle-queries'

/**
 * Add Model Client Component
 *
 * World-class form for adding motorcycle models with:
 * - Real-time validation
 * - Clear error messaging
 * - Loading states
 * - Success animations
 * - Accessibility features
 */

interface ModelFormData {
  model: string
  category: string
  year_start: string
  year_end: string
  engine_displacement_cc: string
  production_status: 'In Production' | 'Discontinued' | 'Limited'
}

interface FieldError {
  field: keyof ModelFormData
  message: string
}

type ErrorType = 'validation' | 'duplicate' | 'database' | 'network' | 'unknown'

interface FormError {
  type: ErrorType
  message: string
  isDuplicate?: boolean
}

// Categories matching database values
const categories = [
  'Commuter',
  'Sport',
  'Standard',
  'Naked',
  'Cruiser',
  'Touring',
  'Adventure',
  'Dual-sport',
  'Dirt bike',
  'Scooter',
  'Moped',
  'Electric',
  'Cafe Racer',
  'Scrambler',
  'Motocross',
]

// Production status options from database
const productionStatuses = [
  { value: 'In Production', label: 'In Production', description: 'Currently being manufactured' },
  { value: 'Discontinued', label: 'Discontinued', description: 'No longer in production' },
  { value: 'Limited', label: 'Limited Edition', description: 'Special limited production run' },
]

interface AddModelClientProps {
  make: MakeData
}

export function AddModelClient({ make }: AddModelClientProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<ModelFormData>({
    model: '',
    category: '',
    year_start: '',
    year_end: '',
    engine_displacement_cc: '',
    production_status: 'In Production',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [formError, setFormError] = useState<FormError | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])
  const [touchedFields, setTouchedFields] = useState<Set<keyof ModelFormData>>(new Set())

  // Clear field error when user starts typing
  const handleInputChange = (field: keyof ModelFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear field-specific error
    setFieldErrors((prev) => prev.filter((e) => e.field !== field))

    // Clear form error if it exists
    if (formError) {
      setFormError(null)
    }
  }

  // Mark field as touched on blur
  const handleFieldBlur = (field: keyof ModelFormData) => {
    setTouchedFields((prev) => new Set(prev).add(field))
    validateField(field)
  }

  // Validate individual field
  const validateField = (field: keyof ModelFormData): string | null => {
    switch (field) {
      case 'model':
        if (!formData.model.trim()) {
          return 'Model name is required'
        }
        if (formData.model.trim().length < 2) {
          return 'Model name must be at least 2 characters'
        }
        if (formData.model.trim().length > 150) {
          return 'Model name must be less than 150 characters'
        }
        return null

      case 'category':
        if (!formData.category) {
          return 'Category is required'
        }
        return null

      case 'year_start':
        if (!formData.year_start) {
          return 'Start year is required'
        }
        const startYear = parseInt(formData.year_start)
        if (isNaN(startYear) || startYear < 1900 || startYear > 2100) {
          return 'Please enter a valid year (1900-2100)'
        }
        return null

      case 'year_end':
        if (formData.year_end) {
          const endYear = parseInt(formData.year_end)
          const startYear = parseInt(formData.year_start)
          if (isNaN(endYear) || endYear < 1900 || endYear > 2100) {
            return 'Please enter a valid year (1900-2100)'
          }
          if (!isNaN(startYear) && endYear < startYear) {
            return 'End year must be after start year'
          }
        }
        return null

      case 'engine_displacement_cc':
        if (formData.engine_displacement_cc === '') {
          return 'Engine displacement is required'
        }
        const cc = parseInt(formData.engine_displacement_cc)
        if (isNaN(cc) || cc < 0 || cc > 10000) {
          return 'Please enter a valid value (0-10000 CC)'
        }
        return null

      default:
        return null
    }
  }

  // Validate entire form
  const validateForm = (): boolean => {
    const errors: FieldError[] = []

    // Validate each field
    const fields: (keyof ModelFormData)[] = ['model', 'category', 'year_start', 'year_end', 'engine_displacement_cc']

    fields.forEach((field) => {
      const errorMessage = validateField(field)
      if (errorMessage) {
        errors.push({ field, message: errorMessage })
      }
    })

    setFieldErrors(errors)

    if (errors.length > 0) {
      // Mark all errored fields as touched
      setTouchedFields((prev) => {
        const newSet = new Set(prev)
        errors.forEach((error) => newSet.add(error.field))
        return newSet
      })

      // Set form error
      setFormError({
        type: 'validation',
        message: 'Please fix the errors below before submitting.',
      })

      return false
    }

    return true
  }

  const handleBack = () => {
    const hasData = Object.values(formData).some((value) => value !== '' && value !== 'In Production')
    if (hasData) {
      setShowCancelModal(true)
    } else {
      router.push(`/vehicle-catalog/${make.id}`)
    }
  }

  const confirmCancel = () => {
    setShowCancelModal(false)
    router.push(`/vehicle-catalog/${make.id}`)
  }

  const cancelCancel = () => {
    setShowCancelModal(false)
  }

  const getErrorType = (errorMessage: string): ErrorType => {
    if (errorMessage.includes('already exists')) {
      return 'duplicate'
    }
    if (errorMessage.includes('Failed to validate')) {
      return 'database'
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network'
    }
    return 'unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addMotorcycleModelAction({
        make: make.name,
        model: formData.model.trim(),
        category: formData.category,
        year_start: parseInt(formData.year_start),
        year_end: formData.year_end ? parseInt(formData.year_end) : null,
        country_of_origin: make.country,
        engine_displacement_cc: parseInt(formData.engine_displacement_cc),
        production_status: formData.production_status,
        logo_url: null,
      })

      if (!result.success) {
        const errorType = getErrorType(result.error || '')

        setFormError({
          type: errorType,
          message: result.error || 'Failed to add model',
          isDuplicate: errorType === 'duplicate',
        })

        setIsSubmitting(false)
        return
      }

      // Success!
      setSuccess(true)
      setFormError(null)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/vehicle-catalog/${make.id}`)
      }, 2000)
    } catch (err) {
      console.error('Error submitting form:', err)

      setFormError({
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
      })

      setIsSubmitting(false)
    }
  }

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case 'validation':
        return AlertCircle
      case 'duplicate':
        return XCircle
      case 'database':
        return AlertTriangle
      case 'network':
        return AlertCircle
      default:
        return AlertTriangle
    }
  }

  const getErrorStyles = (type: ErrorType) => {
    switch (type) {
      case 'validation':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'duplicate':
        return 'bg-amber-50 border-amber-200 text-amber-900'
      case 'database':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-900'
      default:
        return 'bg-red-50 border-red-200 text-red-900'
    }
  }

  const getFieldError = (field: keyof ModelFormData) => {
    return fieldErrors.find((e) => e.field === field)?.message
  }

  const isFieldTouched = (field: keyof ModelFormData) => {
    return touchedFields.has(field)
  }

  const hasFieldError = (field: keyof ModelFormData) => {
    return fieldErrors.some((e) => e.field === field)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
              Add New Model
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Adding a model for <span className="font-semibold text-gray-900">{make.name}</span>
            </p>
          </div>
        </div>
      </motion.header>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3"
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Model added successfully!</p>
              <p className="text-xs text-green-700 mt-1">Redirecting to make details...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'mb-6 p-4 border rounded-lg flex gap-3',
              getErrorStyles(formError.type)
            )}
            role="alert"
            aria-live="assertive"
          >
            {React.createElement(getErrorIcon(formError.type), {
              className: 'h-5 w-5 shrink-0 mt-0.5',
            })}
            <div className="flex-1">
              <p className="text-sm font-medium">{formError.message}</p>
              {formError.isDuplicate && (
                <p className="text-xs mt-1 opacity-90">
                  Please check the existing models for {make.name} and use a different name.
                </p>
              )}
            </div>
            <button
              onClick={() => setFormError(null)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss error"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-card">
          {/* Model Information */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <MotorcycleIcon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Model Information</h2>
                <p className="text-sm text-gray-600">Enter details about the motorcycle model</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Model Name */}
              <div className={cn(hasFieldError('model') && isFieldTouched('model') ? 'space-y-1' : '')}>
                <label htmlFor="modelName" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Model Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="modelName"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  onBlur={() => handleFieldBlur('model')}
                  placeholder="e.g., RS 457, Tuono 457"
                  className={cn(
                    'w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-gray-400 transition-all',
                    hasFieldError('model') && isFieldTouched('model')
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                      : 'border-gray-300 focus:ring-gray-100'
                  )}
                  required
                  aria-invalid={hasFieldError('model') && isFieldTouched('model')}
                  aria-describedby={hasFieldError('model') && isFieldTouched('model') ? 'modelError' : undefined}
                  disabled={isSubmitting || success}
                />
                {isFieldTouched('model') && getFieldError('model') && (
                  <p id="modelError" className="text-xs text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {getFieldError('model')}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className={cn(hasFieldError('category') && isFieldTouched('category') ? 'space-y-1' : '')}>
                <label htmlFor="category" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Category <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    onBlur={() => handleFieldBlur('category')}
                    className={cn(
                      'w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-gray-400 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                      hasFieldError('category') && isFieldTouched('category')
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-gray-300 focus:ring-gray-100'
                    )}
                    required
                    aria-invalid={hasFieldError('category') && isFieldTouched('category')}
                    aria-describedby={hasFieldError('category') && isFieldTouched('category') ? 'categoryError' : undefined}
                    disabled={isSubmitting || success}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
                {isFieldTouched('category') && getFieldError('category') && (
                  <p id="categoryError" className="text-xs text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {getFieldError('category')}
                  </p>
                )}
              </div>

              {/* Engine Displacement */}
              <div className={cn(hasFieldError('engine_displacement_cc') && isFieldTouched('engine_displacement_cc') ? 'space-y-1' : '')}>
                <label htmlFor="engine" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Engine Displacement (CC) <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="engine"
                    min="0"
                    max="10000"
                    step="1"
                    value={formData.engine_displacement_cc}
                    onChange={(e) => handleInputChange('engine_displacement_cc', e.target.value)}
                    onBlur={() => handleFieldBlur('engine_displacement_cc')}
                    placeholder="e.g., 457"
                    className={cn(
                      'w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-gray-400 transition-all pr-16',
                      hasFieldError('engine_displacement_cc') && isFieldTouched('engine_displacement_cc')
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-gray-300 focus:ring-gray-100'
                    )}
                    required
                    aria-invalid={hasFieldError('engine_displacement_cc') && isFieldTouched('engine_displacement_cc')}
                    aria-describedby={hasFieldError('engine_displacement_cc') && isFieldTouched('engine_displacement_cc') ? 'engineError engineHelp' : 'engineHelp'}
                    disabled={isSubmitting || success}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    CC
                  </span>
                </div>
                {isFieldTouched('engine_displacement_cc') && getFieldError('engine_displacement_cc') ? (
                  <p id="engineError" className="text-xs text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {getFieldError('engine_displacement_cc')}
                  </p>
                ) : (
                  <p id="engineHelp" className="text-xs text-gray-500">Enter 0 for electric motorcycles</p>
                )}
              </div>

              {/* Production Status */}
              <div>
                <label htmlFor="status" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Production Status <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={formData.production_status}
                    onChange={(e) => handleInputChange('production_status', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isSubmitting || success}
                  >
                    {productionStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Year Range */}
          <div className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-6">Production Years</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Year */}
              <div className={cn(hasFieldError('year_start') && isFieldTouched('year_start') ? 'space-y-1' : '')}>
                <label htmlFor="yearStart" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Year Started <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="number"
                  id="yearStart"
                  min="1900"
                  max="2100"
                  value={formData.year_start}
                  onChange={(e) => handleInputChange('year_start', e.target.value)}
                  onBlur={() => handleFieldBlur('year_start')}
                  placeholder="e.g., 2024"
                  className={cn(
                    'w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-gray-400 transition-all',
                    hasFieldError('year_start') && isFieldTouched('year_start')
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                      : 'border-gray-300 focus:ring-gray-100'
                  )}
                  required
                  aria-invalid={hasFieldError('year_start') && isFieldTouched('year_start')}
                  aria-describedby={hasFieldError('year_start') && isFieldTouched('year_start') ? 'yearStartError' : undefined}
                  disabled={isSubmitting || success}
                />
                {isFieldTouched('year_start') && getFieldError('year_start') && (
                  <p id="yearStartError" className="text-xs text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {getFieldError('year_start')}
                  </p>
                )}
              </div>

              {/* End Year */}
              <div className={cn(hasFieldError('year_end') && isFieldTouched('year_end') ? 'space-y-1' : '')}>
                <label htmlFor="yearEnd" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Year Ended <span className="text-gray-400 font-normal">(leave blank if in production)</span>
                </label>
                <input
                  type="number"
                  id="yearEnd"
                  min="1900"
                  max="2100"
                  value={formData.year_end}
                  onChange={(e) => handleInputChange('year_end', e.target.value || '')}
                  onBlur={() => handleFieldBlur('year_end')}
                  placeholder="e.g., 2024"
                  className={cn(
                    'w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-gray-400 transition-all',
                    hasFieldError('year_end') && isFieldTouched('year_end')
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                      : 'border-gray-300 focus:ring-gray-100'
                  )}
                  aria-invalid={hasFieldError('year_end') && isFieldTouched('year_end')}
                  aria-describedby={hasFieldError('year_end') && isFieldTouched('year_end') ? 'yearEndError' : undefined}
                  disabled={isSubmitting || success}
                />
                {isFieldTouched('year_end') && getFieldError('year_end') && (
                  <p id="yearEndError" className="text-xs text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {getFieldError('year_end')}
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Model Validation</p>
                <ul className="text-xs space-y-0.5 text-blue-700">
                  <li>• The system will check if this model already exists for {make.name}</li>
                  <li>• If the model exists, you'll be notified and can choose a different name</li>
                  <li>• Engine CC: 0 for electric, {'>'}0 for combustion engines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 md:p-6 pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-end"
            >
              <motion.button
                type="button"
                whileHover={{ scale: isSubmitting || success ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || success ? 1 : 0.98 }}
                onClick={handleBack}
                disabled={isSubmitting || success}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting || success}
                whileHover={{ scale: isSubmitting || success ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || success ? 1 : 0.98 }}
                className={cn(
                  "flex items-center justify-center gap-2 px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]",
                  success ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Adding Model...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Added!
                  </>
                ) : (
                  <>
                    <MotorcycleIcon className="h-5 w-5" />
                    Add Model
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.form>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={cancelCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-modal-title"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 id="cancel-modal-title" className="text-lg font-semibold text-gray-900 mb-1">
                        Discard Changes?
                      </h3>
                      <p className="text-sm text-gray-600">
                        You have unsaved changes. Are you sure you want to go back? All your progress will be lost.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-2 bg-gray-50 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelCancel}
                    className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Keep Editing
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmCancel}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    Discard & Go Back
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
