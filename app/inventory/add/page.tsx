'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Save,
  Loader2,
  AlertCircle,
  Barcode,
  DollarSign,
  Truck,
  Calendar,
  Settings,
  Shield,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useFormAutoSave } from '@/lib/hooks/useFormAutoSave'

/**
 * Add Part Page
 *
 * Comprehensive form to add a new part to inventory.
 * Collects all relevant data for motorcycle service garage in India.
 */

interface FormData {
  // Basic Information
  partNumber: string
  partName: string
  category: string
  make: string
  model: string
  usedFor: string
  description: string

  // Stock Information
  onHandStock: number
  warehouseStock: number
  lowStockThreshold: number

  // Pricing
  purchasePrice: number
  sellingPrice: number
  wholesalePrice: number
  coreCharge: number

  // Identification
  sku: string
  oemPartNumber: string

  // Vehicle Fitment
  compatibleVehicles: string[] // Array of vehicle IDs
  isUniversalFitment: boolean // Fits all motorcycles

  // Physical Attributes
  weight: string
  length: string
  width: string
  height: string
  quantityPerPackage: number
  isHazardous: boolean

  // Vendor Information
  location: string
  supplier: string
  supplierPhone: string
  supplierEmail: string
  supplierWebsite: string
  vendorSku: string
  leadTimeDays: number
  minimumOrderQuantity: number

  // Backup Suppliers
  backupSuppliers: BackupSupplier[]

  // Lifecycle & Tracking
  batchNumber: string
  expirationDate: string
  warrantyMonths: number
  countryOfOrigin: string

  // Digital Assets
  technicalDiagramUrl: string
  installationInstructionsUrl: string
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

interface FlatMotorcycleData {
  id: string
  make: string
  model: string
  category: string
  years: number[]
  yearRange: string
  engine_displacement_cc?: number
  production_status?: 'In Production' | 'Discontinued' | 'Limited'
}

interface BackupSupplier {
  name: string
  phone: string
  email: string
  website: string
  vendorSku: string
  leadTimeDays: number
  minimumOrderQuantity: number
}

interface FieldOption {
  value: string
  label: string
  usageCount: number
  lastUsed?: string
}

// Default options (fallback if API fails)
const defaultCategories = [
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

const defaultUsedForOptions = [
  'Engine',
  'Brakes',
  'Body',
  'Electrical',
  'Suspension',
  'Transmission',
  'Exhaust',
  'General',
]

const positions = ['Front', 'Rear', 'Left', 'Right', 'Top', 'Bottom', 'Upper', 'Lower', 'Internal', 'External']

type TabType = 'basic' | 'stock' | 'pricing' | 'fitment' | 'vendor' | 'lifecycle' | 'technical'

const tabs = [
  { id: 'basic' as TabType, label: 'Basic Info', icon: Package },
  { id: 'stock' as TabType, label: 'Stock', icon: Package },
  { id: 'pricing' as TabType, label: 'Pricing', icon: DollarSign },
  { id: 'fitment' as TabType, label: 'Fitment', icon: Settings },
  { id: 'vendor' as TabType, label: 'Vendor', icon: Truck },
  { id: 'lifecycle' as TabType, label: 'Lifecycle', icon: Calendar },
  { id: 'technical' as TabType, label: 'Technical', icon: FileText },
]

export default function AddPartPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [hasRestoredData, setHasRestoredData] = useState(false)

  // Smart-sorted dropdown options
  const [categoryOptions, setCategoryOptions] = useState<FieldOption[]>([])
  const [usedForOptions, setUsedForOptions] = useState<FieldOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  // Motorcycles from catalog
  const [motorcycles, setMotorcycles] = useState<FlatMotorcycleData[]>([])
  const [filteredMotorcycles, setFilteredMotorcycles] = useState<FlatMotorcycleData[]>([])
  const [motorcycleSearchQuery, setMotorcycleSearchQuery] = useState('')
  const [isMotorcyclesLoading, setIsMotorcyclesLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    // Basic Information
    partNumber: '',
    partName: '',
    category: 'Engine',
    make: '',
    model: '',
    usedFor: 'Engine',
    description: '',

    // Stock Information
    onHandStock: 0,
    warehouseStock: 0,
    lowStockThreshold: 5,

    // Pricing
    purchasePrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    coreCharge: 0,

    // Identification
    sku: '',
    oemPartNumber: '',

    // Vehicle Fitment
    compatibleVehicles: [],
    isUniversalFitment: false,

    // Physical Attributes
    weight: '',
    length: '',
    width: '',
    height: '',
    quantityPerPackage: 1,
    isHazardous: false,

    // Vendor Information
    location: '',
    supplier: '',
    supplierPhone: '',
    supplierEmail: '',
    supplierWebsite: '',
    vendorSku: '',
    leadTimeDays: 0,
    minimumOrderQuantity: 0,

    // Backup Suppliers
    backupSuppliers: [],

    // Lifecycle & Tracking
    batchNumber: '',
    expirationDate: '',
    warrantyMonths: 0,
    countryOfOrigin: '',

    // Digital Assets
    technicalDiagramUrl: '',
    installationInstructionsUrl: '',
  })

