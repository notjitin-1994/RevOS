'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
  Barcode,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

/**
 * Part Detail Page
 *
 * Detailed view of a single part in inventory.
 */

interface Part {
  id: string
  partNumber: string
  partName: string
  category: string
  make?: string | null
  model?: string | null
  usedFor: string
  onHandStock: number
  warehouseStock: number
  lowStockThreshold: number
  purchasePrice: number
  sellingPrice: number
  margin: number
  location?: string | null
  supplier?: string | null
  lastRestocked?: string | null
  description?: string | null
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

export default function PartDetailPage() {
  const router = useRouter()
  const params = useParams()
  const partId = params.partId as string

  const [part, setPart] = useState<Part | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    loadPart()
  }, [partId])

  const loadPart = async () => {
    try {
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      // TODO: Fetch part from API
      // const response = await fetch(`/api/inventory/part/${partId}`)

      // Mock data for now
      const mockPart: Part = {
        id: partId,
        partNumber: 'OIL-001',
        partName: 'Engine Oil 10W-40',
        category: 'Engine',
        make: 'Universal',
        usedFor: 'Engine',
        onHandStock: 25,
        warehouseStock: 50,
        lowStockThreshold: 10,
        purchasePrice: 450,
        sellingPrice: 650,
        margin: 30.8,
        location: 'A1-01',
        supplier: 'AutoParts Ltd',
        lastRestocked: '2024-01-10',
        description: 'High-quality synthetic engine oil suitable for all modern motorcycles. Provides excellent protection and performance.',
        status: 'in-stock',
      }

      setPart(mockPart)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading part:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    // TODO: Implement edit functionality
    alert('Edit functionality to be implemented')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <p className="text-graphite-600 font-medium">Loading part details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !part) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-graphite-900 text-center mb-2">Error Loading Part</h2>
          <p className="text-sm text-graphite-600 text-center">{error || 'Part not found'}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <button
            onClick={() => router.push('/inventory')}
            className="flex items-center gap-2 text-graphite-600 hover:text-graphite-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Inventory</span>
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20">
                <Package className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                  {part.partName}
                </h1>
                <p className="text-sm md:text-base text-graphite-600 mt-1 font-mono">
                  {part.partNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-status-error text-white font-semibold rounded-xl hover:bg-status-error/90 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            'mb-6 p-4 rounded-xl border flex items-center justify-between',
            getStatusColor(part.status)
          )}
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            <div>
              <span className="font-semibold">
                {part.status === 'in-stock' ? 'In Stock' : part.status === 'low-stock' ? 'Low Stock Alert' : 'Out of Stock'}
              </span>
              {part.status === 'low-stock' && (
                <span className="ml-2 text-sm opacity-80">
                  - Below threshold of {part.lowStockThreshold} units
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Total Stock</div>
            <div className="text-lg font-bold">{part.onHandStock + part.warehouseStock}</div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-graphite-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-graphite-200">
                <h3 className="text-lg font-semibold text-graphite-900">Basic Information</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1">Category</dt>
                    <dd className="text-base font-medium text-graphite-900">{part.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1">Used For</dt>
                    <dd className="text-base font-medium text-graphite-900">{part.usedFor}</dd>
                  </div>
                  {part.make && (
                    <div>
                      <dt className="text-sm text-graphite-600 mb-1">Make</dt>
                      <dd className="text-base font-medium text-graphite-900">{part.make}</dd>
                    </div>
                  )}
                  {part.model && (
                    <div>
                      <dt className="text-sm text-graphite-600 mb-1">Model</dt>
                      <dd className="text-base font-medium text-graphite-900">{part.model}</dd>
                    </div>
                  )}
                  {part.description && (
                    <div className="md:col-span-2">
                      <dt className="text-sm text-graphite-600 mb-1">Description</dt>
                      <dd className="text-base text-graphite-900">{part.description}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-graphite-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-graphite-200">
                <h3 className="text-lg font-semibold text-graphite-900">Stock Information</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      On-Hand Stock
                    </dt>
                    <dd className="text-2xl font-bold text-graphite-900">{part.onHandStock}</dd>
                    <dt className="text-xs text-graphite-500 mt-1">Available in workshop</dt>
                  </div>
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Warehouse Stock
                    </dt>
                    <dd className="text-2xl font-bold text-graphite-900">{part.warehouseStock}</dd>
                    <dt className="text-xs text-graphite-500 mt-1">In deep storage</dt>
                  </div>
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1">Low Stock Alert</dt>
                    <dd className="text-2xl font-bold text-status-warning">{part.lowStockThreshold}</dd>
                    <dt className="text-xs text-graphite-500 mt-1">Alert threshold</dt>
                  </div>
                </dl>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-graphite-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-graphite-200">
                <h3 className="text-lg font-semibold text-graphite-900">Pricing Information</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Purchase Price
                    </dt>
                    <dd className="text-2xl font-bold text-graphite-900">₹{part.purchasePrice.toFixed(2)}</dd>
                    <dt className="text-xs text-graphite-500 mt-1">Cost per unit</dt>
                  </div>
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Selling Price
                    </dt>
                    <dd className="text-2xl font-bold text-brand">₹{part.sellingPrice.toFixed(2)}</dd>
                    <dt className="text-xs text-graphite-500 mt-1">Retail per unit</dt>
                  </div>
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1">Profit Margin</dt>
                    <dd className={cn(
                      "text-2xl font-bold",
                      part.margin >= 30 ? "text-status-success" : part.margin >= 20 ? "text-status-warning" : "text-status-error"
                    )}>
                      {part.margin.toFixed(1)}%
                    </dd>
                    <dt className="text-xs text-graphite-500 mt-1">
                      ₹{(part.sellingPrice - part.purchasePrice).toFixed(2)} profit
                    </dt>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Location & Supplier */}
            <div className="bg-white rounded-2xl shadow-lg border border-graphite-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-graphite-200">
                <h3 className="text-lg font-semibold text-graphite-900">Additional Details</h3>
              </div>
              <div className="p-6 space-y-4">
                {part.location && (
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </dt>
                    <dd className="text-base font-medium text-graphite-900">{part.location}</dd>
                  </div>
                )}
                {part.supplier && (
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Supplier
                    </dt>
                    <dd className="text-base font-medium text-graphite-900">{part.supplier}</dd>
                  </div>
                )}
                {part.lastRestocked && (
                  <div>
                    <dt className="text-sm text-graphite-600 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last Restocked
                    </dt>
                    <dd className="text-base font-medium text-graphite-900">
                      {new Date(part.lastRestocked).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Part Number Card */}
            <div className="bg-graphite-900 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-graphite-400 mb-2 flex items-center gap-2">
                  <Barcode className="h-4 w-4" />
                  Part Number
                </h3>
                <p className="text-2xl font-bold text-brand font-mono">{part.partNumber}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-graphite-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-graphite-200">
                <h3 className="text-lg font-semibold text-graphite-900">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleEdit}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-graphite-50 rounded-xl hover:bg-graphite-100 transition-all"
                >
                  <Edit className="h-4 w-4 text-graphite-600" />
                  <span className="text-sm font-medium text-graphite-900">Edit Part</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-graphite-50 rounded-xl hover:bg-graphite-100 transition-all"
                >
                  <Truck className="h-4 w-4 text-graphite-600" />
                  <span className="text-sm font-medium text-graphite-900">Restock</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                >
                  <Trash2 className="h-4 w-4 text-status-error" />
                  <span className="text-sm font-medium text-status-error">Delete Part</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        partName={part ? `${part.partName} (${part.partNumber})` : ''}
        onConfirm={confirmDelete}
      />
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Title and Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-graphite-900 mb-2">Delete Part?</h2>
          <p className="text-graphite-600">
            Are you sure you want to delete <span className="font-semibold text-graphite-900">{partName}</span>? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
