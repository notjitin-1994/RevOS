'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
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
  MoreHorizontal,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Package,
  DollarSign,
  MessageSquare,
  Paperclip,
  History,
  Loader2,
  UserPlus,
  Settings,
  Play,
  Pause,
  Timer,
  ClipboardCheck,
  ClipboardList,
  Truck,
  Receipt,
  Car,
  Users,
  Flag,
  Tag,
  X,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  Video,
  Image,
  File,
  Download,
  Upload,
  Send,
  Bell,
  BellRing,
  Archive,
  Lock,
  Unlock,
  Shield,
  Star,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  Menu,
  Home,
  ChevronLeft,
  GripVertical,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'framer-motion'

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
}

interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  category: string
  assignedTo?: Employee
  estimatedHours: number
  actualHours: number
  parts: TaskPart[]
  dependencies?: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  tags?: string[]
  checklist?: TaskChecklist[]
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
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

interface WorkflowStage {
  id: string
  name: string
  status: ChecklistStatus
  completedAt?: string
  completedBy?: string
  items: WorkflowChecklistItem[]
}

interface WorkflowChecklistItem {
  id: string
  title: string
  description?: string
  status: ChecklistStatus
  completedAt?: string
  completedBy?: string
  notes?: string
  photos?: string[]
  required: boolean
}

interface Activity {
  id: string
  type: 'status_change' | 'comment' | 'task_update' | 'file_upload' | 'assignment' | 'system'
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

  // Issues and tasks
  customerIssues: CustomerIssue[]
  tasks: Task[]

  // Workflow
  workflowStages: WorkflowStage[]

  // Activity
  activities: Activity[]

  // Costs
  estimatedCost: number
  actualCost: number
  laborHours: number
  partsCost: number

  // Notes
  customerNotes?: string
  internalNotes?: string
  mechanicNotes?: string

  // Tags and labels
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

  customerIssues: [
    {
      id: 'issue-1',
      description: 'Engine making strange grinding noise when accelerating above 40 km/h',
      priority: 'high',
      category: 'Engine',
      reportedBy: 'Customer (Rajesh Kumar)',
      reportedAt: '2025-01-18T09:30:00Z',
      status: 'confirmed',
      photos: [],
    },
    {
      id: 'issue-2',
      description: 'Vehicle vibrating at high speeds',
      priority: 'medium',
      category: 'Suspension',
      reportedBy: 'Service Advisor',
      reportedAt: '2025-01-18T09:35:00Z',
      status: 'in_progress',
    },
    {
      id: 'issue-3',
      description: 'Brake pads making squeaking noise',
      priority: 'low',
      category: 'Brakes',
      reportedBy: 'Mechanic (Amit Sharma)',
      reportedAt: '2025-01-18T10:00:00Z',
      status: 'reported',
    },
  ],

  tasks: [
    {
      id: 'task-1',
      title: 'Diagnose engine noise issue',
      description: 'Perform thorough inspection of engine compartment, check timing belt, tensioner, and related components',
      status: 'completed',
      priority: 'high',
      category: 'Diagnostics',
      assignedTo: {
        id: 'mech-1',
        firstName: 'Amit',
        lastName: 'Sharma',
        role: 'mechanic',
        rating: 4.7,
      },
      estimatedHours: 1.5,
      actualHours: 2,
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
      title: 'Replace timing belt and tensioner',
      description: 'Replace worn timing belt and tensioner assembly, re-time engine, verify operation',
      status: 'in_progress',
      priority: 'high',
      category: 'Engine',
      assignedTo: {
        id: 'mech-1',
        firstName: 'Amit',
        lastName: 'Sharma',
        role: 'mechanic',
        rating: 4.7,
      },
      estimatedHours: 3,
      actualHours: 1.5,
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
      createdAt: '2025-01-18T11:50:00Z',
      updatedAt: '2025-01-18T13:30:00Z',
      tags: ['engine', 'timing-belt'],
      checklist: [
        { id: 'chk-4', title: 'Drain coolant', completed: true, completedAt: '2025-01-18T12:00:00Z' },
        { id: 'chk-5', title: 'Remove old belt', completed: true, completedAt: '2025-01-18T12:30:00Z' },
        { id: 'chk-6', title: 'Install new belt', completed: true, completedAt: '2025-01-18T13:00:00Z' },
        { id: 'chk-7', title: 'Re-time engine', completed: true, completedAt: '2025-01-18T13:15:00Z' },
        { id: 'chk-8', title: 'Refill coolant', completed: false },
        { id: 'chk-9', title: 'Test start engine', completed: false },
        { id: 'chk-10', title: 'Final inspection', completed: false },
      ],
      comments: [],
    },
    {
      id: 'task-3',
      title: 'Check suspension for vibration',
      description: 'Inspect front and rear suspension, check wheel bearings, check tire balance',
      status: 'pending',
      priority: 'medium',
      category: 'Suspension',
      estimatedHours: 2,
      actualHours: 0,
      parts: [],
      createdAt: '2025-01-18T11:50:00Z',
      updatedAt: '2025-01-18T11:50:00Z',
      tags: ['suspension', 'vibration'],
      dependencies: ['task-2'],
      checklist: [
        { id: 'chk-11', title: 'Visual inspection', completed: false },
        { id: 'chk-12', title: 'Wheel alignment check', completed: false },
        { id: 'chk-13', title: 'Test drive', completed: false },
      ],
      comments: [],
    },
    {
      id: 'task-4',
      title: 'Inspect brake pads',
      description: 'Check front and rear brake pads, measure thickness, check for wear patterns',
      status: 'pending',
      priority: 'low',
      category: 'Brakes',
      estimatedHours: 1,
      actualHours: 0,
      parts: [],
      createdAt: '2025-01-18T12:00:00Z',
      updatedAt: '2025-01-18T12:00:00Z',
      tags: ['brakes'],
      checklist: [
        { id: 'chk-14', title: 'Remove wheels', completed: false },
        { id: 'chk-15', title: 'Measure pad thickness', completed: false },
        { id: 'chk-16', title: 'Check rotors', completed: false },
        { id: 'chk-17', title: 'Document findings', completed: false },
      ],
      comments: [],
    },
  ],

