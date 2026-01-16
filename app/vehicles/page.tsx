'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  User,
  Hash,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Bike Management Page - Vehicle Registry
 *
 * Customer bike registry with ownership, VIN, and engine number tracking.
 * Based on RevOS-features.md specification.
 */

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  engineNumber: string
  chassisNumber: string
  customerId: string
  customerName: string
  customerPhone?: string
  category?: string
  createdAt: string
}

// Mock data - customer registered bikes
const mockVehicles: VehicleData[] = [
  {
    id: '1',
    make: 'Honda',
    model: 'CBR650R',
    year: 2023,
    engineNumber: 'HC23E41001234',
    chassisNumber: 'MH2JC2323PK000001',
    customerId: 'cust-001',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    category: 'Sport',
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    make: 'Kawasaki',
    model: 'Ninja 400',
    year: 2022,
    engineNumber: 'KX400E52004567',
    chassisNumber: 'KAWJK4020MK000123',
    customerId: 'cust-002',
    customerName: 'Priya Patel',
    customerPhone: '+91 98765 43211',
    category: 'Sport',
    createdAt: '2023-08-20',
  },
  {
    id: '3',
    make: 'Yamaha',
    model: 'MT-07',
    year: 2023,
    engineNumber: 'YM68GE61007890',
    chassisNumber: 'YAMJM6821RK000456',
    customerId: 'cust-003',
    customerName: 'Amit Kumar',
    category: 'Naked',
    createdAt: '2023-09-10',
  },
  {
    id: '4',
    make: 'BMW',
    model: 'R 1250 GS',
    year: 2024,
    engineNumber: 'BM1250E1001122',
    chassisNumber: 'WB10J50522K000789',
    customerId: 'cust-004',
    customerName: 'Suresh Reddy',
    category: 'Adventure',
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    make: 'Royal Enfield',
    model: 'Classic 350',
    year: 2021,
    engineNumber: 'RE350E5203456',
    chassisNumber: 'MT3JC3321FK001234',
    customerId: 'cust-005',
    customerName: 'Anjali Desai',
    category: 'Cruiser',
    createdAt: '2023-05-15',
  },
  {
    id: '6',
    make: 'Suzuki',
    model: 'GSX-R1000',
    year: 2023,
    engineNumber: 'SZ1000E7805678',
    chassisNumber: 'SUSJS1002RK005678',
    customerId: 'cust-006',
    customerName: 'Vikram Singh',
    category: 'Sport',
    createdAt: '2023-07-22',
  },
  {
    id: '7',
    make: 'Ducati',
    model: 'Panigale V4',
    year: 2024,
    engineNumber: 'DV1103E9509012',
    chassisNumber: 'DUCJV11034K009012',
    customerId: 'cust-007',
    customerName: 'Meera Nair',
    category: 'Sport',
    createdAt: '2024-02-10',
  },
  {
    id: '8',
    make: 'KTM',
    model: 'Duke 390',
    year: 2023,
    engineNumber: 'KT390E6203456',
    chassisNumber: 'MT3KD39012K003456',
    customerId: 'cust-008',
    customerName: 'Arjun Menon',
    category: 'Naked',
    createdAt: '2023-10-05',
  },
]

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleData[]>(mockVehicles)
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>(mockVehicles)
  const [searchQuery, setSearchQuery] = useState('')
  const [makeFilter, setMakeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'make' | 'customer'>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 5

  // Extract unique makes and categories for filters
  const makes = ['all', ...Array.from(new Set(vehicles.map((v) => v.make)))]
  const categories = ['all', ...Array.from(new Set(vehicles.map((v) => v.category || 'Other').filter(Boolean)))]

  useEffect(() => {
    let filtered = [...vehicles]

    // Apply search filter - search by make, model, customer, VIN, engine
    if (searchQuery) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.engineNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply make filter
    if (makeFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.make === makeFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.category === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'make':
          return a.make.localeCompare(b.make)
        case 'customer':
          return a.customerName.localeCompare(b.customerName)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
    setCurrentPage(1) // Reset to page 1 when filters change
  }, [searchQuery, makeFilter, categoryFilter, sortBy, vehicles])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

  const handleViewVehicle = (id: string) => {
    router.push(`/vehicles/${id}`)
  }

  const handleEditVehicle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    router.push(`/vehicles/${id}/edit`)
  }

  const handleDeleteVehicle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to remove this bike from the registry?')) {
      setVehicles(vehicles.filter((v) => v.id !== id))
    }
  }

  return (
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
            <div className="h-10 w-1 bg-graphite-600 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                Vehicle Management
              </h1>
              <p className="text-sm md:text-base text-graphite-600 mt-1">
                Customer vehicle registry with ownership details
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/vehicles/add')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20"
          >
            <Plus className="h-5 w-5" />
            Register Bike
          </motion.button>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Total Bikes</p>
          <p className="text-2xl font-bold text-white">{vehicles.length}</p>
        </div>
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Registered Owners</p>
          <p className="text-2xl font-bold text-white">{new Set(vehicles.map(v => v.customerId)).size}</p>
        </div>
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Makes</p>
          <p className="text-2xl font-bold text-brand">{makes.length - 1}</p>
        </div>
        <div className="bg-graphite-800 rounded-xl p-4 border border-graphite-700 shadow-sm">
          <p className="text-sm text-graphite-400 mb-1">Sport Bikes</p>
          <p className="text-2xl font-bold text-graphite-300">{vehicles.filter(v => v.category === 'Sport').length}</p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-graphite-800 rounded-xl border border-graphite-700 shadow-sm p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
            <input
              type="text"
              placeholder="Search by make, model, customer, VIN, or engine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Make Filter */}
            <div className="relative">
              <select
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer"
              >
                {makes.map((make) => (
                  <option key={make} value={make}>
                    {make === 'all' ? 'All Makes' : make}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-graphite-900 border-2 border-graphite-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="make">Sort by Make</option>
                <option value="customer">Sort by Customer</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vehicle List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredVehicles.length === 0 ? (
          <div className="bg-graphite-800 rounded-xl border border-graphite-700 shadow-sm p-12 text-center">
            <MotorcycleIcon className="h-16 w-16 text-graphite-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No bikes found</h3>
            <p className="text-graphite-400 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setMakeFilter('all')
                setCategoryFilter('all')
              }}
              className="text-brand font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {paginatedVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleViewVehicle(vehicle.id)}
                  className="bg-graphite-800 backdrop-blur-sm rounded-xl border border-graphite-700 shadow-sm hover:shadow-lg hover:border-brand/50 transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col gap-4">
                      {/* Vehicle Icon & Basic Info */}
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-brand/20 shrink-0">
                          <MotorcycleIcon className="h-7 w-7 text-brand" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-0.5">
                            {vehicle.make}
                          </h3>
                          <p className="text-brand font-semibold text-base mb-1">
                            {vehicle.model}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-graphite-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{vehicle.year}</span>
                            {vehicle.category && (
                              <>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-graphite-700 text-graphite-300 text-xs font-medium rounded">
                                  {vehicle.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-start gap-3 bg-graphite-900/50 rounded-lg p-3">
                        <div className="h-8 w-8 rounded-lg bg-brand/20 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-brand" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-graphite-400 mb-0.5">Owner</p>
                          <p className="text-sm font-semibold text-white truncate">
                            {vehicle.customerName}
                          </p>
                          {vehicle.customerPhone && (
                            <p className="text-xs text-graphite-400 mt-0.5">{vehicle.customerPhone}</p>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Identification */}
                      <div className="flex items-start gap-3 bg-graphite-900/50 rounded-lg p-3">
                        <div className="h-8 w-8 rounded-lg bg-graphite-700 flex items-center justify-center shrink-0">
                          <Hash className="h-4 w-4 text-graphite-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-graphite-400 mb-1">Identification</p>
                          <div className="space-y-1">
                            <div>
                              <p className="text-xs text-graphite-500">Engine No.</p>
                              <p className="text-xs font-mono text-white truncate">{vehicle.engineNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-graphite-500">Chassis No.</p>
                              <p className="text-xs font-mono text-white truncate">{vehicle.chassisNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-graphite-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewVehicle(vehicle.id)
                        }}
                        className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleEditVehicle(e, vehicle.id)}
                        className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                        title="Edit Bike"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteVehicle(e, vehicle.id)}
                        className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                        title="Remove Bike"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block bg-graphite-800 rounded-xl border border-graphite-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-graphite-700/50">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Vehicle</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Owner</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Engine Number</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Chassis Number</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Category</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-700/30">
                  {paginatedVehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => handleViewVehicle(vehicle.id)}
                      className="hover:bg-graphite-700/30 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Vehicle Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0">
                            <MotorcycleIcon className="h-6 w-6 text-brand" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-white">{vehicle.make}</p>
                            <p className="text-sm font-semibold text-brand">{vehicle.model}</p>
                            <div className="flex items-center gap-1 text-xs text-graphite-400 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              <span>{vehicle.year}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-brand shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white">{vehicle.customerName}</p>
                            {vehicle.customerPhone && (
                              <p className="text-xs text-graphite-400">{vehicle.customerPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Engine Number */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono text-graphite-300">{vehicle.engineNumber}</p>
                      </td>

                      {/* Chassis Number */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono text-graphite-300">{vehicle.chassisNumber}</p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {vehicle.category ? (
                          <span className="px-3 py-1 bg-brand/20 text-brand text-xs font-medium rounded-full inline-block">
                            {vehicle.category}
                          </span>
                        ) : (
                          <span className="text-sm text-graphite-500">N/A</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewVehicle(vehicle.id)
                            }}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditVehicle(e, vehicle.id)
                            }}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200"
                            title="Edit Bike"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteVehicle(e, vehicle.id)
                            }}
                            className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                            title="Remove Bike"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {filteredVehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center justify-between"
          >
            <div className="text-sm text-graphite-700">
              Page <span className="font-medium text-graphite-900">{currentPage}</span> of{' '}
              <span className="font-medium text-graphite-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-graphite-800 border border-graphite-700 rounded-lg text-sm font-medium text-white hover:bg-graphite-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages adjacent to current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, arr) => {
                    // Add ellipsis for gaps in page numbers
                    const prevPage = arr[index - 1]
                    const showEllipsis = prevPage && page > prevPage + 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 text-graphite-500">...</span>
                        )}
                        <motion.button
                          whileHover={{ scale: currentPage !== page ? 1.05 : 1 }}
                          whileTap={{ scale: currentPage !== page ? 0.95 : 1 }}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-brand text-graphite-900'
                              : 'bg-graphite-800 border border-graphite-700 text-white hover:bg-graphite-700'
                          }`}
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
                className="px-4 py-2 bg-graphite-800 border border-graphite-700 rounded-lg text-sm font-medium text-white hover:bg-graphite-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
