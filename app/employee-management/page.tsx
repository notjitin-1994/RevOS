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

/**
 * Employee Management Page
 *
 * A comprehensive interface for managing garage employees.
 * Features include:
 * - View all employees (excluding owner)
 * - Add new employees
 * - Edit existing employees
 * - Delete employees
 * - Search and filter functionality
 */

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeId: string | null
  email: string | null
  phoneNumber: string | null
  alternatePhone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  dateOfBirth?: string | null
  dateOfJoining?: string | null
  bloodGroup?: string | null
  department?: string | null
  role: string
  status: 'active' | 'inactive' | 'on-leave'
  profilePicture?: string | null
  certifications?: string[]
  specializations?: string[]
  // Additional fields from database
  userUid?: string
  loginId?: string
  garageUid?: string
  garageId?: string
  garageName?: string
}

export default function EmployeeManagementPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
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

      console.log('Fetching employees for garage ID:', garageId)

      // Fetch employees from API
      const response = await fetch(`/api/employees/list?garageId=${garageId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch employees')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch employees')
      }

      console.log(`Loaded ${result.count} employees`)

      setEmployees(result.employees)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading employees:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleAddEmployee = () => {
    router.push('/employee-management/add')
  }

  const handleViewEmployee = (employee: Employee) => {
    // Navigate to employee profile page using the actual loginId
    // loginId format is: firstname.lastname@garagename
    if (!employee.loginId) {
      console.error('Employee missing loginId:', employee)
      return
    }
    router.push(`/employee-management/${employee.loginId}`)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedEmployee) {
      try {
        // Call API to soft delete employee
        const response = await fetch('/api/employees/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ employeeId: selectedEmployee.id }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to delete employee')
        }

        // Remove employee from local state
        setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id))
        setIsDeleteModalOpen(false)
        setSelectedEmployee(null)

        console.log('Employee deleted successfully:', selectedEmployee.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        console.error('Error deleting employee:', error)
        alert(`Failed to delete employee: ${message}`)
      }
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchQuery === '' ||
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.employeeId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (employee.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return 'text-status-success bg-status-success/10 border-status-success/30'
      case 'inactive':
        return 'text-status-error bg-status-error/10 border-status-error/30'
      case 'on-leave':
        return 'text-graphite-400 bg-graphite-700/50 border-graphite-600'
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
          <p className="text-graphite-600 font-medium">Loading employees...</p>
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
          <h2 className="text-xl font-semibold text-graphite-900 text-center mb-2">Error Loading Employees</h2>
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
                    Employee Management
                  </h1>
                  <p className="text-sm md:text-base text-graphite-600 mt-1">
                    Manage your garage team members
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddEmployee}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20"
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Employee</span>
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
                  placeholder="Search employees..."
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
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Employee Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6 flex items-center justify-between"
          >
            <p className="text-sm text-graphite-700">
              Showing <span className="font-semibold text-graphite-900">{startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)}</span> of{' '}
              <span className="font-semibold text-graphite-900">{filteredEmployees.length}</span> employees
            </p>
          </motion.div>

          {/* Employee Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {paginatedEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
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
                        {employee.profilePicture ? (
                          <img
                            src={employee.profilePicture}
                            alt={employee.firstName}
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
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0',
                              getStatusColor(employee.status)
                            )}
                          >
                            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-graphite-400 font-mono">{employee.employeeId}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewEmployee(employee)}
                          className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body - Details */}
                  <div className="p-4 space-y-3">
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium border',
                          employee.role === 'Manager'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-brand/10 text-brand border-brand/20'
                        )}
                      >
                        {employee.role || 'N/A'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-graphite-400">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {employee.city}{employee.city && employee.state ? ', ' : ''}{employee.state}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 pt-2 border-t border-graphite-700/30">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-graphite-500 shrink-0" />
                        <span className="text-graphite-300 truncate flex-1">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-graphite-500 shrink-0" />
                        <span className="text-graphite-300">{employee.phoneNumber}</span>
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
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Employee</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Employee ID</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Role</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">Contact</span>
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
                  {paginatedEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-graphite-700/30 transition-colors duration-150"
                    >
                      {/* Employee Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0">
                            {employee.profilePicture ? (
                              <img
                                src={employee.profilePicture}
                                alt={employee.firstName}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-brand" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{employee.firstName} {employee.lastName}</div>
                            <div className="text-xs text-graphite-400">{employee.city}{employee.city && employee.state ? ', ' : ''}{employee.state}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-graphite-300 font-mono">{employee.employeeId}</div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium border',
                            employee.role === 'Manager'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-brand/10 text-brand border-brand/20'
                          )}
                        >
                          {employee.role || 'N/A'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-graphite-400">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-graphite-400">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{employee.phoneNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-semibold border inline-block',
                            getStatusColor(employee.status)
                          )}
                        >
                          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewEmployee(employee)}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteEmployee(employee)}
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
          {paginatedEmployees.length === 0 && (
            <div className="text-center py-16 bg-graphite-800 rounded-xl border border-graphite-700">
                <Users className="h-16 w-16 text-graphite-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No employees found</h3>
                <p className="text-graphite-400 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first employee'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddEmployee}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20"
                  >
                    <UserPlus className="h-5 w-5" />
                    Add Your First Employee
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
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

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(employee) => {
          setEmployees([...employees, { ...employee, id: Date.now().toString() }])
          setIsAddModalOpen(false)
        }}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={selectedEmployee}
        onUpdate={(updatedEmployee) => {
          setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
          setIsEditModalOpen(false)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        employeeName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
        onConfirm={confirmDelete}
      />
    </>
  )
}

/**
 * Add Employee Modal Component
 */
interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (employee: Omit<Employee, 'id'>) => void
}

function AddEmployeeModal({ isOpen, onClose, onAdd }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    dateOfBirth: '',
    dateOfJoining: '',
    bloodGroup: '',
    department: 'Mechanic',
    role: '',
    status: 'active' as Employee['status'],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      onAdd({
        ...formData,
        certifications: [],
        specializations: [],
      })

      onClose()
      setFormData({
        firstName: '',
        lastName: '',
        employeeId: '',
        email: '',
        phoneNumber: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        dateOfBirth: '',
        dateOfJoining: '',
        bloodGroup: '',
        department: 'Mechanic',
        role: '',
        status: 'active',
      })
    } catch (err) {
      setError('Failed to add employee')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-graphite-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-graphite-900">Add New Employee</h2>
            <p className="text-sm text-graphite-600 mt-1">Fill in the employee details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-graphite-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-graphite-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-graphite-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Employee ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone || ''}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup || ''}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-sm font-semibold text-graphite-900 mb-3">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode || ''}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-sm font-semibold text-graphite-900 mb-3">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Department *
                </label>
                <select
                  required
                  value={formData.department || 'Mechanic'}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="Mechanic">Mechanic</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfJoining || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-graphite-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * Edit Employee Modal Component
 */
interface EditEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  onUpdate: (employee: Employee) => void
}

function EditEmployeeModal({ isOpen, onClose, employee, onUpdate }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<Employee | null>(employee)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employee) {
      setFormData(employee)
    }
  }, [employee])

  if (!isOpen || !formData) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      // Email validation
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address')
          setIsLoading(false)
          return
        }
      }

      // Phone validation
      if (formData.phoneNumber) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/
        if (!phoneRegex.test(formData.phoneNumber) || formData.phoneNumber.length < 10) {
          setError('Please enter a valid phone number (minimum 10 digits)')
          setIsLoading(false)
          return
        }
      }

      // Call the API to update employee
      const response = await fetch('/api/employees/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUid: formData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeId: formData.employeeId,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          alternatePhone: formData.alternatePhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup,
          department: formData.department,
          role: formData.role,
          dateOfJoining: formData.dateOfJoining,
          status: formData.status,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update employee')
      }

      console.log('Employee updated successfully:', result)

      // Update the local state
      onUpdate(result.employee)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update employee'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-graphite-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-graphite-900">Edit Employee</h2>
            <p className="text-sm text-graphite-600 mt-1">Update employee information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-graphite-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-graphite-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-graphite-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData!, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData!, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Employee ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId || ''}
                  onChange={(e) => setFormData({ ...formData!, employeeId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData!, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData!, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone || ''}
                  onChange={(e) => setFormData({ ...formData!, alternatePhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData!, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup || ''}
                  onChange={(e) => setFormData({ ...formData!, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-sm font-semibold text-graphite-900 mb-3">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData!, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData!, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData!, state: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode || ''}
                  onChange={(e) => setFormData({ ...formData!, zipCode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData!, country: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-sm font-semibold text-graphite-900 mb-3">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Department *
                </label>
                <select
                  required
                  value={formData.department || 'Mechanic'}
                  onChange={(e) => setFormData({ ...formData!, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="Mechanic">Mechanic</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData!, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfJoining || ''}
                  onChange={(e) => setFormData({ ...formData!, dateOfJoining: e.target.value })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData!, status: e.target.value as Employee['status'] })}
                  className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-graphite-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Update Employee
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * Delete Confirmation Modal Component
 */
interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  employeeName: string
  onConfirm: () => Promise<void>
}

function DeleteConfirmationModal({ isOpen, onClose, employeeName, onConfirm }: DeleteConfirmationModalProps) {
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
          <h2 className="text-xl font-bold text-graphite-900 mb-2">Delete Employee?</h2>
          <p className="text-graphite-600">
            Are you sure you want to delete <span className="font-semibold text-graphite-900">{employeeName}</span>? This action cannot be undone.
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
