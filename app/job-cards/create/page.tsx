'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  User,
  Wrench,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  X,
  ChevronDown,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createJobCardAction } from '@/app/actions/job-card-actions'
import { getMakesDataAction } from '@/app/actions/motorcycle-actions'
import { createCustomerAction, type CreateCustomerInput } from '@/app/actions/customer-actions'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

/**
 * Add Job Card Page
 *
 * A comprehensive form for creating new job cards.
 * Collects customer details, vehicle details, job information,
 * checklist items, scheduling, and assignment information.
 */

// ============================================================================
// TYPES
// ============================================================================

interface CustomerData {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  vehicles: VehicleData[]
}

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color?: string
  vin?: string
  currentMileage?: number
}

interface EmployeeData {
  id: string
  firstName: string
  lastName: string
  role: string
}

interface ChecklistItem {
  id: string
  itemName: string
  description?: string
  category?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedMinutes: number
  laborRate: number
  displayOrder: number
}

type JobType = 'routine' | 'repair' | 'maintenance' | 'custom' | 'diagnostic'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

// ============================================================================
// CUSTOMER FORM TYPES
// ============================================================================

interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  alternatePhone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  notes: string
}

interface VehicleFormData {
  category: string
  make: string
  model: string
  year: string
  licensePlate: string
  color: string
  vin: string
  engineNumber: string
  mileage: string
  notes: string
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreateJobCardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Customer & Vehicle states
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false)

  // Customer Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [customerModalError, setCustomerModalError] = useState<string | null>(null)
  const [customerModalSuccess, setCustomerModalSuccess] = useState(false)
  const [makesData, setMakesData] = useState<MakeData[]>([])
  const [isLoadingMakes, setIsLoadingMakes] = useState(true)

  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    notes: '',
  })

  const [customerVehicles, setCustomerVehicles] = useState<VehicleFormData[]>([
    {
      category: '',
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      color: '',
      vin: '',
      engineNumber: '',
      mileage: '',
      notes: '',
    },
  ])

  // Employees state
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Job details states
  const [jobType, setJobType] = useState<JobType>('repair')
  const [priority, setPriority] = useState<Priority>('medium')
  const [customerComplaint, setCustomerComplaint] = useState('')
  const [workRequested, setWorkRequested] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [currentMileage, setCurrentMileage] = useState('')
  const [reportedIssue, setReportedIssue] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  // Scheduling states
  const [promisedDate, setPromisedDate] = useState('')
  const [promisedTime, setPromisedTime] = useState('')
  const [leadMechanicId, setLeadMechanicId] = useState('')

  // Checklist items
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [currentChecklistItem, setCurrentChecklistItem] = useState<ChecklistItem>({
    id: Date.now().toString(),
    itemName: '',
    description: '',
    category: 'General',
    priority: 'medium',
    estimatedMinutes: 30,
    laborRate: 500,
    displayOrder: checklistItems.length + 1,
  })

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Check authentication
    const sessionUser = sessionStorage.getItem('user')
    if (!sessionUser) {
      router.push('/login')
      return
    }

    // Load initial data
    loadCustomers()
    loadEmployees()
    loadMakes()
  }, [router])

  // Load vehicles when customer is selected
  useEffect(() => {
    if (selectedCustomer?.vehicles && selectedCustomer.vehicles.length > 0) {
      // Auto-select first vehicle if available
      setSelectedVehicle(selectedCustomer.vehicles[0])
    } else {
      setSelectedVehicle(null)
    }
  }, [selectedCustomer])

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadCustomers = async () => {
    setIsLoadingCustomers(true)
    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) return

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      const response = await fetch(`/api/customers/list?garageId=${garageId}`)
      const data = await response.json()

      if (data.success) {
        setCustomers(data.customers || [])
      }
    } catch (err) {
      console.error('Error loading customers:', err)
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  const loadEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) return

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      const response = await fetch(`/api/employees/list?garageId=${garageId}`)
      const data = await response.json()

      if (data.success) {
        setEmployees(data.employees || [])
      }
    } catch (err) {
      console.error('Error loading employees:', err)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const loadMakes = async () => {
    try {
      const makes = await getMakesDataAction()
      setMakesData(makes)
    } catch (err) {
      console.error('Error loading makes:', err)
    } finally {
      setIsLoadingMakes(false)
    }
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
    setCustomerSearchQuery('')
    setShowAddCustomerForm(false)
  }

  const handleAddChecklistItem = () => {
    if (!currentChecklistItem.itemName.trim()) {
      setError('Task name is required')
      return
    }

    setChecklistItems([...checklistItems, { ...currentChecklistItem }])
    setCurrentChecklistItem({
      id: Date.now().toString(),
      itemName: '',
      description: '',
      category: 'General',
      priority: 'medium',
      estimatedMinutes: 30,
      laborRate: 500,
      displayOrder: checklistItems.length + 2,
    })
    setError(null)
  }

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id))
  }

  // ============================================================================
  // CUSTOMER MODAL HANDLERS
  // ============================================================================

  const handleOpenCustomerModal = () => {
    setShowCustomerModal(true)
    setCustomerModalError(null)
    setCustomerModalSuccess(false)
  }

  const handleCloseCustomerModal = () => {
    if (!isCreatingCustomer) {
      setShowCustomerModal(false)
      setCustomerModalError(null)
      setCustomerModalSuccess(false)
      // Reset form
      setCustomerFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        notes: '',
      })
      setCustomerVehicles([
        {
          category: '',
          make: '',
          model: '',
          year: '',
          licensePlate: '',
          color: '',
          vin: '',
          engineNumber: '',
          mileage: '',
          notes: '',
        },
      ])
    }
  }

  const handleCustomerFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerFormData(prev => ({ ...prev, [name]: value }))
  }

  const getAvailableModels = (makeName: string): ModelData[] => {
    const makeData = makesData.find(m => m.name === makeName)
    return makeData?.models || []
  }

  const getAvailableYears = (makeName: string, modelName: string): number[] => {
    const models = getAvailableModels(makeName)
    const model = models.find(m => m.name === modelName)
    return model?.years || []
  }

  const handleCustomerVehicleChange = (index: number, field: keyof VehicleFormData, value: string) => {
    const newVehicles = [...customerVehicles]
    newVehicles[index][field] = value

    // If make changes, reset category, model and year
    if (field === 'make') {
      newVehicles[index].category = ''
      newVehicles[index].model = ''
      newVehicles[index].year = ''
    }

    // If model changes, auto-populate category and reset year
    if (field === 'model') {
      newVehicles[index].year = ''
      if (newVehicles[index].make && value) {
        const models = getAvailableModels(newVehicles[index].make)
        const selectedModel = models.find(m => m.name === value)
        if (selectedModel) {
          newVehicles[index].category = selectedModel.category
        }
      }
    }

    setCustomerVehicles(newVehicles)
  }

  const handleAddCustomerVehicle = () => {
    setCustomerVehicles([
      ...customerVehicles,
      {
        category: '',
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        vin: '',
        engineNumber: '',
        mileage: '',
        notes: '',
      },
    ])
  }

  const handleRemoveCustomerVehicle = (index: number) => {
    if (customerVehicles.length > 1) {
      setCustomerVehicles(customerVehicles.filter((_, i) => i !== index))
    }
  }

  const validateCustomerForm = (): string | null => {
    if (!customerFormData.firstName.trim()) return 'First name is required'
    if (!customerFormData.lastName.trim()) return 'Last name is required'
    if (!customerFormData.email.trim()) return 'Email is required'
    if (!customerFormData.phoneNumber.trim()) return 'Phone number is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerFormData.email)) {
      return 'Please enter a valid email address'
    }

    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(customerFormData.phoneNumber) || customerFormData.phoneNumber.length < 10) {
      return 'Please enter a valid phone number (minimum 10 digits)'
    }

    const hasValidVehicle = customerVehicles.some(
      v => v.make && v.model && v.year && v.licensePlate.trim()
    )

    if (!hasValidVehicle) {
      return 'Please add at least one vehicle with make, model, year, and license plate'
    }

    return null
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCustomerModalError(null)

    const validationError = validateCustomerForm()
    if (validationError) {
      setCustomerModalError(validationError)
      return
    }

    setIsCreatingCustomer(true)

    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        throw new Error('User not authenticated')
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        throw new Error('Invalid user session')
      }

      const validVehicles = customerVehicles
        .filter(v => v.make && v.model && v.year && v.licensePlate.trim())
        .map(v => ({
          make: v.make,
          model: v.model,
          year: parseInt(v.year),
          licensePlate: v.licensePlate,
          color: v.color || undefined,
          vin: v.vin || undefined,
          engineNumber: v.engineNumber || undefined,
          currentMileage: v.mileage ? parseInt(v.mileage) : undefined,
          notes: v.notes || undefined,
        }))

      if (validVehicles.length === 0) {
        setCustomerModalError('Please add at least one vehicle with make, model, year, and license plate')
        setIsCreatingCustomer(false)
        return
      }

      const customerData: CreateCustomerInput = {
        garageId,
        firstName: customerFormData.firstName,
        lastName: customerFormData.lastName,
        email: customerFormData.email,
        phoneNumber: customerFormData.phoneNumber,
        alternatePhone: customerFormData.alternatePhone || undefined,
        address: customerFormData.address || undefined,
        city: customerFormData.city || undefined,
        state: customerFormData.state || undefined,
        zipCode: customerFormData.zipCode || undefined,
        country: customerFormData.country || undefined,
        notes: customerFormData.notes || undefined,
        vehicles: validVehicles,
      }

      const result = await createCustomerAction(customerData)

      if (!result.success || !result.customer) {
        throw new Error(result.error || 'Failed to create customer')
      }

      setCustomerModalSuccess(true)

      // Reload customers list
      await loadCustomers()

      // Auto-select the new customer
      setTimeout(() => {
        const newCustomer = customers.find(c => c.id === result.customer?.id)
        if (newCustomer) {
          setSelectedCustomer(newCustomer)
          setCustomerSearchQuery('')
        }
        handleCloseCustomerModal()
      }, 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setCustomerModalError(message)
      setIsCreatingCustomer(false)
    }
  }

  const validateForm = (): string | null => {
    if (!selectedCustomer) return 'Please select a customer'
    if (!selectedVehicle) return 'Please select a vehicle'
    if (!jobType) return 'Job type is required'
    if (!priority) return 'Priority is required'
    if (!customerComplaint.trim()) return 'Customer complaint is required'
    if (!workRequested.trim()) return 'Work requested is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        throw new Error('User not authenticated')
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        throw new Error('Invalid user session')
      }

      // Prepare job card data
      // Validation above ensures selectedCustomer and selectedVehicle are not null
      const jobCardData = {
        garageId,
        customerId: selectedCustomer!.id,
        vehicleId: selectedVehicle!.id,
        jobType,
        priority,
        customerComplaint,
        workRequested,
        customerNotes: customerNotes || undefined,
        currentMileage: currentMileage ? parseInt(currentMileage) : undefined,
        reportedIssue: reportedIssue || undefined,
        promisedDate: promisedDate || undefined,
        promisedTime: promisedTime || undefined,
        leadMechanicId: leadMechanicId || undefined,
        internalNotes: internalNotes || undefined,
        checklistItems: checklistItems.length > 0 ? checklistItems.map(item => ({
          mechanicId: leadMechanicId || null,
          itemName: item.itemName,
          description: item.description || null,
          category: item.category || null,
          status: 'pending' as const,
          priority: item.priority,
          estimatedMinutes: item.estimatedMinutes,
          actualMinutes: 0,
          isTimerRunning: false,
          timerStartedAt: null,
          totalTimeSpent: 0,
          laborRate: item.laborRate,
          laborCost: 0,
          displayOrder: item.displayOrder,
          mechanicNotes: null,
          notes: null,
          completedAt: null,
        })) : undefined,
      }

      // Call server action
      const result = await createJobCardAction(jobCardData)

      if (!result.success || !result.jobCard) {
        throw new Error(result.error || 'Failed to create job card')
      }

      console.log('Job card created successfully:', result.jobCard)

      setSuccess(true)

      // Redirect after short delay
      setTimeout(() => {
        router.push('/job-cards')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setIsLoading(false)
    }
  }

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName} ${customer.phoneNumber}`.toLowerCase()
      .includes(customerSearchQuery.toLowerCase())
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
              Create New Job Card
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Fill in the job details below
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-status-success/10 border-b border-status-success/30"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-status-success flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-status-success">Job Card Created Successfully!</p>
                <p className="text-sm text-status-success/80">Redirecting to job cards list...</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-status-error/10 border-b border-status-error/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
              <p className="text-sm text-status-error/80">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* ============================================================
              STEP 1: CUSTOMER DETAILS
          ============================================================ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gray-700 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-900">1. Customer Details</h2>
            </div>

            {!showAddCustomerForm ? (
              <>
                {/* Customer Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Search Customer <span className="text-status-error">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search by name or phone..."
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Customer List or Selected */}
                {!selectedCustomer ? (
                  <>
                    {/* Show search results only when searching */}
                    {customerSearchQuery.trim() !== '' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {isLoadingCustomers ? (
                          <div className="col-span-2 flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
                          </div>
                        ) : filteredCustomers.length === 0 ? (
                          <div className="col-span-2 text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <User className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-1">No matching customers found</p>
                            <p className="text-sm text-gray-500 mb-3">Add this customer to continue</p>
                          </div>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <motion.button
                              key={customer.id}
                              type="button"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleCustomerSelect(customer.id)}
                              className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-brand text-left transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {customer.firstName} {customer.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
                                  <p className="text-xs text-gray-500">{customer.vehicles.length} vehicles</p>
                                </div>
                              </div>
                            </motion.button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Add Customer Button - Always visible when not selected */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleOpenCustomerModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add New Customer
                      </button>
                    </div>
                  </>
                ) : (
                  /* Selected Customer Display */
                  <div className="bg-gradient-to-br from-brand/5 to-white rounded-xl border-2 border-brand/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-brand" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{selectedCustomer.phoneNumber}</p>
                          <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    You've chosen to add a new customer. For a complete experience, please use the
                    <button
                      type="button"
                      onClick={() => router.push('/customer-management/add')}
                      className="font-semibold underline mx-1"
                    >
                      Add Customer Page
                    </button>
                    first, then return to create the job card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerForm(false)}
                  className="text-gray-700 font-medium hover:underline"
                >
                  ← Back to customer search
                </button>
              </>
            )}
          </div>

          {/* ============================================================
              STEP 2: VEHICLE DETAILS
          ============================================================ */}
          {selectedCustomer && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gray-700 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">2. Vehicle Details</h2>
              </div>

              {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCustomer.vehicles.map((vehicle) => (
                    <motion.button
                      key={vehicle.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        selectedVehicle?.id === vehicle.id
                          ? "bg-brand/10 border-brand"
                          : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                          {vehicle.color && (
                            <p className="text-xs text-gray-500">{vehicle.color}</p>
                          )}
                        </div>
                        {selectedVehicle?.id === vehicle.id && (
                          <CheckCircle2 className="h-5 w-5 text-brand" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">No vehicles found for this customer</p>
                  <p className="text-sm text-gray-500">Please add a vehicle first</p>
                </div>
              )}

              {/* Current Mileage */}
              {selectedVehicle && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    placeholder={selectedVehicle.currentMileage?.toString() || "Enter current mileage"}
                    min="0"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              STEP 3: JOB DETAILS
          ============================================================ */}
          {selectedVehicle && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gray-700 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">3. Job Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Type <span className="text-status-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as JobType)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                    >
                      <option value="repair">Repair</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="routine">Routine Service</option>
                      <option value="custom">Custom Work</option>
                      <option value="diagnostic">Diagnostic</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Priority <span className="text-status-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Customer Complaint */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Complaint <span className="text-status-error">*</span>
                </label>
                <textarea
                  value={customerComplaint}
                  onChange={(e) => setCustomerComplaint(e.target.value)}
                  placeholder="Describe the customer's complaint..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Work Requested */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Work Requested <span className="text-status-error">*</span>
                </label>
                <textarea
                  value={workRequested}
                  onChange={(e) => setWorkRequested(e.target.value)}
                  placeholder="Describe the work that needs to be performed..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Reported Issue */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reported Issue (Technical)
                </label>
                <textarea
                  value={reportedIssue}
                  onChange={(e) => setReportedIssue(e.target.value)}
                  placeholder="Technical diagnosis or observed issue..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Customer Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Notes
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Any additional notes from the customer..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ============================================================
              STEP 4: CHECKLIST ITEMS
          ============================================================ */}
          {selectedVehicle && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gray-700 rounded-full" />
                  <h2 className="text-lg font-semibold text-gray-900">4. Task Checklist</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {checklistItems.length} {checklistItems.length === 1 ? 'task' : 'tasks'} added
                </span>
              </div>

              {/* Add Checklist Item Form */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5 mb-4">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Task</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Task Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Task Name <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentChecklistItem.itemName}
                      onChange={(e) => setCurrentChecklistItem({
                        ...currentChecklistItem,
                        itemName: e.target.value
                      })}
                      placeholder="e.g., Oil Change, Brake Inspection"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      value={currentChecklistItem.category}
                      onChange={(e) => setCurrentChecklistItem({
                        ...currentChecklistItem,
                        category: e.target.value
                      })}
                      placeholder="General"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        value={currentChecklistItem.priority}
                        onChange={(e) => setCurrentChecklistItem({
                          ...currentChecklistItem,
                          priority: e.target.value as ChecklistItem['priority']
                        })}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Est. Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentChecklistItem.estimatedMinutes}
                      onChange={(e) => setCurrentChecklistItem({
                        ...currentChecklistItem,
                        estimatedMinutes: parseInt(e.target.value) || 0
                      })}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Labor Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Labor Rate (₹/hr)
                    </label>
                    <input
                      type="number"
                      value={currentChecklistItem.laborRate}
                      onChange={(e) => setCurrentChecklistItem({
                        ...currentChecklistItem,
                        laborRate: parseInt(e.target.value) || 0
                      })}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={currentChecklistItem.description}
                      onChange={(e) => setCurrentChecklistItem({
                        ...currentChecklistItem,
                        description: e.target.value
                      })}
                      placeholder="Task description..."
                      rows={2}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Task to Checklist
                </button>
              </div>

              {/* Checklist Items List */}
              {checklistItems.length > 0 && (
                <div className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Settings className="h-4 w-4 text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{item.itemName}</p>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              item.priority === 'urgent' && "bg-red-100 text-red-700",
                              item.priority === 'high' && "bg-orange-100 text-orange-700",
                              item.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                              item.priority === 'low' && "bg-green-100 text-green-700"
                            )}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.estimatedMinutes} min • {item.category} • ₹{item.laborRate}/hr
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              STEP 5: SCHEDULING & ASSIGNMENT
          ============================================================ */}
          {selectedVehicle && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gray-700 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">5. Scheduling & Assignment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Promised Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Promised Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={promisedDate}
                      onChange={(e) => setPromisedDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Promised Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Promised Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={promisedTime}
                      onChange={(e) => setPromisedTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Lead Mechanic */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Lead Mechanic
                  </label>
                  <div className="relative">
                    <select
                      value={leadMechanicId}
                      onChange={(e) => setLeadMechanicId(e.target.value)}
                      disabled={isLoadingEmployees}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal notes for mechanics and staff..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ============================================================
              FORM ACTIONS
          ============================================================ */}
          {selectedVehicle && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => router.back()}
                disabled={isLoading || success}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading || success}
                className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Job Card...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Created Successfully!
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Create Job Card
                  </>
                )}
              </motion.button>
            </div>
          )}
        </form>
      </motion.div>

      {/* ============================================================================
          CUSTOMER MODAL
      ============================================================================ */}
      <AnimatePresence>
        {showCustomerModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCustomerModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
                      <p className="text-sm text-gray-600 mt-1">Fill in the customer details below</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseCustomerModal}
                      disabled={isCreatingCustomer}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Success Message */}
                  {customerModalSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-6 mt-4 p-4 bg-status-success/10 border border-status-success/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-status-success flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-status-success">Customer Added Successfully!</p>
                          <p className="text-sm text-status-success/80">Selecting customer and closing modal...</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {customerModalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-6 mt-4 p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
                        <p className="text-sm text-status-error/80">{customerModalError}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleCreateCustomer} className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            First Name <span className="text-status-error">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={customerFormData.firstName}
                            onChange={handleCustomerFieldChange}
                            placeholder="John"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Last Name <span className="text-status-error">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={customerFormData.lastName}
                            onChange={handleCustomerFieldChange}
                            placeholder="Doe"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address <span className="text-status-error">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              required
                              value={customerFormData.email}
                              onChange={handleCustomerFieldChange}
                              placeholder="john.doe@example.com"
                              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone Number <span className="text-status-error">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              name="phoneNumber"
                              required
                              value={customerFormData.phoneNumber}
                              onChange={handleCustomerFieldChange}
                              placeholder="+91 98765 43210"
                              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Alternate Phone
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              name="alternatePhone"
                              value={customerFormData.alternatePhone}
                              onChange={handleCustomerFieldChange}
                              placeholder="+91 98765 43211"
                              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Street Address
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <textarea
                              name="address"
                              value={customerFormData.address}
                              onChange={handleCustomerFieldChange}
                              placeholder="123 Main Street, Apt 4B"
                              rows={2}
                              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={customerFormData.city}
                            onChange={handleCustomerFieldChange}
                            placeholder="Bangalore"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={customerFormData.state}
                            onChange={handleCustomerFieldChange}
                            placeholder="Karnataka"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={customerFormData.zipCode}
                            onChange={handleCustomerFieldChange}
                            placeholder="560001"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={customerFormData.country}
                            onChange={handleCustomerFieldChange}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vehicles */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                        <button
                          type="button"
                          onClick={handleAddCustomerVehicle}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          Add Vehicle
                        </button>
                      </div>

                      {isLoadingMakes ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerVehicles.map((vehicle, index) => (
                            <div
                              key={index}
                              className="relative bg-gray-50 rounded-xl border-2 border-gray-200 p-4"
                            >
                              {customerVehicles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomerVehicle(index)}
                                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}

                              <div className="flex items-center gap-2 mb-3">
                                <MotorcycleIcon className="h-5 w-5 text-gray-700" />
                                <h4 className="font-semibold text-gray-900">Vehicle {index + 1}</h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Make <span className="text-status-error">*</span>
                                  </label>
                                  <select
                                    value={vehicle.make}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'make', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer pr-10"
                                  >
                                    <option value="">Select Make</option>
                                    {makesData.map((make) => (
                                      <option key={make.id} value={make.name}>
                                        {make.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Model <span className="text-status-error">*</span>
                                  </label>
                                  <select
                                    value={vehicle.model}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'model', e.target.value)}
                                    disabled={!vehicle.make}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                                  >
                                    <option value="">Select Model</option>
                                    {getAvailableModels(vehicle.make).map((model) => (
                                      <option key={model.id} value={model.name}>
                                        {model.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Year <span className="text-status-error">*</span>
                                  </label>
                                  <select
                                    value={vehicle.year}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'year', e.target.value)}
                                    disabled={!vehicle.model}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                                  >
                                    <option value="">Select Year</option>
                                    {getAvailableYears(vehicle.make, vehicle.model)
                                      .slice()
                                      .reverse()
                                      .map((year) => (
                                        <option key={year} value={year.toString()}>
                                          {year}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Category
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.category}
                                    readOnly
                                    placeholder="Auto-populated"
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 cursor-default"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    License Plate <span className="text-status-error">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.licensePlate}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'licensePlate', e.target.value)}
                                    placeholder="KA 01 AB 1234"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Color
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.color}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'color', e.target.value)}
                                    placeholder="Pearl White"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Current Mileage (km)
                                  </label>
                                  <input
                                    type="number"
                                    value={vehicle.mileage}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'mileage', e.target.value)}
                                    placeholder="12000"
                                    min="0"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        value={customerFormData.notes}
                        onChange={handleCustomerFieldChange}
                        placeholder="Any additional notes about the customer..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseCustomerModal}
                        disabled={isCreatingCustomer || customerModalSuccess}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingCustomer || customerModalSuccess}
                        className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isCreatingCustomer ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Adding Customer...
                          </>
                        ) : customerModalSuccess ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Added Successfully!
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Select
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
