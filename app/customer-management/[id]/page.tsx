'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

interface Vehicle {
  id: string
  customerId: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
  vin?: string
  mileage?: number
  lastServiceDate?: string
  status: 'active' | 'inactive' | 'in-repair'
}

interface CustomerDetail {
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
  vehicles?: Vehicle[]
}

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCustomerDetail()
  }, [params.id])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const loadCustomerDetail = async () => {
    try {
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      // Fetch customer from API
      const response = await fetch(`/api/customers/${params.id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch customer details')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer details')
      }
      setCustomer(result.customer)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading customer details:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleEditCustomer = () => {
    router.push(`/customer-management/${params.id}/edit`)
  }

  const handleDeleteCustomer = async () => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/customers/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId: params.id }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete customer')
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete customer')
        }

        console.log('Customer deleted successfully:', params.id)
        router.push('/customer-management')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        console.error('Error deleting customer:', error)
        alert(`Failed to delete customer: ${message}`)
      }
    }
  }

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`)
  }

  const handleAddVehicle = () => {
    router.push(`/vehicles/add?customerId=${params.id}`)
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
          <p className="text-gray-600 font-medium">Loading customer details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Customer</h2>
          <p className="text-sm text-gray-600 text-center">{error || 'Customer not found'}</p>
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
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
              Customer Details
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              View and manage customer information
            </p>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <p className="text-sm text-gray-200 mt-1">
                      Customer since {formatDate(customer.customerSince)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditCustomer}
                      className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/30"
                      title="Edit customer"
                    >
                      <Edit className="h-5 w-5 text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteCustomer}
                      className="p-2.5 bg-red-500/80 backdrop-blur-sm hover:bg-red-500 rounded-lg transition-all duration-200 border border-white/30"
                      title="Delete customer"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Contact Information
                </h3>

                {customer.email && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{customer.email}</p>
                    </div>
                  </div>
                )}

                {customer.phoneNumber && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{customer.phoneNumber}</p>
                      {customer.alternatePhone && (
                        <p className="text-sm text-gray-600 mt-1">Alt: {customer.alternatePhone}</p>
                      )}
                    </div>
                  </div>
                )}

                {(customer.address || customer.city || customer.state) && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {[customer.address, customer.city, customer.state, customer.zipCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {customer.country && (
                        <p className="text-sm text-gray-600 mt-1">{customer.country}</p>
                      )}
                    </div>
                  </div>
                )}

                {customer.dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900">{customer.dateOfBirth}</p>
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Vehicles Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Vehicles Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Vehicles</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {customer.vehicles?.length || 0} vehicle{(customer.vehicles?.length || 0) !== 1 ? 's' : ''} owned
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddVehicle}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Vehicle</span>
                  </motion.button>
                </div>
              </div>

              {/* Vehicles List */}
              <div className="p-6">
                {customer.vehicles && customer.vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.vehicles.map((vehicle, index) => (
                      <motion.div
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => handleViewVehicle(vehicle.id)}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"
                      >
                        {/* Vehicle Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center border border-gray-300 flex-shrink-0">
                            <MotorcycleIcon className="h-8 w-8 text-gray-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{vehicle.licensePlate}</p>
                          </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Color</span>
                            <span className="font-medium text-gray-900">{vehicle.color}</span>
                          </div>
                          {vehicle.mileage && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Mileage</span>
                              <span className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                            </div>
                          )}
                          {vehicle.lastServiceDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Last Service</span>
                              <span className="font-medium text-gray-900">{formatDate(vehicle.lastServiceDate)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                            <span className="text-gray-500">Status</span>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                vehicle.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : vehicle.status === 'in-repair'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {vehicle.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-4 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm"
                        >
                          View Details & Service History
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MotorcycleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Vehicles Found</h4>
                    <p className="text-gray-600 mb-6">This customer hasn't added any vehicles yet</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddVehicle}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Add First Vehicle
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
