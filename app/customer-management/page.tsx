'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Search,
  X,
  AlertCircle,
  Loader2,
  Filter,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Customer Management Page
 *
 * A comprehensive interface for managing garage customers.
 * Features include:
 * - View all customers
 * - Add new customers
 * - Edit existing customers
 * - Delete customers
 * - Search and filter functionality
 * - Link to customer's vehicles
 */

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phoneNumber: string | null
  alternatePhone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  dateOfBirth?: string | null
  customerSince?: string | null
  status: 'active' | 'inactive'
  profilePicture?: string | null
  notes?: string | null
  // Additional fields
  garageId?: string
  totalVehicles?: number
  totalJobs?: number
}

export default function CustomerManagementPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Dummy customer data for demonstration
  const dummyCustomers: Customer[] = [
    {
      id: '1',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@email.com',
      phoneNumber: '+91 98765 43210',
      alternatePhone: '+91 98765 43211',
      address: '123, Palm Grove Society',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      dateOfBirth: '1985-03-15',
      customerSince: '2023-01-15',
      status: 'active',
      totalVehicles: 2,
      totalJobs: 5,
      notes: 'Regular customer, prefers Saturday appointments',
    },
    {
      id: '2',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@email.com',
      phoneNumber: '+91 98765 43212',
      address: '456, Lake View Apartments',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      dateOfBirth: '1990-07-22',
      customerSince: '2023-03-20',
      status: 'active',
      totalVehicles: 1,
      totalJobs: 3,
      notes: 'Owns Honda Activa 6G',
    },
    {
      id: '3',
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@email.com',
      phoneNumber: '+91 98765 43213',
      alternatePhone: '+91 98765 43214',
      address: '789, Green Park',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380001',
      country: 'India',
      dateOfBirth: '1988-11-08',
      customerSince: '2022-11-10',
      status: 'active',
      totalVehicles: 3,
      totalJobs: 12,
      notes: 'Heavy user, owns multiple bikes',
    },
    {
      id: '4',
      firstName: 'Sneha',
      lastName: 'Reddy',
      email: 'sneha.reddy@email.com',
      phoneNumber: '+91 98765 43215',
      address: '321, Hillside Colony',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001',
      country: 'India',
      dateOfBirth: '1992-05-30',
      customerSince: '2023-06-05',
      status: 'active',
      totalVehicles: 1,
      totalJobs: 2,
      notes: 'New customer, referred by Amit Patel',
    },
    {
      id: '5',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@email.com',
      phoneNumber: '+91 98765 43216',
      alternatePhone: '+91 98765 43217',
      address: '654, Metro City',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      dateOfBirth: '1986-09-12',
      customerSince: '2022-08-18',
      status: 'inactive',
      totalVehicles: 2,
      totalJobs: 8,
      notes: 'Inactive for 6 months, follow-up needed',
    },
    {
      id: '6',
      firstName: 'Ananya',
      lastName: 'Das',
      email: 'ananya.das@email.com',
      phoneNumber: '+91 98765 43218',
      address: '987, Sea View Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India',
      dateOfBirth: '1995-02-14',
      customerSince: '2023-09-01',
      status: 'active',
      totalVehicles: 1,
      totalJobs: 1,
      notes: 'First-time service scheduled',
    },
    {
      id: '7',
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul.verma@email.com',
      phoneNumber: '+91 98765 43219',
      address: '147, City Center',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India',
      dateOfBirth: '1989-06-25',
      customerSince: '2022-04-12',
      status: 'active',
      totalVehicles: 2,
      totalJobs: 7,
      notes: 'Prefers genuine parts only',
    },
    {
      id: '8',
      firstName: 'Kavita',
      lastName: 'Nair',
      email: 'kavita.nair@email.com',
      phoneNumber: '+91 98765 43220',
      alternatePhone: '+91 98765 43221',
      address: '258, Tech Park Area',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682001',
      country: 'India',
      dateOfBirth: '1991-10-08',
      customerSince: '2023-07-22',
      status: 'active',
      totalVehicles: 1,
      totalJobs: 4,
      notes: 'Regular maintenance customer',
    },
    {
      id: '9',
      firstName: 'Arjun',
      lastName: 'Mehta',
      email: 'arjun.mehta@email.com',
      phoneNumber: '+91 98765 43222',
      address: '369, Industrial Area',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302001',
      country: 'India',
      dateOfBirth: '1987-04-03',
      customerSince: '2022-12-05',
      status: 'inactive',
      totalVehicles: 1,
      totalJobs: 3,
      notes: 'Moved to another city',
    },
    {
      id: '10',
      firstName: 'Pooja',
      lastName: 'Iyer',
      email: 'pooja.iyer@email.com',
      phoneNumber: '+91 98765 43223',
      address: '741, Beach Road',
      city: 'Goa',
      state: 'Goa',
      zipCode: '403001',
      country: 'India',
      dateOfBirth: '1993-12-20',
      customerSince: '2023-10-15',
      status: 'active',
      totalVehicles: 2,
      totalJobs: 2,
      notes: 'Touring enthusiast',
    },
    {
      id: '11',
      firstName: 'Deepak',
      lastName: 'Joshi',
      email: 'deepak.joshi@email.com',
      phoneNumber: '+91 98765 43224',
      address: '852, Hill Station',
      city: 'Lonavala',
      state: 'Maharashtra',
      zipCode: '410401',
      country: 'India',
      dateOfBirth: '1984-08-17',
      customerSince: '2022-02-28',
      status: 'active',
      totalVehicles: 4,
      totalJobs: 15,
      notes: 'Vintage bike collector',
    },
    {
      id: '12',
      firstName: 'Meera',
      lastName: 'Saxena',
      email: 'meera.saxena@email.com',
      phoneNumber: '+91 98765 43225',
      address: '963, Garden Estate',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      zipCode: '226001',
      country: 'India',
      dateOfBirth: '1990-01-25',
      customerSince: '2023-05-10',
      status: 'active',
      totalVehicles: 1,
      totalJobs: 6,
      notes: 'Monthly maintenance package',
    },
  ]

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
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

      console.log('Fetching customers for garage ID:', garageId)

      // TODO: Replace with actual API call when ready
      // const response = await fetch(`/api/customers/list?garageId=${garageId}`)
      // if (!response.ok) {
      //   const errorData = await response.json()
      //   throw new Error(errorData.error || 'Failed to fetch customers')
      // }
      // const result = await response.json()
      // if (!result.success) {
      //   throw new Error(result.error || 'Failed to fetch customers')
      // }
      // setCustomers(result.customers)

      // Using dummy data for now - replace with actual API call later
      setCustomers(dummyCustomers)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading customers:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleAddCustomer = () => {
    router.push('/customer-management/add')
  }

  const handleViewCustomer = (customer: Customer) => {
    // TODO: Navigate to customer profile page when implemented
    console.log('View customer:', customer)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        // TODO: Call API to soft delete customer
        // const response = await fetch('/api/customers/delete', {
        //   method: 'DELETE',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ customerId: selectedCustomer.id }),
        // })

        // Remove customer from local state
        setCustomers(customers.filter((cust) => cust.id !== selectedCustomer.id))
        setIsDeleteModalOpen(false)
        setSelectedCustomer(null)

        console.log('Customer deleted successfully:', selectedCustomer.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        console.error('Error deleting customer:', error)
        alert(`Failed to delete customer: ${message}`)
      }
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === '' ||
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (customer.phoneNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'text-status-success bg-status-success/10 border-status-success/30'
      case 'inactive':
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
          <p className="text-graphite-600 font-medium">Loading customers...</p>
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
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-graphite-900 text-center mb-2">Error Loading Customers</h2>
          <p className="text-sm text-graphite-600 text-center">{error}</p>
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
              <div className="h-10 w-1 bg-graphite-600 rounded-full" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                  Customer Management
                </h1>
                <p className="text-sm md:text-base text-graphite-600 mt-1">
                  Manage your garage customers
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddCustomer}
              className="flex items-center gap-2 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20"
            >
              <UserPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>
        </motion.header>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 bg-graphite-800 backdrop-blur-sm rounded-xl p-4 border border-graphite-700"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-graphite-900 border border-graphite-700 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-graphite-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-12 pr-4 py-3 bg-graphite-900 border border-graphite-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Customer Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-sm text-graphite-700">
            Showing <span className="font-semibold text-graphite-900">{startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)}</span> of{' '}
            <span className="font-semibold text-graphite-900">{filteredCustomers.length}</span> customers
          </p>
        </motion.div>

        {/* Customer Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {paginatedCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="bg-graphite-800 rounded-xl border border-graphite-700 overflow-hidden"
              >
                {/* Card Header - Name, Status & Actions */}
                <div className="p-4 border-b border-graphite-700/50">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0">
                      {customer.profilePicture ? (
                        <img
                          src={customer.profilePicture}
                          alt={customer.firstName}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-brand" />
                      )}
                    </div>

                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white truncate">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0',
                            getStatusColor(customer.status)
                          )}
                        >
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-graphite-400">Customer since {customer.customerSince || 'N/A'}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewCustomer(customer)}
                        className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteCustomer(customer)}
                        className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Card Body - Details */}
                <div className="p-4 space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-graphite-400">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state}
                    </span>
                  </div>

                  {/* Vehicle Count */}
                  {customer.totalVehicles !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-graphite-400">
                      <MotorcycleIcon className="h-4 w-4 shrink-0" />
                      <span>{customer.totalVehicles} Vehicle{customer.totalVehicles !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 pt-2 border-t border-graphite-700/30">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-graphite-500 shrink-0" />
                      <span className="text-graphite-300 truncate flex-1">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-graphite-500 shrink-0" />
                      <span className="text-graphite-300">{customer.phoneNumber}</span>
                    </div>
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
                    <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Customer</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Contact</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Location</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Vehicles</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Status</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/30">
                {paginatedCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-graphite-700/30 transition-colors duration-150"
                  >
                    {/* Customer Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0">
                          {customer.profilePicture ? (
                            <img
                              src={customer.profilePicture}
                              alt={customer.firstName}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-brand" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{customer.firstName} {customer.lastName}</div>
                          <div className="text-xs text-graphite-400">Since {customer.customerSince || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-graphite-400">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[200px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-graphite-400">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{customer.phoneNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-graphite-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state}</span>
                      </div>
                    </td>

                    {/* Vehicles */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <MotorcycleIcon className="h-4 w-4 text-brand" />
                        <span>{customer.totalVehicles !== undefined ? customer.totalVehicles : 0}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold border inline-block',
                          getStatusColor(customer.status)
                        )}
                      >
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewCustomer(customer)}
                          className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteCustomer(customer)}
                          className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
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
          {paginatedCustomers.length === 0 && (
            <div className="text-center py-16 bg-graphite-800 rounded-xl border border-graphite-700">
              <Users className="h-16 w-16 text-graphite-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No customers found</h3>
              <p className="text-graphite-400 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first customer'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddCustomer}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20"
                >
                  <UserPlus className="h-5 w-5" />
                  Add Your First Customer
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
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
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-graphite-800 border border-graphite-700 rounded-lg text-sm font-medium text-white hover:bg-graphite-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
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
                        {showEllipsis && (
                          <span className="px-2 text-graphite-500">...</span>
                        )}
                        <motion.button
                          whileHover={{ scale: currentPage !== page ? 1.05 : 1 }}
                          whileTap={{ scale: currentPage !== page ? 0.95 : 1 }}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            currentPage === page
                              ? 'bg-brand text-graphite-900'
                              : 'bg-graphite-800 border border-graphite-700 text-white hover:bg-graphite-700'
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-graphite-800 border border-graphite-700 rounded-lg text-sm font-medium text-white hover:bg-graphite-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        customerName={selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : ''}
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
  customerName: string
  onConfirm: () => Promise<void>
}

function DeleteConfirmationModal({ isOpen, onClose, customerName, onConfirm }: DeleteConfirmationModalProps) {
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
          <h2 className="text-xl font-bold text-graphite-900 mb-2">Delete Customer?</h2>
          <p className="text-graphite-600">
            Are you sure you want to delete <span className="font-semibold text-graphite-900">{customerName}</span>? This action cannot be undone.
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
