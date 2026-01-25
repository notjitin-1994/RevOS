'use client'

/**
 * Job Card Detail Page - COMPREHENSIVE VERSION
 *
 * Displays ALL available data from the database:
 * - Job card parts with full pricing, quantities, core charges
 * - Status history timeline
 * - Parts transactions log
 * - Extended customer information
 * - Extended vehicle information
 * - Technical diagnosis
 * - Full staff details
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { SchedulingTab } from '@/components/scheduling/SchedulingTab'

// ============================================================================
// TYPES & INTERFACES - COMPREHENSIVE
// ============================================================================

type JobCardStatus = 'draft' | 'queued' | 'in_progress' | 'parts_waiting' | 'quality_check' | 'ready' | 'delivered' | 'invoiced' | 'closed'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue'
type PartStatus = 'requested' | 'allocated' | 'used'
type CommentType = 'internal' | 'customer' | 'system'
type AttachmentCategory = 'photo' | 'document' | 'video' | 'other'

interface ChecklistSubtask {
  id: string
  name: string
  description?: string
  completed: boolean
  displayOrder: number
}

interface ChecklistItem {
  id: string
  itemName: string // Changed from 'name' to match API response and shared type
  description: string | null
  status: TaskStatus
  priority: Priority
  category: string
  estimatedMinutes: number
  actualMinutes: number | null
  laborRate: number
  displayOrder: number
  mechanicId: string | null
  startedAt: string | null
  completedAt: string | null
  isTimerRunning: boolean
  timerStartedAt: string | null
  totalTimeSpent: number
  mechanicNotes: string | null
  subtasks: ChecklistSubtask[]
  linkedIssueIds: string[]
  linkedServiceItemIds: string[]
  serviceScope: string | null
  technicalDiagnosis: string | null
}

// COMPREHENSIVE PART INTERFACE - All fields from job_card_parts table
interface JobCardPart {
  id: string
  jobCardId: string
  partNumber: string
  partName: string
  category: string | null
  manufacturer: string | null
  quantityRequested: number
  quantityUsed: number
  quantityReturned: number
  status: PartStatus
  estimatedUnitPrice: number
  actualUnitPrice: number
  priceVariance: number
  isPriceOverride: boolean
  priceOverrideReason: string | null
  coreChargeAmount: number
  coreCreditAmount: number
  hasCoreCharge: boolean
  disposalFeeAmount: number
  hasDisposalFee: boolean
  source: 'inventory' | 'customer' | 'external'
  requestedBy: string | null
  usedBy: string | null
  requestedAt: string
  usedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// STATUS HISTORY INTERFACE
interface StatusHistory {
  id: string
  jobCardId: string
  oldStatus: JobCardStatus | null
  newStatus: JobCardStatus
  changedById: string
  changedByName: string
  reason: string | null
  timestamp: string
}

// PARTS TRANSACTION INTERFACE
interface PartsTransaction {
  id: string
  jobCardId: string
  partId: string | null
  transactionType: string
  quantity: number
  unitPrice: number
  totalPrice: number
  transactionDate: string
  performedBy: string | null
  notes: string | null
  createdAt: string
}

// COMPREHENSIVE EMPLOYEE INTERFACE
interface Employee {
  id: string
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
  role: string
  specialization?: string
  status?: string
  hireDate?: string
  avatar?: string
}

// COMPREHENSIVE CUSTOMER INTERFACE
interface Customer {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  alternatePhone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  customerSince?: string | null
  status?: string | null
  notes?: string | null
}

// COMPREHENSIVE VEHICLE INTERFACE
interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin: string | null
  color?: string | null
  engineNumber?: string | null
  fuelType?: string | null
  transmission?: string | null
  currentMileage?: number | null
  lastServiceDate?: string | null
  status?: string | null
  notes?: string | null
}

interface JobCardAttachment {
  id: string
  jobCardId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  mimeType: string
  category: AttachmentCategory
  description: string | null
  uploadedById: string
  uploadedByName: string
  createdAt: string
}

interface JobCardComment {
  id: string
  jobCardId: string
  commentText: string
  commentType: CommentType
  customerVisible: boolean
  authorId: string
  authorName: string
  authorRole: string
  createdAt: string
  updatedAt: string
}

interface TimeEntry {
  id: string
  jobCardId: string
  checklistItemId: string | null
  mechanicId: string
  mechanicName: string
  startTime: string
  endTime: string | null
  notes: string | null
  duration: number
}

interface JobCardDetail {
  // Core Identity
  id: string
  garageId: string
  jobCardNumber: string

  // Customer & Vehicle - FULL DETAILS
  customer: Customer
  vehicle: Vehicle

  // Job Details
  status: JobCardStatus
  priority: Priority
  jobType: string

  // Customer Inputs
  customerComplaint: string | null
  workRequested: string | null
  customerNotes: string | null

  // Internal Notes
  technicianNotes: string | null
  serviceAdvisorNotes: string | null
  qualityCheckNotes: string | null

  // Technical Diagnosis - Previously missing
  technicalDiagnosis: string | null

  // Scheduling
  promisedDate: string | null
  promisedTime: string | null
  actualStartDate: string | null
  actualCompletionDate: string | null
  bayAssigned: string | null

  // Financials
  estimatedLaborCost: number
  estimatedPartsCost: number
  actualLaborCost: number
  actualPartsCost: number
  discountAmount: number
  taxAmount: number
  finalAmount: number
  paymentStatus: PaymentStatus

  // Staffing - FULL DETAILS
  serviceAdvisorId: string | null
  leadMechanicId: string | null
  serviceAdvisor?: Employee
  leadMechanic?: Employee

  // Quality
  qualityChecked: boolean
  qualityCheckedBy: string | null
  customerRating: number | null

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string

  // Related Data
  checklistItems: ChecklistItem[]
  parts: JobCardPart[] // FULLY IMPLEMENTED
  attachments: JobCardAttachment[]
  comments: JobCardComment[]
  timeEntries: TimeEntry[]
  statusHistory: StatusHistory[] // Previously missing
  partsTransactions: PartsTransaction[] // Previously missing
}

// ============================================================================
// ICON IMPORTS
// ============================================================================
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Printer,
  Share2,
  MoreVertical,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Wrench,
  Package,
  FileText,
  MessageSquare,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertCircle,
  Shield,
  Activity,
  RefreshCw,
  Search,
  Zap,
  Users,
  Grid3x3,
  List,
  UploadCloud,
  Send,
  Archive,
  Info,
  HelpCircle,
  Tag,
  Timer,
  Settings,
  ExternalLink,
  Copy,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCode,
  History,
  Truck,
  Star,
  ThumbsUp,
  AlertTriangle,
  IndianRupee,
} from 'lucide-react'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(amount: number | null | undefined): string {
  // Handle NaN, null, undefined
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '₹0.00'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(dateStr)
}

// ============================================================================
// STATUS & PRIORITY BADGES
// ============================================================================

interface StatusBadgeProps {
  status: JobCardStatus
  size?: 'sm' | 'md'
}

function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${sizeClasses} ${config.classes}`}>
      <config.icon />
      {config.label}
    </span>
  )
}

function getStatusConfig(status: JobCardStatus) {
  const configs: Record<JobCardStatus, { label: string; classes: string; icon: () => JSX.Element }> = {
    draft: {
      label: 'Draft',
      classes: 'bg-gray-50 text-gray-600 border-gray-300',
      icon: () => <FileText className="h-3 w-3" />,
    },
    queued: {
      label: 'Queued',
      classes: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: () => <Clock className="h-3 w-3" />,
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: () => <Zap className="h-3 w-3" />,
    },
    parts_waiting: {
      label: 'Parts Waiting',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: () => <Package className="h-3 w-3" />,
    },
    quality_check: {
      label: 'Quality Check',
      classes: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: () => <Shield className="h-3 w-3" />,
    },
    ready: {
      label: 'Ready',
      classes: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: () => <CheckCircle2 className="h-3 w-3" />,
    },
    delivered: {
      label: 'Delivered',
      classes: 'bg-green-50 text-green-700 border-green-200',
      icon: () => <Truck className="h-3 w-3" />,
    },
    invoiced: {
      label: 'Invoiced',
      classes: 'bg-gray-50 text-gray-600 border-gray-300',
      icon: () => <FileText className="h-3 w-3" />,
    },
    closed: {
      label: 'Closed',
      classes: 'bg-gray-50 text-gray-500 border-gray-300',
      icon: () => <Archive className="h-3 w-3" />,
    },
  }

  return configs[status] || configs.draft
}

interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md'
}

function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = getPriorityConfig(priority)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${sizeClasses} ${config.classes}`}>
      <AlertCircle className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function getPriorityConfig(priority: Priority) {
  const configs = {
    urgent: {
      label: 'Urgent',
      classes: 'bg-red-50 text-red-700 border-red-200',
    },
    high: {
      label: 'High',
      classes: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    medium: {
      label: 'Medium',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    low: {
      label: 'Low',
      classes: 'bg-gray-50 text-gray-600 border-gray-300',
    },
  }

  return configs[priority] || configs.medium
}

// ============================================================================
// API FETCH FUNCTION
// ============================================================================

async function fetchJobCardDetail(id: string): Promise<JobCardDetail> {
  const response = await fetch(`/api/job-cards/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch job card')
  }

  const result = await response.json()

  console.log('[API Response]', {
    success: result.success,
    hasJobCard: !!result.jobCard,
    jobCardKeys: result.jobCard ? Object.keys(result.jobCard) : [],
    hasChecklistItems: !!result.jobCard?.checklistItems,
    checklistItemsCount: result.jobCard?.checklistItems?.length,
    firstChecklistItem: result.jobCard?.checklistItems?.[0],
    fullJobCard: result.jobCard
  })

  if (!result.success || !result.jobCard) {
    throw new Error('Job card not found')
  }

  return result.jobCard
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function JobCardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobCardId = params.id as string

  // UI State
  const [activeTab, setActiveTab] = useState<'tasks' | 'parts' | 'schedule' | 'timeline' | 'transactions' | 'attachments' | 'comments'>('tasks')
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Fetch job card data
  const {
    data: jobCard,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['job-card', jobCardId],
    queryFn: () => fetchJobCardDetail(jobCardId),
    enabled: !!jobCardId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  // Real-time subscription for job card updates
  useEffect(() => {
    if (!jobCardId) return

    const supabase = createClient()

    // Subscribe to job_cards changes
    const jobCardChannel = supabase
      .channel(`job-card-${jobCardId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'job_cards',
          filter: `id=eq.${jobCardId}`,
        },
        (payload) => {
          console.log('[Real-time] Job card updated:', payload)
          refetch()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true)
        }
      })

    // Subscribe to users table changes (for service advisor and lead mechanic updates)
    const usersChannel = supabase
      .channel(`job-card-users-${jobCardId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('[Real-time] User updated:', payload)
          // Only refetch if the updated user is the service advisor or lead mechanic
          if (jobCard && (
            payload.old.user_uid === jobCard.serviceAdvisorId ||
            payload.old.user_uid === jobCard.leadMechanicId
          )) {
            refetch()
          }
        }
      )
      .subscribe()

    // Subscribe to checklist items changes
    const checklistChannel = supabase
      .channel(`job-card-checklist-${jobCardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_card_checklist_items',
          filter: `job_card_id=eq.${jobCardId}`,
        },
        (payload) => {
          console.log('[Real-time] Checklist item updated:', payload)
          refetch()
        }
      )
      .subscribe()

    // Subscribe to job card parts changes
    const partsChannel = supabase
      .channel(`job-card-parts-${jobCardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_card_parts',
          filter: `job_card_id=eq.${jobCardId}`,
        },
        (payload) => {
          console.log('[Real-time] Job card part updated:', payload)
          refetch()
        }
      )
      .subscribe()

    // Subscribe to status history changes
    const statusHistoryChannel = supabase
      .channel(`job-card-status-history-${jobCardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_card_status_history',
          filter: `job_card_id=eq.${jobCardId}`,
        },
        (payload) => {
          console.log('[Real-time] Status history updated:', payload)
          refetch()
        }
      )
      .subscribe()

    // Subscribe to parts transactions changes
    const partsTransactionsChannel = supabase
      .channel(`job-card-parts-transactions-${jobCardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parts_transactions',
          filter: `job_card_id=eq.${jobCardId}`,
        },
        (payload) => {
          console.log('[Real-time] Parts transaction updated:', payload)
          refetch()
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      console.log('[Real-time] Cleaning up subscriptions')
      setIsRealtimeConnected(false)
      supabase.removeChannel(jobCardChannel)
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(checklistChannel)
      supabase.removeChannel(partsChannel)
      supabase.removeChannel(statusHistoryChannel)
      supabase.removeChannel(partsTransactionsChannel)
    }
  }, [jobCardId, jobCard, refetch])

  // Toggle handlers
  const toggleTask = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }, [])

  const toggleSection = useCallback((section: string) => {
    console.log('[toggleSection] Clicking section:', section)
    console.log('[toggleSection] Current expandedSections:', Array.from(expandedSections))
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
        console.log('[toggleSection] Removing section:', section)
      } else {
        newSet.add(section)
        console.log('[toggleSection] Adding section:', section)
      }
      console.log('[toggleSection] New expandedSections:', Array.from(newSet))
      return newSet
    })
  }, [expandedSections])

  // Calculate derived data
  const totalTasks = jobCard?.checklistItems?.length || 0
  const completedTasks = jobCard?.checklistItems?.filter(t => t.status === 'completed').length || 0
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate labor cost from checklist items in real-time with null checks
  const calculatedLaborCost = (jobCard?.checklistItems || []).reduce((sum, item) => {
    const minutes = item?.estimatedMinutes || 0
    const hours = minutes / 60
    const rate = item?.laborRate || 0
    return sum + (hours * rate)
  }, 0)

  // Calculate total estimated minutes
  const totalEstimatedMinutes = (jobCard?.checklistItems || []).reduce((sum, item) => {
    return sum + (item?.estimatedMinutes || 0)
  }, 0)

  // Use calculated labor cost if job card cost is 0/null
  const displayLaborCost = jobCard?.estimatedLaborCost || calculatedLaborCost
  const displayPartsCost = jobCard?.estimatedPartsCost || 0
  const totalEstimatedCost = displayLaborCost + displayPartsCost

  // Debug logging (remove in production)
  console.log('[Job Card Data]', {
    jobCardExists: !!jobCard,
    hasChecklistItems: !!jobCard?.checklistItems,
    checklistItemsCount: jobCard?.checklistItems?.length,
    estimatedLaborCost: jobCard?.estimatedLaborCost,
    calculatedLaborCost,
    displayLaborCost,
    totalEstimatedMinutes,
    rawChecklistItems: jobCard?.checklistItems,
    firstItem: jobCard?.checklistItems?.[0]
  })

  // Filter and search
  const filteredChecklistItems = jobCard?.checklistItems.filter(item => {
    const matchesSearch = !searchQuery ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  }) || []

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf0f5]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block h-16 w-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-t-graphite-900 border-r-transparent border-b-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="mt-6 text-gray-700 font-semibold text-base">Loading job card...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error || !jobCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf0f5] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl border-2 border-red-200 p-8 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900">Error Loading Job Card</h2>
              <p className="text-sm text-gray-600 mt-0.5">{error instanceof Error ? error.message : 'Job card not found'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="flex-1 bg-graphite-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-graphite-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#ecf0f5] pb-safe">
      {/* HEADER */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="h-11 w-11 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-display font-bold text-gray-900">
                  {jobCard.jobCardNumber}
                </h1>
                <StatusBadge status={jobCard.status} size="md" />
                <PriorityBadge priority={jobCard.priority} size="md" />
              </div>
              <p className="text-sm text-gray-600 mt-0.5 truncate">
                {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model} • {jobCard.customer.firstName} {jobCard.customer.lastName}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {/* Real-time connection indicator */}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border",
                isRealtimeConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              )}>
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isRealtimeConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                <span>{isRealtimeConnected ? "Live" : "Offline"}</span>
              </div>

              <button className="h-11 px-4 flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all">
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              {jobCard.status === 'draft' && (
                <button
                  onClick={() => router.push(`/job-cards/create?editJobCardId=${jobCard.id}`)}
                  className="h-11 px-4 flex items-center gap-2 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 active:scale-[0.98] transition-all"
                >
                  <Edit className="h-4 w-4" />
                  <span>Continue Draft</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Progress</p>
                <p className="text-2xl font-display font-bold text-gray-900">{progressPercentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Parts</p>
                <p className="text-2xl font-display font-bold text-gray-900">{jobCard.parts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Timer className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Est. Time</p>
                <p className="text-2xl font-display font-bold text-gray-900">
                  {formatDuration(totalEstimatedMinutes)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Actual: {formatDuration(
                    jobCard.checklistItems.reduce((acc, item) => acc + (item.actualMinutes || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-display font-bold text-gray-900 font-mono">
                  {formatCurrency(jobCard.finalAmount || totalEstimatedCost)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Card - Extended */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <div
                onClick={() => toggleSection('customer')}
                className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-gray-900">
                      {jobCard.customer.firstName} {jobCard.customer.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">Customer Information</p>
                  </div>
                  {expandedSections.has('customer') ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.has('customer') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <a
                            href={`tel:${jobCard.customer.phoneNumber}`}
                            className="text-sm font-mono text-gray-900 font-semibold hover:text-graphite-700"
                          >
                            {jobCard.customer.phoneNumber}
                          </a>
                        </div>
                        {jobCard.customer.alternatePhone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            <a
                              href={`tel:${jobCard.customer.alternatePhone}`}
                              className="text-sm font-mono text-gray-900 font-semibold hover:text-graphite-700"
                            >
                              {jobCard.customer.alternatePhone} (Alt)
                            </a>
                          </div>
                        )}
                        {jobCard.customer.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            <a
                              href={`mailto:${jobCard.customer.email}`}
                              className="text-sm text-gray-900 font-semibold hover:text-graphite-700 truncate"
                            >
                              {jobCard.customer.email}
                            </a>
                          </div>
                        )}
                        {jobCard.customer.address && (
                          <div className="flex items-start gap-3 md:col-span-2">
                            <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-900">
                              {jobCard.customer.address}
                              {jobCard.customer.city && `, ${jobCard.customer.city}`}
                              {jobCard.customer.state && `, ${jobCard.customer.state}`}
                              {jobCard.customer.zipCode && ` ${jobCard.customer.zipCode}`}
                            </span>
                          </div>
                        )}
                        {jobCard.customer.customerSince && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-600">Customer since {formatDate(jobCard.customer.customerSince)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Vehicle Card - Extended */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <div
                onClick={() => toggleSection('vehicle')}
                className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Car className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-gray-900">
                      {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
                    </h3>
                    <p className="text-sm font-mono text-gray-600">{jobCard.vehicle.licensePlate}</p>
                  </div>
                  {expandedSections.has('vehicle') ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.has('vehicle') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {jobCard.vehicle.vin && (
                          <div className="col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">VIN</p>
                            <p className="text-sm font-mono text-gray-900 tracking-wide">{jobCard.vehicle.vin}</p>
                          </div>
                        )}
                        {jobCard.vehicle.currentMileage && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Mileage</p>
                            <p className="text-sm font-mono text-gray-900">
                              {jobCard.vehicle.currentMileage.toLocaleString()} km
                            </p>
                          </div>
                        )}
                        {jobCard.vehicle.color && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Color</p>
                            <p className="text-sm text-gray-900">{jobCard.vehicle.color}</p>
                          </div>
                        )}
                        {jobCard.vehicle.fuelType && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Fuel Type</p>
                            <p className="text-sm text-gray-900">{jobCard.vehicle.fuelType}</p>
                          </div>
                        )}
                        {jobCard.vehicle.transmission && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Transmission</p>
                            <p className="text-sm text-gray-900">{jobCard.vehicle.transmission}</p>
                          </div>
                        )}
                        {jobCard.vehicle.engineNumber && (
                          <div className="col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Engine Number</p>
                            <p className="text-sm font-mono text-gray-900">{jobCard.vehicle.engineNumber}</p>
                          </div>
                        )}
                        {jobCard.vehicle.lastServiceDate && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Last Service</p>
                            <p className="text-sm text-gray-900">{formatDate(jobCard.vehicle.lastServiceDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Technical Diagnosis - Previously Missing */}
            {jobCard.technicalDiagnosis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.17 }}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
              >
                <div
                  onClick={() => toggleSection('diagnosis')}
                  className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FileCode className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-display font-bold text-gray-900">Technical Diagnosis</h3>
                    </div>
                    {expandedSections.has('diagnosis') ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.has('diagnosis') && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                          {jobCard.technicalDiagnosis}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* NOTES SECTION - Collapsible */}
            <div className="flex flex-col space-y-4">
              {/* Customer Notes */}
              {jobCard.customerNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
                >
                  <div
                    onClick={() => toggleSection('customerNotes')}
                    className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-display font-bold text-gray-900">Customer Notes</h3>
                      </div>
                      {expandedSections.has('customerNotes') ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSections.has('customerNotes') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{jobCard.customerNotes}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Technician Notes */}
              {jobCard.technicianNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 }}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
                >
                  <div
                    onClick={() => toggleSection('technicianNotes')}
                    className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-display font-bold text-gray-900">Technician Notes</h3>
                      </div>
                      {expandedSections.has('technicianNotes') ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSections.has('technicianNotes') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{jobCard.technicianNotes}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Service Advisor Notes */}
              {jobCard.serviceAdvisorNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.27 }}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
                >
                  <div
                    onClick={() => toggleSection('advisorNotes')}
                    className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-display font-bold text-gray-900">Advisor Notes</h3>
                      </div>
                      {expandedSections.has('advisorNotes') ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSections.has('advisorNotes') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{jobCard.serviceAdvisorNotes}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Staffing Card - Full Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <div
                onClick={() => toggleSection('staffing')}
                className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-display font-bold text-gray-900">Staffing</h3>
                  </div>
                  {expandedSections.has('staffing') ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.has('staffing') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {jobCard.serviceAdvisor && (
                        <EmployeeCard employee={jobCard.serviceAdvisor} role="Service Advisor" />
                      )}
                      {jobCard.leadMechanic && (
                        <EmployeeCard employee={jobCard.leadMechanic} role="Lead Mechanic" />
                      )}
                      {!jobCard.serviceAdvisor && !jobCard.leadMechanic && (
                        <p className="text-sm text-gray-600 text-center py-4">No staff assigned</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Cost Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-graphite-900 to-graphite-800 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold">Cost Summary</h3>
                  <p className="text-xs text-gray-300">Estimated vs Actual</p>
                </div>
              </div>

              <div className="space-y-4">
                <CostRow label="Labor (Est.)" value={formatCurrency(displayLaborCost)} />
                <CostRow label="Labor (Actual)" value={formatCurrency(jobCard.actualLaborCost)} />
                <div className="h-px bg-white/20" />
                <CostRow label="Parts (Est.)" value={formatCurrency(displayPartsCost)} />
                <CostRow label="Parts (Actual)" value={formatCurrency(jobCard.actualPartsCost)} />
                {jobCard.discountAmount > 0 && (
                  <>
                    <div className="h-px bg-white/20" />
                    <CostRow label="Discount" value={`-${formatCurrency(jobCard.discountAmount)}`} />
                  </>
                )}
                {jobCard.taxAmount > 0 && (
                  <CostRow label="Tax" value={formatCurrency(jobCard.taxAmount)} />
                )}
                <div className="h-px bg-white/20" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Total</span>
                  <span className="text-xl font-display font-bold font-mono">
                    {formatCurrency(jobCard.finalAmount || totalEstimatedCost)}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Payment Status</span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      jobCard.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-300' :
                      jobCard.paymentStatus === 'partial' ? 'bg-amber-500/20 text-amber-300' :
                      jobCard.paymentStatus === 'overdue' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    )}>
                      {jobCard.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quality Check Panel */}
            {(jobCard.qualityChecked || jobCard.customerRating) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-2 border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-gray-900">Quality Check</h3>
                    {jobCard.qualityChecked && (
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Passed
                      </p>
                    )}
                  </div>
                </div>

                {jobCard.customerRating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-5 w-5',
                            star <= jobCard.customerRating!
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {jobCard.customerRating}/5
                    </span>
                  </div>
                )}

                {jobCard.qualityCheckNotes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{jobCard.qualityCheckNotes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* TABS SECTION - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b-2 border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-thin" role="tablist">
              {[
                { id: 'tasks' as const, label: 'Tasks', icon: Wrench, count: totalTasks },
                { id: 'parts' as const, label: 'Parts', icon: Package, count: jobCard.parts.length },
                { id: 'schedule' as const, label: 'Schedule', icon: Calendar, count: jobCard.promisedDate ? 1 : 0 },
                { id: 'timeline' as const, label: 'Timeline', icon: History, count: jobCard.statusHistory.length },
                { id: 'transactions' as const, label: 'Transactions', icon: Activity, count: jobCard.partsTransactions.length },
                { id: 'attachments' as const, label: 'Attachments', icon: Paperclip, count: jobCard.attachments.length },
                { id: 'comments' as const, label: 'Comments', icon: MessageSquare, count: jobCard.comments.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-4 transition-colors whitespace-nowrap min-h-[64px]',
                    activeTab === tab.id
                      ? 'border-graphite-900 text-graphite-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      activeTab === tab.id
                        ? 'bg-graphite-100 text-graphite-900'
                        : 'bg-gray-100 text-gray-700'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {filteredChecklistItems.map((task, index) => (
                  <ChecklistItemCard
                    key={task.id}
                    task={task}
                    index={index}
                    isExpanded={expandedTasks.has(task.id)}
                    onToggle={() => toggleTask(task.id)}
                    jobCardId={jobCardId}
                  />
                ))}

                {filteredChecklistItems.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-sm text-gray-600">
                      {searchQuery ? 'Try a different search term' : 'No tasks have been added yet'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Parts Tab - FULLY IMPLEMENTED */}
            {activeTab === 'parts' && (
              <PartsSection parts={jobCard.parts} jobCardId={jobCardId} />
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <SchedulingTab
                jobCardId={jobCardId}
                initialData={{
                  promisedDate: jobCard.promisedDate,
                  promisedTime: jobCard.promisedTime,
                  actualStartDate: jobCard.actualStartDate,
                  actualCompletionDate: jobCard.actualCompletionDate,
                  bayAssigned: jobCard.bayAssigned,
                  serviceAdvisorId: jobCard.serviceAdvisorId,
                  mechanicId: jobCard.leadMechanicId,
                }}
                onDataChange={(data) => {
                  // TODO: Implement data update mutation
                  console.log('[Schedule] Data changed:', data)
                }}
              />
            )}

            {/* Timeline Tab - Status History */}
            {activeTab === 'timeline' && (
              <TimelineSection statusHistory={jobCard.statusHistory} />
            )}

            {/* Transactions Tab - Parts Transactions */}
            {activeTab === 'transactions' && (
              <TransactionsSection transactions={jobCard.partsTransactions} />
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <AttachmentsSection attachments={jobCard.attachments} jobCardId={jobCardId} />
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <CommentsSection comments={jobCard.comments} jobCardId={jobCardId} />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CostRowProps {
  label: string
  value: string
}

function CostRow({ label, value }: CostRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-sm font-mono font-semibold">{value}</span>
    </div>
  )
}

interface EmployeeCardProps {
  employee: Employee
  role: string
}

function EmployeeCard({ employee, role }: EmployeeCardProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()

  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-graphite-700 to-graphite-900 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="text-xs text-gray-600">{role}</p>
        </div>
      </div>

      {(employee.email || employee.phoneNumber) && (
        <div className="space-y-2 pl-1">
          {employee.email && (
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3 w-3 text-gray-500" />
              <a href={`mailto:${employee.email}`} className="text-gray-700 hover:text-graphite-700 truncate">
                {employee.email}
              </a>
            </div>
          )}
          {employee.phoneNumber && (
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-3 w-3 text-gray-500" />
              <a href={`tel:${employee.phoneNumber}`} className="font-mono text-gray-700 hover:text-graphite-700">
                {employee.phoneNumber}
              </a>
            </div>
          )}
          {employee.specialization && (
            <div className="flex items-center gap-2 text-xs">
              <Tag className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">{employee.specialization}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ChecklistItemCardProps {
  task: ChecklistItem
  index: number
  isExpanded: boolean
  onToggle: () => void
  jobCardId: string
}

function ChecklistItemCard({ task, isExpanded, onToggle, jobCardId }: ChecklistItemCardProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const progress = task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)
    : task.status === 'completed' ? 100 : 0

  // Quick status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: TaskStatus) => {
      const response = await fetch(`/api/job-cards/${jobCardId}/checklist/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update status')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-card', jobCardId] })
    }
  })

  const handleQuickAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()

    if (action === 'view-details') {
      router.push(`/job-cards/${jobCardId}/tasks/${task.id}`)
    } else if (action === 'start' && task.status === 'pending') {
      updateStatusMutation.mutate('in_progress')
    } else if (action === 'complete' && task.status === 'in_progress') {
      updateStatusMutation.mutate('completed')
    } else if (action === 'block') {
      updateStatusMutation.mutate('blocked')
    }
  }

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-teal-50 text-teal-700 border-teal-200'
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'blocked':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0 }}
      className={cn(
        'bg-white rounded-xl border-2 transition-all duration-200',
        task.status === 'completed' ? 'border-teal-200 bg-teal-50/30' :
        task.status === 'in_progress' ? 'border-blue-400 bg-blue-50/30' :
        task.status === 'blocked' ? 'border-red-300 bg-red-50/30' :
        'border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Collapsed View - Enhanced with 5 key data points and subtask summary */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 active:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          {/* Task Name + Status Badge + Subtask Summary - 3 key data points */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="text-base font-display font-bold text-gray-900">{task.itemName}</h4>

            {/* Status Badge - Key data point #1 */}
            <span className={cn(
              'px-2.5 py-0.5 rounded-lg text-xs font-semibold border flex-shrink-0',
              getStatusClass(task.status)
            )}>
              {task.status.replace('_', ' ')}
            </span>

            {/* Subtask Summary - Key data point #2 */}
            {task.subtasks.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-600">
                <CheckCircle2 className="h-3 w-3" />
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* Category + Time Estimate - Key data points #3-5 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
              {task.category}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
              <Timer className="h-3 w-3 inline mr-1" />
              {formatDuration(task.estimatedMinutes)}
            </span>
          </div>

          {/* Progress Bar - Visual summary */}
          {(task.subtasks.length > 0 || task.status !== 'pending') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'h-full rounded-full',
                    progress === 100 ? 'bg-teal-500' :
                    progress >= 50 ? 'bg-blue-600' :
                    'bg-amber-500'
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Quick Actions - ONLY in collapsed view */}
      {!isExpanded && (
        <div className="px-4 pb-4 flex items-center gap-2">
          {task.status === 'pending' && (
            <button
              onClick={(e) => handleQuickAction(e, 'start')}
              disabled={updateStatusMutation.isPending}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Start Task
            </button>
          )}

          {task.status === 'in_progress' && (
            <>
              <button
                onClick={(e) => handleQuickAction(e, 'complete')}
                disabled={updateStatusMutation.isPending}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-teal-50 text-teal-700 font-semibold rounded-lg border border-teal-200 hover:bg-teal-100 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </button>

              <button
                onClick={(e) => handleQuickAction(e, 'block')}
                disabled={updateStatusMutation.isPending}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 active:scale-[0.98] transition-all disabled:opacity-50"
                aria-label="Mark as blocked"
              >
                <AlertCircle className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={(e) => handleQuickAction(e, 'view-details')}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-graphite-900 text-white font-semibold rounded-lg hover:bg-graphite-700 active:scale-[0.98] transition-all"
          >
            <Edit className="h-4 w-4" />
            View Details
          </button>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t-2 border-gray-200"
          >
            <div className="p-4 space-y-4">
              {/* Mechanic Notes */}
              {task.mechanicNotes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Mechanic Notes</p>
                  <p className="text-sm text-gray-900">{task.mechanicNotes}</p>
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Estimated Cost</p>
                  <p className="text-sm font-bold font-mono text-gray-900">
                    {formatCurrency(Math.round(task.estimatedMinutes * task.laborRate / 60))}
                  </p>
                </div>
                {task.actualMinutes && (
                  <div>
                    <p className="text-xs text-gray-600">Actual Cost</p>
                    <p className="text-sm font-bold font-mono text-gray-900">
                      {formatCurrency(Math.round(task.actualMinutes * task.laborRate / 60))}
                    </p>
                  </div>
                )}
              </div>

              {/* Subtasks Section - NEW */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-gray-900">Subtasks</h5>
                    <span className="text-xs text-gray-600">
                      {Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}% complete
                    </span>
                  </div>

                  <div className="space-y-2">
                    {task.subtasks.map((subtask, idx) => (
                      <div
                        key={subtask.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-all",
                          subtask.completed
                            ? "bg-teal-50 border-teal-200"
                            : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
                          {subtask.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-teal-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium",
                            subtask.completed ? "text-gray-500 line-through" : "text-gray-900"
                          )}>
                            <span className="text-gray-600 mr-2">{idx + 1}.</span>
                            {subtask.name}
                          </p>

                          {subtask.description && (
                            <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                          )}
                        </div>

                        {subtask.displayOrder && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {subtask.displayOrder}m
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// COMPREHENSIVE PARTS SECTION
// ============================================================================

interface PartsSectionProps {
  parts: JobCardPart[]
  jobCardId: string
}

function PartsSection({ parts, jobCardId }: PartsSectionProps) {
  if (parts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-gray-900 mb-2">No Parts Added</h3>
        <p className="text-sm text-gray-600 mb-4">Parts will appear here once added to this job card</p>
        <button className="h-11 px-6 flex items-center justify-center gap-2 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 active:scale-[0.98] transition-all mx-auto">
          <Plus className="h-4 w-4" />
          Add Part
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Total Parts</p>
          <p className="text-2xl font-display font-bold text-gray-900">{parts.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Requested</p>
          <p className="text-2xl font-display font-bold text-blue-900">{parts.filter(p => p.status === 'requested').length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">Allocated</p>
          <p className="text-2xl font-display font-bold text-amber-900">{parts.filter(p => p.status === 'allocated').length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">Used</p>
          <p className="text-2xl font-display font-bold text-green-900">{parts.filter(p => p.status === 'used').length}</p>
        </div>
      </div>

      {/* Parts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Part Info</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Quantities</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Pricing</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Extras</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900">{part.partNumber}</p>
                    <p className="text-sm text-gray-900 font-medium">{part.partName}</p>
                    {part.manufacturer && (
                      <p className="text-xs text-gray-600">{part.manufacturer}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Req:</span>
                      <span className="text-sm font-semibold text-gray-900">{part.quantityRequested}</span>
                    </div>
                    {part.quantityUsed > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Used:</span>
                        <span className="text-sm font-semibold text-gray-900">{part.quantityUsed}</span>
                      </div>
                    )}
                    {part.quantityReturned > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Ret:</span>
                        <span className="text-sm font-semibold text-gray-900">{part.quantityReturned}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Est:</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">{formatCurrency(part.estimatedUnitPrice)}</span>
                    </div>
                    {part.actualUnitPrice > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Act:</span>
                        <span className={cn(
                          'text-sm font-mono font-semibold',
                          part.priceVariance > 0 ? 'text-red-600' :
                          part.priceVariance < 0 ? 'text-green-600' :
                          'text-gray-900'
                        )}>
                          {formatCurrency(part.actualUnitPrice)}
                        </span>
                        {part.priceVariance !== 0 && (
                          part.priceVariance > 0 ? (
                            <TrendingUp className="h-3 w-3 text-red-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-green-600" />
                          )
                        )}
                      </div>
                    )}
                    {part.isPriceOverride && part.priceOverrideReason && (
                      <div className="text-xs text-gray-600 italic" title={part.priceOverrideReason}>
                        Price override
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={cn(
                    'inline-flex px-2 py-1 rounded-lg text-xs font-semibold border',
                    part.status === 'requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    part.status === 'allocated' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  )}>
                    {part.status}
                  </span>
                  <div className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {part.source}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1 text-xs">
                    {part.hasCoreCharge && part.coreChargeAmount > 0 && (
                      <div className="flex items-center gap-1 text-gray-700">
                        <span>Core:</span>
                        <span className="font-mono font-semibold">{formatCurrency(part.coreChargeAmount)}</span>
                      </div>
                    )}
                    {part.hasDisposalFee && part.disposalFeeAmount > 0 && (
                      <div className="flex items-center gap-1 text-gray-700">
                        <span>Disposal:</span>
                        <span className="font-mono font-semibold">{formatCurrency(part.disposalFeeAmount)}</span>
                      </div>
                    )}
                    {part.requestedAt && (
                      <div className="text-gray-600">
                        Req: {getRelativeTime(part.requestedAt)}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full h-11 flex items-center justify-center gap-2 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 active:scale-[0.98] transition-all">
        <Plus className="h-4 w-4" />
        Add Part
      </button>
    </div>
  )
}

// ============================================================================
// STATUS HISTORY TIMELINE
// ============================================================================

interface TimelineSectionProps {
  statusHistory: StatusHistory[]
}

function TimelineSection({ statusHistory }: TimelineSectionProps) {
  if (statusHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-gray-900 mb-2">No Status History</h3>
        <p className="text-sm text-gray-600">Status changes will be tracked here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {statusHistory.map((history, index) => (
        <motion.div
          key={history.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative pl-8 pb-6 border-l-2 border-gray-200 last:pb-0"
        >
          <div className="absolute left-0 top-0 -translate-x-1/2 h-6 w-6 rounded-full bg-graphite-900 border-4 border-white" />

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {history.oldStatus && (
                  <>
                    <StatusBadge status={history.oldStatus} size="sm" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </>
                )}
                <StatusBadge status={history.newStatus} size="sm" />
              </div>
              <span className="text-xs text-gray-600">{getRelativeTime(history.timestamp)}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <User className="h-3 w-3 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">{history.changedByName}</span>
            </div>

            {history.reason && (
              <div className="bg-white rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-600 mb-1">Reason</p>
                <p className="text-sm text-gray-900">{history.reason}</p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">{formatDateTime(history.timestamp)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// PARTS TRANSACTIONS SECTION
// ============================================================================

interface TransactionsSectionProps {
  transactions: PartsTransaction[]
}

function TransactionsSection({ transactions }: TransactionsSectionProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-gray-900 mb-2">No Transactions</h3>
        <p className="text-sm text-gray-600">Parts transactions will be tracked here</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Quantity</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Unit Price</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Total</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Performed By</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-4 px-4">
                <div>
                  <p className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</p>
                  <p className="text-xs text-gray-600">{formatTime(transaction.transactionDate)}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={cn(
                  'inline-flex px-2 py-1 rounded-lg text-xs font-semibold border',
                  transaction.transactionType === 'issue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  transaction.transactionType === 'return' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  transaction.transactionType === 'adjustment' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                )}>
                  {transaction.transactionType}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={cn(
                  'text-sm font-semibold font-mono',
                  transaction.transactionType === 'return' ? 'text-red-600' : 'text-gray-900'
                )}>
                  {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-mono text-gray-900">{formatCurrency(transaction.unitPrice)}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-mono font-semibold text-gray-900">{formatCurrency(transaction.totalPrice)}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-gray-900">{transaction.performedBy || 'N/A'}</span>
                {transaction.notes && (
                  <p className="text-xs text-gray-600 mt-1" title={transaction.notes}>
                    {transaction.notes.length > 30 ? transaction.notes.substring(0, 30) + '...' : transaction.notes}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// PLACEHOLDER SECTIONS
// ============================================================================

function AttachmentsSection({ attachments, jobCardId }: { attachments: JobCardAttachment[], jobCardId: string }) {
  return (
    <div className="text-center py-12">
      <Paperclip className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-display font-bold text-gray-900 mb-2">Attachments</h3>
      <p className="text-sm text-gray-600 mb-4">{attachments.length} files attached</p>
      <button className="h-11 px-6 flex items-center justify-center gap-2 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 active:scale-[0.98] transition-all mx-auto">
        <UploadCloud className="h-4 w-4" />
        Upload File
      </button>
    </div>
  )
}

function CommentsSection({ comments, jobCardId }: { comments: JobCardComment[], jobCardId: string }) {
  return (
    <div className="text-center py-12">
      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-display font-bold text-gray-900 mb-2">Comments</h3>
      <p className="text-sm text-gray-600 mb-4">{comments.length} comments</p>
      <div className="max-w-md mx-auto">
        <textarea
          placeholder="Add a comment..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-graphite-900 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <button className="h-11 px-6 flex items-center gap-2 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 active:scale-[0.98] transition-all">
            <Send className="h-4 w-4" />
            Post Comment
          </button>
        </div>
      </div>
    </div>
  )
}
