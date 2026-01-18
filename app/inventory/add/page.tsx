'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

/**
 * Add Part Page
 *
 * Form to add a new part to the inventory.
 * Includes all fields from the Parts & Inventory specifications.
 */

interface FormData {
  partNumber: string
  partName: string
  category: string
  make: string
  model: string
  usedFor: string
  onHandStock: number
  warehouseStock: number
  lowStockThreshold: number
  purchasePrice: number
  sellingPrice: number
  location: string
  supplier: string
  description: string
}

const categories = [
  'Engine',
  'Brakes',
  'Body',
  'Electrical',
  'Suspension',
  'Transmission',
  'Exhaust',
  'Tires & Wheels',
  'Filters',
  'Fluids',
  'Accessories',
  'Other',
]

const usedForOptions = [
  'Engine',
  'Brakes',
  'Body',
  'Electrical',
  'Suspension',
  'Transmission',
  'Exhaust',
  'General',
]

export default function AddPartPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    partNumber: '',
    partName: '',
    category: 'Engine',
    make: '',
    model: '',
    usedFor: 'Engine',
    onHandStock: 0,
    warehouseStock: 0,
    lowStockThreshold: 5,
    purchasePrice: 0,
    sellingPrice: 0,
    location: '',
    supplier: '',
    description: '',
  })

  // Calculate margin in real-time
  const margin = formData.purchasePrice > 0
    ? ((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice) * 100
    : 0

  // Determine stock status
  const stockStatus = formData.onHandStock === 0
    ? 'out-of-stock'
    : formData.onHandStock <= formData.lowStockThreshold
    ? 'low-stock'
    : 'in-stock'

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        setError('Invalid user session')
        setIsLoading(false)
        return
      }

      // Basic validation
      if (!formData.partNumber || !formData.partName || !formData.category) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      // Price validation
      if (formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
        setError('Prices must be greater than 0')
        setIsLoading(false)
        return
      }

      if (formData.sellingPrice <= formData.purchasePrice) {
        setError('Selling price must be greater than purchase price')
        setIsLoading(false)
        return
      }

      // TODO: Call API to add part
      // const response = await fetch('/api/inventory/add', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, garageId }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('Part added successfully:', formData)

      // Navigate back to inventory list
      router.push('/inventory')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error adding part:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'text-status-success bg-status-success/10 border-status-success/30'
      case 'low-stock':
        return 'text-status-warning bg-status-warning/10 border-status-warning/30'
      case 'out-of-stock':
        return 'text-status-error bg-status-error/10 border-status-error/30'
      default:
        return 'text-graphite-400'
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
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/inventory')}
            className="flex items-center justify-center h-10 w-10 bg-graphite-800 text-white rounded-xl hover:bg-graphite-700 transition-all duration-200 shadow-md border border-graphite-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Add New Part
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Add a new part to your inventory
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-700" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Part Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., OIL-001"
                  value={formData.partNumber}
                  onChange={(e) => handleChange('partNumber', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for this part</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Engine Oil 10W-40"
                  value={formData.partName}
                  onChange={(e) => handleChange('partName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Used For *
                </label>
                <select
                  required
                  value={formData.usedFor}
                  onChange={(e) => handleChange('usedFor', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer"
                >
                  {usedForOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Make
                </label>
                <input
                  type="text"
                  placeholder="e.g., Honda"
                  value={formData.make}
                  onChange={(e) => handleChange('make', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  placeholder="e.g., CBR650R"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of the part..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  On-Hand Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.onHandStock}
                  onChange={(e) => handleChange('onHandStock', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Available in workshop</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Warehouse Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.warehouseStock}
                  onChange={(e) => handleChange('warehouseStock', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">In deep storage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Low Stock Threshold *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when below this</p>
              </div>

              {/* Stock Status Preview */}
              <div className="md:col-span-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Stock Status Preview:</span>
                    <span
                      className={cn(
                        'ml-3 px-3 py-1 rounded-lg text-sm font-semibold border inline-block',
                        getStatusColor(stockStatus)
                      )}
                    >
                      {stockStatus === 'in-stock' ? 'In Stock' : stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{formData.onHandStock + formData.warehouseStock}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Cost per unit</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Retail price per unit</p>
              </div>

              {/* Margin Display */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="block text-sm font-medium text-gray-700 mb-1">Profit Margin</span>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-2xl font-bold",
                    margin >= 30 ? "text-status-success" : margin >= 20 ? "text-status-warning" : "text-status-error"
                  )}>
                    {margin.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-600">
                    (₹{(formData.sellingPrice - formData.purchasePrice).toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., A1-01"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Storage location</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Supplier
                </label>
                <input
                  type="text"
                  placeholder="e.g., AutoParts Ltd"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Primary supplier</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/inventory')}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Add Part
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
