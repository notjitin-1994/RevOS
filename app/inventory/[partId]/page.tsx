'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Package,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
  Barcode,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { DetailViewSkeleton } from '@/components/ui/skeleton/detail-view-skeleton'
import { ActionsDropdown } from '@/components/inventory/actions-dropdown'
import { EditPartModal } from '@/components/inventory/edit-part-modal'
import { OrderLogSheet, OrderLogData } from '@/components/inventory/order-log-sheet'
import { VehicleFitmentDisplay, CompatibleVehicle } from '@/components/inventory/vehicle-fitment-display'

/**
 * Part Detail Page
 *
 * Comprehensive view of a single part in inventory with enhanced
 * tracking following ACES/PIES automotive industry standards.
 */

// Enhanced Part interface with all required fields
interface Part {
  id: string
  partNumber: string
  partName: string
  category: string
  make?: string | null
  model?: string | null
  usedFor: string
  description?: string | null

  // Stock Information
  onHandStock: number
  warehouseStock: number
  lowStockThreshold: number

  // Pricing
  purchasePrice: number
  sellingPrice: number
  margin: number
  wholesalePrice?: number | null
  coreCharge?: number | null
  priceLastUpdated?: string | null

  // Identification
  sku?: string | null
  oemPartNumber?: string | null

  // Vehicle Fitment - Array of motorcycle catalog IDs
  compatibleVehicles?: string[] | null

  // Physical Attributes
  weight?: number | null // kg
  dimensions?: Dimensions | null
  quantityPerPackage?: number | null
  isHazardous?: boolean | null

  // Vendor Information
  location?: string | null
  supplier?: string | null
  supplierPhone?: string | null
  supplierEmail?: string | null
  supplierWebsite?: string | null
  vendorSku?: string | null
  leadTimeDays?: number | null
  minimumOrderQuantity?: number | null
  secondarySuppliers?: SecondarySupplier[] | null

  // Lifecycle & Tracking
  lastRestocked?: string | null
  dateAdded?: string | null
  lastSoldDate?: string | null
  lastPurchaseDate?: string | null
  batchNumber?: string | null
  expirationDate?: string | null

  // Quality & Compliance
  warrantyMonths?: number | null
  countryOfOrigin?: string | null

  // Digital Assets
  technicalDiagramUrl?: string | null
  installationInstructionsUrl?: string | null

  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

interface ModelData {
  id: string
  name: string
  category: string
  years: number[]
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
}

interface Dimensions {
  length?: number | null // cm
  width?: number | null // cm
  height?: number | null // cm
}

interface SecondarySupplier {
  name: string
  phone?: string | null
  email?: string | null
  website?: string | null
  vendorSku?: string | null
  leadTimeDays?: number | null
  minimumOrderQuantity?: number | null
}

export default function PartDetailPage() {
  const router = useRouter()
  const params = useParams()
  const partId = params.partId as string

  const [part, setPart] = useState<Part | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isOrderLogOpen, setIsOrderLogOpen] = useState(false)
  const [communicationType, setCommunicationType] = useState<'phone' | 'email'>('phone')
  const [activeTab, setActiveTab] = useState<'overview' | 'fitment' | 'vendor' | 'lifecycle' | 'technical'>('overview')
  const [activeBackupSupplier, setActiveBackupSupplier] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Motorcycle catalog data
  const [motorcycles, setMotorcycles] = useState<FlatMotorcycleData[]>([])
  const [isMotorcyclesLoading, setIsMotorcyclesLoading] = useState(true)

