'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  User,
  Wrench,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical,
  Plus,
  Search,
  ChevronDown,
  Package,
  DollarSign,
  MessageSquare,
  Paperclip,
  History,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Job Card Detail Page
 *
 * Comprehensive view of a single job card with:
 * - Job card header with actions
 * - Customer and vehicle information
 * - Job details and notes
 * - Checklist and progress tracking
 * - Parts and costs breakdown
 * - Timeline and activity
 * - Comments and attachments
 */

// Types based on the API response
interface JobCardDetail {
  id: string
  jobCardNumber: string
  jobType: string
  priority: string
  status: string
  customerComplaint: string | null
  workRequested: string | null
  customerNotes: string | null
  currentMileage: number | null
  reportedIssue: string | null
  promisedDate: string | null
  promisedTime: string | null
  actualCompletionDate: string | null
  laborHours: number
  laborCost: number
  partsCost: number
  totalCost: number
  totalChecklistItems: number
  completedChecklistItems: number
  progressPercentage: number
  internalNotes: string | null
  mechanicNotes: string | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
    email: string | null
  }
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    vin: string | null
  }
  leadMechanic: {
    id: string
    firstName: string
    lastName: string
  } | null
  checklistItems: ChecklistItem[]
  parts: JobCardPart[]
}

interface ChecklistItem {
  id: string
  itemName: string
  description: string | null
  category: string | null
  status: string
  priority: string
  estimatedMinutes: number
  actualMinutes: number
  totalTimeSpent: number
  laborCost: number
  mechanicNotes: string | null
  notes: string | null
  completedAt: string | null
}

interface JobCardPart {
  id: string
  partName: string
  partNumber: string | null
  manufacturer: string | null
  status: string
  quantityAllocated: number
  quantityUsed: number
  unitPrice: number
  totalPrice: number
  source: string
  notes: string | null
}

type JobCardStatus = 'draft' | 'queued' | 'in_progress' | 'parts_waiting' | 'quality_check' | 'ready' | 'delivered' | 'cancelled'

