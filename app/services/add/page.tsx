'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Add Make Page - Service Scope Management
 *
 * Add a new motorcycle manufacturer (make) with its models.
 * This is master data for the service scope.
 */

interface ModelFormData {
  id: string
  name: string
  category: string
  years: number[]
}

interface MakeFormData {
  name: string
  country: string
  models: ModelFormData[]
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

const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]

const countries = [
  'Japan',
  'Germany',
  'India',
  'Italy',
  'Austria',
  'USA',
  'United Kingdom',
  'Spain',
  'France',
  'Other',
]

export default function AddMakePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MakeFormData>({
    name: '',
    country: '',
    models: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof MakeFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addModel = () => {
    const newModel: ModelFormData = {
      id: Date.now().toString(),
      name: '',
      category: '',
      years: [],
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
      models: prev.models.map((m) =>
        m.id === modelId ? { ...m, [field]: value } : m
      ),
    }))
  }

  const toggleYear = (modelId: string, year: number) => {
    setFormData((prev) => ({
      ...prev,
      models: prev.models.map((m) => {
        if (m.id === modelId) {
          const years = m.years.includes(year)
            ? m.years.filter((y) => y !== year)
            : [...m.years, year]
          return { ...m, years }
        }
        return m
      }),
    }))
  }

  const handleBack = () => {
    router.push('/services')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.country) {
      alert('Please enter make name and select country')
      return
    }

    if (formData.models.length === 0) {
      alert('Please add at least one model')
      return
    }

    // Validate each model
    const invalidModel = formData.models.find((m) => !m.name || !m.category || m.years.length === 0)
    if (invalidModel) {
      alert('Please complete all model details (name, category, and at least one year)')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log('Make data:', formData)

      setIsSubmitting(false)
      alert('Make added successfully!')
      router.push('/services')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
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
              Add New Make
            </h1>
            <p className="text-sm md:text-base text-graphite-600 mt-1">
              Add a motorcycle manufacturer to service scope
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
          {/* Make Information */}
          <div className="p-6 border-b border-graphite-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-brand/20 rounded-xl flex items-center justify-center">
                <MotorcycleIcon className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Make Information</h2>
                <p className="text-sm text-graphite-400">Basic details about the manufacturer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Make Name */}
              <div>
                <label htmlFor="makeName" className="block text-sm font-semibold text-white mb-2">
                  Make Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="makeName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Honda, Kawasaki, Yamaha"
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-white mb-2">
                  Country of Origin <span className="text-red-400">*</span>
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-graphite-900 border-2 border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand/20 rounded-xl flex items-center justify-center">
                  <MotorcycleIcon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Models</h2>
                  <p className="text-sm text-graphite-400">
                    {formData.models.length} {formData.models.length === 1 ? 'model' : 'models'} added
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addModel}
                className="flex items-center gap-2 px-4 py-2 bg-brand/20 text-brand font-medium rounded-xl hover:bg-brand/30 transition-all duration-200 border border-brand/30"
              >
                <Plus className="h-4 w-4" />
                Add Model
              </motion.button>
            </div>

            {/* Models List */}
            {formData.models.length === 0 ? (
              <div className="text-center py-12 bg-graphite-900/50 rounded-xl border-2 border-dashed border-graphite-700">
                <MotorcycleIcon className="h-12 w-12 text-graphite-600 mx-auto mb-3" />
                <p className="text-graphite-400 font-medium">No models added yet</p>
                <p className="text-sm text-graphite-500 mt-1">Click "Add Model" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.models.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-graphite-900 rounded-xl border border-graphite-700 p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-brand/20 rounded-lg flex items-center justify-center">
                          <MotorcycleIcon className="h-4 w-4 text-brand" />
                        </div>
                        <span className="text-white font-semibold">Model {index + 1}</span>
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
                        <label className="block text-sm font-semibold text-white mb-2">
                          Model Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={model.name}
                          onChange={(e) => updateModel(model.id, 'name', e.target.value)}
                          placeholder="e.g., CBR650R"
                          className="w-full px-4 py-2.5 bg-graphite-800 border-2 border-graphite-700 rounded-lg text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Category <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={model.category}
                          onChange={(e) => updateModel(model.id, 'category', e.target.value)}
                          className="w-full px-4 py-2.5 bg-graphite-800 border-2 border-graphite-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                          required
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

                    {/* Year Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Applicable Years <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableYears.map((year) => (
                          <motion.button
                            key={year}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleYear(model.id, year)}
                            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                              model.years.includes(year)
                                ? 'bg-brand text-graphite-900 border-2 border-brand'
                                : 'bg-graphite-800 text-graphite-400 border-2 border-graphite-700 hover:border-graphite-600'
                            }`}
                          >
                            {year}
                          </motion.button>
                        ))}
                      </div>
                      {model.years.length > 0 && (
                        <p className="text-sm text-brand mt-2">
                          Selected: {model.years.sort((a, b) => b - a).join(', ')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
                    Adding...
                  </>
                ) : (
                  <>
                    <MotorcycleIcon className="h-5 w-5" />
                    Add Make
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