  // Auto-save hook for form persistence (must be after formData state)
  const { clearSavedData, loadSavedData, hasSavedData } = useFormAutoSave({
    formData: formData,
    storageKey: 'add-part-draft',
    isSubmitting: isLoading,
    debounceMs: 2000, // Save 2 seconds after last change
    shouldSave: (data) => {
      // Only save if there's meaningful data (at least part number or name)
      return !!(data.partNumber || data.partName || data.sku || data.oemPartNumber)
    },
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

  // Load motorcycles and restore draft on mount
  useEffect(() => {
    loadMotorcycles()
    loadFieldOptions()
    restoreDraft()
  }, [])

  /**
   * Restore saved draft from localStorage
   */
  const restoreDraft = () => {
    const savedData = loadSavedData()
    if (savedData && Object.keys(savedData).length > 0) {
      try {
        // Restore form data
        setFormData(savedData as FormData)
        setHasRestoredData(true)

        // Silent restoration - no visual indicator
        console.log('✓ Draft restored from', new Date().toLocaleTimeString())
      } catch (error) {
        console.warn('Failed to restore draft:', error)
      }
    }
  }

  /**
   * Handle cancel with optional draft cleanup
   */
  const handleCancel = (shouldClearDraft = true) => {
    if (shouldClearDraft) {
      clearSavedData()
      console.log('✓ Draft cleared on cancel')
    }
    router.push('/inventory')
  }

  // Filter motorcycles based on search query
  useEffect(() => {
    if (!motorcycleSearchQuery) {
      setFilteredMotorcycles(motorcycles)
      return
    }

    const filtered = motorcycles.filter(
      (motorcycle) =>
        motorcycle.make.toLowerCase().includes(motorcycleSearchQuery.toLowerCase()) ||
        motorcycle.model.toLowerCase().includes(motorcycleSearchQuery.toLowerCase()) ||
        motorcycle.category.toLowerCase().includes(motorcycleSearchQuery.toLowerCase()) ||
        motorcycle.yearRange.includes(motorcycleSearchQuery)
    )
    setFilteredMotorcycles(filtered)
  }, [motorcycleSearchQuery, motorcycles])

  const loadMotorcycles = async () => {
    try {
      const response = await fetch('/api/motorcycles/list')
      if (!response.ok) {
        throw new Error('Failed to fetch motorcycle catalog')
      }
      const result = await response.json()
      if (result.success && result.makes) {
        // Flatten the makes/models into a single array
        const flatList: FlatMotorcycleData[] = []
        result.makes.forEach((make: MakeData) => {
          make.models.forEach((model: ModelData) => {
            const yearMin = Math.min(...model.years)
            const yearMax = Math.max(...model.years)
            const yearRange = yearMin === yearMax ? `${yearMin}` : `${yearMin} - ${yearMax}`

            flatList.push({
              id: model.id,
              make: make.name,
              model: model.name,
              category: model.category,
              years: model.years,
              yearRange,
              engine_displacement_cc: model.engine_displacement_cc,
              production_status: model.production_status,
            })
          })
        })
        setMotorcycles(flatList)
        setFilteredMotorcycles(flatList)
      }
    } catch (err) {
      console.error('Error loading motorcycle catalog:', err)
    } finally {
      setIsMotorcyclesLoading(false)
    }
  }

  const loadFieldOptions = async () => {
    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        // Use default options if not authenticated
        setCategoryOptions(defaultCategories.map((value) => ({ value, label: value, usageCount: 0 })))
        setUsedForOptions(defaultUsedForOptions.map((value) => ({ value, label: value, usageCount: 0 })))
        setIsLoadingOptions(false)
        return
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        // Use default options if no garage ID
        setCategoryOptions(defaultCategories.map((value) => ({ value, label: value, usageCount: 0 })))
        setUsedForOptions(defaultUsedForOptions.map((value) => ({ value, label: value, usageCount: 0 })))
        setIsLoadingOptions(false)
        return
      }

      // Fetch category options
      const categoryResponse = await fetch(`/api/inventory/field-options?field=category&garageId=${garageId}`)
      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json()
        if (categoryResult.success) {
          setCategoryOptions(categoryResult.options)
        } else {
          // Fallback to default options
          setCategoryOptions(defaultCategories.map((value) => ({ value, label: value, usageCount: 0 })))
        }
      } else {
        setCategoryOptions(defaultCategories.map((value) => ({ value, label: value, usageCount: 0 })))
      }

      // Fetch usedFor options
      const usedForResponse = await fetch(`/api/inventory/field-options?field=usedFor&garageId=${garageId}`)
      if (usedForResponse.ok) {
        const usedForResult = await usedForResponse.json()
        if (usedForResult.success) {
          setUsedForOptions(usedForResult.options)
        } else {
          // Fallback to default options
          setUsedForOptions(defaultUsedForOptions.map((value) => ({ value, label: value, usageCount: 0 })))
        }
      } else {
        setUsedForOptions(defaultUsedForOptions.map((value) => ({ value, label: value, usageCount: 0 })))
      }
    } catch (err) {
      console.error('Error loading field options:', err)
      // Fallback to default options on error
      setCategoryOptions(defaultCategories.map((value) => ({ value, label: value, usageCount: 0 })))
      setUsedForOptions(defaultUsedForOptions.map((value) => ({ value, label: value, usageCount: 0 })))
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const handleAddMotorcycle = (motorcycleId: string) => {
    if (!formData.compatibleVehicles.includes(motorcycleId)) {
      setFormData((prev) => ({
        ...prev,
        compatibleVehicles: [...prev.compatibleVehicles, motorcycleId],
      }))
    }
  }

  const handleRemoveMotorcycle = (motorcycleId: string) => {
    setFormData((prev) => ({
      ...prev,
      compatibleVehicles: prev.compatibleVehicles.filter((id) => id !== motorcycleId),
    }))
  }

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddBackupSupplier = () => {
    setFormData((prev) => ({
      ...prev,
      backupSuppliers: [
        ...prev.backupSuppliers,
        {
          name: '',
          phone: '',
          email: '',
          website: '',
          vendorSku: '',
          leadTimeDays: 0,
          minimumOrderQuantity: 0,
        },
      ],
    }))
  }

  const handleRemoveBackupSupplier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      backupSuppliers: prev.backupSuppliers.filter((_, i) => i !== index),
    }))
  }

  const handleBackupSupplierChange = (index: number, field: keyof BackupSupplier, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      backupSuppliers: prev.backupSuppliers.map((supplier, i) =>
        i === index ? { ...supplier, [field]: value } : supplier
      ),
    }))
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

      // Call API to add part
      const response = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, garageId }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to add part')
        setIsLoading(false)
        return
      }

      console.log('Part added successfully:', result.part)

      // Clear saved draft after successful submission
      clearSavedData()
      console.log('✓ Draft cleared after successful submission')

      // Record usage for dropdown fields (fire and forget, don't wait)
      ;(async () => {
        try {
          await fetch('/api/inventory/field-options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              garageId,
              field: 'category',
              value: formData.category,
            }),
          })

          await fetch('/api/inventory/field-options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              garageId,
              field: 'usedFor',
              value: formData.usedFor,
            }),
          })

          if (formData.make) {
            await fetch('/api/inventory/field-options', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                garageId,
                field: 'make',
                value: formData.make,
              }),
            })
          }
        } catch (err) {
          // Silently fail - usage tracking is not critical
          console.error('Error recording usage:', err)
        }
      })()

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

  // Get the next tab in sequence
  const getNextTab = (currentTab: TabType): TabType | null => {
    const tabOrder: TabType[] = ['basic', 'stock', 'pricing', 'fitment', 'vendor', 'lifecycle', 'technical']
    const currentIndex = tabOrder.indexOf(currentTab)
    if (currentIndex === -1 || currentIndex === tabOrder.length - 1) {
      return null // No next tab
    }
    return tabOrder[currentIndex + 1]
  }

  // Handle button click - either go to next tab or submit
  const handleActionButton = async () => {
    const nextTab = getNextTab(activeTab)

    if (nextTab) {
      // Move to next tab
      setActiveTab(nextTab)
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Last tab - submit the form by triggering the form submit event
      const form = document.querySelector('form')
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }
  }

  // Get button text based on current tab
  const getActionButtonText = (): string => {
    const nextTab = getNextTab(activeTab)
    if (nextTab) {
      const tab = tabs.find((t) => t.id === nextTab)
      return tab?.label || 'Next'
    }
    return 'Add Part'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4">
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

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Form */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
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

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Barcode className="h-5 w-5 text-gray-700" />
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
                    disabled={isLoadingOptions}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingOptions ? (
                      <option>Loading...</option>
                    ) : (
                      categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                          {option.usageCount > 0 && ` (${option.usageCount})`}
                        </option>
                      ))
                    )}
                  </select>
                  {!isLoadingOptions && categoryOptions.some((opt) => opt.usageCount > 0) && (
                    <p className="text-xs text-gray-500 mt-1">Sorted by popularity</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Used For *
                  </label>
                  <select
                    required
                    value={formData.usedFor}
                    onChange={(e) => handleChange('usedFor', e.target.value)}
                    disabled={isLoadingOptions}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingOptions ? (
                      <option>Loading...</option>
                    ) : (
                      usedForOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                          {option.usageCount > 0 && ` (${option.usageCount})`}
                        </option>
                      ))
                    )}
                  </select>
                  {!isLoadingOptions && usedForOptions.some((opt) => opt.usageCount > 0) && (
                    <p className="text-xs text-gray-500 mt-1">Sorted by popularity</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Motul, Castrol, Bosch"
                    value={formData.make}
                    onChange={(e) => handleChange('make', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Part manufacturer brand</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Part Model / Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 300V, Power 1, Semi-Synthetic"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specific model or variant</p>
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
          )}

          {/* Stock Information Tab */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-700" />
                Stock Information
              </h3>
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
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-700" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Wholesale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={(e) => handleChange('wholesalePrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">For bulk orders (optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Core Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.coreCharge}
                    onChange={(e) => handleChange('coreCharge', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">For rebuildable parts (optional)</p>
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Profit Margin</span>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-2xl font-bold",
                      margin >= 30 ? "text-status-success" : margin >= 20 ? "text-status-warning" : "text-status-error"
                    )}>
                      {margin.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-600">
                      (₹{(formData.sellingPrice - formData.purchasePrice).toFixed(2)} profit)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Fitment Tab */}
          {activeTab === 'fitment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-700" />
                Motorcycle Fitment
              </h3>
              <p className="text-sm text-gray-500">
                Select motorcycles from your vehicle catalog that this part is compatible with. Part manufacturer brand is in Basic Info.
              </p>

              {/* Selected Motorcycles */}
              {formData.compatibleVehicles.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Selected Motorcycles ({formData.compatibleVehicles.length})
                  </h4>
                  <div className="space-y-2">
                    {formData.compatibleVehicles.map((motorcycleId) => {
                      const motorcycle = motorcycles.find((m) => m.id === motorcycleId)
                      if (!motorcycle) return null
                      return (
                        <div
                          key={motorcycle.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200">
                              <Package className="h-5 w-5 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {motorcycle.make} {motorcycle.model}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{motorcycle.yearRange}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                  {motorcycle.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMotorcycle(motorcycle.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove motorcycle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Motorcycle Search & Selection */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Add Compatible Motorcycles
                </h4>

                {/* Search Input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search by make, model, category, or year..."
                    value={motorcycleSearchQuery}
                    onChange={(e) => setMotorcycleSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Motorcycle List */}
                {isMotorcyclesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Loading motorcycle catalog...</span>
                  </div>
                ) : motorcycles.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500">No motorcycles in catalog</p>
                    <p className="text-xs text-gray-400 mt-1">Add motorcycles to your vehicle catalog first</p>
                  </div>
                ) : filteredMotorcycles.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500">No motorcycles match your search</p>
                    <button
                      onClick={() => setMotorcycleSearchQuery('')}
                      className="text-sm text-graphite-700 font-medium hover:underline mt-1"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {filteredMotorcycles
                      .filter((m) => !formData.compatibleVehicles.includes(m.id))
                      .slice(0, 20)
                      .map((motorcycle) => (
                        <div
                          key={motorcycle.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200">
                              <Package className="h-5 w-5 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {motorcycle.make} {motorcycle.model}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{motorcycle.yearRange}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                  {motorcycle.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddMotorcycle(motorcycle.id)}
                            className="px-3 py-1.5 bg-graphite-50 text-graphite-700 rounded-lg text-sm font-medium hover:bg-graphite-100 transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        </div>
                      ))}
                    {filteredMotorcycles.filter((m) => !formData.compatibleVehicles.includes(m.id)).length > 20 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        Showing 20 of {filteredMotorcycles.length - formData.compatibleVehicles.length} motorcycles. Search for more.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vendor Information Tab */}
          {activeTab === 'vendor' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-700" />
                Primary Supplier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., AutoParts Ltd"
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g., +91 98765 43210"
                    value={formData.supplierPhone}
                    onChange={(e) => handleChange('supplierPhone', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., orders@autopartsltd.com"
                    value={formData.supplierEmail}
                    onChange={(e) => handleChange('supplierEmail', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="e.g., https://autopartsltd.com"
                    value={formData.supplierWebsite}
                    onChange={(e) => handleChange('supplierWebsite', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vendor SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., APL-OIL-SYN-10W40"
                    value={formData.vendorSku}
                    onChange={(e) => handleChange('vendorSku', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Lead Time (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 3"
                    value={formData.leadTimeDays}
                    onChange={(e) => handleChange('leadTimeDays', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Min Order Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 12"
                    value={formData.minimumOrderQuantity}
                    onChange={(e) => handleChange('minimumOrderQuantity', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., A1-01"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Backup Suppliers */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Backup Suppliers</h3>
                  <button
                    type="button"
                    onClick={handleAddBackupSupplier}
                    className="flex items-center gap-2 px-4 py-2 bg-graphite-50 text-graphite-700 rounded-lg hover:bg-graphite-100 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Backup Supplier
                  </button>
                </div>

                {formData.backupSuppliers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500">No backup suppliers added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Backup Supplier" to add alternative suppliers</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.backupSuppliers.map((supplier, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveBackupSupplier(index)}
                          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove backup supplier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="Supplier name"
                              value={supplier.name}
                              onChange={(e) => handleBackupSupplierChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              placeholder="Phone"
                              value={supplier.phone}
                              onChange={(e) => handleBackupSupplierChange(index, 'phone', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="Email"
                              value={supplier.email}
                              onChange={(e) => handleBackupSupplierChange(index, 'email', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                              type="url"
                              placeholder="Website"
                              value={supplier.website}
                              onChange={(e) => handleBackupSupplierChange(index, 'website', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor SKU</label>
                            <input
                              type="text"
                              placeholder="Vendor SKU"
                              value={supplier.vendorSku}
                              onChange={(e) => handleBackupSupplierChange(index, 'vendorSku', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="Days"
                              value={supplier.leadTimeDays}
                              onChange={(e) => handleBackupSupplierChange(index, 'leadTimeDays', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Qty</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="Quantity"
                              value={supplier.minimumOrderQuantity}
                              onChange={(e) => handleBackupSupplierChange(index, 'minimumOrderQuantity', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lifecycle Tab */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700" />
                Lifecycle & Tracking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Batch/Lot Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BATCH-2024-01-001"
                    value={formData.batchNumber}
                    onChange={(e) => handleChange('batchNumber', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => handleChange('expirationDate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Warranty Period (months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 24"
                    value={formData.warrantyMonths}
                    onChange={(e) => handleChange('warrantyMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., India"
                    value={formData.countryOfOrigin}
                    onChange={(e) => handleChange('countryOfOrigin', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Technical Tab */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-700" />
                Identification & Digital Assets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SKU-OIL-10W40-SYN-1L"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    OEM Part Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., OEM-999-888-777"
                    value={formData.oemPartNumber}
                    onChange={(e) => handleChange('oemPartNumber', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Technical Diagram URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/docs/oil-specs.pdf"
                    value={formData.technicalDiagramUrl}
                    onChange={(e) => handleChange('technicalDiagramUrl', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Installation Instructions URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/docs/oil-install.pdf"
                    value={formData.installationInstructionsUrl}
                    onChange={(e) => handleChange('installationInstructionsUrl', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleCancel(true)}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleActionButton}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-graphite-700 text-white font-semibold rounded-xl hover:bg-graphite-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {getNextTab(activeTab) ? 'Loading...' : 'Adding...'}
                </>
              ) : (
                <>
                  {getActionButtonText()}
                  {getNextTab(activeTab) ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