  workflowStages: [
    {
      id: 'stage-1',
      name: 'Vehicle Inspection',
      status: 'completed',
      completedAt: '2025-01-18T10:30:00Z',
      completedBy: 'Amit Sharma',
      items: [
        {
          id: 'wf-1',
          title: 'Visual inspection of exterior',
          description: 'Check for scratches, dents, paint damage',
          status: 'completed',
          completedAt: '2025-01-18T09:45:00Z',
          completedBy: 'Amit Sharma',
          required: true,
        },
        {
          id: 'wf-2',
          title: 'Interior inspection',
          description: 'Check seats, dashboard, electronics',
          status: 'completed',
          completedAt: '2025-01-18T10:00:00Z',
          completedBy: 'Amit Sharma',
          required: true,
        },
        {
          id: 'wf-3',
          title: 'Engine compartment inspection',
          description: 'Check fluids, belts, hoses, leaks',
          status: 'completed',
          completedAt: '2025-01-18T10:15:00Z',
          completedBy: 'Amit Sharma',
          required: true,
        },
        {
          id: 'wf-4',
          title: 'Test drive',
          description: 'Verify customer reported issues',
          status: 'completed',
          completedAt: '2025-01-18T10:30:00Z',
          completedBy: 'Amit Sharma',
          required: true,
          notes: 'Confirmed grinding noise at 40+ km/h, vibration at high speeds',
        },
        {
          id: 'wf-5',
          title: 'Mileage and photos',
          description: 'Record current mileage, take before photos',
          status: 'completed',
          completedAt: '2025-01-18T09:30:00Z',
          completedBy: 'Vikram Singh',
          required: true,
        },
      ],
    },
    {
      id: 'stage-2',
      name: 'Tasks Execution',
      status: 'in_progress',
      items: [
        {
          id: 'wf-6',
          title: 'Diagnose engine noise issue',
          description: 'Task: Diagnose engine noise issue',
          status: 'completed',
          completedAt: '2025-01-18T11:45:00Z',
          completedBy: 'Amit Sharma',
          required: true,
        },
        {
          id: 'wf-7',
          title: 'Replace timing belt and tensioner',
          description: 'Task: Replace timing belt and tensioner',
          status: 'in_progress',
          required: true,
        },
        {
          id: 'wf-8',
          title: 'Check suspension for vibration',
          description: 'Task: Check suspension for vibration',
          status: 'pending',
          required: false,
        },
        {
          id: 'wf-9',
          title: 'Inspect brake pads',
          description: 'Task: Inspect brake pads',
          status: 'pending',
          required: false,
        },
      ],
    },
    {
      id: 'stage-3',
      name: 'Quality Check',
      status: 'pending',
      items: [
        {
          id: 'wf-10',
          title: 'Visual quality check',
          description: 'Ensure work area is clean, no debris left behind',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-11',
          title: 'Test drive verification',
          description: 'Verify all reported issues are resolved',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-12',
          title: 'Safety inspection',
          description: 'Check all safety-related components',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-13',
          title: 'Fluid levels check',
          description: 'Top up all fluids as needed',
          status: 'pending',
          required: true,
        },
      ],
    },
    {
      id: 'stage-4',
      name: 'Delivery Checklist',
      status: 'pending',
      items: [
        {
          id: 'wf-14',
          title: 'Customer issues verification',
          description: 'Review and verify all customer reported issues are addressed',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-15',
          title: 'Final cleaning',
          description: 'Clean vehicle interior and exterior',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-16',
          title: 'Documentation review',
          description: 'Review all service documents with customer',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-17',
          title: 'Customer sign-off',
          description: 'Obtain customer signature on job card',
          status: 'pending',
          required: true,
        },
      ],
    },
    {
      id: 'stage-5',
      name: 'Invoicing',
      status: 'pending',
      items: [
        {
          id: 'wf-18',
          title: 'Finalize invoice',
          description: 'Generate invoice with all parts and labor',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-19',
          title: 'Payment processing',
          description: 'Process customer payment',
          status: 'pending',
          required: true,
        },
        {
          id: 'wf-20',
          title: 'Close job card',
          description: 'Mark job card as delivered and archive',
          status: 'pending',
          required: true,
        },
      ],
    },
  ],

  activities: [
    {
      id: 'act-1',
      type: 'status_change',
      title: 'Job card status changed to "In Progress"',
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
  ],

  estimatedCost: 7500,
  actualCost: 5175,
  laborHours: 6.5,
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
      return 'text-gray-600 bg-gray-100 border-gray-300'
    case 'queued':
      return 'text-status-info bg-status-info/10 border-status-info/20'
    case 'in_progress':
      return 'text-status-warning bg-status-warning/10 border-status-warning/20'
    case 'parts_waiting':
    case 'blocked':
      return 'text-status-error bg-status-error/10 border-status-error/20'
    case 'quality_check':
      return 'text-purple-600 bg-purple-100 border-purple-300'
    case 'ready':
      return 'text-status-success bg-status-success/10 border-status-success/20'
    case 'completed':
    case 'delivered':
      return 'text-status-success bg-status-success/10 border-status-success/20'
    case 'cancelled':
      return 'text-red-600 bg-red-100 border-red-300'
    case 'skipped':
      return 'text-gray-500 bg-gray-100 border-gray-300'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300'
  }
}

