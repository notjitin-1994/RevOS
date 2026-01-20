'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Printer,
  Share2,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Check,
  Wrench,
  Package,
  DollarSign,
  FileText,
  MessageSquare,
  Paperclip,
  Image,
  Video,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  X,
  MoreVertical,
  Flag,
  Tag,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Truck,
  ClipboardCheck,
  TrendingUp,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  Search,
  Bell,
  Archive,
  Lock,
  Unlock,
  Shield,
  Star,
  Info,
  HelpCircle,
  GripVertical,
  Link2,
  Copy,
  ExternalLink,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  Zap,
  Target,
  Award,
  Flame,
  Sparkles,
  Users,
  UserCheck,
  Cog,
  Layers,
  Grid3x3,
  List,
  Maximize2,
  Minimize2,
  DownloadCloud,
  UploadCloud,
  FileCode,
  FolderOpen,
  FileSearch,
  Clipboard,
  ClipboardCopy,
  CheckSquare,
  Square,
  AlertCircle,
  AlertOctagon,
  Ban,
  SkipForward,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

type JobCardStatus = 'draft' | 'queued' | 'in_progress' | 'parts_waiting' | 'quality_check' | 'ready' | 'delivered' | 'cancelled'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

interface Customer {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  customerSince?: string
  totalVehicles?: number
  totalJobs?: number
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  color?: string
  fuelType?: string
  transmission?: string
  currentMileage?: number
  engineNumber?: string
  chassisNumber?: string
  lastServiceDate?: string
  insuranceExpiry?: string
  warrantyExpiry?: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  role: 'mechanic' | 'manager' | 'technician' | 'advisor'
  avatar?: string
  email?: string
  phoneNumber?: string
  specialization?: string[]
  rating?: number
  activeJobs?: number
}

interface CustomerIssue {
  id: string
  description: string
  priority: Priority
  category: string
  reportedBy: string
  reportedAt: string
  status: 'reported' | 'confirmed' | 'in_progress' | 'resolved'
  photos?: string[]
  videos?: string[]
}

interface WorkRequested {
  id: string
  description: string
  priority: Priority
  category: string
  requestedBy: string
  requestedAt: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed'
}

interface TechnicalDiagnosis {
  id: string
  description: string
  category: string
  diagnosedBy: string
  diagnosedAt: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  relatedIssues: string[] // issue IDs
  photos?: string[]
}

interface Task {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: Priority
  category: string
  estimatedMinutes: number
  laborRate: number
  displayOrder: number
  linkedToIssues?: number[] // indices of customerReportIssues
  linkedToServiceItems?: number[] // indices of workRequestedItems
  linkedToTechnicalDiagnosis?: number[] // indices of technicalDiagnosisItems
  assignedTo?: Employee
  actualMinutes?: number
  parts: TaskPart[]
  subtasks?: TaskSubtask[]
  tags?: string[]
  checklist?: TaskChecklist[]
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
}

interface TaskSubtask {
  id: string
  name: string
  description?: string
  estimatedMinutes: number
  completed: boolean
  displayOrder: number
}

interface TaskPart {
  id: string
  partName: string
  partNumber?: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  source: 'inventory' | 'ordered' | 'external'
  status: 'pending' | 'ordered' | 'received' | 'installed'
  notes?: string
}

interface TaskChecklist {
  id: string
  title: string
  completed: boolean
  completedAt?: string
}

interface TaskComment {
  id: string
  author: string
  text: string
  createdAt: string
}

interface TaskAttachment {
  id: string
  fileName: string
  fileType: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
}

interface Activity {
  id: string
  type: 'status_change' | 'comment' | 'task_update' | 'file_upload' | 'assignment' | 'system' | 'time_logged'
  title: string
  description?: string
  author?: string
  timestamp: string
  icon?: string
  metadata?: Record<string, any>
}

interface JobCardDetail {
  id: string
  jobCardNumber: string
  jobType: string
  priority: Priority
  status: JobCardStatus
  createdAt: string
  updatedAt: string
  promisedDate?: string
  promisedTime?: string
  actualCompletionDate?: string

  // Key entities
  customer: Customer
  vehicle: Vehicle
  manager?: Employee
  mechanic?: Employee

  // Issues and service scope
  customerReportedIssues: string[]
  workRequestedItems: string[]
  technicalDiagnosisItems: string[]

  // Enhanced tasks with links
  tasks: Task[]

  // Activity
  activities: Activity[]

