'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Info, ChevronDown, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { cn } from '@/lib/utils'

/**
 * Add Make Page - Service Scope Management
 *
 * Add a new motorcycle manufacturer (make) with its models.
 * This is master data for the service scope.
 * Based on database schema: motorcycles table
 */

interface ModelFormData {
  id: string
  model: string // Changed from 'name' to match database 'model' field
  category: string
  year_start: string // Changed from years[] to match database
  year_end: string // NULL if still in production
  engine_displacement_cc: string // Required field
  production_status: 'In Production' | 'Discontinued' | 'Limited' // From database
}

interface MakeFormData {
  make: string // Changed from 'name' to match database 'make' field
  country_of_origin: string // Changed from 'country' to match database
  models: ModelFormData[]
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

// Countries matching seed data
const countries = [
  'India',
  'Japan',
  'United Kingdom',
  'USA',
  'Italy',
  'Germany',
  'Austria',
  'France',
  'Spain',
  'Czech Republic',
  'Other',
]

// Production status options from database
const productionStatuses = [
  { value: 'In Production', label: 'In Production', description: 'Currently being manufactured' },
  { value: 'Discontinued', label: 'Discontinued', description: 'No longer in production' },
  { value: 'Limited', label: 'Limited Edition', description: 'Special limited production run' },
]

export default function AddMakePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MakeFormData>({
    make: '',
    country_of_origin: '',
    models: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleInputChange = (field: keyof MakeFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addModel = () => {
    const newModel: ModelFormData = {
      id: Date.now().toString(),
      model: '',
      category: '',
      year_start: '',
      year_end: '',
      engine_displacement_cc: '',
      production_status: 'In Production',
    }
    setFormData((prev) => ({
      ...prev,
      models: [...prev.models, newModel],
    }))
  }

  const removeModel = (modelId: string) => {
    setFormData((prev) => ({
      ...prev,
      models: prev.models.filter((m) => m.id !== modelId),
    }))
  }

  const updateModel = (modelId: string, field: keyof ModelFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      models: prev.models.map((m) => {
        if (m.id === modelId) {
          // Auto-calculate production status based on year_end
          if (field === 'year_end' && value) {
            return { ...m, [field]: value, production_status: 'Discontinued' }
          }
          if (field === 'year_end' && !value) {
            return { ...m, [field]: value, production_status: 'In Production' }
          }
          return { ...m, [field]: value }
        }
        return m
      }),
    }))
  }

  const handleBack = () => {
    if (formData.models.length > 0 || formData.make || formData.country_of_origin) {
      // Show custom modal instead of native confirm
      setShowCancelModal(true)
    } else {
      router.push('/vehicle-catalog')
    }
  }

  const confirmCancel = () => {
    setShowCancelModal(false)
    router.push('/vehicle-catalog')
  }

  const cancelCancel = () => {
    setShowCancelModal(false)
  }

