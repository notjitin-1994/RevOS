'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Car,
  Tool,
  CalendarCheck,
  ClipboardCheck,
  Eye,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  SprayCan,
  Scan,
  Settings2,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createJobCardAction } from '@/app/actions/job-card-actions'
import { getMakesDataAction } from '@/app/actions/motorcycle-actions'
import { createCustomerAction, type CreateCustomerInput } from '@/app/actions/customer-actions'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

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
type JobStatus = 'draft' | 'queued'
type TabValue = 'customer' | 'job-details' | 'tasks' | 'scheduling' | 'review'

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

interface TabValidation {
  customer: boolean
  jobDetails: boolean
  tasks: boolean
  scheduling: boolean
  review: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreateJobCardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('customer')
  const [tabErrors, setTabErrors] = useState<Record<string, string>>({})

  // Validation state
  const [tabValidation, setTabValidation] = useState<TabValidation>({
    customer: false,
    jobDetails: false,
    tasks: true,
    scheduling: true,
    review: false,
  })

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

  const [customerVehicles, setCustomerVehicles] = useState<VehicleFormData[]>([{
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
  }])

  // Employees state
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Job details states
  const [jobType, setJobType] = useState<JobType>('repair')
  const [priority, setPriority] = useState<Priority>('medium')
  const [initialStatus, setInitialStatus] = useState<JobStatus>('draft')
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
  const [serviceAdvisorId, setServiceAdvisorId] = useState('')

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
    displayOrder: 1,
  })

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user')
    if (!sessionUser) {
      router.push('/login')
      return
    }

    loadCustomers()
    loadEmployees()
    loadMakes()
  }, [router])

  useEffect(() => {
    if (selectedCustomer?.vehicles && selectedCustomer.vehicles.length > 0) {
      setSelectedVehicle(selectedCustomer.vehicles[0])
    } else {
      setSelectedVehicle(null)
    }
  }, [selectedCustomer])

  // Update validation state when form data changes
  useEffect(() => {
    setTabValidation({
      customer: !!selectedCustomer && !!selectedVehicle,
      jobDetails: !!jobType && !!priority && customerComplaint.trim() !== '' && workRequested.trim() !== '',
      tasks: true,
      scheduling: true,
      review: false,
    })
  }, [selectedCustomer, selectedVehicle, jobType, priority, customerComplaint, workRequested])

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
  // VALIDATION
  // ============================================================================

  const validateCustomerTab = useCallback((): boolean => {
    if (!selectedCustomer) {
      setTabErrors(prev => ({ ...prev, customer: 'Please select a customer' }))
      return false
    }
    if (!selectedVehicle) {
      setTabErrors(prev => ({ ...prev, customer: 'Please select a vehicle' }))
      return false
    }
    setTabErrors(prev => ({ ...prev, customer: '' }))
    return true
  }, [selectedCustomer, selectedVehicle])

  const validateJobDetailsTab = useCallback((): boolean => {
    if (!customerComplaint.trim()) {
      setTabErrors(prev => ({ ...prev, jobDetails: 'Customer complaint is required' }))
      return false
    }
    if (!workRequested.trim()) {
      setTabErrors(prev => ({ ...prev, jobDetails: 'Work requested is required' }))
      return false
    }
    setTabErrors(prev => ({ ...prev, jobDetails: '' }))
    return true
  }, [customerComplaint, workRequested])

  const validateTasksTab = useCallback((): boolean => {
    setTabErrors(prev => ({ ...prev, tasks: '' }))
    return true
  }, [])

  const validateSchedulingTab = useCallback((): boolean => {
    setTabErrors(prev => ({ ...prev, scheduling: '' }))
    return true
  }, [])

  const validateReviewTab = useCallback((): boolean => {
    const allValid =
      validateCustomerTab() &&
      validateJobDetailsTab()

    if (!allValid) {
      setTabErrors(prev => ({ ...prev, review: 'Please complete all required fields' }))
      return false
    }

    setTabErrors(prev => ({ ...prev, review: '' }))
    return true
  }, [validateCustomerTab, validateJobDetailsTab])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTabChange = (value: string) => {
    // Validate current tab before allowing navigation
    if (activeTab === 'customer' && value !== 'customer') {
      if (!validateCustomerTab()) return
    }
    if (activeTab === 'job-details' && value !== 'job-details') {
      if (!validateJobDetailsTab()) return
    }

    setActiveTab(value as TabValue)
  }

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

  // Customer Modal Handlers (preserved from original)
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
      setCustomerVehicles([{
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
      }])
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

    if (field === 'make') {
      newVehicles[index].category = ''
      newVehicles[index].model = ''
      newVehicles[index].year = ''
    }

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
      await loadCustomers()

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

  // Calculate estimated costs
  const calculateEstimatedCosts = useCallback(() => {
    let totalLaborMinutes = 0
    let totalLaborCost = 0

    checklistItems.forEach(item => {
      totalLaborMinutes += item.estimatedMinutes
      totalLaborCost += (item.estimatedMinutes / 60) * item.laborRate
    })

    return {
      totalLaborMinutes,
      totalLaborHours: (totalLaborMinutes / 60).toFixed(1),
      totalLaborCost: totalLaborCost.toFixed(2),
      totalCost: totalLaborCost.toFixed(2),
    }
  }, [checklistItems])

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault()
    setError(null)

    if (!validateReviewTab()) {
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

      const jobCardData = {
        garageId,
        customerId: selectedCustomer!.id,
        vehicleId: selectedVehicle!.id,
        jobType,
        priority,
        status: saveAsDraft ? 'draft' : initialStatus,
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

      const result = await createJobCardAction(jobCardData)

      if (!result.success || !result.jobCard) {
        throw new Error(result.error || 'Failed to create job card')
      }

      console.log('Job card created successfully:', result.jobCard)

      setSuccess(true)

      setTimeout(() => {
        router.push('/job-cards')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setIsLoading(false)
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName} ${customer.phoneNumber}`.toLowerCase()
      .includes(customerSearchQuery.toLowerCase())
  )

  const getJobTypeIcon = (type: JobType) => {
    switch (type) {
      case 'repair':
        return <Wrench className="h-5 w-5" />
      case 'maintenance':
        return <Settings className="h-5 w-5" />
      case 'routine':
        return <SprayCan className="h-5 w-5" />
      case 'custom':
        return <Settings2 className="h-5 w-5" />
      case 'diagnostic':
        return <Scan className="h-5 w-5" />
    }
  }

  const getJobTypeLabel = (type: JobType) => {
    switch (type) {
      case 'repair':
        return 'Repair'
      case 'maintenance':
        return 'Maintenance'
      case 'routine':
        return 'Routine Service'
      case 'custom':
        return 'Custom Work'
      case 'diagnostic':
        return 'Diagnostic'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  const getPriorityBgColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
    }
  }

  const tabs = [
    { value: 'customer', label: 'Customer', icon: User },
    { value: 'job-details', label: 'Details', icon: FileText },
    { value: 'tasks', label: 'Tasks', icon: ClipboardCheck },
    { value: 'scheduling', label: 'Schedule', icon: CalendarCheck },
    { value: 'review', label: 'Review', icon: Eye },
  ] as const

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div className="h-10 w-1 bg-graphite-700 rounded-full" />
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-graphite-900 tracking-tight">
              Create Job Card
            </h1>
            <p className="text-sm md:text-base text-graphite-600 mt-1">
              Follow the steps to create a comprehensive job card
            </p>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-6 bg-status-success/10 border border-status-success/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-status-success flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-status-success text-lg">Job Card Created Successfully!</p>
                <p className="text-sm text-status-success/80">Redirecting to job cards list...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
              <p className="text-sm text-status-error/80">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.value}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    const tabIndex = tabs.findIndex(t => t.value === activeTab)
                    const targetIndex = tabs.findIndex(t => t.value === tab.value)

                    // Allow navigation back to previous tabs, or forward if current tab is validated
                    if (targetIndex < tabIndex || (targetIndex === tabIndex + 1 && tabValidation[activeTab as keyof TabValidation])) {
                      handleTabChange(tab.value)
                    }
                  }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200",
                    activeTab === tab.value
                      ? "bg-brand text-graphite-900 scale-110 shadow-glow"
                      : tabValidation[tab.value as keyof TabValidation]
                      ? "bg-status-success text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {tabValidation[tab.value as keyof TabValidation] && activeTab !== tab.value ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <tab.icon className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={cn(
                    "text-xs font-medium mt-2 hidden sm:block",
                    activeTab === tab.value ? "text-brand" : "text-gray-600"
                  )}
                >
                  {tab.label}
                </span>
              </div>
              {index < tabs.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
                    tabValidation[tab.value as keyof TabValidation]
                      ? "bg-status-success"
                      : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Tabs Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6 pt-6">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.value
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === 'customer' && (
            <TabCustomer
              customers={customers}
              selectedCustomer={selectedCustomer}
              selectedVehicle={selectedVehicle}
              customerSearchQuery={customerSearchQuery}
              setCustomerSearchQuery={setCustomerSearchQuery}
              isLoadingCustomers={isLoadingCustomers}
              onCustomerSelect={handleCustomerSelect}
              onVehicleSelect={setSelectedVehicle}
              onOpenCustomerModal={handleOpenCustomerModal}
              currentMileage={currentMileage}
              setCurrentMileage={setCurrentMileage}
              onNextTab={() => handleTabChange('job-details')}
              tabError={tabErrors.customer}
              tabValidation={tabValidation.customer}
            />
          )}

          {activeTab === 'job-details' && (
            <TabJobDetails
              jobType={jobType}
              setJobType={setJobType}
              priority={priority}
              setPriority={setPriority}
              initialStatus={initialStatus}
              setInitialStatus={setInitialStatus}
              customerComplaint={customerComplaint}
              setCustomerComplaint={setCustomerComplaint}
              workRequested={workRequested}
              setWorkRequested={setWorkRequested}
              customerNotes={customerNotes}
              setCustomerNotes={setCustomerNotes}
              reportedIssue={setReportedIssue}
              onPreviousTab={() => handleTabChange('customer')}
              onNextTab={() => handleTabChange('tasks')}
              tabError={tabErrors.jobDetails}
              getJobTypeIcon={getJobTypeIcon}
              getJobTypeLabel={getJobTypeLabel}
              getPriorityColor={getPriorityColor}
              getPriorityBgColor={getPriorityBgColor}
            />
          )}

          {activeTab === 'tasks' && (
            <TabTasks
              checklistItems={checklistItems}
              currentChecklistItem={currentChecklistItem}
              setCurrentChecklistItem={setCurrentChecklistItem}
              onAddItem={handleAddChecklistItem}
              onRemoveItem={handleRemoveChecklistItem}
              onPreviousTab={() => handleTabChange('job-details')}
              onNextTab={() => handleTabChange('scheduling')}
              getPriorityColor={getPriorityColor}
              calculateEstimatedCosts={calculateEstimatedCosts}
            />
          )}

          {activeTab === 'scheduling' && (
            <TabScheduling
              promisedDate={promisedDate}
              setPromisedDate={setPromisedDate}
              promisedTime={promisedTime}
              setPromisedTime={setPromisedTime}
              leadMechanicId={leadMechanicId}
              setLeadMechanicId={setLeadMechanicId}
              serviceAdvisorId={serviceAdvisorId}
              setServiceAdvisorId={setServiceAdvisorId}
              employees={employees}
              isLoadingEmployees={isLoadingEmployees}
              internalNotes={internalNotes}
              setInternalNotes={setInternalNotes}
              onPreviousTab={() => handleTabChange('tasks')}
              onNextTab={() => handleTabChange('review')}
            />
          )}

          {activeTab === 'review' && (
            <TabReview
              selectedCustomer={selectedCustomer}
              selectedVehicle={selectedVehicle}
              jobType={jobType}
              priority={priority}
              initialStatus={initialStatus}
              customerComplaint={customerComplaint}
              workRequested={workRequested}
              checklistItems={checklistItems}
              promisedDate={promisedDate}
              promisedTime={promisedTime}
              leadMechanicId={leadMechanicId}
              serviceAdvisorId={serviceAdvisorId}
              employees={employees}
              currentMileage={currentMileage}
              onPreviousTab={() => handleTabChange('scheduling')}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              success={success}
              tabError={tabErrors.review}
              getJobTypeLabel={getJobTypeLabel}
              getPriorityColor={getPriorityColor}
              calculateEstimatedCosts={calculateEstimatedCosts}
            />
          )}
        </div>
      </motion.div>

      {/* ============================================================================
          CUSTOMER MODAL (Preserved from original)
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-status-error">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={customerFormData.firstName}
                            onChange={handleCustomerFieldChange}
                            placeholder="John"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-status-error">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={customerFormData.lastName}
                            onChange={handleCustomerFieldChange}
                            placeholder="Doe"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={customerFormData.city}
                            onChange={handleCustomerFieldChange}
                            placeholder="Bangalore"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={customerFormData.state}
                            onChange={handleCustomerFieldChange}
                            placeholder="Karnataka"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={customerFormData.zipCode}
                            onChange={handleCustomerFieldChange}
                            placeholder="560001"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={customerFormData.country}
                            onChange={handleCustomerFieldChange}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
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
                          className="flex items-center gap-2 px-4 py-2 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all text-sm"
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
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Make <span className="text-status-error">*</span>
                                  </label>
                                  <select
                                    value={vehicle.make}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'make', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
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
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model <span className="text-status-error">*</span>
                                  </label>
                                  <select
                                    value={vehicle.model}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'model', e.target.value)}
                                    disabled={!vehicle.make}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year <span className="text-status-error">*</span>
                                  </label>
                                  <select
                                    value={vehicle.year}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'year', e.target.value)}
                                    disabled={!vehicle.model}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.category}
                                    readOnly
                                    placeholder="Auto-populated"
                                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-900 cursor-default"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    License Plate <span className="text-status-error">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.licensePlate}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'licensePlate', e.target.value)}
                                    placeholder="KA 01 AB 1234"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.color}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'color', e.target.value)}
                                    placeholder="Pearl White"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Mileage (km)
                                  </label>
                                  <input
                                    type="number"
                                    value={vehicle.mileage}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'mileage', e.target.value)}
                                    placeholder="12000"
                                    min="0"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        value={customerFormData.notes}
                        onChange={handleCustomerFieldChange}
                        placeholder="Any additional notes about the customer..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseCustomerModal}
                        disabled={isCreatingCustomer || customerModalSuccess}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingCustomer || customerModalSuccess}
                        className="flex-1 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            Add Customer
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

// ============================================================================
// TAB COMPONENTS
// ============================================================================

// Tab 1: Customer & Vehicle
function TabCustomer({
  customers,
  selectedCustomer,
  selectedVehicle,
  customerSearchQuery,
  setCustomerSearchQuery,
  isLoadingCustomers,
  onCustomerSelect,
  onVehicleSelect,
  onOpenCustomerModal,
  currentMileage,
  setCurrentMileage,
  onNextTab,
  tabError,
  tabValidation,
}: {
  customers: CustomerData[]
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
  customerSearchQuery: string
  setCustomerSearchQuery: (value: string) => void
  isLoadingCustomers: boolean
  onCustomerSelect: (id: string) => void
  onVehicleSelect: (vehicle: VehicleData) => void
  onOpenCustomerModal: () => void
  currentMileage: string
  setCurrentMileage: (value: string) => void
  onNextTab: () => void
  tabError?: string
  tabValidation: boolean
}) {
  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName} ${customer.phoneNumber}`.toLowerCase()
      .includes(customerSearchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-1 bg-graphite-700 rounded-full" />
        <h2 className="text-xl font-semibold text-graphite-900">Customer & Vehicle Information</h2>
      </div>

      {tabError && (
        <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
            <p className="text-sm text-status-error/80">{tabError}</p>
          </div>
        </div>
      )}

      {/* Customer Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>

        {!selectedCustomer ? (
          <>
            {/* Customer Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Search Customer <span className="text-status-error">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Customer Results */}
            {customerSearchQuery.trim() !== '' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto mb-4">
                {isLoadingCustomers ? (
                  <div className="col-span-2 flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-graphite-700" />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="col-span-2 text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <User className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-graphite-600 mb-1">No matching customers found</p>
                    <p className="text-sm text-gray-500 mb-3">Add a new customer to continue</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <motion.button
                      key={customer.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onCustomerSelect(customer.id)}
                      className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-brand text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-graphite-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-graphite-900 truncate">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-sm text-graphite-600">{customer.phoneNumber}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            )}

            {/* Add Customer Button */}
            <button
              type="button"
              onClick={onOpenCustomerModal}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Add New Customer
            </button>
          </>
        ) : (
          <div className="mb-6 bg-gradient-to-br from-brand/5 to-white rounded-xl border-2 border-brand/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <p className="font-bold text-graphite-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-sm text-graphite-600">{selectedCustomer.phoneNumber}</p>
                  <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCustomerSelect('')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-graphite-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Section */}
      {selectedCustomer && (
        <div>
          <h3 className="text-lg font-semibold text-graphite-900 mb-4">Vehicle Information</h3>

          {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {selectedCustomer.vehicles.map((vehicle) => (
                <motion.button
                  key={vehicle.id}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onVehicleSelect(vehicle)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedVehicle?.id === vehicle.id
                      ? "bg-brand/10 border-brand"
                      : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Car className="h-5 w-5 text-graphite-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-graphite-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-graphite-600">{vehicle.licensePlate}</p>
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
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-4">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-graphite-600 mb-1">No vehicles found for this customer</p>
              <p className="text-sm text-gray-500">Please add a vehicle first</p>
            </div>
          )}

          {/* Current Mileage */}
          {selectedVehicle && (
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Current Mileage (km)
              </label>
              <input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                placeholder={selectedVehicle.currentMileage?.toString() || "Enter current mileage"}
                min="0"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onNextTab}
          disabled={!tabValidation}
          className="flex items-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Job Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Tab 2: Job Details
function TabJobDetails({
  jobType,
  setJobType,
  priority,
  setPriority,
  initialStatus,
  setInitialStatus,
  customerComplaint,
  setCustomerComplaint,
  workRequested,
  setWorkRequested,
  customerNotes,
  setCustomerNotes,
  reportedIssue,
  setReportedIssue,
  onPreviousTab,
  onNextTab,
  tabError,
  getJobTypeIcon,
  getJobTypeLabel,
  getPriorityColor,
  getPriorityBgColor,
}: {
  jobType: JobType
  setJobType: (type: JobType) => void
  priority: Priority
  setPriority: (priority: Priority) => void
  initialStatus: JobStatus
  setInitialStatus: (status: JobStatus) => void
  customerComplaint: string
  setCustomerComplaint: (value: string) => void
  workRequested: string
  setWorkRequested: (value: string) => void
  customerNotes: string
  setCustomerNotes: (value: string) => void
  reportedIssue: string
  setReportedIssue: (value: string) => void
  onPreviousTab: () => void
  onNextTab: () => void
  tabError?: string
  getJobTypeIcon: (type: JobType) => React.ReactNode
  getJobTypeLabel: (type: JobType) => string
  getPriorityColor: (priority: Priority) => string
  getPriorityBgColor: (priority: Priority) => string
}) {
  const jobTypes: JobType[] = ['repair', 'maintenance', 'routine', 'custom', 'diagnostic']
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']
  const statuses: JobStatus[] = ['draft', 'queued']

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-1 bg-graphite-700 rounded-full" />
        <h2 className="text-xl font-semibold text-graphite-900">Job Details</h2>
      </div>

      {tabError && (
        <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
            <p className="text-sm text-status-error/80">{tabError}</p>
          </div>
        </div>
      )}

      {/* Job Type Selection */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-3">
          Job Type <span className="text-status-error">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {jobTypes.map((type) => (
            <motion.button
              key={type}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setJobType(type)}
              className={cn(
                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                jobType === type
                  ? "bg-brand/10 border-brand shadow-glow"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div className={cn(jobType === type ? "text-brand" : "text-gray-600")}>
                {getJobTypeIcon(type)}
              </div>
              <span className={cn(
                "text-sm font-medium text-center",
                jobType === type ? "text-brand font-bold" : "text-gray-700"
              )}>
                {getJobTypeLabel(type)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Initial Status */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-3">
          Initial Status
        </label>
        <div className="flex gap-3">
          {statuses.map((status) => (
            <motion.button
              key={status}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setInitialStatus(status)}
              className={cn(
                "px-6 py-3 rounded-xl border-2 font-medium text-sm transition-all capitalize flex-1",
                initialStatus === status
                  ? "bg-brand/10 border-brand text-graphite-900"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {status.replace('_', ' ')}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Priority Selection */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-3">
          Priority Level <span className="text-status-error">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {priorities.map((prio) => (
            <motion.button
              key={prio}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPriority(prio)}
              className={cn(
                "px-6 py-3 rounded-xl border-2 font-semibold capitalize transition-all flex items-center gap-2",
                priority === prio
                  ? getPriorityColor(prio)
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              )}
            >
              {priority === prio && (
                <div className={cn("h-2 w-2 rounded-full", getPriorityBgColor(prio))} />
              )}
              {prio}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Customer Complaint */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Customer Complaint <span className="text-status-error">*</span>
        </label>
        <textarea
          value={customerComplaint}
          onChange={(e) => setCustomerComplaint(e.target.value)}
          placeholder="Describe the customer's complaint... (e.g., 'Engine making strange noise when accelerating', 'Brake pads squeaking', 'Oil leakage noticed')"
          rows={3}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Work Requested */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Work Requested <span className="text-status-error">*</span>
        </label>
        <textarea
          value={workRequested}
          onChange={(e) => setWorkRequested(e.target.value)}
          placeholder="Describe the work that needs to be performed... (e.g., 'Full service including oil change', 'Replace brake pads and rotors', 'Diagnose engine noise')"
          rows={3}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Reported Issue */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Reported Issue (Technical Diagnosis)
        </label>
        <textarea
          value={reportedIssue}
          onChange={(e) => setReportedIssue(e.target.value)}
          placeholder="Technical diagnosis or observed issue... (e.g., 'Worn brake pads at 3mm', 'Oil leak from valve cover gasket', 'Timing belt showing signs of wear')"
          rows={2}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Customer Notes */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Customer Notes
        </label>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="Any additional notes from the customer..."
          rows={2}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPreviousTab}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-graphite-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNextTab}
          className="flex items-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          Next: Tasks
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Tab 3: Tasks & Checklist
function TabTasks({
  checklistItems,
  currentChecklistItem,
  setCurrentChecklistItem,
  onAddItem,
  onRemoveItem,
  onPreviousTab,
  onNextTab,
  getPriorityColor,
  calculateEstimatedCosts,
}: {
  checklistItems: ChecklistItem[]
  currentChecklistItem: ChecklistItem
  setCurrentChecklistItem: (item: ChecklistItem) => void
  onAddItem: () => void
  onRemoveItem: (id: string) => void
  onPreviousTab: () => void
  onNextTab: () => void
  getPriorityColor: (priority: Priority) => string
  calculateEstimatedCosts: () => { totalLaborMinutes: number; totalLaborHours: string; totalLaborCost: string; totalCost: string }
}) {
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']

  const costs = calculateEstimatedCosts()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-graphite-700 rounded-full" />
          <h2 className="text-xl font-semibold text-graphite-900">Tasks & Checklist</h2>
        </div>
        <span className="text-sm text-graphite-600">
          {checklistItems.length} {checklistItems.length === 1 ? 'task' : 'tasks'} added
        </span>
      </div>

      {/* Task Summary Cards */}
      {checklistItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{checklistItems.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Total Time</p>
            <p className="text-2xl font-bold text-gray-900">{Math.floor(costs.totalLaborMinutes / 60)}h {costs.totalLaborMinutes % 60}m</p>
          </div>
          <div className="col-span-2 bg-brand/10 rounded-xl p-4 border-2 border-brand/30">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Est. Total Cost</p>
            <p className="text-2xl font-bold text-brand">₹{costs.totalCost}</p>
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Add New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Task Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((prio) => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setCurrentChecklistItem({
                    ...currentChecklistItem,
                    priority: prio
                  })}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 font-medium text-xs transition-all capitalize",
                    currentChecklistItem.priority === prio
                      ? getPriorityColor(prio)
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  )}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          {/* Labor Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Task to Checklist
        </button>
      </div>

      {/* Task List */}
      {checklistItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Tasks Added</h4>
          {checklistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-gray-200"
            >
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <Tool className="h-4 w-4 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{item.itemName}</p>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                      getPriorityColor(item.priority)
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
                onClick={() => onRemoveItem(item.id)}
                className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPreviousTab}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-graphite-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNextTab}
          className="flex items-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          Next: Scheduling
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Tab 4: Scheduling & Assignment
function TabScheduling({
  promisedDate,
  setPromisedDate,
  promisedTime,
  setPromisedTime,
  leadMechanicId,
  setLeadMechanicId,
  serviceAdvisorId,
  setServiceAdvisorId,
  employees,
  isLoadingEmployees,
  internalNotes,
  setInternalNotes,
  onPreviousTab,
  onNextTab,
}: {
  promisedDate: string
  setPromisedDate: (value: string) => void
  promisedTime: string
  setPromisedTime: (value: string) => void
  leadMechanicId: string
  setLeadMechanicId: (value: string) => void
  serviceAdvisorId: string
  setServiceAdvisorId: (value: string) => void
  employees: EmployeeData[]
  isLoadingEmployees: boolean
  internalNotes: string
  setInternalNotes: (value: string) => void
  onPreviousTab: () => void
  onNextTab: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-1 bg-graphite-700 rounded-full" />
        <h2 className="text-xl font-semibold text-graphite-900">Scheduling & Assignment</h2>
      </div>

      {/* Promised Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-2">
            Promised Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={promisedDate}
              onChange={(e) => setPromisedDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-2">
            Promised Time
          </label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="time"
              value={promisedTime}
              onChange={(e) => setPromisedTime(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Scheduling Summary */}
      {(promisedDate || promisedTime) && (
        <div className="bg-status-info/10 border border-status-info/30 rounded-xl p-4">
          <p className="font-medium text-status-info">
            {promisedDate && `Job promised for ${new Date(promisedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            {promisedDate && promisedTime && ' at '}
            {promisedTime && promisedTime}
          </p>
        </div>
      )}

      {/* Staff Assignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-2">
            Service Advisor
          </label>
          <div className="relative">
            <select
              value={serviceAdvisorId}
              onChange={(e) => setServiceAdvisorId(e.target.value)}
              disabled={isLoadingEmployees}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-2">
            Lead Mechanic
          </label>
          <div className="relative">
            <select
              value={leadMechanicId}
              onChange={(e) => setLeadMechanicId(e.target.value)}
              disabled={isLoadingEmployees}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Internal Notes
        </label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes for mechanics and staff..."
          rows={3}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPreviousTab}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-graphite-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNextTab}
          className="flex items-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          Next: Review
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Tab 5: Review & Create
function TabReview({
  selectedCustomer,
  selectedVehicle,
  jobType,
  priority,
  initialStatus,
  customerComplaint,
  workRequested,
  checklistItems,
  promisedDate,
  promisedTime,
  leadMechanicId,
  serviceAdvisorId,
  employees,
  currentMileage,
  onPreviousTab,
  onSubmit,
  isLoading,
  success,
  tabError,
  getJobTypeLabel,
  getPriorityColor,
  calculateEstimatedCosts,
}: {
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
  jobType: JobType
  priority: Priority
  initialStatus: JobStatus
  customerComplaint: string
  workRequested: string
  checklistItems: ChecklistItem[]
  promisedDate: string
  promisedTime: string
  leadMechanicId: string
  serviceAdvisorId: string
  employees: EmployeeData[]
  currentMileage: string
  onPreviousTab: () => void
  onSubmit: (e: React.FormEvent, saveAsDraft: boolean) => void
  isLoading: boolean
  success: boolean
  tabError?: string
  getJobTypeLabel: (type: JobType) => string
  getPriorityColor: (priority: Priority) => string
  calculateEstimatedCosts: () => { totalLaborMinutes: number; totalLaborHours: string; totalLaborCost: string; totalCost: string }
}) {
  const leadMechanic = employees.find(e => e.id === leadMechanicId)
  const serviceAdvisor = employees.find(e => e.id === serviceAdvisorId)
  const costs = calculateEstimatedCosts()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={(e) => onSubmit(e, false)} className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1 bg-graphite-700 rounded-full" />
          <h2 className="text-xl font-semibold text-graphite-900">Review & Create</h2>
        </div>

        {tabError && (
          <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
              <p className="text-sm text-status-error/80">{tabError}</p>
            </div>
          </div>
        )}

        {/* Summary Sections */}
        <div className="space-y-6">
          {/* Customer & Vehicle Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer & Vehicle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer</p>
                <p className="font-medium text-gray-900">
                  {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedCustomer?.phoneNumber}</p>
                <p className="text-sm text-gray-500">{selectedCustomer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                <p className="font-medium text-gray-900">
                  {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                </p>
                <p className="text-sm text-gray-600">{selectedVehicle?.licensePlate}</p>
                {currentMileage && (
                  <p className="text-sm text-gray-500">Current Mileage: {currentMileage} km</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Details Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Job Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <p className="font-medium text-gray-900">{getJobTypeLabel(jobType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Priority</p>
                <span className={cn("inline-block px-2 py-1 rounded-full text-xs font-medium capitalize", getPriorityColor(priority))}>
                  {priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-medium text-gray-900 capitalize">{initialStatus.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tasks</p>
                <p className="font-medium text-gray-900">{checklistItems.length} items</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Complaint</p>
                <p className="text-sm text-gray-900">{customerComplaint}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Work Requested</p>
                <p className="text-sm text-gray-900">{workRequested}</p>
              </div>
            </div>
          </div>

          {/* Tasks Summary */}
          {checklistItems.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Tasks & Cost Estimate
              </h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {checklistItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-xs text-gray-500">{item.estimatedMinutes} min • {item.category}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{((item.estimatedMinutes / 60) * item.laborRate).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-900">Total Estimated Cost</span>
                <span className="text-xl font-bold text-brand">
                  ₹{costs.totalCost}
                </span>
              </div>
            </div>
          )}

          {/* Scheduling Summary */}
          {(promisedDate || promisedTime || leadMechanicId || serviceAdvisorId) && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                Scheduling & Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promisedDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Promised Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(promisedDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
                {promisedTime && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Promised Time</p>
                    <p className="font-medium text-gray-900">{promisedTime}</p>
                  </div>
                )}
                {serviceAdvisorId && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Advisor</p>
                    <p className="font-medium text-gray-900">
                      {serviceAdvisor?.firstName} {serviceAdvisor?.lastName}
                    </p>
                  </div>
                )}
                {leadMechanicId && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lead Mechanic</p>
                    <p className="font-medium text-gray-900">
                      {leadMechanic?.firstName} {leadMechanic?.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={onPreviousTab}
            disabled={isLoading || success}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={(e) => onSubmit(e as React.FormEvent, true)}
            disabled={isLoading || success}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading || success}
            className="flex-1 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </form>
    </motion.div>
  )
}