  useEffect(() => {
    loadPart()
    loadMotorcycles()
  }, [partId])

  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => setCopiedField(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedField])

  const loadPart = async () => {
    try {
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      // Fetch part from API
      const response = await fetch(`/api/inventory/part/${partId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch part: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch part')
      }

      // API now returns data in the correct format, just use it directly
      setPart(result.part as Part)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading part:', err)
      setError(message)
      setIsLoading(false)
    }
  }

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
            })
          })
        })
        setMotorcycles(flatList)
      }
    } catch (err) {
      console.error('Error loading motorcycle catalog:', err)
    } finally {
      setIsMotorcyclesLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleCallVendor = () => {
    if (!part?.supplierPhone) {
      alert('No phone number available for this vendor')
      return
    }

    // Open phone call
    window.open(`tel:${part.supplierPhone}`, '_blank')

    // Show order log sheet after a short delay
    setCommunicationType('phone')
    setTimeout(() => {
      setIsOrderLogOpen(true)
    }, 500)
  }

  const handleEmailVendor = () => {
    if (!part?.supplierEmail) {
      alert('No email address available for this vendor')
      return
    }

    // Open email client
    const subject = encodeURIComponent(`Inquiry about ${part.partName} (${part.partNumber})`)
    const body = encodeURIComponent(`Hi ${part.supplier},\n\nI'm writing to inquire about...`)
    window.open(`mailto:${part.supplierEmail}?subject=${subject}&body=${body}`, '_blank')

    // Show order log sheet after a short delay
    setCommunicationType('email')
    setTimeout(() => {
      setIsOrderLogOpen(true)
    }, 500)
  }

  const handleLogOrder = () => {
    setIsOrderLogOpen(true)
  }

  const handleSavePart = async (updatedPart: Partial<Part>) => {
    try {
      const response = await fetch(`/api/inventory/part/${partId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPart),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update part')
      }

      // Update local state with new part data
      setPart(result.part as Part)

      // Show success message
      alert('Part updated successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error updating part:', err)
      alert(`Failed to update part: ${message}`)
      throw err
    }
  }

  const handleLogCommunication = async (data: OrderLogData) => {
    try {
      const response = await fetch('/api/inventory/log-communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to log communication')
      }

      console.log('Communication logged successfully:', result.communication)

      // If order was placed, refresh part data to update stock
      if (data.outcome === 'order-placed') {
        await loadPart()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error logging communication:', err)
      alert(`Failed to log communication: ${message}`)
      throw err
    }
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (part) {
      try {
        // TODO: Call API to delete part
        // const response = await fetch('/api/inventory/delete', {
        //   method: 'DELETE',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ partId: part.id }),
        // })

        console.log('Part deleted successfully:', part.id)
        router.push('/inventory')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        console.error('Error deleting part:', error)
        alert(`Failed to delete part: ${message}`)
      }
    }
  }

  const getStatusColor = (status: Part['status']) => {
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const CopyableField = ({ label, value, fieldId }: { label: string; value: string; fieldId: string }) => (
    <div className="group relative">
      <dt className="text-sm text-gray-600 mb-1">{label}</dt>
      <div className="flex items-center gap-2">
        <dd className="text-base font-mono text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg flex-1">
          {value}
        </dd>
        <button
          onClick={() => copyToClipboard(value, fieldId)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copiedField === fieldId ? (
            <CheckCircle className="h-4 w-4 text-status-success" />
          ) : (
            <Copy className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Package },
    { id: 'fitment' as const, label: 'Vehicle Fitment', icon: Settings },
    { id: 'vendor' as const, label: 'Vendor Info', icon: Truck },
    { id: 'lifecycle' as const, label: 'Lifecycle', icon: TrendingUp },
    { id: 'technical' as const, label: 'Technical', icon: FileText },
  ]

  if (isLoading) {
    return (
      <DetailViewSkeleton tabCount={5} hasSidebar={true} />
    )
  }

  if (error || !part) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-card"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Part</h2>
          <p className="text-sm text-gray-600 text-center">{error || 'Part not found'}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header Section */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Part Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    {part.partName}
                  </h1>
                  {part.isHazardous && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Hazardous
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-600 font-mono mb-2">
                  {part.partNumber}
                </p>
                {part.description && (
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{part.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {part.category && (
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-graphite-700/10 rounded-full transform scale-110"></div>
                      <span className="relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-graphite-50/80 text-graphite-700 border border-graphite-200/50 backdrop-blur-sm">
                        {part.category}
                      </span>
                    </div>
                  )}
                  {part.make && (
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-graphite-700/10 rounded-full transform scale-110"></div>
                      <span className="relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-graphite-50/80 text-graphite-700 border border-graphite-200/50 backdrop-blur-sm">
                        {part.make}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

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

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Identification Section */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Barcode className="h-5 w-5" />
                        Part Identification
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CopyableField label="Part Number" value={part.partNumber} fieldId="partNumber" />
                        {part.sku && <CopyableField label="SKU" value={part.sku} fieldId="sku" />}
                        {part.oemPartNumber && <CopyableField label="OEM Part Number" value={part.oemPartNumber} fieldId="oemPartNumber" />}

                        {part.make && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Brand / Manufacturer</dt>
                            <dd className="text-base font-semibold text-gray-900">{part.make}</dd>
                          </div>
                        )}
                        {part.model && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Model / Variant</dt>
                            <dd className="text-base font-medium text-gray-900">{part.model}</dd>
                          </div>
                        )}
                        {part.location && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Storage Location
                            </dt>
                            <dd className="text-base font-mono font-medium text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                              {part.location}
                            </dd>
                          </div>
                        )}

                        {part.vendorSku && <CopyableField label="Vendor SKU" value={part.vendorSku} fieldId="vendorSku" />}
                        {part.batchNumber && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Batch / Lot Number</dt>
                            <dd className="text-base font-mono text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                              {part.batchNumber}
                            </dd>
                          </div>
                        )}
                        {part.countryOfOrigin && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Country of Origin</dt>
                            <dd className="text-base font-medium text-gray-900">{part.countryOfOrigin}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Stock Information
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">On-Hand Stock</dt>
                          <dd className="text-3xl font-bold text-gray-900">{part.onHandStock}</dd>
                          <dt className="text-xs text-gray-500 mt-1">Available in workshop</dt>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">Warehouse Stock</dt>
                          <dd className="text-3xl font-bold text-gray-900">{part.warehouseStock}</dd>
                          <dt className="text-xs text-gray-500 mt-1">In deep storage</dt>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">Low Stock Alert</dt>
                          <dd className={cn(
                            "text-3xl font-bold",
                            part.onHandStock + part.warehouseStock <= part.lowStockThreshold
                              ? "text-status-warning"
                              : "text-status-success"
                          )}>
                            {part.lowStockThreshold}
                          </dd>
                          <dt className="text-xs text-gray-500 mt-1">Alert threshold</dt>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pricing Information
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">Purchase Price</dt>
                          <dd className="text-2xl font-bold text-gray-900">₹{part.purchasePrice.toFixed(2)}</dd>
                          <dt className="text-xs text-gray-500 mt-1">Cost per unit</dt>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">Selling Price</dt>
                          <dd className="text-2xl font-bold text-gray-700">₹{part.sellingPrice.toFixed(2)}</dd>
                          <dt className="text-xs text-gray-500 mt-1">Retail per unit</dt>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">Profit Margin</dt>
                          <dd className={cn(
                            "text-2xl font-bold",
                            part.margin >= 30 ? "text-status-success" : part.margin >= 20 ? "text-status-warning" : "text-status-error"
                          )}>
                            {part.margin.toFixed(1)}%
                          </dd>
                          <dt className="text-xs text-gray-500 mt-1">
                            ₹{(part.sellingPrice - part.purchasePrice).toFixed(2)} profit
                          </dt>
                        </div>
                        {part.wholesalePrice && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Wholesale Price</dt>
                            <dd className="text-xl font-bold text-gray-900">₹{part.wholesalePrice.toFixed(2)}</dd>
                          </div>
                        )}
                        {part.coreCharge && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Core Charge</dt>
                            <dd className="text-xl font-bold text-gray-900">₹{part.coreCharge.toFixed(2)}</dd>
                          </div>
                        )}
                        {part.priceLastUpdated && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Price Updated</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.priceLastUpdated)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                </>
              )}

              {activeTab === 'fitment' && (
                isMotorcyclesLoading ? (
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Loading vehicle catalog...</span>
                    </div>
                  </div>
                ) : (
                  <VehicleFitmentDisplay
                    vehicles={(() => {
                      // Transform motorcycle data to CompatibleVehicle format
                      const compatibleVehiclesData = part?.compatibleVehicles
                        ?.map((motorcycleId) => {
                          const moto = motorcycles.find((m) => m.id === motorcycleId)
                          return moto
                            ? {
                                id: moto.id,
                                make: moto.make,
                                model: moto.model,
                                years: moto.years || [],
                                category: moto.category,
                              }
                            : null
                        })
                        .filter(Boolean) as CompatibleVehicle[]
                      return compatibleVehiclesData
                    })()}
                    maxVisible={4}
                  />
                )
              )}

              {activeTab === 'vendor' && (
                <div className="space-y-6">
                  {/* Primary Supplier */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Primary Supplier
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm text-gray-600 mb-1">Supplier Name</dt>
                          <dd className="text-lg font-semibold text-gray-900">{part.supplier}</dd>
                        </div>
                        {part.supplierPhone && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Phone</dt>
                            <dd className="text-base font-medium text-gray-900">{part.supplierPhone}</dd>
                          </div>
                        )}
                        {part.supplierEmail && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Email</dt>
                            <dd className="text-base text-graphite-700">{part.supplierEmail}</dd>
                          </div>
                        )}
                        {part.supplierWebsite && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Website</dt>
                            <a
                              href={part.supplierWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-graphite-700 hover:underline flex items-center gap-1"
                            >
                              {part.supplierWebsite}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {part.vendorSku && <CopyableField label="Vendor SKU" value={part.vendorSku} fieldId="vendorSku" />}
                        {part.leadTimeDays && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <dt className="text-sm text-gray-600 mb-1">Lead Time</dt>
                              <dd className="text-base font-medium text-gray-900">{part.leadTimeDays} days</dd>
                            </div>
                            {part.minimumOrderQuantity && (
                              <div>
                                <dt className="text-sm text-gray-600 mb-1">Min Order Qty</dt>
                                <dd className="text-base font-medium text-gray-900">{part.minimumOrderQuantity}</dd>
                              </div>
                            )}
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Backup Suppliers */}
                  {part.secondarySuppliers && part.secondarySuppliers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Backup Suppliers</h3>
                          {part.secondarySuppliers.length > 1 && (
                            <div className="flex gap-1">
                              {part.secondarySuppliers.map((supplier, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveBackupSupplier(idx)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                    activeBackupSupplier === idx
                                      ? 'bg-graphite-700 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  )}
                                >
                                  {supplier.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <dl className="space-y-4">
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Supplier Name</dt>
                            <dd className="text-lg font-semibold text-gray-900">{part.secondarySuppliers[activeBackupSupplier].name}</dd>
                          </div>
                          {part.secondarySuppliers[activeBackupSupplier].phone && (
                            <div>
                              <dt className="text-sm text-gray-600 mb-1">Phone</dt>
                              <dd className="text-base font-medium text-gray-900">{part.secondarySuppliers[activeBackupSupplier].phone}</dd>
                            </div>
                          )}
                          {part.secondarySuppliers[activeBackupSupplier].email && (
                            <div>
                              <dt className="text-sm text-gray-600 mb-1">Email</dt>
                              <dd className="text-base text-graphite-700">{part.secondarySuppliers[activeBackupSupplier].email}</dd>
                            </div>
                          )}
                          {part.secondarySuppliers[activeBackupSupplier].website && (
                            <div>
                              <dt className="text-sm text-gray-600 mb-1">Website</dt>
                              <a
                                href={part.secondarySuppliers[activeBackupSupplier].website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base text-graphite-700 hover:underline flex items-center gap-1"
                              >
                                {part.secondarySuppliers[activeBackupSupplier].website}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {part.secondarySuppliers[activeBackupSupplier].vendorSku && (
                            <CopyableField
                              label="Vendor SKU"
                              value={part.secondarySuppliers[activeBackupSupplier].vendorSku!}
                              fieldId={`backup-${activeBackupSupplier}-vendorSku`}
                            />
                          )}
                          {part.secondarySuppliers[activeBackupSupplier].leadTimeDays && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm text-gray-600 mb-1">Lead Time</dt>
                                <dd className="text-base font-medium text-gray-900">{part.secondarySuppliers[activeBackupSupplier].leadTimeDays} days</dd>
                              </div>
                              {part.secondarySuppliers[activeBackupSupplier].minimumOrderQuantity && (
                                <div>
                                  <dt className="text-sm text-gray-600 mb-1">Min Order Qty</dt>
                                  <dd className="text-base font-medium text-gray-900">{part.secondarySuppliers[activeBackupSupplier].minimumOrderQuantity}</dd>
                                </div>
                              )}
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'lifecycle' && (
                <div className="space-y-6">
                  {/* Inventory Metrics */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Inventory Metrics
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {part.batchNumber && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Batch/Lot Number</dt>
                            <dd className="text-base font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                              {part.batchNumber}
                            </dd>
                          </div>
                        )}
                        {part.location && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Storage Location
                            </dt>
                            <dd className="text-base font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                              {part.location}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Important Dates
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {part.dateAdded && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Date Added</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.dateAdded)}</dd>
                          </div>
                        )}
                        {part.lastRestocked && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Last Restocked</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.lastRestocked)}</dd>
                          </div>
                        )}
                        {part.lastSoldDate && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Last Sold</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.lastSoldDate)}</dd>
                          </div>
                        )}
                        {part.lastPurchaseDate && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Last Purchase</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.lastPurchaseDate)}</dd>
                          </div>
                        )}
                        {part.expirationDate && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Expiration Date</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.expirationDate)}</dd>
                          </div>
                        )}
                        {part.priceLastUpdated && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Price Last Updated</dt>
                            <dd className="text-base font-medium text-gray-900">{formatDate(part.priceLastUpdated)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-6">
                  {/* Quality & Compliance */}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Quality & Compliance
                      </h3>
                    </div>
                    <div className="p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {part.warrantyMonths && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Warranty Period</dt>
                            <dd className="text-base font-medium text-gray-900">{part.warrantyMonths} months</dd>
                          </div>
                        )}
                        {part.countryOfOrigin && (
                          <div>
                            <dt className="text-sm text-gray-600 mb-1">Country of Origin</dt>
                            <dd className="text-base font-medium text-gray-900">{part.countryOfOrigin}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Digital Assets */}
                  {(part.technicalDiagramUrl || part.installationInstructionsUrl) && (
                    <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Digital Resources
                        </h3>
                      </div>
                      <div className="p-6">
                        <dl className="space-y-4">
                          {part.technicalDiagramUrl && (
                            <div>
                              <dt className="text-sm text-gray-600 mb-1">Technical Diagram</dt>
                              <a
                                href={part.technicalDiagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base text-graphite-700 hover:underline flex items-center gap-1"
                              >
                                View Diagram
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {part.installationInstructionsUrl && (
                            <div>
                              <dt className="text-sm text-gray-600 mb-1">Installation Instructions</dt>
                              <a
                                href={part.installationInstructionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base text-graphite-700 hover:underline flex items-center gap-1"
                              >
                                View Instructions
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden sticky top-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-4">
                  <ActionsDropdown
                    onCallVendor={handleCallVendor}
                    onEmailVendor={handleEmailVendor}
                    onEdit={handleEdit}
                    onLogOrder={handleLogOrder}
                    onDelete={handleDelete}
                    partName={part ? `${part.partName} (${part.partNumber})` : ''}
                    className="w-full"
                  />
                </div>

                {/* Direct Contact Actions */}
                {(part?.supplierPhone || part?.supplierEmail) && (
                  <div className="px-4 pb-4 space-y-2">
                    {part.supplierPhone && (
                      <a
                        href={`tel:${part.supplierPhone}`}
                        className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all group sm:hidden"
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Call Vendor</span>
                      </a>
                    )}
                    {part.supplierEmail && (
                      <a
                        href={`mailto:${part.supplierEmail}`}
                        className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all group hidden sm:flex"
                      >
                        <Mail className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Email Vendor</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        partName={part ? `${part.partName} (${part.partNumber})` : ''}
        onConfirm={confirmDelete}
      />

      {/* Edit Part Modal */}
      {part && (
        <EditPartModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          part={part}
          onSave={handleSavePart}
          motorcycles={motorcycles}
        />
      )}

      {/* Order Log Sheet */}
      {part && (
        <OrderLogSheet
          isOpen={isOrderLogOpen}
          onClose={() => setIsOrderLogOpen(false)}
          vendorName={part.supplier || 'Unknown'}
          communicationType={communicationType}
          partId={part.id}
          partName={`${part.partName} (${part.partNumber})`}
          onSubmit={handleLogCommunication}
        />
      )}
    </>
  )
}

/**
 * Delete Confirmation Modal Component
 */
interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  partName: string
  onConfirm: () => Promise<void>
}

function DeleteConfirmationModal({ isOpen, onClose, partName, onConfirm }: DeleteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200"
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Title and Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Part?</h2>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{partName}</span>? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-status-error text-white font-semibold rounded-xl hover:bg-status-error/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

