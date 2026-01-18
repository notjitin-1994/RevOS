'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Filter,
  Eye,
  Search,
  X,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

/**
 * Parts & Inventory Management Page
 *
 * A comprehensive interface for managing garage parts inventory.
 * Features include:
 * - View all parts
 * - Add new parts
 * - Edit existing parts
 * - Delete parts
 * - Low stock alerts
 * - Search and filter functionality
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

export default function InventoryManagementPage() {
  const router = useRouter()
  const [parts, setParts] = useState<Part[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadParts()
  }, [])

  const loadParts = async () => {
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

      // TODO: Fetch parts from API
      // const response = await fetch(`/api/inventory/list?garageId=${garageId}`)

      // Mock data for now
      const mockParts: Part[] = [
        {
          id: '1',
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
          description: 'High-quality synthetic engine oil',
          status: 'in-stock',
        },
        {
          id: '2',
          partNumber: 'BRK-002',
          partName: 'Brake Pads Front',
          category: 'Brakes',
          make: 'Honda',
          model: 'CBR650R',
          usedFor: 'Brakes',
          onHandStock: 8,
          warehouseStock: 5,
          lowStockThreshold: 10,
          purchasePrice: 800,
          sellingPrice: 1200,
          margin: 33.3,
          location: 'B2-03',
          supplier: 'Brake Masters',
          lastRestocked: '2024-01-05',
          description: 'Ceramic brake pads for front wheel',
          status: 'low-stock',
        },
        {
          id: '3',
          partNumber: 'AIR-003',
          partName: 'Air Filter',
          category: 'Engine',
          make: 'Yamaha',
          model: 'MT-07',
          usedFor: 'Engine',
          onHandStock: 0,
          warehouseStock: 0,
          lowStockThreshold: 5,
          purchasePrice: 350,
          sellingPrice: 500,
          margin: 30,
          location: 'A1-05',
          supplier: 'Filter World',
          lastRestocked: '2023-12-20',
          description: 'High-flow air filter',
          status: 'out-of-stock',
        },
      ]

      setParts(mockParts)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading parts:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleAddPart = () => {
    router.push('/inventory/add')
  }

  const handleViewPart = (part: Part) => {
    router.push(`/inventory/${part.id}`)
  }

  const handleDeletePart = (part: Part) => {
    setSelectedPart(part)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedPart) {
      try {
        // Call API to delete part
        // const response = await fetch('/api/inventory/delete', {
        //   method: 'DELETE',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ partId: selectedPart.id }),
        // })

        // Remove part from local state
        setParts(parts.filter((p) => p.id !== selectedPart.id))
        setIsDeleteModalOpen(false)
        setSelectedPart(null)

        console.log('Part deleted successfully:', selectedPart.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        console.error('Error deleting part:', error)
        alert(`Failed to delete part: ${message}`)
      }
    }
  }

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      searchQuery === '' ||
      part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (part.make?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (part.model?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter
    const matchesStock = stockFilter === 'all' || part.status === stockFilter

    return matchesSearch && matchesCategory && matchesStock
  })

  // Pagination
  const totalPages = Math.ceil(filteredParts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedParts = filteredParts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, stockFilter])

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

  const getCategories = () => {
    const categories = Array.from(new Set(parts.map((p) => p.category)))
    return categories
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
          <Loader2 className="h-12 w-12 animate-spin text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading inventory...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-card"
        >
          <AlertCircle className="h-12 w-12 text-status-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Inventory</h2>
          <p className="text-sm text-gray-600 text-center">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 bg-gray-700 rounded-full" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Parts & Inventory
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Manage your garage parts and stock levels
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddPart}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Part</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>

          {/* Low Stock Alerts */}
          {parts.some((p) => p.status === 'low-stock' || p.status === 'out-of-stock') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-4 p-4 bg-status-warning/10 border border-status-warning/30 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-status-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {parts.filter((p) => p.status === 'out-of-stock').length} out of stock,{' '}
                  {parts.filter((p) => p.status === 'low-stock').length} low stock items
                </p>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 bg-white rounded-xl p-4 border border-gray-200 shadow-card"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {getCategories().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Stock Levels</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Parts Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startIndex + 1}-{Math.min(endIndex, filteredParts.length)}</span> of{' '}
            <span className="font-semibold text-gray-900">{filteredParts.length}</span> parts
          </p>
        </motion.div>

        {/* Parts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {paginatedParts.map((part, index) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card"
              >
                {/* Card Header - Part Name, Status & Actions */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-700" />
                    </div>

                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {part.partName}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0',
                            getStatusColor(part.status)
                          )}
                        >
                          {part.status === 'in-stock' ? 'In Stock' : part.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{part.partNumber}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewPart(part)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeletePart(part)}
                        className="p-2 text-gray-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Card Body - Details */}
                <div className="p-4 space-y-3">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-status-info/10 text-status-info border-status-info/20">
                      {part.category}
                    </span>
                    {part.make && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                        {part.make} {part.model || ''}
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">On Hand:</span>
                      <span className="text-gray-900 font-medium ml-2">{part.onHandStock}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Warehouse:</span>
                      <span className="text-gray-900 font-medium ml-2">{part.warehouseStock}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">₹{part.sellingPrice}</span>
                      <span className="text-gray-700 text-xs font-medium">{part.margin.toFixed(1)}% margin</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Part</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Part Number</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedParts.map((part, index) => (
                  <motion.tr
                    key={part.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Part Name & Icon */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                          <Package className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{part.partName}</div>
                          <div className="text-xs text-gray-500">
                            {part.make} {part.model ? `${part.model}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Part Number */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-mono">{part.partNumber}</div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-status-info/10 text-status-info border-status-info/20">
                        {part.category}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <span className="text-gray-500">On Hand:</span>
                          <span className="font-medium">{part.onHandStock}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Warehouse:</span>
                          <span>{part.warehouseStock}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 font-medium">₹{part.sellingPrice}</div>
                        <div className="text-xs text-gray-600">{part.margin.toFixed(1)}% margin</div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold border inline-block',
                          getStatusColor(part.status)
                        )}
                      >
                        {part.status === 'in-stock' ? 'In Stock' : part.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewPart(part)}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePart(part)}
                          className="p-2 text-gray-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedParts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-card">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No parts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first part'}
              </p>
              {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPart}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Part
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredParts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center justify-between"
          >
            <div className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, arr) => {
                    const prevPage = arr[index - 1]
                    const showEllipsis = prevPage && page > prevPage + 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                        <motion.button
                          whileHover={{ scale: currentPage !== page ? 1.05 : 1 }}
                          whileTap={{ scale: currentPage !== page ? 0.95 : 1 }}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            currentPage === page
                              ? 'bg-gray-700 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          {page}
                        </motion.button>
                      </React.Fragment>
                    )
                  })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        partName={selectedPart ? `${selectedPart.partName} (${selectedPart.partNumber})` : ''}
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