function getPriorityColor(priority: Priority) {
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

function getWorkflowStageIcon(stageName: string) {
  switch (stageName) {
    case 'Vehicle Inspection':
      return <Car className="h-4 w-4" />
    case 'Tasks Execution':
      return <Settings className="h-4 w-4" />
    case 'Quality Check':
      return <ClipboardCheck className="h-4 w-4" />
    case 'Delivery Checklist':
      return <Truck className="h-4 w-4" />
    case 'Invoicing':
      return <Receipt className="h-4 w-4" />
    default:
      return <Circle className="h-4 w-4" />
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

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Section Header Component
interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  badge?: string | number
  action?: React.ReactNode
  collapsible?: boolean
  isCollapsed?: boolean
  onToggle?: () => void
}

function SectionHeader({
  icon,
  title,
  badge,
  action,
  collapsible = false,
  isCollapsed = false,
  onToggle,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {badge !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action}
        {collapsible && (
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: JobCardStatus | TaskStatus | ChecklistStatus
  size?: 'sm' | 'md'
  showIcon?: boolean
}

function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const colors = getStatusColor(status)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${colors} ${sizeClasses}`}>
      {showIcon && <Circle className={`h-3 w-3 fill-current ${status === 'completed' || status === 'delivered' ? 'text-current' : ''}`} />}
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  )
}

// Priority Badge Component
interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md'
}

function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const colors = getPriorityColor(priority)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border font-semibold ${colors} ${sizeClasses}`}>
      <Flag className={`h-3 w-3 ${priority === 'urgent' ? 'fill-current' : ''}`} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

// ============================================================================
// MOBILE-SPECIFIC COMPONENTS
// ============================================================================

// Mobile Bottom Sheet Component
interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  height?: 'full' | 'half' | 'auto'
}

function MobileBottomSheet({ isOpen, onClose, title, children, height = 'auto' }: MobileBottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const heightClasses = {
    full: 'h-[85vh]',
    half: 'h-[50vh]',
    auto: 'max-h-[70vh]',
  }[height]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 lg:hidden"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl ${heightClasses} flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            onClick={onClose}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Mobile Bottom Navigation Bar
interface MobileBottomNavProps {
  activeTab: 'activity' | 'checklist' | 'tasklist'
  onTabChange: (tab: 'activity' | 'checklist' | 'tasklist') => void
  badgeCounts?: {
    tasklist?: number
    activity?: number
  }
}

function MobileBottomNav({ activeTab, onTabChange, badgeCounts }: MobileBottomNavProps) {
  const tabs = [
    { id: 'activity' as const, label: 'Activity', icon: Activity },
    { id: 'checklist' as const, label: 'Checklist', icon: ClipboardList },
    { id: 'tasklist' as const, label: 'Tasks', icon: Settings },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const badge = tab.id === 'tasklist' ? badgeCounts?.tasklist :
                        tab.id === 'activity' ? badgeCounts?.activity :
                        undefined

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-2 relative min-h-[44px]"
            >
              <div className="relative">
                <tab.icon className={`h-6 w-6 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Floating Action Button (FAB)
interface FABProps {
  actions: Array<{
    icon: React.ReactNode
    label: string
    onClick: () => void
    color?: string
  }>
}

function FAB({ actions }: FABProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-2 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
                  action.color || 'bg-gray-900'
                } text-white min-w-[160px] justify-start`}
              >
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-gray-900 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>
    </div>
  )
}

// Mobile Swipeable Tabs Hook
function useSwipeableTabs(onTabChange: (direction: 'left' | 'right') => void) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      onTabChange('left')
    } else if (isRightSwipe) {
      onTabChange('right')
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

// Mobile Quick Actions Bar
interface MobileQuickActionsProps {
  onCallCustomer: () => void
  onViewStaff: () => void
  onViewVehicle: () => void
  onAddComment: () => void
}

function MobileQuickActions({ onCallCustomer, onViewStaff, onViewVehicle, onAddComment }: MobileQuickActionsProps) {
  const actions = [
    { icon: <Phone className="h-5 w-5" />, label: 'Call', onClick: onCallCustomer, color: 'bg-green-600' },
    { icon: <Users className="h-5 w-5" />, label: 'Staff', onClick: onViewStaff, color: 'bg-blue-600' },
    { icon: <Car className="h-5 w-5" />, label: 'Vehicle', onClick: onViewVehicle, color: 'bg-purple-600' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Comment', onClick: onAddComment, color: 'bg-orange-600' },
  ]

  return (
    <div className="lg:hidden grid grid-cols-4 gap-2 px-4 py-3 bg-white border-t border-gray-200">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`${action.color} text-white rounded-xl p-3 flex flex-col items-center gap-1 min-h-[64px]`}
          style={{ minHeight: '64px' }}
        >
          {action.icon}
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

// Mobile Pull to Refresh Indicator
interface PullToRefreshProps {
  isRefreshing: boolean
  progress: number
}

function PullToRefreshIndicator({ isRefreshing, progress }: PullToRefreshProps) {
  return (
    <div className="lg:hidden flex justify-center pt-2">
      <motion.div
        animate={{ rotate: isRefreshing ? 360 : 0 }}
        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
        style={{ opacity: Math.min(progress / 100, 1) }}
      >
        <RefreshCw className="h-6 w-6 text-gray-600" />
      </motion.div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function JobCardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobCardId = params.id as string

  const [jobCard, setJobCard] = useState<JobCardDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // View mode: detail | edit
  const [viewMode, setViewMode] = useState<'detail' | 'edit'>('detail')

  // Active tab
  const [activeTab, setActiveTab] = useState<'activity' | 'checklist' | 'tasklist'>('activity')

  // Collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // Selected task for detail view
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Timer state for tasks
  const [runningTimers, setRunningTimers] = useState<Set<string>>(new Set())

  // New task modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // New comment input
  const [newComment, setNewComment] = useState('')

  // Filter states
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [activityFilter, setActivityFilter] = useState<'all' | 'status_change' | 'comment' | 'task_update' | 'assignment'>('all')

  // Mobile-specific states
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showStaffBottomSheet, setShowStaffBottomSheet] = useState(false)
  const [showCustomerBottomSheet, setShowCustomerBottomSheet] = useState(false)
  const [showVehicleBottomSheet, setShowVehicleBottomSheet] = useState(false)
  const [showTaskBottomSheet, setShowTaskBottomSheet] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [selectedMobileTask, setSelectedMobileTask] = useState<Task | null>(null)
  const [showMobileComments, setShowMobileComments] = useState(false)

  useEffect(() => {
    if (jobCardId) {
      loadJobCard()
    }
  }, [jobCardId])

  const loadJobCard = async () => {
    try {
      setIsLoading(true)
      // For now, use mock data
      console.log('Loading job card with mock data')
      setJobCard(getMockJobCard(jobCardId))
      setIsLoading(false)
      setError(null)
    } catch (err) {
      console.error('Error loading job card:', err)
      setError(err instanceof Error ? err.message : 'Failed to load job card')
      setIsLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const toggleTaskTimer = (taskId: string) => {
    setRunningTimers(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    // TODO: Implement comment addition
    console.log('Adding comment:', newComment)
    setNewComment('')
  }

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!jobCard) return
    setJobCard({
      ...jobCard,
      tasks: jobCard.tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    })
  }

  const updateWorkflowItemStatus = (stageId: string, itemId: string, newStatus: ChecklistStatus) => {
    if (!jobCard) return
    setJobCard({
      ...jobCard,
      workflowStages: jobCard.workflowStages.map(stage => {
        if (stage.id === stageId) {
          return {
            ...stage,
            items: stage.items.map(item =>
              item.id === itemId
                ? {
                    ...item,
                    status: newStatus,
                    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
                    completedBy: newStatus === 'completed' ? 'Current User' : undefined,
                  }
                : item
            ),
          }
        }
        return stage
      }),
    })
  }

  // Mobile-specific handlers
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadJobCard()
    setTimeout(() => {
      setIsRefreshing(false)
      setPullProgress(0)
    }, 1000)
  }

  const handleTabSwipe = (direction: 'left' | 'right') => {
    const tabs: Array<'activity' | 'checklist' | 'tasklist'> = ['activity', 'checklist', 'tasklist']
    const currentIndex = tabs.indexOf(activeTab)

    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  const handleMobileTaskClick = (task: Task) => {
    setSelectedMobileTask(task)
    setShowTaskBottomSheet(true)
  }

  const handleCallCustomer = () => {
    if (jobCard?.customer.phoneNumber) {
      window.location.href = `tel:${jobCard.customer.phoneNumber}`
    }
  }

  const fabActions = [
    { icon: <Plus className="h-5 w-5" />, label: 'Add Task', onClick: () => setShowNewTaskModal(true), color: 'bg-blue-600' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Add Comment', onClick: () => setShowMobileComments(true), color: 'bg-green-600' },
    { icon: <Phone className="h-5 w-5" />, label: 'Call Customer', onClick: handleCallCustomer, color: 'bg-orange-600' },
    { icon: <Edit className="h-5 w-5" />, label: 'Edit Job Card', onClick: () => setViewMode('edit'), color: 'bg-purple-600' },
  ]

  const swipeHandlers = useSwipeableTabs(handleTabSwipe)

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

  const calculateProgress = (items: typeof jobCard.workflowStages[0]['items']) => {
    if (items.length === 0) return 0
    const completed = items.filter(i => i.status === 'completed').length
    return Math.round((completed / items.length) * 100)
  }

  const isSectionCollapsed = (sectionId: string) => collapsedSections.has(sectionId)

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator isRefreshing={isRefreshing} progress={pullProgress} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back button + Job Card Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push('/job-cards')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Back to Job Cards"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-gray-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base md:text-lg font-bold text-gray-900 font-mono truncate">{jobCard.jobCardNumber}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Created {formatDate(jobCard.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Status & Priority (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <StatusBadge status={jobCard.status} />
              <PriorityBadge priority={jobCard.priority} />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-700" />
              </button>

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'detail' ? 'edit' : 'detail')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all text-sm"
                >
                  <Edit className="h-4 w-4" />
                  <span>{viewMode === 'detail' ? 'Edit' : 'View'}</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                  <Printer className="h-5 w-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Status & Priority */}
          <div className="flex md:hidden items-center gap-3 mt-3">
            <StatusBadge status={jobCard.status} size="sm" />
            <PriorityBadge priority={jobCard.priority} size="sm" />
            <span className="text-xs text-gray-500 ml-auto">
              {formatDate(jobCard.createdAt)}
            </span>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-3 pt-3 border-t border-gray-200 overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setViewMode(viewMode === 'detail' ? 'edit' : 'detail')
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{viewMode === 'detail' ? 'Edit' : 'View'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      // TODO: Implement print
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Printer className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Print</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomerBottomSheet(true)
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">View Customer</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowVehicleBottomSheet(true)
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Car className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">View Vehicle</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowStaffBottomSheet(true)
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">View Staff</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Quick Actions Bar */}
      <MobileQuickActions
        onCallCustomer={handleCallCustomer}
        onViewStaff={() => setShowStaffBottomSheet(true)}
        onViewVehicle={() => setShowVehicleBottomSheet(true)}
        onAddComment={() => setShowMobileComments(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{jobCard.customer.firstName} {jobCard.customer.lastName}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Vehicle</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Labor</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{jobCard.laborHours} hrs</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Est. Cost</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">₹{jobCard.estimatedCost.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid lg:grid-cols-12 gap-4">
          {/* Left Sidebar: Quick Info */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Staff Assignment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-card p-4"
            >
              <SectionHeader
                icon={<Users className="h-4 w-4" />}
                title="Staff"
                action={
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors" title="Assign Staff">
                    <UserPlus className="h-4 w-4 text-gray-600" />
                  </button>
                }
              />

              <div className="space-y-3">
                {/* Manager */}
                {jobCard.manager && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">
                        {jobCard.manager.firstName.charAt(0)}{jobCard.manager.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{jobCard.manager.firstName} {jobCard.manager.lastName}</p>
                      <p className="text-xs text-gray-600 capitalize">{jobCard.manager.role}</p>
                    </div>
                  </div>
                )}

                {/* Mechanic */}
                {jobCard.mechanic && (
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">
                        {jobCard.mechanic.firstName.charAt(0)}{jobCard.mechanic.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{jobCard.mechanic.firstName} {jobCard.mechanic.lastName}</p>
                      <p className="text-xs text-gray-600 capitalize">{jobCard.mechanic.role}</p>
                    </div>
                  </div>
                )}

                {!jobCard.manager && !jobCard.mechanic && (
                  <p className="text-sm text-gray-500 text-center py-2">No staff assigned</p>
                )}
              </div>
            </motion.div>

            {/* Customer Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden"
            >
              <SectionHeader
                icon={<User className="h-4 w-4" />}
                title="Customer"
                collapsible
                isCollapsed={isSectionCollapsed('customer')}
                onToggle={() => toggleSection('customer')}
              />

              {!isSectionCollapsed('customer') && (
                <div className="px-4 pb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{jobCard.customer.firstName} {jobCard.customer.lastName}</p>
                      {jobCard.customer.loyaltyTier && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600 capitalize">{jobCard.customer.loyaltyTier} Member</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <a href={`tel:${jobCard.customer.phoneNumber}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{jobCard.customer.phoneNumber}</span>
                      </a>

                      {jobCard.customer.email && (
                        <a href={`mailto:${jobCard.customer.email}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{jobCard.customer.email}</span>
                        </a>
                      )}

                      {(jobCard.customer.address || jobCard.customer.city) && (
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                          <span className="text-xs">
                            {[jobCard.customer.address, jobCard.customer.city, jobCard.customer.state, jobCard.customer.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Customer Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{jobCard.customer.totalJobs || 0}</p>
                        <p className="text-xs text-gray-600">Total Jobs</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{jobCard.customer.totalVehicles || 0}</p>
                        <p className="text-xs text-gray-600">Vehicles</p>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all text-sm">
                      <Eye className="h-4 w-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Vehicle Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden"
            >
              <SectionHeader
                icon={<Car className="h-4 w-4" />}
                title="Vehicle"
                collapsible
                isCollapsed={isSectionCollapsed('vehicle')}
                onToggle={() => toggleSection('vehicle')}
              />

              {!isSectionCollapsed('vehicle') && (
                <div className="px-4 pb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}</p>
                      <p className="text-xs text-gray-600 font-mono mt-1">{jobCard.vehicle.licensePlate}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {jobCard.vehicle.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color</span>
                          <span className="font-medium text-gray-900">{jobCard.vehicle.color}</span>
                        </div>
                      )}
                      {jobCard.vehicle.fuelType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fuel</span>
                          <span className="font-medium text-gray-900">{jobCard.vehicle.fuelType}</span>
                        </div>
                      )}
                      {jobCard.vehicle.transmission && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transmission</span>
                          <span className="font-medium text-gray-900">{jobCard.vehicle.transmission}</span>
                        </div>
                      )}
                      {jobCard.vehicle.currentMileage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mileage</span>
                          <span className="font-medium text-gray-900">{jobCard.vehicle.currentMileage.toLocaleString()} km</span>
                        </div>
                      )}
                    </div>

                    {jobCard.vehicle.vin && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">VIN</p>
                        <p className="text-xs text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{jobCard.vehicle.vin}</p>
                      </div>
                    )}

                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all text-sm">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Schedule & Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-card p-4"
            >
              <SectionHeader icon={<Calendar className="h-4 w-4" />} title="Schedule" />

              <div className="space-y-3">
                {jobCard.promisedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Promised</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(jobCard.promisedDate)}
                      {jobCard.promisedTime && ` ${formatTime(jobCard.promisedTime)}`}
                    </span>
                  </div>
                )}
                {jobCard.actualCompletionDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-status-success">{formatDate(jobCard.actualCompletionDate)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-4">
            {/* Overview Section (Always Visible) */}
            <div>
              <SectionHeader
                icon={<FileText className="h-4 w-4" />}
                title="Overview"
              />
              <div className="space-y-4 mt-4">
              {/* Customer Issues / Checklist Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-200 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-orange-900">Customer Issues Checklist</h3>
                      <p className="text-xs text-orange-700">Issues reported by customer - Manager reviewed</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-orange-200 text-orange-800 text-xs font-semibold">
                      {jobCard.customerIssues.length}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {jobCard.customerIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                    >
                      <div className="mt-0.5">
                        {issue.status === 'resolved' ? (
                          <CheckCircle2 className="h-4 w-4 text-status-success" />
                        ) : issue.status === 'in_progress' ? (
                          <Clock className="h-4 w-4 text-status-warning" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{issue.description}</p>
                          <PriorityBadge priority={issue.priority} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="px-2 py-0.5 bg-gray-200 rounded capitalize">{issue.category}</span>
                          <span>Reported by {issue.reportedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Notes & Cost Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                {jobCard.customerNotes && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border border-blue-200 rounded-xl p-4 bg-blue-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-700" />
                      <h4 className="text-sm font-semibold text-blue-900">Customer Notes</h4>
                    </div>
                    <p className="text-sm text-blue-800">{jobCard.customerNotes}</p>
                  </motion.div>
                )}

                {jobCard.mechanicNotes && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="border border-amber-200 rounded-xl p-4 bg-amber-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-amber-700" />
                      <h4 className="text-sm font-semibold text-amber-900">Mechanic Notes</h4>
                    </div>
                    <p className="text-sm text-amber-800">{jobCard.mechanicNotes}</p>
                  </motion.div>
                )}

                {jobCard.internalNotes && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Internal Notes</h4>
                    </div>
                    <p className="text-sm text-gray-700">{jobCard.internalNotes}</p>
                  </motion.div>
                )}
              </div>

              {/* Cost Summary */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-xl border border-gray-200 shadow-card p-4"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Cost Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Labor Hours</p>
                    <p className="text-lg font-bold text-gray-900">{jobCard.laborHours} hrs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Parts Cost</p>
                    <p className="text-lg font-bold text-gray-900">₹{jobCard.partsCost.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Estimated Total</p>
                    <p className="text-lg font-bold text-gray-900">₹{jobCard.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden"
            >
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex gap-1 min-w-max px-2">
                  {[
                    { id: 'activity', label: 'Activity', icon: Activity },
                    { id: 'checklist', label: 'Checklist', icon: ClipboardList },
                    { id: 'tasklist', label: 'Task List', icon: Settings },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-graphite-700 text-graphite-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div
                className="p-3 md:p-4 touch-pan-y pb-24 md:pb-6"
                {...swipeHandlers}
              >
                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {/* Activity Filter */}
                    <div className="flex items-center gap-3">
                      <select
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        <option value="all">All Activity</option>
                        <option value="status_change">Status Changes</option>
                        <option value="comment">Comments</option>
                        <option value="task_update">Task Updates</option>
                        <option value="assignment">Assignments</option>
                      </select>
                    </div>

                    {/* New Comment Input */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Attach File">
                            <Paperclip className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Add Image">
                            <Image className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-4 w-4" />
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="space-y-3">
                      {jobCard.activities
                        .filter(a => activityFilter === 'all' || a.type === activityFilter)
                        .map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <div className="mt-0.5">
                              {activity.type === 'status_change' && <RefreshCw className="h-4 w-4 text-status-info" />}
                              {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-status-warning" />}
                              {activity.type === 'task_update' && <CheckCircle2 className="h-4 w-4 text-status-success" />}
                              {activity.type === 'assignment' && <UserPlus className="h-4 w-4 text-purple-600" />}
                              {activity.type === 'file_upload' && <Paperclip className="h-4 w-4 text-gray-600" />}
                              {activity.type === 'system' && <Bell className="h-4 w-4 text-gray-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDateTime(activity.timestamp)}
                                </span>
                              </div>
                              {activity.author && (
                                <p className="text-xs text-gray-600 mb-1">by {activity.author}</p>
                              )}
                              {activity.description && (
                                <p className="text-sm text-gray-700 bg-gray-50 rounded px-2 py-1 mt-1">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Checklist Tab (formerly Workflow) */}
                {activeTab === 'checklist' && (
                  <div className="space-y-6">
                    {jobCard.workflowStages.map((stage, stageIndex) => {
                      const progress = calculateProgress(stage.items)
                      const isLast = stageIndex === jobCard.workflowStages.length - 1

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: stageIndex * 0.1 }}
                          className="border border-gray-200 rounded-xl overflow-hidden"
                        >
                          {/* Stage Header */}
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                stage.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : stage.status === 'in_progress'
                                  ? 'bg-status-warning/20 text-status-warning'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {getWorkflowStageIcon(stage.name)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-base font-bold text-gray-900">{stage.name}</h3>
                                  <StatusBadge status={stage.status} size="sm" />
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span>{progress}% Complete</span>
                                  <span>
                                    {stage.items.filter(i => i.status === 'completed').length} of {stage.items.length} items
                                  </span>
                                  {stage.completedAt && (
                                    <span className="text-status-success">
                                      Completed {formatDateTime(stage.completedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="h-10 w-10">
                                {stage.status === 'completed' ? (
                                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-white" />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-gray-600">{stageIndex + 1}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                              {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    progress === 100
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                      : progress > 0
                                      ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                                      : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Stage Items */}
                          <div className="p-4 bg-white">
                            <div className="space-y-2">
                              {stage.items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                    item.status === 'completed'
                                      ? 'bg-green-50 border-green-200'
                                      : item.status === 'in_progress'
                                      ? 'bg-status-warning/10 border-status-warning/20'
                                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <button
                                    onClick={() => {
                                      if (item.status !== 'completed') {
                                        updateWorkflowItemStatus(stage.id, item.id, 'completed')
                                      } else {
                                        updateWorkflowItemStatus(stage.id, item.id, 'pending')
                                      }
                                    }}
                                    className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                                      item.status === 'completed'
                                        ? 'bg-status-success border-status-success'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {item.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                                  </button>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <div>
                                        <p className={`text-sm font-medium ${item.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                                          {item.title}
                                          {item.required && <span className="text-status-error ml-1">*</span>}
                                        </p>
                                        {item.description && (
                                          <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                                        )}
                                      </div>
                                      {item.completedBy && (
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                          by {item.completedBy}
                                        </span>
                                      )}
                                    </div>

                                    {item.notes && (
                                      <p className="text-xs text-gray-700 bg-white rounded px-2 py-1 mt-2 border border-gray-200">
                                        {item.notes}
                                      </p>
                                    )}

                                    {item.completedAt && (
                                      <p className="text-xs text-status-success mt-1">
                                        Completed {formatDateTime(item.completedAt)}
                                      </p>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-white rounded-lg transition-colors" title="Add Note">
                                      <MessageSquare className="h-4 w-4 text-gray-500" />
                                    </button>
                                    <button className="p-1.5 hover:bg-white rounded-lg transition-colors" title="Add Photo">
                                      <Image className="h-4 w-4 text-gray-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Connector to next stage */}
                          {!isLast && (
                            <div className="flex justify-center py-2 bg-gray-50">
                              <div className="flex items-center gap-2 text-gray-400">
                                <div className="h-0.5 w-8 bg-gray-300" />
                                <ChevronDown className="h-4 w-4" />
                                <div className="h-0.5 w-8 bg-gray-300" />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* Tasklist Tab */}
                {activeTab === 'tasklist' && (
                  <div className="space-y-4">
                    {/* Task Actions Bar */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={taskStatusFilter}
                          onChange={(e) => setTaskStatusFilter(e.target.value as any)}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                          <option value="all">All Tasks</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <span className="text-sm text-gray-600">
                          {jobCard.tasks.filter(t => taskStatusFilter === 'all' || t.status === taskStatusFilter).length} tasks
                        </span>
                      </div>
                      <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </button>
                    </div>

                    {/* Tasks List */}
                    <div className="grid gap-4">
                      {jobCard.tasks
                        .filter(t => taskStatusFilter === 'all' || t.status === taskStatusFilter)
                        .map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded-xl overflow-hidden transition-all ${
                              selectedTaskId === task.id
                                ? 'border-gray-700 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Task Header */}
                            <div
                              className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer lg:cursor-default"
                              onClick={() => {
                                // On mobile, open bottom sheet; on desktop, toggle expand
                                if (window.innerWidth < 1024) {
                                  handleMobileTaskClick(task)
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-base font-semibold text-gray-900">{task.title}</h4>
                                    <StatusBadge status={task.status} size="sm" />
                                    <PriorityBadge priority={task.priority} size="sm" />
                                  </div>
                                  <p className="text-sm text-gray-700">{task.description}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {runningTimers.has(task.id) ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleTaskTimer(task.id)
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-all text-xs"
                                    >
                                      <Pause className="h-3 w-3" />
                                      Stop
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleTaskTimer(task.id)
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-all text-xs"
                                    >
                                      <Play className="h-3 w-3" />
                                      Start
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (window.innerWidth >= 1024) {
                                        setSelectedTaskId(selectedTaskId === task.id ? null : task.id)
                                      }
                                    }}
                                    className="hidden lg:block p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {selectedTaskId === task.id ? (
                                      <ChevronUp className="h-5 w-5 text-gray-600" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-gray-600" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMobileTaskClick(task)
                                    }}
                                    className="lg:hidden p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Task Details */}
                            {selectedTaskId === task.id && (
                              <div className="p-4 bg-white space-y-4">
                                {/* Task Metadata */}
                                <div className="grid md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Category</p>
                                    <p className="font-medium text-gray-900">{task.category}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Assigned To</p>
                                    <p className="font-medium text-gray-900">
                                      {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Time</p>
                                    <p className="font-medium text-gray-900">
                                      {task.actualHours} / {task.estimatedHours} hrs
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Created</p>
                                    <p className="font-medium text-gray-900">{formatDate(task.createdAt)}</p>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>
                                      {task.checklist?.filter(c => c.completed).length || 0} / {task.checklist?.length || 0} items
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gray-700 transition-all duration-300"
                                      style={{
                                        width: `${
                                          task.checklist && task.checklist.length > 0
                                            ? (task.checklist.filter(c => c.completed).length / task.checklist.length) * 100
                                            : 0
                                        }%`
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Task Checklist */}
                                {task.checklist && task.checklist.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Checklist</h5>
                                    <div className="space-y-2">
                                      {task.checklist.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 text-sm">
                                          <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                                            item.completed ? 'bg-status-success border-status-success' : 'border-gray-300'
                                          }`}>
                                            {item.completed && <Check className="h-3 w-3 text-white" />}
                                          </div>
                                          <span className={item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                                            {item.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Parts Used */}
                                {task.parts && task.parts.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Parts</h5>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 text-xs font-semibold text-gray-600 uppercase">Part</th>
                                            <th className="text-left py-2 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                                            <th className="text-left py-2 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="text-right py-2 text-xs font-semibold text-gray-600 uppercase">Price</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {task.parts.map((part) => (
                                            <tr key={part.id}>
                                              <td className="py-2">
                                                <p className="font-medium text-gray-900">{part.partName}</p>
                                                {part.partNumber && (
                                                  <p className="text-xs text-gray-500">{part.partNumber}</p>
                                                )}
                                              </td>
                                              <td className="py-2 text-gray-700">
                                                {part.quantity} {part.unit}
                                              </td>
                                              <td className="py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                  part.status === 'installed' ? 'bg-status-success/10 text-status-success' :
                                                  part.status === 'received' ? 'bg-status-info/10 text-status-info' :
                                                  'bg-gray-100 text-gray-700'
                                                }`}>
                                                  {part.status}
                                                </span>
                                              </td>
                                              <td className="py-2 text-right font-medium text-gray-900">
                                                ₹{part.totalPrice.toLocaleString()}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Task Comments */}
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-900 mb-2">Comments</h5>
                                  {task.comments && task.comments.length > 0 ? (
                                    <div className="space-y-2">
                                      {task.comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-900">{comment.author}</span>
                                            <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                                          </div>
                                          <p className="text-gray-700">{comment.text}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ================================================================== */}
      {/* MOBILE COMPONENTS */}
      {/* ================================================================== */}

      {/* Floating Action Button (FAB) */}
      <FAB actions={fabActions} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        badgeCounts={{
          tasklist: jobCard.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
          activity: jobCard.activities.filter(a => a.type === 'comment').length,
        }}
      />

      {/* Staff Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showStaffBottomSheet}
        onClose={() => setShowStaffBottomSheet(false)}
        title="Staff Assignment"
        height="half"
      >
        <div className="space-y-4">
          {jobCard.manager && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">
                    {jobCard.manager.firstName.charAt(0)}{jobCard.manager.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{jobCard.manager.firstName} {jobCard.manager.lastName}</p>
                  <p className="text-sm text-gray-600 capitalize">{jobCard.manager.role}</p>
                </div>
              </div>
              {jobCard.manager.email && (
                <a href={`mailto:${jobCard.manager.email}`} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>{jobCard.manager.email}</span>
                </a>
              )}
              {jobCard.manager.phoneNumber && (
                <a href={`tel:${jobCard.manager.phoneNumber}`} className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{jobCard.manager.phoneNumber}</span>
                </a>
              )}
            </div>
          )}

          {jobCard.mechanic && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700">
                    {jobCard.mechanic.firstName.charAt(0)}{jobCard.mechanic.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{jobCard.mechanic.firstName} {jobCard.mechanic.lastName}</p>
                  <p className="text-sm text-gray-600 capitalize">{jobCard.mechanic.role}</p>
                </div>
              </div>
              {jobCard.mechanic.specialization && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {jobCard.mechanic.specialization.map((spec) => (
                    <span key={spec} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
              {jobCard.mechanic.email && (
                <a href={`mailto:${jobCard.mechanic.email}`} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>{jobCard.mechanic.email}</span>
                </a>
              )}
              {jobCard.mechanic.phoneNumber && (
                <a href={`tel:${jobCard.mechanic.phoneNumber}`} className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{jobCard.mechanic.phoneNumber}</span>
                </a>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setShowStaffBottomSheet(false)
              setShowNewTaskModal(true)
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl"
          >
            <UserPlus className="h-4 w-4" />
            Assign Staff
          </button>
        </div>
      </MobileBottomSheet>

      {/* Customer Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showCustomerBottomSheet}
        onClose={() => setShowCustomerBottomSheet(false)}
        title="Customer Details"
        height="half"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{jobCard.customer.firstName} {jobCard.customer.lastName}</p>
              {jobCard.customer.loyaltyTier && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-600 capitalize">{jobCard.customer.loyaltyTier} Member</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <a href={`tel:${jobCard.customer.phoneNumber}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Phone className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm font-semibold text-gray-900">{jobCard.customer.phoneNumber}</p>
              </div>
            </a>

            {jobCard.customer.email && (
              <a href={`mailto:${jobCard.customer.email}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{jobCard.customer.email}</p>
                </div>
              </a>
            )}

            {(jobCard.customer.address || jobCard.customer.city) && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Address</p>
                  <p className="text-sm text-gray-900">
                    {[jobCard.customer.address, jobCard.customer.city, jobCard.customer.state, jobCard.customer.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-900">{jobCard.customer.totalJobs || 0}</p>
              <p className="text-xs text-gray-600">Total Jobs</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-900">{jobCard.customer.totalVehicles || 0}</p>
              <p className="text-xs text-gray-600">Vehicles</p>
            </div>
          </div>
        </div>
      </MobileBottomSheet>

      {/* Vehicle Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showVehicleBottomSheet}
        onClose={() => setShowVehicleBottomSheet(false)}
        title="Vehicle Details"
        height="half"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-xl bg-gray-200 flex items-center justify-center">
              <Car className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}</p>
              <p className="text-sm text-gray-600 font-mono">{jobCard.vehicle.licensePlate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {jobCard.vehicle.color && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Color</p>
                <p className="text-sm font-semibold text-gray-900">{jobCard.vehicle.color}</p>
              </div>
            )}
            {jobCard.vehicle.fuelType && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Fuel Type</p>
                <p className="text-sm font-semibold text-gray-900">{jobCard.vehicle.fuelType}</p>
              </div>
            )}
            {jobCard.vehicle.transmission && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Transmission</p>
                <p className="text-sm font-semibold text-gray-900">{jobCard.vehicle.transmission}</p>
              </div>
            )}
            {jobCard.vehicle.currentMileage && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Mileage</p>
                <p className="text-sm font-semibold text-gray-900">{jobCard.vehicle.currentMileage.toLocaleString()} km</p>
              </div>
            )}
          </div>

          {jobCard.vehicle.vin && (
            <div>
              <p className="text-xs text-gray-600 mb-2">VIN Number</p>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded-lg">{jobCard.vehicle.vin}</p>
            </div>
          )}

          {(jobCard.vehicle.lastServiceDate || jobCard.vehicle.insuranceExpiry || jobCard.vehicle.warrantyExpiry) && (
            <div className="space-y-2">
              {jobCard.vehicle.lastServiceDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Service</span>
                  <span className="font-medium text-gray-900">{formatDate(jobCard.vehicle.lastServiceDate)}</span>
                </div>
              )}
              {jobCard.vehicle.insuranceExpiry && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance Expires</span>
                  <span className="font-medium text-gray-900">{formatDate(jobCard.vehicle.insuranceExpiry)}</span>
                </div>
              )}
              {jobCard.vehicle.warrantyExpiry && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Warranty Expires</span>
                  <span className="font-medium text-gray-900">{formatDate(jobCard.vehicle.warrantyExpiry)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </MobileBottomSheet>

      {/* Task Detail Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showTaskBottomSheet}
        onClose={() => {
          setShowTaskBottomSheet(false)
          setSelectedMobileTask(null)
        }}
        title={selectedMobileTask?.title || 'Task Details'}
        height="full"
      >
        {selectedMobileTask && (
          <div className="space-y-4">
            {/* Task Status & Priority */}
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedMobileTask.status} />
              <PriorityBadge priority={selectedMobileTask.priority} />
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Description</p>
              <p className="text-sm text-gray-700">{selectedMobileTask.description}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Category</p>
                <p className="text-sm font-semibold text-gray-900">{selectedMobileTask.category}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedMobileTask.actualHours} / {selectedMobileTask.estimatedHours} hrs
                </p>
              </div>
            </div>

            {/* Progress */}
            {selectedMobileTask.checklist && selectedMobileTask.checklist.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {selectedMobileTask.checklist.filter(c => c.completed).length} / {selectedMobileTask.checklist.length} items
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 transition-all duration-300"
                    style={{
                      width: `${(selectedMobileTask.checklist.filter(c => c.completed).length / selectedMobileTask.checklist.length) * 100}%`
                    }}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  {selectedMobileTask.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                        item.completed ? 'bg-status-success border-status-success' : 'border-gray-300'
                      }`}>
                        {item.completed && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parts */}
            {selectedMobileTask.parts && selectedMobileTask.parts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Parts Used</p>
                <div className="space-y-2">
                  {selectedMobileTask.parts.map((part) => (
                    <div key={part.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{part.partName}</p>
                        <p className="text-sm font-semibold text-gray-900">₹{part.totalPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Qty: {part.quantity} {part.unit}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-white rounded font-medium">{part.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timer Button */}
            <button
              onClick={() => toggleTaskTimer(selectedMobileTask.id)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-medium rounded-xl ${
                runningTimers.has(selectedMobileTask.id) ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {runningTimers.has(selectedMobileTask.id) ? (
                <>
                  <Pause className="h-5 w-5" />
                  Stop Timer
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Timer
                </>
              )}
            </button>
          </div>
        )}
      </MobileBottomSheet>

      {/* Mobile Comments Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showMobileComments}
        onClose={() => setShowMobileComments(false)}
        title="Add Comment"
        height="auto"
      >
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your comment here..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
          <div className="flex items-center gap-3">
            <button className="p-3 bg-gray-100 rounded-xl" title="Attach file">
              <Paperclip className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-3 bg-gray-100 rounded-xl" title="Add photo">
              <Image className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Post Comment
            </button>
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  )
}