  // Costs
  estimatedCost: number
  actualCost: number
  laborMinutes: number
  laborCost: number
  partsCost: number

  // Notes
  customerNotes?: string
  internalNotes?: string
  mechanicNotes?: string

  // Tags
  tags?: string[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const getMockJobCard = (id: string): JobCardDetail => ({
  id,
  jobCardNumber: `JC-2025-${id.padStart(4, '0')}`,
  jobType: 'repair',
  priority: 'high',
  status: 'in_progress',
  createdAt: '2025-01-18T09:30:00Z',
  updatedAt: '2025-01-18T14:20:00Z',
  promisedDate: '2025-01-20',
  promisedTime: '14:00',

  customer: {
    id: 'cust-1',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    phoneNumber: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: '123, Main Street',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    customerSince: '2022-03-15',
    totalVehicles: 2,
    totalJobs: 8,
    loyaltyTier: 'gold',
  },

  vehicle: {
    id: 'veh-1',
    make: 'Honda',
    model: 'Activa 6G',
    year: 2023,
    licensePlate: 'KA-03-EM-2345',
    vin: 'MA1JB5412MC345678',
    color: 'Pearl White',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    currentMileage: 45000,
    engineNumber: 'JB51E2345678',
    chassisNumber: 'MA1JB5412MC345678',
    lastServiceDate: '2024-12-15',
    insuranceExpiry: '2025-06-15',
    warrantyExpiry: '2025-03-15',
  },

  manager: {
    id: 'mgr-1',
    firstName: 'Vikram',
    lastName: 'Singh',
    role: 'manager',
    email: 'vikram.singh@garage.com',
    phoneNumber: '+91 98765 11111',
    rating: 4.8,
    activeJobs: 12,
  },

  mechanic: {
    id: 'mech-1',
    firstName: 'Amit',
    lastName: 'Sharma',
    role: 'mechanic',
    email: 'amit.sharma@garage.com',
    phoneNumber: '+91 98765 22222',
    specialization: ['Engine', 'Transmission', 'Electrical'],
    rating: 4.7,
    activeJobs: 5,
  },

  customerReportedIssues: [
    'Engine making strange grinding noise when accelerating above 40 km/h',
    'Vehicle vibrating at high speeds',
    'Brake pads making squeaking noise',
  ],

  workRequestedItems: [
    'Diagnose and fix engine noise',
    'Check suspension system',
    'Inspect and replace brake pads if needed',
    'General service check',
  ],

  technicalDiagnosisItems: [
    'Timing belt worn out - needs replacement',
    'Tensioner showing signs of wear',
    'Front wheel bearings need attention',
  ],

  tasks: [
    {
      id: 'task-1',
      name: 'Diagnose engine noise issue',
      description: 'Perform thorough inspection of engine compartment, check timing belt, tensioner, and related components',
      status: 'completed',
      priority: 'high',
      category: 'Engine',
      estimatedMinutes: 90,
      laborRate: 600,
      displayOrder: 1,
      linkedToIssues: [0],
      linkedToServiceItems: [0],
      linkedToTechnicalDiagnosis: [0, 1],
      assignedTo: {
        id: 'mech-1',
        firstName: 'Amit',
        lastName: 'Sharma',
        role: 'mechanic',
        rating: 4.7,
      },
      actualMinutes: 120,
      parts: [
        {
          id: 'part-1',
          partName: 'Engine Oil (for diagnosis)',
          partNumber: 'OIL-4T-10W30-1L',
          quantity: 0.5,
          unit: 'L',
          unitPrice: 350,
          totalPrice: 175,
          source: 'inventory',
          status: 'installed',
        },
      ],
      subtasks: [
        { id: 'st-1', name: 'Visual inspection', description: 'Check engine compartment visually', estimatedMinutes: 30, completed: true, displayOrder: 1 },
        { id: 'st-2', name: 'Test drive', description: 'Verify the noise issue', estimatedMinutes: 30, completed: true, displayOrder: 2 },
        { id: 'st-3', name: 'Document findings', description: 'Create diagnosis report', estimatedMinutes: 30, completed: true, displayOrder: 3 },
      ],
      createdAt: '2025-01-18T09:45:00Z',
      updatedAt: '2025-01-18T11:45:00Z',
      completedAt: '2025-01-18T11:45:00Z',
      tags: ['diagnostics', 'engine'],
      checklist: [
        { id: 'chk-1', title: 'Visual inspection', completed: true, completedAt: '2025-01-18T10:30:00Z' },
        { id: 'chk-2', title: 'Test drive', completed: true, completedAt: '2025-01-18T11:30:00Z' },
        { id: 'chk-3', title: 'Document findings', completed: true, completedAt: '2025-01-18T11:45:00Z' },
      ],
      comments: [
        { id: 'cmt-1', author: 'Amit Sharma', text: 'Noise confirmed from timing belt area', createdAt: '2025-01-18T10:30:00Z' },
      ],
    },
    {
      id: 'task-2',
      name: 'Replace timing belt and tensioner',
      description: 'Replace worn timing belt and tensioner assembly, re-time engine, verify operation',
      status: 'in_progress',
      priority: 'high',
      category: 'Engine',
      estimatedMinutes: 180,
      laborRate: 700,
      displayOrder: 2,
      linkedToIssues: [0],
      linkedToServiceItems: [0],
      linkedToTechnicalDiagnosis: [0, 1],
      assignedTo: {
        id: 'mech-1',
        firstName: 'Amit',
        lastName: 'Sharma',
        role: 'mechanic',
        rating: 4.7,
      },
      actualMinutes: 90,
      parts: [
        {
          id: 'part-2',
          partName: 'Timing Belt',
          partNumber: 'TB-HON-2023-001',
          quantity: 1,
          unit: 'pcs',
          unitPrice: 1800,
          totalPrice: 1800,
          source: 'ordered',
          status: 'received',
          notes: 'Genuine Honda part',
        },
        {
          id: 'part-3',
          partName: 'Timing Belt Tensioner',
          partNumber: 'TBT-HON-2023-045',
          quantity: 1,
          unit: 'pcs',
          unitPrice: 1200,
          totalPrice: 1200,
          source: 'ordered',
          status: 'received',
        },
      ],
      subtasks: [
        { id: 'st-4', name: 'Drain coolant', description: 'Drain radiator coolant', estimatedMinutes: 20, completed: true, displayOrder: 1 },
        { id: 'st-5', name: 'Remove old belt', description: 'Remove timing belt cover and old belt', estimatedMinutes: 40, completed: true, displayOrder: 2 },
        { id: 'st-6', name: 'Install new belt', description: 'Install new timing belt', estimatedMinutes: 60, completed: true, displayOrder: 3 },
        { id: 'st-7', name: 'Re-time engine', description: 'Set timing correctly', estimatedMinutes: 40, completed: false, displayOrder: 4 },
        { id: 'st-8', name: 'Refill coolant', description: 'Refill with fresh coolant', estimatedMinutes: 10, completed: false, displayOrder: 5 },
        { id: 'st-9', name: 'Test start engine', description: 'Start and verify operation', estimatedMinutes: 10, completed: false, displayOrder: 6 },
      ],
      createdAt: '2025-01-18T11:50:00Z',
      updatedAt: '2025-01-18T13:30:00Z',
      startedAt: '2025-01-18T12:00:00Z',
      tags: ['engine', 'timing-belt', 'critical'],
      checklist: [
        { id: 'chk-4', title: 'Drain coolant', completed: true, completedAt: '2025-01-18T12:00:00Z' },
        { id: 'chk-5', title: 'Remove old belt', completed: true, completedAt: '2025-01-18T12:30:00Z' },
        { id: 'chk-6', title: 'Install new belt', completed: true, completedAt: '2025-01-18T13:00:00Z' },
        { id: 'chk-7', title: 'Re-time engine', completed: false },
        { id: 'chk-8', title: 'Refill coolant', completed: false },
        { id: 'chk-9', title: 'Test start engine', completed: false },
        { id: 'chk-10', title: 'Final inspection', completed: false },
      ],
    },
    {
      id: 'task-3',
      name: 'Check suspension for vibration',
      description: 'Inspect front and rear suspension, check wheel bearings, check tire balance',
      status: 'pending',
      priority: 'medium',
      category: 'Suspension',
      estimatedMinutes: 120,
      laborRate: 550,
      displayOrder: 3,
      linkedToIssues: [1],
      linkedToServiceItems: [1],
      linkedToTechnicalDiagnosis: [2],
      parts: [],
      subtasks: [
        { id: 'st-10', name: 'Visual inspection', description: 'Check suspension components', estimatedMinutes: 30, completed: false, displayOrder: 1 },
        { id: 'st-11', name: 'Wheel bearing check', description: 'Test wheel bearings', estimatedMinutes: 45, completed: false, displayOrder: 2 },
        { id: 'st-12', name: 'Test drive', description: 'Test drive to verify vibration', estimatedMinutes: 30, completed: false, displayOrder: 3 },
        { id: 'st-13', name: 'Tire balancing', description: 'Balance wheels if needed', estimatedMinutes: 15, completed: false, displayOrder: 4 },
      ],
      createdAt: '2025-01-18T11:50:00Z',
      updatedAt: '2025-01-18T11:50:00Z',
      tags: ['suspension', 'vibration'],
    },
    {
      id: 'task-4',
      name: 'Inspect and replace brake pads',
      description: 'Check front and rear brake pads, measure thickness, replace if worn',
      status: 'pending',
      priority: 'low',
      category: 'Brakes',
      estimatedMinutes: 60,
      laborRate: 500,
      displayOrder: 4,
      linkedToIssues: [2],
      linkedToServiceItems: [2],
      parts: [],
      subtasks: [
        { id: 'st-14', name: 'Remove wheels', description: 'Remove all wheels', estimatedMinutes: 15, completed: false, displayOrder: 1 },
        { id: 'st-15', name: 'Measure pad thickness', description: 'Measure brake pad thickness', estimatedMinutes: 15, completed: false, displayOrder: 2 },
        { id: 'st-16', name: 'Check rotors', description: 'Inspect brake rotors', estimatedMinutes: 15, completed: false, displayOrder: 3 },
        { id: 'st-17', name: 'Replace if needed', description: 'Replace brake pads if worn', estimatedMinutes: 15, completed: false, displayOrder: 4 },
      ],
      createdAt: '2025-01-18T12:00:00Z',
      updatedAt: '2025-01-18T12:00:00Z',
      tags: ['brakes', 'safety'],
    },
  ],

  activities: [
    {
      id: 'act-1',
      type: 'status_change',
      title: 'Job card created',
      author: 'Vikram Singh',
      timestamp: '2025-01-18T09:30:00Z',
    },
    {
      id: 'act-2',
      type: 'assignment',
      title: 'Amit Sharma assigned as lead mechanic',
      author: 'Vikram Singh',
      timestamp: '2025-01-18T09:35:00Z',
    },
    {
      id: 'act-3',
      type: 'task_update',
      title: 'Task "Diagnose engine noise issue" completed',
      author: 'Amit Sharma',
      timestamp: '2025-01-18T11:45:00Z',
      description: 'Confirmed timing belt issue, replacement recommended',
    },
    {
      id: 'act-4',
      type: 'comment',
      title: 'Comment added to task',
      author: 'Amit Sharma',
      timestamp: '2025-01-18T10:30:00Z',
      description: 'Noise confirmed from timing belt area',
    },
    {
      id: 'act-5',
      type: 'system',
      title: 'Parts ordered - Timing Belt and Tensioner',
      timestamp: '2025-01-18T11:50:00Z',
    },
    {
      id: 'act-6',
      type: 'time_logged',
      title: 'Time logged for task "Replace timing belt"',
      author: 'Amit Sharma',
      timestamp: '2025-01-18T13:30:00Z',
      description: '90 minutes logged',
    },
  ],

  estimatedCost: 7500,
  actualCost: 5175,
  laborMinutes: 390,
  laborCost: 3850,
  partsCost: 3175,

  customerNotes: 'Please call before doing any major work. I need the vehicle back by Tuesday evening.',
  internalNotes: 'Customer is a regular, prioritize this job. He has referred 3 other customers.',
  mechanicNotes: 'Need to check timing belt and tensioner. Customer mentioned noise started after last service from another garage.',

  tags: ['engine', 'timing-belt', 'priority', 'regular-customer'],
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusColor(status: JobCardStatus | TaskStatus | ChecklistStatus) {
  switch (status) {
    case 'draft':
    case 'pending':
      return 'text-gray-700 bg-gray-100 border-gray-300'
    case 'queued':
      return 'text-gray-700 bg-gray-100 border-gray-300'
    case 'in_progress':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'parts_waiting':
    case 'blocked':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'quality_check':
      return 'text-purple-700 bg-purple-50 border-purple-200'
    case 'ready':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'completed':
    case 'delivered':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'cancelled':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'skipped':
      return 'text-gray-500 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300'
  }
}

function getPriorityColor(priority: Priority) {
  switch (priority) {
    case 'urgent':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'high':
      return 'text-orange-700 bg-orange-50 border-orange-200'
    case 'medium':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'low':
      return 'text-gray-700 bg-gray-100 border-gray-300'
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300'
  }
}

function formatDate(dateStr: string): string {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ViewJobCardPage() {
  const router = useRouter()
  const params = useParams()
  const [jobCard, setJobCard] = useState<JobCardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['issues', 'tasks']))
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (params.id) {
        setJobCard(getMockJobCard(params.id as string))
        setLoading(false)
      }
    }, 500)
  }, [params.id])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf0f5]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300" />
            <div className="absolute inset-0 rounded-full border-4 border-t-gray-600 border-r-transparent border-b-transparent animate-spin" />
          </div>
          <p className="mt-6 text-gray-600 font-medium text-base">Loading job card...</p>
        </div>
      </div>
    )
  }

  if (error || !jobCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf0f5] p-4">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Error Loading Job Card</h2>
              <p className="text-sm text-gray-600 mt-0.5">{error || 'Job card not found'}</p>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-700 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-600 active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ecf0f5] pb-safe md:pb-0">
      {/* Header - Mobile Optimized */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{jobCard.jobCardNumber}</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
              </p>
            </div>

            {/* Status badges - only on mobile header */}
            <div className="flex items-center gap-1 md:hidden">
              <span className={cn('px-2 py-1 rounded-lg border text-xs font-semibold', getStatusColor(jobCard.status))}>
                {jobCard.status.replace('_', ' ')}
              </span>
              <span className={cn('px-2 py-1 rounded-lg border text-xs font-semibold', getPriorityColor(jobCard.priority))}>
                <Flag className="h-3 w-3 inline mr-0.5" />
                {jobCard.priority}
              </span>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <span className={cn('px-3 py-1 rounded-lg border text-xs font-semibold', getStatusColor(jobCard.status))}>
                {jobCard.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={cn('px-3 py-1 rounded-lg border text-xs font-semibold', getPriorityColor(jobCard.priority))}>
                <Flag className="h-3 w-3 inline mr-1" />
                {jobCard.priority.toUpperCase()}
              </span>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <button className="h-11 px-3 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors" title="Print">
                <Printer className="h-4 w-4 text-gray-700" />
              </button>
              <button className="h-11 px-3 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors" title="Share">
                <Share2 className="h-4 w-4 text-gray-700" />
              </button>
              <button className="h-11 px-3 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors" title="Edit">
                <Edit className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Quick Stats Bar - Mobile Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          <div className="bg-white border border-gray-200 md:rounded-xl md:border-2 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 font-medium">Tasks</p>
                <p className="text-base md:text-lg font-bold text-gray-900">
                  {jobCard.tasks.filter(t => t.status === 'completed').length}/{jobCard.tasks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 md:rounded-xl md:border-2 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Timer className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 font-medium">Time</p>
                <p className="text-base md:text-lg font-bold text-gray-900">{formatDuration(jobCard.laborMinutes)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 md:rounded-xl md:border-2 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 font-medium">Parts</p>
                <p className="text-base md:text-lg font-bold text-gray-900">
                  {jobCard.tasks.reduce((acc, task) => acc + task.parts.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 md:rounded-xl md:border-2 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 font-medium">Est. Cost</p>
                <p className="text-base md:text-lg font-bold text-gray-900">₹{jobCard.estimatedCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customer & Vehicle Info - Stack on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Customer Card - Mobile Optimized */}
          <div className="bg-white border border-gray-200 md:rounded-xl md:border-2 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-white truncate">
                    {jobCard.customer.firstName} {jobCard.customer.lastName}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300">Customer</p>
                </div>
                {jobCard.customer.loyaltyTier && (
                  <span className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-gray-700/20 text-gray-300 text-xs font-semibold border border-gray-600/30 hidden md:inline">
                    <Star className="h-3 w-3 inline mr-1" />
                    {jobCard.customer.loyaltyTier.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <a href={`tel:${jobCard.customer.phoneNumber}`} className="text-sm text-gray-900 font-medium hover:text-gray-700">
                  {jobCard.customer.phoneNumber}
                </a>
              </div>
              {jobCard.customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <a href={`mailto:${jobCard.customer.email}`} className="text-sm text-gray-900 font-medium hover:text-gray-700 truncate">
                    {jobCard.customer.email}
                  </a>
                </div>
              )}
              {(jobCard.customer.address || jobCard.customer.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    {[jobCard.customer.address, jobCard.customer.city, jobCard.customer.state, jobCard.customer.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
              <div className="pt-3 md:pt-4 border-t border-gray-200 grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Customer Since</p>
                  <p className="text-sm text-gray-900 font-semibold">{formatDate(jobCard.customer.customerSince || '')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Total Jobs</p>
                  <p className="text-sm text-gray-900 font-semibold">{jobCard.customer.totalJobs || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Card - Mobile Optimized */}
          <div className="bg-white border border-gray-200 md:rounded-xl md:border-2 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Car className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-white truncate">
                    {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300">{jobCard.vehicle.licensePlate}</p>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Color</p>
                  <p className="text-sm text-gray-900 font-semibold">{jobCard.vehicle.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Mileage</p>
                  <p className="text-sm text-gray-900 font-semibold">{jobCard.vehicle.currentMileage?.toLocaleString() || 'N/A'} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Fuel</p>
                  <p className="text-sm text-gray-900 font-semibold">{jobCard.vehicle.fuelType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Transmission</p>
                  <p className="text-sm text-gray-900 font-semibold">{jobCard.vehicle.transmission || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-3 md:pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VIN</span>
                  <span className="text-gray-900 font-medium text-xs md:text-sm">{jobCard.vehicle.vin || 'N/A'}</span>
                </div>
                {jobCard.vehicle.engineNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engine No.</span>
                    <span className="text-gray-900 font-medium text-xs md:text-sm">{jobCard.vehicle.engineNumber}</span>
                  </div>
                )}
                {jobCard.vehicle.chassisNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chassis No.</span>
                    <span className="text-gray-900 font-medium text-xs md:text-sm">{jobCard.vehicle.chassisNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Issues & Service Scope - Stack on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 md:rounded-xl md:border-2 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('issues')}
            className="w-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between active:bg-gray-50 transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-sm md:text-base font-bold text-gray-900">Issues & Service</h3>
                <p className="text-xs text-gray-600">
                  {jobCard.customerReportedIssues.length} issues • {jobCard.workRequestedItems.length} services
                </p>
              </div>
            </div>
            {expandedSections.has('issues') ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.has('issues') && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                  {/* Customer Reported Issues */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-700" />
                      <h4 className="text-sm font-bold text-gray-900">Issues</h4>
                    </div>
                    {jobCard.customerReportedIssues.map((issue, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 active:scale-[0.98] transition-transform">
                        <div className="flex items-start gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{issue}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Work Requested */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardCheck className="h-4 w-4 text-gray-700" />
                      <h4 className="text-sm font-bold text-gray-900">Services</h4>
                    </div>
                    {jobCard.workRequestedItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 active:scale-[0.98] transition-transform">
                        <div className="flex items-start gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Technical Diagnosis */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSearch className="h-4 w-4 text-gray-700" />
                      <h4 className="text-sm font-bold text-gray-900">Diagnosis</h4>
                    </div>
                    {jobCard.technicalDiagnosisItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 active:scale-[0.98] transition-transform">
                        <div className="flex items-start gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-graphite-50 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-graphite-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-graphite-900">Tasks</h3>
                  <p className="text-xs text-graphite-600">
                    {jobCard.tasks.filter(t => t.status === 'completed').length} of {jobCard.tasks.length} completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'grid' ? 'bg-graphite-100 text-graphite-900' : 'bg-white text-graphite-600 hover:bg-gray-50'
                    )}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'list' ? 'bg-graphite-100 text-graphite-900' : 'bg-white text-graphite-600 hover:bg-gray-50'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            'p-6 gap-4',
            viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex flex-col'
          )}>
            {jobCard.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                customerIssues={jobCard.customerReportedIssues}
                workRequested={jobCard.workRequestedItems}
                technicalDiagnosis={jobCard.technicalDiagnosisItems}
                isExpanded={expandedTasks.has(task.id)}
                onToggle={() => toggleTask(task.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </motion.div>

        {/* Scheduling & Assignment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Scheduling */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-graphite-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-graphite-700" />
              </div>
              <h3 className="text-base font-bold text-graphite-900">Scheduling</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-graphite-600">Promised Date</span>
                <span className="text-sm font-semibold text-graphite-900">
                  {jobCard.promisedDate ? formatDate(jobCard.promisedDate) : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-graphite-600">Promised Time</span>
                <span className="text-sm font-semibold text-graphite-900">{jobCard.promisedTime || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-graphite-600">Created</span>
                <span className="text-sm font-semibold text-graphite-900">{formatDateTime(jobCard.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-graphite-600">Last Updated</span>
                <span className="text-sm font-semibold text-graphite-900">{formatDateTime(jobCard.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-graphite-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-graphite-700" />
              </div>
              <h3 className="text-base font-bold text-graphite-900">Assignment</h3>
            </div>
            <div className="space-y-4">
              {jobCard.manager && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-graphite-700 to-graphite-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {jobCard.manager.firstName[0]}{jobCard.manager.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-graphite-900">
                      {jobCard.manager.firstName} {jobCard.manager.lastName}
                    </p>
                    <p className="text-xs text-graphite-600">Service Advisor</p>
                  </div>
                  {jobCard.manager.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-graphite-700 fill-amber-500" />
                      <span className="text-sm font-semibold text-graphite-900">{jobCard.manager.rating}</span>
                    </div>
                  )}
                </div>
              )}
              {jobCard.mechanic && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {jobCard.mechanic.firstName[0]}{jobCard.mechanic.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-graphite-900">
                      {jobCard.mechanic.firstName} {jobCard.mechanic.lastName}
                    </p>
                    <p className="text-xs text-graphite-600">Lead Mechanic</p>
                  </div>
                  {jobCard.mechanic.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-graphite-700 fill-amber-500" />
                      <span className="text-sm font-semibold text-graphite-900">{jobCard.mechanic.rating}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border-2 border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-graphite-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-graphite-700" />
            </div>
            <h3 className="text-base font-bold text-graphite-900">Cost Breakdown</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-graphite-600">Labor</span>
                <Timer className="h-4 w-4 text-graphite-600" />
              </div>
              <p className="text-2xl font-bold text-graphite-900 mb-1">₹{jobCard.laborCost.toLocaleString()}</p>
              <p className="text-xs text-graphite-600">{formatDuration(jobCard.laborMinutes)} @ ₹{Math.round(jobCard.laborCost / (jobCard.laborMinutes / 60))}/hr</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-graphite-600">Parts</span>
                <Package className="h-4 w-4 text-graphite-600" />
              </div>
              <p className="text-2xl font-bold text-graphite-900 mb-1">₹{jobCard.partsCost.toLocaleString()}</p>
              <p className="text-xs text-graphite-600">{jobCard.tasks.reduce((acc, t) => acc + t.parts.length, 0)} parts</p>
            </div>

            <div className="bg-gradient-to-br from-graphite-900 to-graphite-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Total (Est.)</span>
                <DollarSign className="h-4 w-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">₹{jobCard.estimatedCost.toLocaleString()}</p>
              <p className="text-xs text-gray-300">Estimated total cost</p>
            </div>
          </div>
        </motion.div>

        {/* Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {jobCard.customerNotes && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-graphite-50 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-graphite-700" />
                </div>
                <h4 className="text-sm font-bold text-graphite-900">Customer Notes</h4>
              </div>
              <p className="text-sm text-graphite-700">{jobCard.customerNotes}</p>
            </div>
          )}

          {jobCard.mechanicNotes && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-graphite-50 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-graphite-700" />
                </div>
                <h4 className="text-sm font-bold text-graphite-900">Mechanic Notes</h4>
              </div>
              <p className="text-sm text-graphite-700">{jobCard.mechanicNotes}</p>
            </div>
          )}

          {jobCard.internalNotes && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-graphite-50 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-graphite-800" />
                </div>
                <h4 className="text-sm font-bold text-graphite-900">Internal Notes</h4>
              </div>
              <p className="text-sm text-graphite-700">{jobCard.internalNotes}</p>
            </div>
          )}
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border-2 border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-graphite-50 flex items-center justify-center">
              <Activity className="h-5 w-5 text-graphite-700" />
            </div>
            <h3 className="text-base font-bold text-graphite-900">Activity Timeline</h3>
          </div>

          <div className="space-y-4">
            {jobCard.activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-graphite-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-graphite-700" />
                  </div>
                  {index < jobCard.activities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-graphite-900">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-graphite-600 mt-1">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-graphite-500 whitespace-nowrap ml-4">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.author && (
                    <p className="text-xs text-graphite-500 mt-1">by {activity.author}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom spacer for mobile fixed bar */}
        <div className="h-20 md:hidden" />
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 pb-safe">
          <div className="flex items-center gap-2">
            <button className="flex-1 h-11 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 active:scale-[0.98] text-white font-semibold rounded-lg transition-all shadow-lg">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button className="flex-1 h-11 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 active:scale-[0.98] text-white font-semibold rounded-lg transition-all shadow-lg">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button className="flex-1 h-11 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover active:scale-[0.98] text-gray-900 font-semibold rounded-lg transition-all shadow-lg">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================

interface TaskCardProps {
  task: Task
  index: number
  customerIssues: string[]
  workRequested: string[]
  technicalDiagnosis: string[]
  isExpanded: boolean
  onToggle: () => void
  viewMode: 'grid' | 'list'
}

function TaskCard({
  task,
  index,
  customerIssues,
  workRequested,
  technicalDiagnosis,
  isExpanded,
  onToggle,
  viewMode,
}: TaskCardProps) {
  const progress = task.subtasks ? Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-white rounded-lg md:rounded-xl border transition-all',
        task.status === 'completed' ? 'border-emerald-300 bg-emerald-50/30' :
        task.status === 'in_progress' ? 'border-blue-300 bg-blue-50/30' :
        task.status === 'blocked' ? 'border-amber-300 bg-amber-50/30' :
        'border-gray-200 active:border-gray-300'
      )}
    >
      {/* Card Header - Minimum 44px touch target */}
      <button
        onClick={onToggle}
        className="w-full p-3 md:p-4 flex items-start gap-3 active:bg-gray-50 transition-colors"
      >
        <div className="flex-shrink-0 mt-1">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-bold text-gray-900">{task.name}</h4>
            <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold border flex-shrink-0', getStatusColor(task.status))}>
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-3">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', getPriorityColor(task.priority))}>
              <Flag className="h-3 w-3 inline mr-0.5" />
              {task.priority}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
              <Tag className="h-3 w-3 inline mr-0.5" />
              {task.category}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
              <Timer className="h-3 w-3 inline mr-0.5" />
              {formatDuration(task.estimatedMinutes)}
            </span>
            {task.actualMinutes && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <Clock className="h-3 w-3 inline mr-0.5" />
                {formatDuration(task.actualMinutes)}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mb-3">
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
                    progress === 100 ? 'bg-emerald-500' :
                    progress >= 50 ? 'bg-gray-600' :
                    'bg-amber-500'
                  )}
                />
              </div>
            </div>
          )}

          {/* Linked Items Pills */}
          {(task.linkedToIssues?.length || task.linkedToServiceItems?.length || task.linkedToTechnicalDiagnosis?.length) && (
            <div className="flex flex-wrap gap-1">
              {task.linkedToIssues?.map((issueIdx, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200">
                  <Link2 className="h-3 w-3 inline mr-0.5" />
                  Issue #{issueIdx + 1}
                </span>
              ))}
              {task.linkedToServiceItems?.map((itemIdx, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300">
                  <Link2 className="h-3 w-3 inline mr-0.5" />
                  Service #{itemIdx + 1}
                </span>
              ))}
              {task.linkedToTechnicalDiagnosis?.map((diagIdx, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300">
                  <Link2 className="h-3 w-3 inline mr-0.5" />
                  Diag #{diagIdx + 1}
                </span>
              ))}
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

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200"
          >
            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              {/* Assigned To */}
              {task.assignedTo && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{task.assignedTo.role}</p>
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                  </h5>
                  <div className="space-y-2">
                    {task.subtasks.map((subtask, idx) => (
                      <div key={subtask.id} className="flex items-start gap-3 p-2 rounded-lg active:bg-gray-50 transition-colors">
                        <div className={cn(
                          'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                          subtask.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                        )}>
                          {subtask.completed && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', subtask.completed ? 'text-gray-500 line-through' : 'text-gray-900')}>
                            {subtask.name}
                          </p>
                          {subtask.description && (
                            <p className="text-xs text-gray-600">{subtask.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">{formatDuration(subtask.estimatedMinutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parts */}
              {task.parts.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Parts ({task.parts.length})
                  </h5>
                  <div className="space-y-2">
                    {task.parts.map((part) => (
                      <div key={part.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{part.partName}</p>
                          <p className="text-xs text-gray-600">
                            {part.quantity} {part.unit} × ₹{part.unitPrice}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-bold text-gray-900">₹{part.totalPrice}</p>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            part.status === 'installed' ? 'bg-emerald-100 text-emerald-700' :
                            part.status === 'received' ? 'bg-gray-200 text-gray-700' :
                            part.status === 'ordered' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          )}>
                            {part.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Estimated</p>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{Math.round(task.estimatedMinutes * task.laborRate / 60).toLocaleString()}
                  </p>
                </div>
                {task.actualMinutes && (
                  <div>
                    <p className="text-xs text-gray-600">Actual</p>
                    <p className="text-sm font-bold text-gray-900">
                      ₹{Math.round(task.actualMinutes * task.laborRate / 60).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