export default function JobCardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobCardId = params.id as string

  const [jobCard, setJobCard] = useState<JobCardDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'parts' | 'timeline'>('overview')

  useEffect(() => {
    if (jobCardId) {
      loadJobCard()
    }
  }, [jobCardId])

  const loadJobCard = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/job-cards/${jobCardId}`)

      // For demo purposes, use mock data if API fails or returns mock data
      if (!response.ok) {
        console.log('API not available, using mock data')
        setJobCard(getMockJobCard(jobCardId))
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.success && data.jobCard) {
        setJobCard(data.jobCard)
      } else {
        // Use mock data as fallback
        console.log('Using mock data fallback')
        setJobCard(getMockJobCard(jobCardId))
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading job card:', err)
      // Use mock data as fallback
      console.log('Using mock data due to error')
      setJobCard(getMockJobCard(jobCardId))
      setIsLoading(false)
    }
  }

  // Mock data for demonstration
  const getMockJobCard = (id: string): JobCardDetail => ({
    id,
    jobCardNumber: `JC-2025-${id.padStart(4, '0')}`,
    jobType: 'repair',
    priority: 'high',
    status: 'in_progress',
    customerComplaint: 'Engine making strange noise when accelerating',
    workRequested: 'Diagnose and repair engine issue',
    customerNotes: 'Please call before doing any major work',
    currentMileage: 45000,
    reportedIssue: 'Loud grinding noise from engine compartment',
    promisedDate: '2025-01-20',
    promisedTime: '14:00',
    actualCompletionDate: null,
    laborHours: 2.5,
    laborCost: 1500,
    partsCost: 3500,
    totalCost: 5000,
    totalChecklistItems: 5,
    completedChecklistItems: 3,
    progressPercentage: 60,
    internalNotes: 'Customer is a regular, prioritize this job',
    mechanicNotes: 'Need to check timing belt and tensioner',
    createdAt: '2025-01-18T09:30:00Z',
    updatedAt: '2025-01-18T14:20:00Z',
    customer: {
      id: 'cust-1',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phoneNumber: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
    },
    vehicle: {
      id: 'veh-1',
      make: 'Honda',
      model: 'Activa 6G',
      year: 2023,
      licensePlate: 'KA-03-EM-2345',
      vin: 'MA1JB5412MC345678',
    },
    leadMechanic: {
      id: 'mech-1',
      firstName: 'Amit',
      lastName: 'Sharma',
    },
    checklistItems: [
      {
        id: 'item-1',
        itemName: 'Initial Inspection',
        description: 'Perform visual inspection and diagnostics',
        category: 'Diagnostics',
        status: 'completed',
        priority: 'high',
        estimatedMinutes: 30,
        actualMinutes: 35,
        totalTimeSpent: 2100,
        laborCost: 350,
        mechanicNotes: 'Noise confirmed from timing belt area',
        notes: null,
        completedAt: '2025-01-18T10:30:00Z',
      },
      {
        id: 'item-2',
        itemName: 'Check Timing Belt',
        description: 'Inspect timing belt condition and tension',
        category: 'Inspection',
        status: 'completed',
        priority: 'high',
        estimatedMinutes: 45,
        actualMinutes: 50,
        totalTimeSpent: 3000,
        laborCost: 500,
        mechanicNotes: 'Belt showing signs of wear, needs replacement',
        notes: null,
        completedAt: '2025-01-18T11:45:00Z',
      },
      {
        id: 'item-3',
        itemName: 'Replace Timing Belt',
        description: 'Replace timing belt and tensioner',
        category: 'Repair',
        status: 'in_progress',
        priority: 'high',
        estimatedMinutes: 90,
        actualMinutes: 0,
        totalTimeSpent: 0,
        laborCost: 650,
        mechanicNotes: null,
        notes: 'Waiting for parts to arrive',
        completedAt: null,
      },
      {
        id: 'item-4',
        itemName: 'Test Engine',
        description: 'Run engine and verify no more noise',
        category: 'Testing',
        status: 'pending',
        priority: 'medium',
        estimatedMinutes: 30,
        actualMinutes: 0,
        totalTimeSpent: 0,
        laborCost: 0,
        mechanicNotes: null,
        notes: null,
        completedAt: null,
      },
      {
        id: 'item-5',
        itemName: 'Final Quality Check',
        description: 'Perform quality check before delivery',
        category: 'Quality',
        status: 'pending',
        priority: 'medium',
        estimatedMinutes: 20,
        actualMinutes: 0,
        totalTimeSpent: 0,
        laborCost: 0,
        mechanicNotes: null,
        notes: null,
        completedAt: null,
      },
    ],
    parts: [
      {
        id: 'part-1',
        partName: 'Timing Belt',
        partNumber: 'TB-HON-2023-001',
        manufacturer: 'Honda',
        status: 'ordered',
        quantityAllocated: 1,
        quantityUsed: 0,
        unitPrice: 1800,
        totalPrice: 1800,
        source: 'OEM',
        notes: 'Expected delivery by tomorrow',
      },
      {
        id: 'part-2',
        partName: 'Timing Belt Tensioner',
        partNumber: 'TBT-HON-2023-045',
        manufacturer: 'Honda',
        status: 'ordered',
        quantityAllocated: 1,
        quantityUsed: 0,
        unitPrice: 1200,
        totalPrice: 1200,
        source: 'OEM',
        notes: 'Ordered with timing belt',
      },
      {
        id: 'part-3',
        partName: 'Engine Oil',
        partNumber: 'OIL-4T-10W30-1L',
        manufacturer: 'Castrol',
        status: 'allocated',
        quantityAllocated: 2,
        quantityUsed: 0,
        unitPrice: 350,
        totalPrice: 700,
        source: 'inventory',
        notes: 'Already in stock',
      },
    ],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100 border-gray-300'
      case 'queued':
        return 'text-status-info bg-status-info/10 border-status-info/20'
      case 'in_progress':
        return 'text-status-warning bg-status-warning/10 border-status-warning/20'
      case 'parts_waiting':
        return 'text-status-error bg-status-error/10 border-status-error/20'
      case 'quality_check':
        return 'text-purple-600 bg-purple-100 border-purple-300'
      case 'ready':
        return 'text-status-success bg-status-success/10 border-status-success/20'
      case 'delivered':
        return 'text-status-success bg-status-success/10 border-status-success/20'
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-status-error bg-status-error/10 border-status-error/20'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'medium':
        return 'text-status-warning bg-status-warning/10 border-status-warning/20'
      case 'low':
        return 'text-status-info bg-status-info/10 border-status-info/20'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getChecklistStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-status-success" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-status-warning" />
      case 'waiting_parts':
        return <Package className="h-4 w-4 text-status-error" />
      case 'skipped':
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading job card...</p>
        </div>
      </div>
    )
  }

  if (error || !jobCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Job Card</h2>
          <p className="text-gray-600 mb-6">{error || 'Job card not found'}</p>
          <button
            onClick={() => router.push('/job-cards')}
            className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
          >
            Back to Job Cards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/job-cards')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Job Cards</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/job-cards/${jobCardId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Job Card Title */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900 font-mono">{jobCard.jobCardNumber}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(jobCard.status)}`}>
                {jobCard.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getPriorityColor(jobCard.priority)}`}>
                {jobCard.priority.charAt(0).toUpperCase() + jobCard.priority.slice(1)} Priority
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-medium border bg-gray-100 text-gray-700 border-gray-300">
                {jobCard.jobType.charAt(0).toUpperCase() + jobCard.jobType.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(jobCard.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Updated: {new Date(jobCard.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 shadow-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Overall Progress</h3>
          <span className="text-sm font-bold text-gray-900">{jobCard.progressPercentage}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gray-600 to-gray-700 transition-all duration-500"
            style={{ width: `${jobCard.progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <span>{jobCard.completedChecklistItems} of {jobCard.totalChecklistItems} tasks completed</span>
          {jobCard.promisedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Promised: {new Date(jobCard.promisedDate).toLocaleDateString()}
              {jobCard.promisedTime && ` at ${jobCard.promisedTime}`}
            </span>
          )}
        </div>
      </motion.div>

      {/* Customer & Vehicle Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid md:grid-cols-2 gap-6 mb-6"
      >
        {/* Customer Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm font-medium text-gray-900">
                {jobCard.customer.firstName} {jobCard.customer.lastName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <a
                href={`tel:${jobCard.customer.phoneNumber}`}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                {jobCard.customer.phoneNumber}
              </a>
            </div>

            {jobCard.customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <a
                  href={`mailto:${jobCard.customer.email}`}
                  className="text-sm text-gray-700 hover:text-gray-900 truncate"
                >
                  {jobCard.customer.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-gray-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Vehicle Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
              <p className="text-sm font-medium text-gray-900">
                {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">License Plate</p>
              <p className="text-sm font-medium text-gray-900">{jobCard.vehicle.licensePlate}</p>
            </div>

            {jobCard.vehicle.vin && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">VIN</p>
                <p className="text-sm text-gray-600 font-mono">{jobCard.vehicle.vin}</p>
              </div>
            )}

            {jobCard.currentMileage && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Mileage</p>
                <p className="text-sm font-medium text-gray-900">{jobCard.currentMileage.toLocaleString()} km</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lead Mechanic & Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6 mb-6"
      >
        {/* Lead Mechanic */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Lead Mechanic</h3>
          {jobCard.leadMechanic ? (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-700">
                  {jobCard.leadMechanic.firstName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {jobCard.leadMechanic.firstName} {jobCard.leadMechanic.lastName}
                </p>
                <p className="text-sm text-gray-500">Assigned Mechanic</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No mechanic assigned</p>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Schedule</h3>
          <div className="space-y-3">
            {jobCard.promisedDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promised Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(jobCard.promisedDate).toLocaleDateString()}
                  {jobCard.promisedTime && ` ${jobCard.promisedTime}`}
                </span>
              </div>
            )}
            {jobCard.actualCompletionDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-status-success">
                  {new Date(jobCard.actualCompletionDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden"
      >
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
              { id: 'parts', label: 'Parts', icon: Package },
              { id: 'timeline', label: 'Timeline', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-700 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Job Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Job Details</h3>
                <div className="space-y-4">
                  {jobCard.customerComplaint && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer Complaint</p>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{jobCard.customerComplaint}</p>
                    </div>
                  )}

                  {jobCard.reportedIssue && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reported Issue</p>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{jobCard.reportedIssue}</p>
                    </div>
                  )}

                  {jobCard.workRequested && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Work Requested</p>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{jobCard.workRequested}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
                <div className="space-y-4">
                  {jobCard.customerNotes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer Notes</p>
                      <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        {jobCard.customerNotes}
                      </p>
                    </div>
                  )}

                  {jobCard.mechanicNotes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mechanic Notes</p>
                      <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                        {jobCard.mechanicNotes}
                      </p>
                    </div>
                  )}

                  {jobCard.internalNotes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Internal Notes</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        {jobCard.internalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Labor Hours</span>
                      <span className="font-medium text-gray-900">{jobCard.laborHours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Labor Cost</span>
                      <span className="font-medium text-gray-900">₹{jobCard.laborCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Parts Cost</span>
                      <span className="font-medium text-gray-900">₹{jobCard.partsCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Total Cost</span>
                        <span className="text-lg font-bold text-gray-900">₹{jobCard.totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div>
              {jobCard.checklistItems.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No checklist items yet</p>
                  <button className="mt-4 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-all">
                    Add Checklist Item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobCard.checklistItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getChecklistStatusIcon(item.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                            <span>Est: {item.estimatedMinutes} min</span>
                            {item.actualMinutes > 0 && <span>Actual: {item.actualMinutes} min</span>}
                            {item.category && <span className="px-2 py-0.5 bg-gray-100 rounded">{item.category}</span>}
                          </div>

                          {(item.notes || item.mechanicNotes) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {item.notes && <p className="text-xs text-gray-600 mb-1">{item.notes}</p>}
                              {item.mechanicNotes && (
                                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                  Mechanic: {item.mechanicNotes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Parts Tab */}
          {activeTab === 'parts' && (
            <div>
              {jobCard.parts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No parts added yet</p>
                  <button className="mt-4 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-all">
                    Add Part
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Part
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobCard.parts.map((part) => (
                        <tr key={part.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{part.partName}</p>
                              {part.partNumber && (
                                <p className="text-xs text-gray-500">{part.partNumber}</p>
                              )}
                              {part.manufacturer && (
                                <p className="text-xs text-gray-500">{part.manufacturer}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {part.quantityUsed}/{part.quantityAllocated}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${
                              part.status === 'used' ? 'bg-status-success/10 text-status-success border-status-success/20' :
                              part.status === 'ordered' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {part.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            ₹{part.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ₹{part.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Status history will be displayed here</p>
                <p className="text-sm text-gray-500 mt-1">Track all status changes and updates</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
