'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  Loader2,
  Package,
  Settings,
  Truck,
  TrendingUp,
  FileText,
  Check,
  AlertCircle,
  Barcode,
  MapPin,
  DollarSign,
  Calendar,
  Shield,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useFormAutoSave } from '@/lib/hooks/useFormAutoSave'

/**
 * Edit Part Modal - Multi-step form with 5 tabs
 *
 * Features:
 * - Responsive: Bottom sheet on mobile, modal on desktop
 * - 5 tabs: Overview, Vehicle Fitment, Vendor Info, Lifecycle, Technical
 * - Auto-save with debouncing (1 second)
 * - Inline validation with 500ms debounce
 * - Keyboard shortcuts: Cmd/Ctrl+Enter to save, Esc to cancel
 * - Progress indicator
 */

// Tab definitions
const TABS = [
  { id: 'overview' as const, label: 'Overview', icon: Package },
  { id: 'fitment' as const, label: 'Vehicle Fitment', icon: Settings },
  { id: 'vendor' as const, label: 'Vendor Info', icon: Truck },
  { id: 'lifecycle' as const, label: 'Lifecycle', icon: TrendingUp },
  { id: 'technical' as const, label: 'Technical', icon: FileText },
] as const

type TabId = typeof TABS[number]['id']

// Part interface matching the detail page
interface Part {
  id: string
  partNumber: string
  partName: string
  category: string
  make?: string | null
  model?: string | null
  usedFor: string
  description?: string | null
  onHandStock: number
  warehouseStock: number
  lowStockThreshold: number
  purchasePrice: number
  sellingPrice: number
  margin: number
  wholesalePrice?: number | null
  coreCharge?: number | null
  priceLastUpdated?: string | null
  sku?: string | null
  oemPartNumber?: string | null
  compatibleVehicles?: string[] | null
  weight?: number | null
  dimensions?: {
    length?: number | null
    width?: number | null
    height?: number | null
  } | null
  quantityPerPackage?: number | null
  isHazardous?: boolean | null
  location?: string | null
  supplier?: string | null
  supplierPhone?: string | null
  supplierEmail?: string | null
  supplierWebsite?: string | null
  vendorSku?: string | null
  leadTimeDays?: number | null
  minimumOrderQuantity?: number | null
  secondarySuppliers?: Array<{
    name: string
    phone?: string | null
    email?: string | null
    website?: string | null
    vendorSku?: string | null
    leadTimeDays?: number | null
    minimumOrderQuantity?: number | null
  }> | null
  lastRestocked?: string | null
  dateAdded?: string | null
  lastSoldDate?: string | null
  lastPurchaseDate?: string | null
  batchNumber?: string | null
  expirationDate?: string | null
  warrantyMonths?: number | null
  countryOfOrigin?: string | null
  technicalDiagramUrl?: string | null
  installationInstructionsUrl?: string | null
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

interface EditPartModalProps {
  isOpen: boolean
  onClose: () => void
  part: Part
  onSave: (updatedPart: Partial<Part>) => Promise<void>
  motorcycles?: Array<{ id: string; make: string; model: string; yearRange: string }>
}

interface FormErrors {
  [key: string]: string
}

export function EditPartModal({
  isOpen,
  onClose,
  part,
  onSave,
  motorcycles = [],
}: EditPartModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [formData, setFormData] = useState<Partial<Part>>(part)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Update form data when part changes
  useEffect(() => {
    setFormData(part)
  }, [part])

  // Auto-save hook
  const { clearSavedData, loadSavedData } = useFormAutoSave({
    formData: formData as Record<string, any>,
    storageKey: `edit-part-${part.id}`,
    isSubmitting,
    debounceMs: 1000,
    onSave: () => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
  })

  // Load saved data on mount
  useEffect(() => {
    if (isOpen) {
      const saved = loadSavedData()
      if (saved) {
        setFormData(saved)
      }
    }
  }, [isOpen, loadSavedData])

  // Validation function
  const validateField = useCallback((name: string, value: any): string | null => {
    switch (name) {
      case 'partName':
        return !value || value.trim().length === 0 ? 'Part name is required' : null
      case 'partNumber':
        return !value || value.trim().length === 0 ? 'Part number is required' : null
      case 'category':
        return !value || value.trim().length === 0 ? 'Category is required' : null
      case 'purchasePrice':
        return isNaN(value) || value < 0 ? 'Must be a valid number' : null
      case 'sellingPrice':
        return isNaN(value) || value < 0 ? 'Must be a valid number' : null
      case 'onHandStock':
        return isNaN(value) || value < 0 ? 'Must be a valid number' : null
      case 'warehouseStock':
        return isNaN(value) || value < 0 ? 'Must be a valid number' : null
      default:
        return null
    }
  }, [])

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors: FormErrors = {}

      Object.entries(formData).forEach(([key, value]) => {
        const error = validateField(key, value)
        if (error) {
          newErrors[key] = error
        }
      })

      setErrors(newErrors)
    }, 500)

    return () => clearTimeout(timer)
  }, [formData, validateField])

  // Handle field change
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle save
  const handleSave = async () => {
    // Validate all fields
    const validationErrors: FormErrors = {}
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value)
      if (error) {
        validationErrors[key] = error
      }
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSaveStatus('saving')

    try {
      await onSave(formData)
      clearSavedData()
      setSaveStatus('saved')
      setTimeout(() => onClose(), 500)
    } catch (error) {
      console.error('Error saving part:', error)
      setSaveStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, formData, onClose])

  // Calculate progress
  const currentTabIndex = TABS.findIndex((tab) => tab.id === activeTab)
  const progress = ((currentTabIndex + 1) / TABS.length) * 100

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Modal/Bottom Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: '100%' }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'bg-white w-full sm:rounded-2xl rounded-t-3xl',
            'shadow-2xl border border-gray-200',
            'max-h-[90vh] sm:max-h-[85vh] sm:max-w-4xl',
            'flex flex-col'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-xl font-display font-semibold text-gray-900">Edit Part</h2>
              <p className="text-sm text-gray-600 mt-0.5">{part.partNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                Step {currentTabIndex + 1} of {TABS.length}
              </span>
              <span className="text-xs text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto flex-shrink-0">
            <nav className="flex min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-brand text-brand bg-brand/5'
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

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab formData={formData} onChange={handleChange} errors={errors} />
                )}
                {activeTab === 'fitment' && (
                  <FitmentTab
                    formData={formData}
                    onChange={handleChange}
                    motorcycles={motorcycles}
                  />
                )}
                {activeTab === 'vendor' && (
                  <VendorTab formData={formData} onChange={handleChange} errors={errors} />
                )}
                {activeTab === 'lifecycle' && (
                  <LifecycleTab formData={formData} onChange={handleChange} errors={errors} />
                )}
                {activeTab === 'technical' && (
                  <TechnicalTab formData={formData} onChange={handleChange} errors={errors} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-sm text-teal-600">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Error saving
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl',
                  'bg-brand text-graphite-900 font-semibold',
                  'hover:bg-brand-hover transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'shadow-glow'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Overview Tab Component
 */
function OverviewTab({
  formData,
  onChange,
  errors,
}: {
  formData: Partial<Part>
  onChange: (name: string, value: any) => void
  errors: FormErrors
}) {
  return (
    <div className="space-y-6">
      {/* Part Identification */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Barcode className="h-5 w-5" />
          Part Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Part Name *"
            value={formData.partName || ''}
            onChange={(v) => onChange('partName', v)}
            error={errors.partName}
            required
          />
          <FormField
            label="Part Number *"
            value={formData.partNumber || ''}
            onChange={(v) => onChange('partNumber', v)}
            error={errors.partNumber}
            required
            mono
          />
          <FormField
            label="Category *"
            value={formData.category || ''}
            onChange={(v) => onChange('category', v)}
            error={errors.category}
            required
          />
          <FormField
            label="SKU"
            value={formData.sku || ''}
            onChange={(v) => onChange('sku', v)}
            mono
          />
          <FormField
            label="OEM Part Number"
            value={formData.oemPartNumber || ''}
            onChange={(v) => onChange('oemPartNumber', v)}
            mono
          />
          <FormField
            label="Brand/Manufacturer"
            value={formData.make || ''}
            onChange={(v) => onChange('make', v)}
          />
          <FormField
            label="Model/Variant"
            value={formData.model || ''}
            onChange={(v) => onChange('model', v)}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
            placeholder="Enter part description..."
          />
        </div>
      </div>

      {/* Stock Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="On-Hand Stock *"
            type="number"
            value={formData.onHandStock || 0}
            onChange={(v) => onChange('onHandStock', parseFloat(v))}
            error={errors.onHandStock}
            required
          />
          <FormField
            label="Warehouse Stock *"
            type="number"
            value={formData.warehouseStock || 0}
            onChange={(v) => onChange('warehouseStock', parseFloat(v))}
            error={errors.warehouseStock}
            required
          />
          <FormField
            label="Low Stock Threshold"
            type="number"
            value={formData.lowStockThreshold || 0}
            onChange={(v) => onChange('lowStockThreshold', parseFloat(v))}
          />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Purchase Price *"
            type="number"
            step="0.01"
            prefix="₹"
            value={formData.purchasePrice || 0}
            onChange={(v) => onChange('purchasePrice', parseFloat(v))}
            error={errors.purchasePrice}
            required
            mono
          />
          <FormField
            label="Selling Price *"
            type="number"
            step="0.01"
            prefix="₹"
            value={formData.sellingPrice || 0}
            onChange={(v) => onChange('sellingPrice', parseFloat(v))}
            error={errors.sellingPrice}
            required
            mono
          />
          <FormField
            label="Wholesale Price"
            type="number"
            step="0.01"
            prefix="₹"
            value={formData.wholesalePrice || ''}
            onChange={(v) => onChange('wholesalePrice', v ? parseFloat(v) : null)}
            mono
          />
          <FormField
            label="Core Charge"
            type="number"
            step="0.01"
            prefix="₹"
            value={formData.coreCharge || ''}
            onChange={(v) => onChange('coreCharge', v ? parseFloat(v) : null)}
            mono
          />
        </div>
      </div>

      {/* Physical Attributes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={formData.weight || ''}
            onChange={(v) => onChange('weight', v ? parseFloat(v) : null)}
          />
          <FormField
            label="Storage Location"
            value={formData.location || ''}
            onChange={(v) => onChange('location', v)}
          />
          <FormField
            label="Length (cm)"
            type="number"
            step="0.1"
            value={formData.dimensions?.length || ''}
            onChange={(v) =>
              onChange('dimensions', { ...formData.dimensions, length: v ? parseFloat(v) : null })
            }
          />
          <FormField
            label="Width (cm)"
            type="number"
            step="0.1"
            value={formData.dimensions?.width || ''}
            onChange={(v) =>
              onChange('dimensions', { ...formData.dimensions, width: v ? parseFloat(v) : null })
            }
          />
          <FormField
            label="Height (cm)"
            type="number"
            step="0.1"
            value={formData.dimensions?.height || ''}
            onChange={(v) =>
              onChange('dimensions', { ...formData.dimensions, height: v ? parseFloat(v) : null })
            }
          />
          <FormField
            label="Quantity per Package"
            type="number"
            value={formData.quantityPerPackage || ''}
            onChange={(v) => onChange('quantityPerPackage', v ? parseInt(v) : null)}
          />
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isHazardous || false}
              onChange={(e) => onChange('isHazardous', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <span className="text-sm font-medium text-gray-700">Hazardous Material</span>
          </label>
        </div>
      </div>
    </div>
  )
}

/**
 * Vehicle Fitment Tab Component
 */
function FitmentTab({
  formData,
  onChange,
  motorcycles,
}: {
  formData: Partial<Part>
  onChange: (name: string, value: any) => void
  motorcycles: Array<{ id: string; make: string; model: string; yearRange: string }>
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMotorcycles = motorcycles.filter(
    (m) =>
      m.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isMotorcycleSelected = (id: string) =>
    formData.compatibleVehicles?.includes(id) || false

  const toggleMotorcycle = (id: string) => {
    const current = formData.compatibleVehicles || []
    const updated = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id]
    onChange('compatibleVehicles', updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Compatible Motorcycles</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all motorcycles this part is compatible with ({formData.compatibleVehicles?.length || 0} selected)
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by make or model..."
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      {/* Motorcycle List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-200">
        {filteredMotorcycles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No motorcycles found matching "{searchTerm}"
          </div>
        ) : (
          filteredMotorcycles.map((motorcycle) => (
            <label
              key={motorcycle.id}
              className={cn(
                'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                'hover:bg-gray-50'
              )}
            >
              <input
                type="checkbox"
                checked={isMotorcycleSelected(motorcycle.id)}
                onChange={() => toggleMotorcycle(motorcycle.id)}
                className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {motorcycle.make} {motorcycle.model}
                </p>
                <p className="text-sm text-gray-600">{motorcycle.yearRange}</p>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Vendor Info Tab Component
 */
function VendorTab({
  formData,
  onChange,
  errors,
}: {
  formData: Partial<Part>
  onChange: (name: string, value: any) => void
  errors: FormErrors
}) {
  return (
    <div className="space-y-6">
      {/* Primary Supplier */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Primary Supplier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Supplier Name"
            value={formData.supplier || ''}
            onChange={(v) => onChange('supplier', v)}
          />
          <FormField
            label="Phone"
            type="tel"
            value={formData.supplierPhone || ''}
            onChange={(v) => onChange('supplierPhone', v)}
            mono
          />
          <FormField
            label="Email"
            type="email"
            value={formData.supplierEmail || ''}
            onChange={(v) => onChange('supplierEmail', v)}
          />
          <FormField
            label="Website"
            type="url"
            value={formData.supplierWebsite || ''}
            onChange={(v) => onChange('supplierWebsite', v)}
          />
          <FormField
            label="Vendor SKU"
            value={formData.vendorSku || ''}
            onChange={(v) => onChange('vendorSku', v)}
            mono
          />
          <FormField
            label="Lead Time (days)"
            type="number"
            value={formData.leadTimeDays || ''}
            onChange={(v) => onChange('leadTimeDays', v ? parseInt(v) : null)}
          />
          <FormField
            label="Minimum Order Quantity"
            type="number"
            value={formData.minimumOrderQuantity || ''}
            onChange={(v) => onChange('minimumOrderQuantity', v ? parseInt(v) : null)}
          />
        </div>
      </div>

      {/* Backup Suppliers */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Backup suppliers can be managed separately.
        </p>
      </div>
    </div>
  )
}

/**
 * Lifecycle Tab Component
 */
function LifecycleTab({
  formData,
  onChange,
  errors,
}: {
  formData: Partial<Part>
  onChange: (name: string, value: any) => void
  errors: FormErrors
}) {
  return (
    <div className="space-y-6">
      {/* Important Dates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Important Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Batch/Lot Number"
            value={formData.batchNumber || ''}
            onChange={(v) => onChange('batchNumber', v)}
            mono
          />
          <FormField
            label="Expiration Date"
            type="date"
            value={formData.expirationDate || ''}
            onChange={(v) => onChange('expirationDate', v)}
          />
        </div>
      </div>

      {/* Tracking Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Last Restocked</p>
            <p className="font-mono text-gray-900 mt-1">
              {formData.lastRestocked
                ? new Date(formData.lastRestocked).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Last Sold</p>
            <p className="font-mono text-gray-900 mt-1">
              {formData.lastSoldDate
                ? new Date(formData.lastSoldDate).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Last Purchase</p>
            <p className="font-mono text-gray-900 mt-1">
              {formData.lastPurchaseDate
                ? new Date(formData.lastPurchaseDate).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Date Added</p>
            <p className="font-mono text-gray-900 mt-1">
              {formData.dateAdded ? new Date(formData.dateAdded).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Technical Tab Component
 */
function TechnicalTab({
  formData,
  onChange,
  errors,
}: {
  formData: Partial<Part>
  onChange: (name: string, value: any) => void
  errors: FormErrors
}) {
  return (
    <div className="space-y-6">
      {/* Quality & Compliance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Quality & Compliance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Warranty Period (months)"
            type="number"
            value={formData.warrantyMonths || ''}
            onChange={(v) => onChange('warrantyMonths', v ? parseInt(v) : null)}
          />
          <FormField
            label="Country of Origin"
            value={formData.countryOfOrigin || ''}
            onChange={(v) => onChange('countryOfOrigin', v)}
          />
        </div>
      </div>

      {/* Digital Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Technical Diagram URL"
            type="url"
            value={formData.technicalDiagramUrl || ''}
            onChange={(v) => onChange('technicalDiagramUrl', v)}
          />
          <FormField
            label="Installation Instructions URL"
            type="url"
            value={formData.installationInstructionsUrl || ''}
            onChange={(v) => onChange('installationInstructionsUrl', v)}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Form Field Component
 */
function FormField({
  label,
  value,
  onChange,
  type = 'text',
  error,
  required,
  mono,
  prefix,
  step,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  error?: string
  required?: boolean
  mono?: boolean
  prefix?: string
  step?: string
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-mono">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-xl text-base transition-all',
            'placeholder:text-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent',
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
            mono && 'font-mono',
            prefix && 'pl-10'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