  const validateForm = () => {
    // Validate make information
    if (!formData.make.trim()) {
      alert('Please enter make name')
      return false
    }
    if (!formData.country_of_origin) {
      alert('Please select country of origin')
      return false
    }

    // Check at least one model
    if (formData.models.length === 0) {
      alert('Please add at least one model')
      return false
    }

    // Validate each model
    for (let i = 0; i < formData.models.length; i++) {
      const model = formData.models[i]
      const modelNum = i + 1

      if (!model.model.trim()) {
        alert(`Please enter model name for Model ${modelNum}`)
        return false
      }
      if (!model.category) {
        alert(`Please select category for Model ${modelNum}`)
        return false
      }
      if (!model.year_start) {
        alert(`Please enter start year for Model ${modelNum}`)
        return false
      }
      const startYear = parseInt(model.year_start)
      if (isNaN(startYear) || startYear < 1900 || startYear > 2100) {
        alert(`Please enter a valid start year (1900-2100) for Model ${modelNum}`)
        return false
      }
      if (model.year_end) {
        const endYear = parseInt(model.year_end)
        if (isNaN(endYear) || endYear < 1900 || endYear > 2100) {
          alert(`Please enter a valid end year (1900-2100) for Model ${modelNum}`)
          return false
        }
        if (endYear < startYear) {
          alert(`End year must be after start year for Model ${modelNum}`)
          return false
        }
      }
      if (model.engine_displacement_cc === '') {
        alert(`Please enter engine displacement for Model ${modelNum}`)
        return false
      }
      const cc = parseInt(model.engine_displacement_cc)
      if (isNaN(cc) || cc < 0) {
        alert(`Please enter a valid engine displacement (CC >= 0) for Model ${modelNum}`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement actual API call to save make and models
      // For now, just log the data
      console.log('Form data to submit:', formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitting(false)
      alert('Make added successfully! (Function to be implemented)')
      router.push('/vehicle-catalog')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
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
              Add New Make
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Add a motorcycle manufacturer and models to service scope
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-card">
          {/* Make Information */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <MotorcycleIcon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Make Information</h2>
                <p className="text-sm text-gray-600">Basic details about the manufacturer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Make Name */}
              <div>
                <label htmlFor="makeName" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Make Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="makeName"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Honda, Kawasaki, Royal Enfield"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                  Country of Origin <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="country"
                    value={formData.country_of_origin}
                    onChange={(e) => handleInputChange('country_of_origin', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <MotorcycleIcon className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Models</h2>
                  <p className="text-sm text-gray-600">
                    {formData.models.length} {formData.models.length === 1 ? 'model' : 'models'} added
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addModel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Model
              </motion.button>
            </div>

            {/* Models List */}
            {formData.models.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <MotorcycleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">No models added yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Model" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.models.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4 md:p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MotorcycleIcon className="h-4 w-4 text-gray-700" />
                        </div>
                        <span className="text-gray-900 font-semibold">Model {index + 1}</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeModel(model.id)}
                        className="p-2 text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                        title="Remove Model"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Model Name */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Model Name <span className="text-status-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={model.model}
                          onChange={(e) => updateModel(model.id, 'model', e.target.value)}
                          placeholder="e.g., CBR650R, Classic 350"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all"
                          required
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Category <span className="text-status-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={model.category}
                            onChange={(e) => updateModel(model.id, 'category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all appearance-none cursor-pointer"
                            required
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
                      </div>

                      {/* Engine Displacement */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Engine Displacement (CC) <span className="text-status-error">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={model.engine_displacement_cc}
                            onChange={(e) => updateModel(model.id, 'engine_displacement_cc', e.target.value)}
                            placeholder="e.g., 350"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all pr-16"
                            required
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                            CC
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter 0 for electric motorcycles</p>
                      </div>

                      {/* Production Status */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Production Status <span className="text-status-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={model.production_status}
                            onChange={(e) => updateModel(model.id, 'production_status', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all appearance-none cursor-pointer"
                            required
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

                    {/* Year Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Start Year */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Year Started <span className="text-status-error">*</span>
                        </label>
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          value={model.year_start}
                          onChange={(e) => updateModel(model.id, 'year_start', e.target.value)}
                          placeholder="e.g., 2020"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all"
                          required
                        />
                      </div>

                      {/* End Year */}
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-2">
                          Year Ended <span className="text-gray-400 font-normal">(leave blank if in production)</span>
                        </label>
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          value={model.year_end}
                          onChange={(e) => updateModel(model.id, 'year_end', e.target.value || '')}
                          placeholder="e.g., 2024"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-gray-400 transition-all"
                        />
                        {model.year_end && (
                          <p className="text-xs text-gray-500 mt-1">
                            Production will be marked as "Discontinued"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Database Fields</p>
                        <ul className="text-xs space-y-0.5 text-blue-700">
                          <li>• Year Range: Converted to individual years for display</li>
                          <li>• Engine CC: 0 for electric, {'>'}0 for combustion engines</li>
                          <li>• Production Status: Auto-calculated if end year is provided</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={cn(
                  "flex items-center justify-center gap-2 px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]",
                  formData.models.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <MotorcycleIcon className="h-5 w-5" />
                    Add Make & Models
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Validation Message */}
            {formData.models.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  You must add at least one model before submitting
                </p>
              </div>
            )}
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
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Discard Changes?
                      </h3>
                      <p className="text-sm text-gray-600">
                        You have unsaved changes. Are you sure you want to go back? All your progress will be lost.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                {(formData.models.length > 0 || formData.make || formData.country_of_origin) && (
                  <div className="px-6 pb-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">You'll lose:</p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {formData.make && <li>• Make name: "{formData.make}"</li>}
                        {formData.country_of_origin && <li>• Country: "{formData.country_of_origin}"</li>}
                        {formData.models.length > 0 && <li>• {formData.models.length} model(s)</li>}
                      </ul>
                    </div>
                  </div>
                )}

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
                    className="flex-1 px-4 py-2.5 bg-status-error text-white font-semibold rounded-lg hover:bg-status-error/90 transition-all duration-200"
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
