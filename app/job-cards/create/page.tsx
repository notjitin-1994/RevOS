'use client'

import React, { useState, useEffect, useCallback, startTransition, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  UserPlus,
  User,
  Wrench,
  FileText,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
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
  GripVertical,
  Filter,
  MoreHorizontal,
  Copy,
  Link2,
  Unlink,
  Square,
  CheckSquare,
  Zap,
  Timer,
  TrendingUp,
  Circle,
  Ban,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Package,
  Tag,
  Layers,
  Command,
  Sparkles,
  Flame,
  ArrowUpDown,
  IndianRupee,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { getMakesDataAction } from '@/app/actions/motorcycle-actions'
import { createCustomerAction, addVehicleToCustomerAction, type CreateCustomerInput, type CreateVehicleInput } from '@/app/actions/customer-actions'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { TabTasks } from '@/app/job-cards/components/tasks/TabTasks'

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
  engineNumber?: string
  chassisNumber?: string
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
  subtasks?: Subtask[]
  linkedToCustomerIssues?: number[] // indices of customerReportIssues
  linkedToServiceScope?: number[] // indices of workRequestedItems
  linkedToTechnicalDiagnosis?: number[] // indices of technicalDiagnosisItems
}

// ============================================================================
// ENHANCED TASK MANAGEMENT SYSTEM TYPES
// ============================================================================

interface Subtask {
  id: string
  name: string
  description?: string
  estimatedMinutes: number
  completed: boolean
  displayOrder: number
}

interface EnhancedTask {
  id: string
  name: string
  description: string
  category: 'Engine' | 'Electrical' | 'Body' | 'Maintenance' | 'Diagnostic' | 'Custom'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedMinutes: number
  laborRate: number
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  progress: number
  displayOrder: number
  linkedToIssues: number[] // indices of customerReportIssues
  linkedToServiceItems: number[] // indices of workRequestedItems
  tags: string[]
  subtasks: Subtask[]
  createdAt: number
}

type TaskCategory = 'Engine' | 'Electrical' | 'Body' | 'Maintenance' | 'Diagnostic' | 'Custom'
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskTemplate extends Omit<EnhancedTask, 'status' | 'progress' | 'displayOrder' | 'linkedToIssues' | 'linkedToServiceItems' | 'createdAt'> {
  isTemplate: true
}

type FilterType = 'all' | 'linked' | 'unlinked' | 'high-priority' | 'overdue'
type SortType = 'name' | 'category' | 'priority' | 'time' | 'status'

// ============================================================================
// TASK REPOSITORY - Pre-built task templates for automotive services
// ============================================================================

const TASK_REPOSITORY: TaskTemplate[] = [
  // ENGINE TASKS
  {
    id: 'template-engine-oil-change',
    isTemplate: true,
    name: 'Oil Change & Filter Replacement',
    description: 'Complete oil change with filter replacement and fluid level check',
    category: 'Engine',
    priority: 'medium',
    estimatedMinutes: 30,
    laborRate: 500,
    tags: ['engine', 'maintenance', 'routine'],
    subtasks: [
      { id: 'st-1', name: 'Drain old oil', description: 'Drain engine oil completely', estimatedMinutes: 10, completed: false, displayOrder: 1 },
      { id: 'st-2', name: 'Replace oil filter', description: 'Remove old filter and install new one', estimatedMinutes: 5, completed: false, displayOrder: 2 },
      { id: 'st-3', name: 'Refill with fresh oil', description: 'Add recommended oil grade and quantity', estimatedMinutes: 10, completed: false, displayOrder: 3 },
      { id: 'st-4', name: 'Check fluid levels', description: 'Verify oil level and check for leaks', estimatedMinutes: 5, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-engine-tune-up',
    isTemplate: true,
    name: 'Engine Tune-Up',
    description: 'Comprehensive engine tune-up including spark plugs, air filter, and fuel system',
    category: 'Engine',
    priority: 'high',
    estimatedMinutes: 120,
    laborRate: 600,
    tags: ['engine', 'maintenance', 'fuel-system'],
    subtasks: [
      { id: 'st-5', name: 'Replace spark plugs', description: 'Remove old plugs and install new ones', estimatedMinutes: 45, completed: false, displayOrder: 1 },
      { id: 'st-6', name: 'Clean/replace air filter', description: 'Inspect and replace air filter if needed', estimatedMinutes: 15, completed: false, displayOrder: 2 },
      { id: 'st-7', name: 'Check ignition timing', description: 'Verify and adjust ignition timing', estimatedMinutes: 30, completed: false, displayOrder: 3 },
      { id: 'st-8', name: 'Clean fuel injectors', description: 'Perform fuel system cleaning', estimatedMinutes: 30, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-engine-timing-chain',
    isTemplate: true,
    name: 'Timing Chain/Belt Replacement',
    description: 'Replace timing chain or belt and associated components',
    category: 'Engine',
    priority: 'urgent',
    estimatedMinutes: 240,
    laborRate: 700,
    tags: ['engine', 'critical', 'timing'],
    subtasks: [
      { id: 'st-9', name: 'Remove covers and accessories', description: 'Remove necessary components to access timing chain', estimatedMinutes: 60, completed: false, displayOrder: 1 },
      { id: 'st-10', name: 'Replace timing chain/belt', description: 'Install new timing chain or belt', estimatedMinutes: 90, completed: false, displayOrder: 2 },
      { id: 'st-11', name: 'Replace tensioner and guides', description: 'Install new tensioner and guide components', estimatedMinutes: 45, completed: false, displayOrder: 3 },
      { id: 'st-12', name: 'Set timing and verify', description: 'Properly time the engine and verify operation', estimatedMinutes: 45, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-engine-gasket-set',
    isTemplate: true,
    name: 'Cylinder Head Gasket Replacement',
    description: 'Replace cylinder head gasket and resurface head if needed',
    category: 'Engine',
    priority: 'urgent',
    estimatedMinutes: 300,
    laborRate: 800,
    tags: ['engine', 'critical', 'gasket'],
    subtasks: [
      { id: 'st-13', name: 'Drain fluids and disconnect', description: 'Prepare engine for disassembly', estimatedMinutes: 60, completed: false, displayOrder: 1 },
      { id: 'st-14', name: 'Remove cylinder head', description: 'Carefully remove head and inspect', estimatedMinutes: 90, completed: false, displayOrder: 2 },
      { id: 'st-15', name: 'Resurface head', description: 'Machine head surface if necessary', estimatedMinutes: 60, completed: false, displayOrder: 3 },
      { id: 'st-16', name: 'Install new gasket and reassemble', description: 'Install new gasket and reassemble engine', estimatedMinutes: 90, completed: false, displayOrder: 4 },
    ]
  },

  // ELECTRICAL TASKS
  {
    id: 'template-electrical-battery',
    isTemplate: true,
    name: 'Battery Replacement & Charging System Test',
    description: 'Replace battery and test charging system performance',
    category: 'Electrical',
    priority: 'high',
    estimatedMinutes: 30,
    laborRate: 400,
    tags: ['electrical', 'battery', 'charging'],
    subtasks: [
      { id: 'st-17', name: 'Test battery and charging system', description: 'Perform complete electrical system test', estimatedMinutes: 15, completed: false, displayOrder: 1 },
      { id: 'st-18', name: 'Replace battery', description: 'Remove old battery and install new one', estimatedMinutes: 10, completed: false, displayOrder: 2 },
      { id: 'st-19', name: 'Clean terminals and verify', description: 'Clean terminals and test operation', estimatedMinutes: 5, completed: false, displayOrder: 3 },
    ]
  },
  {
    id: 'template-electrical-starter',
    isTemplate: true,
    name: 'Starter Motor Replacement',
    description: 'Replace starter motor and test starting system',
    category: 'Electrical',
    priority: 'high',
    estimatedMinutes: 90,
    laborRate: 550,
    tags: ['electrical', 'starter', 'diagnostic'],
    subtasks: [
      { id: 'st-20', name: 'Diagnose starter issue', description: 'Confirm starter failure', estimatedMinutes: 20, completed: false, displayOrder: 1 },
      { id: 'st-21', name: 'Remove starter motor', description: 'Disconnect and remove starter', estimatedMinutes: 30, completed: false, displayOrder: 2 },
      { id: 'st-22', name: 'Install new starter', description: 'Install new or rebuilt starter', estimatedMinutes: 30, completed: false, displayOrder: 3 },
      { id: 'st-23', name: 'Test starting system', description: 'Verify proper operation', estimatedMinutes: 10, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-electrical-alternator',
    isTemplate: true,
    name: 'Alternator Replacement',
    description: 'Replace alternator and test charging system',
    category: 'Electrical',
    priority: 'high',
    estimatedMinutes: 90,
    laborRate: 550,
    tags: ['electrical', 'alternator', 'charging'],
    subtasks: [
      { id: 'st-24', name: 'Test alternator output', description: 'Confirm alternator failure', estimatedMinutes: 15, completed: false, displayOrder: 1 },
      { id: 'st-25', name: 'Remove alternator', description: 'Disconnect and remove alternator', estimatedMinutes: 35, completed: false, displayOrder: 2 },
      { id: 'st-26', name: 'Install new alternator', description: 'Install new alternator and belt', estimatedMinutes: 30, completed: false, displayOrder: 3 },
      { id: 'st-27', name: 'Test charging system', description: 'Verify output and battery charging', estimatedMinutes: 10, completed: false, displayOrder: 4 },
    ]
  },

  // BODY TASKS
  {
    id: 'template-body-paint-scratch',
    isTemplate: true,
    name: 'Paint Scratch & Chip Repair',
    description: 'Repair paint scratches and chips with color matching',
    category: 'Body',
    priority: 'low',
    estimatedMinutes: 120,
    laborRate: 450,
    tags: ['body', 'cosmetic', 'paint'],
    subtasks: [
      { id: 'st-28', name: 'Clean and prep area', description: 'Clean and sand damaged area', estimatedMinutes: 30, completed: false, displayOrder: 1 },
      { id: 'st-29', name: 'Apply primer and basecoat', description: 'Apply matching primer and paint', estimatedMinutes: 45, completed: false, displayOrder: 2 },
      { id: 'st-30', name: 'Apply clearcoat', description: 'Apply clear coat for protection', estimatedMinutes: 30, completed: false, displayOrder: 3 },
      { id: 'st-31', name: 'Buff and polish', description: 'Wet sand and polish finish', estimatedMinutes: 15, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-body-dent-repair',
    isTemplate: true,
    name: 'Dent Repair (Paintless)',
    description: 'Remove minor dents without affecting original paint',
    category: 'Body',
    priority: 'medium',
    estimatedMinutes: 90,
    laborRate: 500,
    tags: ['body', 'cosmetic', 'dent-repair'],
    subtasks: [
      { id: 'st-32', name: 'Assess dent damage', description: 'Evaluate if PDR is suitable', estimatedMinutes: 15, completed: false, displayOrder: 1 },
      { id: 'st-33', name: 'Access dent area', description: 'Gain access to back of dent', estimatedMinutes: 20, completed: false, displayOrder: 2 },
      { id: 'st-34', name: 'Massage dent out', description: 'Carefully work dent out from behind', estimatedMinutes: 45, completed: false, displayOrder: 3 },
      { id: 'st-35', name: 'Final touch-up', description: 'Minor finishing and polish', estimatedMinutes: 10, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-body-fairing-replacement',
    isTemplate: true,
    name: 'Fairing/Body Panel Replacement',
    description: 'Replace damaged body panels or fairings',
    category: 'Body',
    priority: 'medium',
    estimatedMinutes: 150,
    laborRate: 500,
    tags: ['body', 'panel', 'replacement'],
    subtasks: [
      { id: 'st-36', name: 'Remove damaged panel', description: 'Carefully remove fasteners and panel', estimatedMinutes: 45, completed: false, displayOrder: 1 },
      { id: 'st-37', name: 'Prepare mounting points', description: 'Clean and inspect mounting areas', estimatedMinutes: 30, completed: false, displayOrder: 2 },
      { id: 'st-38', name: 'Install new panel', description: 'Fit and secure new panel', estimatedMinutes: 60, completed: false, displayOrder: 3 },
      { id: 'st-39', name: 'Align and adjust', description: 'Ensure proper fit and alignment', estimatedMinutes: 15, completed: false, displayOrder: 4 },
    ]
  },

  // MAINTENANCE TASKS
  {
    id: 'template-maintenance-brake-pads',
    isTemplate: true,
    name: 'Brake Pad Replacement',
    description: 'Replace front and/or rear brake pads',
    category: 'Maintenance',
    priority: 'urgent',
    estimatedMinutes: 60,
    laborRate: 500,
    tags: ['maintenance', 'brakes', 'safety'],
    subtasks: [
      { id: 'st-40', name: 'Inspect brake system', description: 'Check pads, rotors, and fluid', estimatedMinutes: 15, completed: false, displayOrder: 1 },
      { id: 'st-41', name: 'Replace brake pads', description: 'Remove old pads and install new ones', estimatedMinutes: 30, completed: false, displayOrder: 2 },
      { id: 'st-42', name: 'Bed in new pads', description: 'Properly bed in new brake pads', estimatedMinutes: 15, completed: false, displayOrder: 3 },
    ]
  },
  {
    id: 'template-maintenance-brake-fluid',
    isTemplate: true,
    name: 'Brake Fluid Flush',
    description: 'Complete brake fluid system flush and refill',
    category: 'Maintenance',
    priority: 'high',
    estimatedMinutes: 45,
    laborRate: 450,
    tags: ['maintenance', 'brakes', 'fluid'],
    subtasks: [
      { id: 'st-43', name: 'Drain old fluid', description: 'Flush old brake fluid from system', estimatedMinutes: 20, completed: false, displayOrder: 1 },
      { id: 'st-44', name: 'Refill with fresh fluid', description: 'Add new brake fluid and bleed system', estimatedMinutes: 20, completed: false, displayOrder: 2 },
      { id: 'st-45', name: 'Test brake operation', description: 'Verify brake feel and operation', estimatedMinutes: 5, completed: false, displayOrder: 3 },
    ]
  },
  {
    id: 'template-maintenance-chain-service',
    isTemplate: true,
    name: 'Chain & Sprocket Service',
    description: 'Clean, adjust, lubricate chain and inspect sprockets',
    category: 'Maintenance',
    priority: 'medium',
    estimatedMinutes: 30,
    laborRate: 350,
    tags: ['maintenance', 'drivetrain', 'routine'],
    subtasks: [
      { id: 'st-46', name: 'Clean chain', description: 'Thoroughly clean chain', estimatedMinutes: 10, completed: false, displayOrder: 1 },
      { id: 'st-47', name: 'Inspect chain and sprockets', description: 'Check for wear and damage', estimatedMinutes: 10, completed: false, displayOrder: 2 },
      { id: 'st-48', name: 'Adjust and lubricate', description: 'Properly tension and lubricate chain', estimatedMinutes: 10, completed: false, displayOrder: 3 },
    ]
  },
  {
    id: 'template-maintenance-tire-service',
    isTemplate: true,
    name: 'Tire Replacement & Balancing',
    description: 'Replace tires and balance wheels',
    category: 'Maintenance',
    priority: 'high',
    estimatedMinutes: 90,
    laborRate: 400,
    tags: ['maintenance', 'tires', 'safety'],
    subtasks: [
      { id: 'st-49', name: 'Remove wheels', description: 'Remove wheels from motorcycle', estimatedMinutes: 30, completed: false, displayOrder: 1 },
      { id: 'st-50', name: 'Replace tires', description: 'Mount and balance new tires', estimatedMinutes: 45, completed: false, displayOrder: 2 },
      { id: 'st-51', name: 'Install and torque', description: 'Install wheels and torque properly', estimatedMinutes: 15, completed: false, displayOrder: 3 },
    ]
  },
  {
    id: 'template-maintenance-air-filter',
    isTemplate: true,
    name: 'Air Filter Replacement',
    description: 'Replace air filter element',
    category: 'Maintenance',
    priority: 'low',
    estimatedMinutes: 20,
    laborRate: 300,
    tags: ['maintenance', 'engine', 'routine'],
    subtasks: [
      { id: 'st-52', name: 'Remove airbox cover', description: 'Access air filter housing', estimatedMinutes: 5, completed: false, displayOrder: 1 },
      { id: 'st-53', name: 'Replace air filter', description: 'Install new air filter element', estimatedMinutes: 10, completed: false, displayOrder: 2 },
      { id: 'st-54', name: 'Reassemble and verify', description: 'Close airbox and check sealing', estimatedMinutes: 5, completed: false, displayOrder: 3 },
    ]
  },
  {
    id: 'template-maintenance-coolant-flush',
    isTemplate: true,
    name: 'Coolant System Flush',
    description: 'Flush cooling system and refill with fresh coolant',
    category: 'Maintenance',
    priority: 'high',
    estimatedMinutes: 60,
    laborRate: 450,
    tags: ['maintenance', 'cooling', 'fluid'],
    subtasks: [
      { id: 'st-55', name: 'Drain coolant', description: 'Drain old coolant from system', estimatedMinutes: 20, completed: false, displayOrder: 1 },
      { id: 'st-56', name: 'Flush system', description: 'Flush with water to remove debris', estimatedMinutes: 15, completed: false, displayOrder: 2 },
      { id: 'st-57', name: 'Refill with coolant', description: 'Fill with recommended coolant mix', estimatedMinutes: 15, completed: false, displayOrder: 3 },
      { id: 'st-58', name: 'Bleed system', description: 'Bleed air from cooling system', estimatedMinutes: 10, completed: false, displayOrder: 4 },
    ]
  },

  // DIAGNOSTIC TASKS
  {
    id: 'template-diagnostic-engine-noise',
    isTemplate: true,
    name: 'Engine Noise Diagnosis',
    description: 'Diagnose unusual engine noises and vibrations',
    category: 'Diagnostic',
    priority: 'high',
    estimatedMinutes: 90,
    laborRate: 600,
    tags: ['diagnostic', 'engine', 'troubleshooting'],
    subtasks: [
      { id: 'st-59', name: 'Interview customer', description: 'Get details about noise and when it occurs', estimatedMinutes: 15, completed: false, displayOrder: 1 },
      { id: 'st-60', name: 'Visual inspection', description: 'Check for obvious issues', estimatedMinutes: 20, completed: false, displayOrder: 2 },
      { id: 'st-61', name: 'Test ride and listen', description: 'Reproduce noise and identify source', estimatedMinutes: 30, completed: false, displayOrder: 3 },
      { id: 'st-62', name: 'Provide diagnosis and estimate', description: 'Report findings and repair options', estimatedMinutes: 25, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-diagnostic-electrical-issue',
    isTemplate: true,
    name: 'Electrical System Diagnosis',
    description: 'Diagnose electrical issues including shorts, grounds, and component failures',
    category: 'Diagnostic',
    priority: 'high',
    estimatedMinutes: 120,
    laborRate: 650,
    tags: ['diagnostic', 'electrical', 'troubleshooting'],
    subtasks: [
      { id: 'st-63', name: 'Battery and charging test', description: 'Test battery and charging system', estimatedMinutes: 20, completed: false, displayOrder: 1 },
      { id: 'st-64', name: 'Visual wiring inspection', description: 'Check for damaged wires and connections', estimatedMinutes: 30, completed: false, displayOrder: 2 },
      { id: 'st-65', name: 'Circuit testing', description: 'Test affected circuits with multimeter', estimatedMinutes: 40, completed: false, displayOrder: 3 },
      { id: 'st-66', name: 'Component testing', description: 'Test suspected faulty components', estimatedMinutes: 30, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-diagnostic-vibration',
    isTemplate: true,
    name: 'Vibration & Handling Diagnosis',
    description: 'Diagnose vibration, wobbling, or handling issues',
    category: 'Diagnostic',
    priority: 'high',
    estimatedMinutes: 90,
    laborRate: 600,
    tags: ['diagnostic', 'suspension', 'troubleshooting'],
    subtasks: [
      { id: 'st-67', name: 'Test ride and assessment', description: 'Ride to reproduce the issue', estimatedMinutes: 30, completed: false, displayOrder: 1 },
      { id: 'st-68', name: 'Wheel and tire inspection', description: 'Check wheels, tires, and balance', estimatedMinutes: 20, completed: false, displayOrder: 2 },
      { id: 'st-69', name: 'Suspension inspection', description: 'Check forks, shocks, and bearings', estimatedMinutes: 25, completed: false, displayOrder: 3 },
      { id: 'st-70', name: 'Frame and alignment check', description: 'Inspect for frame damage or misalignment', estimatedMinutes: 15, completed: false, displayOrder: 4 },
    ]
  },

  // CUSTOM TASKS
  {
    id: 'template-custom-performance-upgrade',
    isTemplate: true,
    name: 'Performance Upgrade Installation',
    description: 'Install aftermarket performance parts and accessories',
    category: 'Custom',
    priority: 'low',
    estimatedMinutes: 180,
    laborRate: 700,
    tags: ['custom', 'upgrade', 'performance'],
    subtasks: [
      { id: 'st-71', name: 'Pre-install inspection', description: 'Verify parts compatibility', estimatedMinutes: 30, completed: false, displayOrder: 1 },
      { id: 'st-72', name: 'Remove stock components', description: 'Remove OEM parts being replaced', estimatedMinutes: 60, completed: false, displayOrder: 2 },
      { id: 'st-73', name: 'Install performance parts', description: 'Fit and secure new components', estimatedMinutes: 60, completed: false, displayOrder: 3 },
      { id: 'st-74', name: 'Test and tune', description: 'Test operation and make adjustments', estimatedMinutes: 30, completed: false, displayOrder: 4 },
    ]
  },
  {
    id: 'template-custom-accessory-install',
    isTemplate: true,
    name: 'Accessory Installation',
    description: 'Install motorcycle accessories (luggage, lights, guards, etc.)',
    category: 'Custom',
    priority: 'low',
    estimatedMinutes: 90,
    laborRate: 450,
    tags: ['custom', 'accessory', 'upgrade'],
    subtasks: [
      { id: 'st-75', name: 'Review instructions', description: 'Review installation manual', estimatedMinutes: 15, completed: false, displayOrder: 1 },
      { id: 'st-76', name: 'Prepare mounting points', description: 'Clean and prep installation areas', estimatedMinutes: 20, completed: false, displayOrder: 2 },
      { id: 'st-77', name: 'Install accessory', description: 'Mount and secure accessory', estimatedMinutes: 45, completed: false, displayOrder: 3 },
      { id: 'st-78', name: 'Test functionality', description: 'Verify proper operation', estimatedMinutes: 10, completed: false, displayOrder: 4 },
    ]
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate task progress based on subtask completion
 */
function calculateTaskProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0
  const completed = subtasks.filter(st => st.completed).length
  return Math.round((completed / subtasks.length) * 100)
}

/**
 * Calculate total estimated time for a task including subtasks
 */
function calculateTaskTime(task: EnhancedTask | TaskTemplate): number {
  const subtaskTime = task.subtasks.reduce((sum, st) => sum + st.estimatedMinutes, 0)
  return subtaskTime > 0 ? subtaskTime : task.estimatedMinutes
}

/**
 * Calculate total cost for a task
 */
function calculateTaskCost(task: EnhancedTask | TaskTemplate): number {
  const time = calculateTaskTime(task)
  return Math.round((time / 60) * task.laborRate)
}

/**
 * Get category icon
 */
function getCategoryIcon(category: TaskCategory): React.ReactNode {
  const icons = {
    Engine: <Settings className="h-4 w-4" />,
    Electrical: <Zap className="h-4 w-4" />,
    Body: <SprayCan className="h-4 w-4" />,
    Maintenance: <Wrench className="h-4 w-4" />,
    Diagnostic: <Scan className="h-4 w-4" />,
    Custom: <Sparkles className="h-4 w-4" />,
  }
  return icons[category] || <Package className="h-4 w-4" />
}

/**
 * Get status badge styles
 */
function getStatusStyles(status: TaskStatus): { bg: string; text: string; icon: React.ReactNode } {
  const styles = {
    'pending': { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Circle className="h-3 w-3" /> },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', icon: <PlayCircle className="h-3 w-3" /> },
    'completed': { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    'blocked': { bg: 'bg-red-100', text: 'text-red-700', icon: <Ban className="h-3 w-3" /> },
  }
  return styles[status]
}

/**
 * Fuzzy search for tasks
 */
function searchTasks(tasks: (EnhancedTask | TaskTemplate)[], query: string): (EnhancedTask | TaskTemplate)[] {
  if (!query.trim()) return tasks

  const lowerQuery = query.toLowerCase()
  return tasks.filter(task => {
    const nameMatch = task.name.toLowerCase().includes(lowerQuery)
    const descMatch = task.description.toLowerCase().includes(lowerQuery)
    const categoryMatch = task.category.toLowerCase().includes(lowerQuery)
    return nameMatch || descMatch || categoryMatch
  })
}

/**
 * Filter tasks based on filter type
 */
function filterTasks(tasks: EnhancedTask[], filterType: FilterType): EnhancedTask[] {
  switch (filterType) {
    case 'all':
      return tasks
    case 'linked':
      return tasks.filter(t => t.linkedToIssues.length > 0 || t.linkedToServiceItems.length > 0)
    case 'unlinked':
      return tasks.filter(t => t.linkedToIssues.length === 0 && t.linkedToServiceItems.length === 0)
    case 'high-priority':
      return tasks.filter(t => t.priority === 'high' || t.priority === 'urgent')
    case 'overdue':
      // For now, return high priority tasks as "overdue"
      return tasks.filter(t => t.priority === 'urgent')
    default:
      return tasks
  }
}

/**
 * Sort tasks based on sort type
 */
function sortTasks(tasks: EnhancedTask[], sortType: SortType): EnhancedTask[] {
  const sorted = [...tasks]
  switch (sortType) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category))
    case 'priority':
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    case 'time':
      return sorted.sort((a, b) => calculateTaskTime(b) - calculateTaskTime(a))
    case 'status':
      const statusOrder = { blocked: 0, 'in-progress': 1, pending: 2, completed: 3 }
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    default:
      return sorted
  }
}

type JobType = 'routine' | 'repair' | 'maintenance' | 'custom' | 'diagnostic'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type JobStatus = 'draft' | 'queued'
type TabValue = 'customer' | 'job-details' | 'tasks' | 'labor-parts' | 'scheduling' | 'review'

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
  chassisNumber: string
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
  laborParts: boolean
  scheduling: boolean
  review: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function CreateJobCardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const editJobCardId = searchParams.get('editJobCardId')
  const [isEditingDraft, setIsEditingDraft] = useState(false)

  // Initialize isLoading to true if we're loading a draft, false otherwise
  const [isLoading, setIsLoading] = useState(!!editJobCardId)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Job card creation states
  const [isCreatingJobCard, setIsCreatingJobCard] = useState(false)
  const [jobCardCreationError, setJobCardCreationError] = useState<string | null>(null)
  const [createdJobCardId, setCreatedJobCardId] = useState<string | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('customer')
  const [tabErrors, setTabErrors] = useState<Record<string, string>>({})

  // Validation state
  const [tabValidation, setTabValidation] = useState<TabValidation>({
    customer: false,
    jobDetails: false,
    tasks: false,
    laborParts: false,
    scheduling: false,
    review: false,
  })

  // Customer & Vehicle states
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null)
  const [garageId, setGarageId] = useState<string | undefined>(undefined)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false)

  // Customer Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [customerModalError, setCustomerModalError] = useState<string | null>(null)
  const [customerModalSuccess, setCustomerModalSuccess] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'add-vehicle'>('create')
  const [newlyAddedVehicleId, setNewlyAddedVehicleId] = useState<string | null>(null)
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
    chassisNumber: '',
    mileage: '',
    notes: '',
  }])

  // Employees state
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Job details states
  const [jobType, setJobType] = useState<JobType>('repair')
  const [priority, setPriority] = useState<Priority>('medium')
  const [customerReportIssues, setCustomerReportIssues] = useState<string[]>([])
  const [currentReportIssue, setCurrentReportIssue] = useState('')
  const [workRequestedItems, setWorkRequestedItems] = useState<string[]>([])
  const [currentWorkRequested, setCurrentWorkRequested] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [currentMileage, setCurrentMileage] = useState('')
  const [technicalDiagnosisItems, setTechnicalDiagnosisItems] = useState<string[]>([])
  const [currentTechnicalDiagnosis, setCurrentTechnicalDiagnosis] = useState('')
  const [technicianNotes, setTechnicianNotes] = useState('')

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
    subtasks: [],
    linkedToCustomerIssues: [],
    linkedToServiceScope: [],
    linkedToTechnicalDiagnosis: [],
  })

  // Parts state
  type SelectedPart = {
    id: string
    partId: string | null
    partName: string
    partNumber: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user')
    if (!sessionUser) {
      router.push('/login')
      return
    }

    // Set garageId from session
    const user = JSON.parse(sessionUser)
    setGarageId(user.garageId || user.garage_id)

    loadCustomers()
    loadEmployees()
    loadMakes()
  }, [router])

  useEffect(() => {
    // Only auto-select first vehicle if no vehicle is currently selected
    // This preserves the draft's vehicle selection when loading a draft
    if (selectedCustomer?.vehicles && selectedCustomer.vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(selectedCustomer.vehicles[0])
    } else if (!selectedCustomer?.vehicles || selectedCustomer.vehicles.length === 0) {
      setSelectedVehicle(null)
    }
  }, [selectedCustomer, selectedVehicle])

  // Update tab validation state based on form data and navigation
  // This ensures required tabs (Customer, Details) are validated based on actual data
  // and optional tabs (Tasks, Scheduling) are marked complete when visited
  useEffect(() => {
    setTabValidation(prev => {
      // Calculate validation state for required tabs based on form data
      const customerValid = !!selectedCustomer && !!selectedVehicle
      const jobDetailsValid = !!jobType && !!priority && customerReportIssues.length > 0 && workRequestedItems.length > 0

      // Debug logging (can be removed in production)
      console.log('[Tab Validation]', {
        activeTab,
        customerValid,
        jobDetailsValid,
        jobType,
        priority,
        customerReportIssuesCount: customerReportIssues.length,
        workRequestedItemsCount: workRequestedItems.length,
      })

      return {
        // Preserve form-based validation for required tabs
        customer: customerValid,
        jobDetails: jobDetailsValid,
        // Mark tasks as complete when visited (optional tab)
        tasks: activeTab === 'tasks' || activeTab === 'labor-parts' || activeTab === 'scheduling' || activeTab === 'review' ? true : prev.tasks,
        // Mark labor-parts as complete when visited (optional tab)
        laborParts: activeTab === 'labor-parts' || activeTab === 'scheduling' || activeTab === 'review' ? true : prev.laborParts,
        // Mark scheduling as complete when visited (optional tab)
        scheduling: activeTab === 'scheduling' || activeTab === 'review' ? true : prev.scheduling,
        // Mark review as complete only when all required tabs are complete
        review: activeTab === 'review' && customerValid && jobDetailsValid ? true : prev.review,
      }
    })
  }, [activeTab, selectedCustomer, selectedVehicle, jobType, priority, customerReportIssues, workRequestedItems])

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
    if (customerReportIssues.length === 0) {
      setTabErrors(prev => ({ ...prev, jobDetails: 'At least one customer reported issue is required' }))
      return false
    }
    if (workRequestedItems.length === 0) {
      setTabErrors(prev => ({ ...prev, jobDetails: 'At least one service scope item is required' }))
      return false
    }
    setTabErrors(prev => ({ ...prev, jobDetails: '' }))
    return true
  }, [customerReportIssues, workRequestedItems])

  const validateTasksTab = useCallback((): boolean => {
    // Check if all tasks are linked to at least one item
    const unlinkedTasks = checklistItems.filter(item => {
      const hasLinks =
        (item.linkedToCustomerIssues?.length || 0) +
        (item.linkedToServiceScope?.length || 0) +
        (item.linkedToTechnicalDiagnosis?.length || 0)
      return hasLinks === 0
    })

    if (unlinkedTasks.length > 0) {
      setTabErrors(prev => ({
        ...prev,
        tasks: `All tasks must be linked to at least one customer issue, service scope item, or diagnosis item. ${unlinkedTasks.length} task(s) not linked.`
      }))
      return false
    }

    setTabErrors(prev => ({ ...prev, tasks: '' }))
    return true
  }, [checklistItems])

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

  /**
   * Creates a draft job card when user proceeds from customer tab to job details
   * This ensures we have a job card ID to work with for the rest of the form
   * @returns The job card ID if creation succeeded, null otherwise
   */
  const createDraftJobCard = async (): Promise<string | null> => {
    // Don't create if already editing a draft or if already created
    if (editJobCardId || createdJobCardId) {
      return createdJobCardId || editJobCardId || null
    }

    // Clear any previous errors
    setJobCardCreationError(null)
    setIsCreatingJobCard(true)

    try {
      // Get user from sessionStorage
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        setJobCardCreationError('User not authenticated. Please log in again.')
        setIsCreatingJobCard(false)
        return null
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId || currentUser.garage_id
      const userId = currentUser.userUid || currentUser.user_uid

      if (!garageId || !userId) {
        setJobCardCreationError('Invalid user session. Please log in again.')
        setIsCreatingJobCard(false)
        return null
      }

      // Validate we have customer and vehicle selected
      if (!selectedCustomer || !selectedVehicle) {
        setJobCardCreationError('Please select a customer and vehicle before proceeding.')
        setIsCreatingJobCard(false)
        return null
      }

      // Prepare payload
      const payload = {
        garageId,
        customerId: selectedCustomer.id,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim(),
        customerPhone: selectedCustomer.phoneNumber,
        customerEmail: selectedCustomer.email || undefined,
        vehicleId: selectedVehicle.id,
        vehicleMake: selectedVehicle.make,
        vehicleModel: selectedVehicle.model,
        vehicleYear: selectedVehicle.year,
        vehicleLicensePlate: selectedVehicle.licensePlate,
        vehicleVin: selectedVehicle.vin || undefined,
        currentMileage: currentMileage ? parseInt(currentMileage) : undefined,
        createdBy: userId,
      }

      console.log('Creating draft job card with payload:', payload)

      // Call API
      const response = await fetch('/api/job-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to create job card')
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to create job card')
      }

      console.log('Job card created successfully:', result.jobCard)

      // Store the created job card ID
      const jobCardId = result.jobCard.id
      setCreatedJobCardId(jobCardId)

      // Clear loading state
      setIsCreatingJobCard(false)

      // Return the job card ID
      return jobCardId

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while creating job card'
      console.error('Error creating job card:', err)
      setJobCardCreationError(message)
      setIsCreatingJobCard(false)
      return null
    }
  }

  /**
   * Saves job details when user proceeds from job-details tab to tasks tab
   * Includes job type, priority, customer issues, work requested, technical diagnosis, and notes
   */
  const saveJobDetails = async (): Promise<boolean> => {
    // Get the job card ID (either newly created or being edited)
    const jobCardId = createdJobCardId || editJobCardId

    if (!jobCardId) {
      console.error('No job card ID available for saving job details')
      return false
    }

    setIsLoading(true)
    setJobCardCreationError(null)

    try {
      // Prepare the update payload
      const updateData = {
        jobType,
        priority,
        customerComplaint: customerReportIssues.join('\n\n'),
        workRequested: workRequestedItems.join('\n\n'),
        customerNotes,
        technicianNotes: technicalDiagnosisItems.join('\n\n'),
      }

      console.log('Saving job details for job card:', jobCardId, updateData)

      // Call the PATCH API
      const response = await fetch(`/api/job-cards/${jobCardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to save job details')
      }

      console.log('Job details saved successfully:', result)
      return true

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving job details'
      console.error('Error saving job details:', err)
      setJobCardCreationError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = async (value: string) => {
    // When transitioning from customer to job-details, create a draft job card first
    if (activeTab === 'customer' && value === 'job-details' && !createdJobCardId && !editJobCardId) {
      // Validate customer tab first
      if (!validateCustomerTab()) return

      // Create draft job card and get the ID directly
      const jobCardId = await createDraftJobCard()

      // After creation, if we have the job card ID, proceed to change tab
      if (jobCardId) {
        // Clear any previous error
        setJobCardCreationError(null)
        // Set the new active tab
        setActiveTab(value)
        return
      }

      // If we don't have the job card ID (creation failed), stay on current tab
      setIsCreatingJobCard(false)
      return
    }

    // Validate current tab before allowing navigation
    if (activeTab === 'customer' && value !== 'customer') {
      if (!validateCustomerTab()) return
    }
    if (activeTab === 'job-details' && value !== 'job-details') {
      if (!validateJobDetailsTab()) return

      // Save job details before moving to the next tab
      const saved = await saveJobDetails()
      if (!saved) {
        // Saving failed, stay on current tab
        return
      }
      // Clear any error after successful save
      setJobCardCreationError(null)
    }
    if (activeTab === 'tasks' && value !== 'tasks') {
      if (!validateTasksTab()) return
    }

    setActiveTab(value as TabValue)
  }

  // Check if a tab is accessible based on completed tabs
  const isTabAccessible = (tabValue: string): boolean => {
    const tabIndex = tabs.findIndex(t => t.value === tabValue)
    const activeIndex = tabs.findIndex(t => t.value === activeTab)

    // Can always go back to previous tabs
    if (tabIndex < activeIndex) return true

    // Can always stay on current tab
    if (tabIndex === activeIndex) return true

    // Can only move forward if current tab is validated
    if (tabIndex === activeIndex + 1) {
      // Map active tab value to validation state key (handle hyphen-to-camelCase conversion)
      const validationKey = activeTab === 'job-details' ? 'jobDetails' :
                          activeTab === 'labor-parts' ? 'laborParts' :
                          activeTab as keyof TabValidation
      return tabValidation[validationKey]
    }

    // Cannot skip tabs
    return false
  }

  // Get tab status for styling
  const getTabStatus = (tabValue: string) => {
    if (activeTab === tabValue) return 'active'

    // Map tab value to validation state key (handle hyphen-to-camelCase conversion)
    const validationKey = tabValue === 'job-details' ? 'jobDetails' :
                        tabValue === 'labor-parts' ? 'laborParts' :
                        tabValue as keyof TabValidation

    if (tabValidation[validationKey]) return 'complete'
    if (isTabAccessible(tabValue)) return 'accessible'
    return 'inaccessible'
  }

  // Get the message for inaccessible tabs
  const getTabAccessibilityMessage = (tabValue: string): string | undefined => {
    const status = getTabStatus(tabValue)
    if (status !== 'inaccessible') return undefined

    const tabIndex = tabs.findIndex(t => t.value === tabValue)
    const activeIndex = tabs.findIndex(t => t.value === activeTab)

    // Find the first incomplete tab before this one
    for (let i = activeIndex; i < tabIndex; i++) {
      const tab = tabs[i]
      if (!tabValidation[tab.value as keyof TabValidation]) {
        return `Complete ${tab.label} section first`
      }
    }

    return undefined
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
      subtasks: [],
      linkedToCustomerIssues: [],
      linkedToServiceScope: [],
      linkedToTechnicalDiagnosis: [],
    })
    setError(null)
  }

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id))
  }

  const handleAddReportIssue = () => {
    if (!currentReportIssue.trim()) {
      return
    }

    setCustomerReportIssues([...customerReportIssues, currentReportIssue.trim()])
    setCurrentReportIssue('')
  }

  const handleRemoveReportIssue = (index: number) => {
    setCustomerReportIssues(customerReportIssues.filter((_, i) => i !== index))
  }

  const handleAddWorkRequested = () => {
    if (!currentWorkRequested.trim()) {
      return
    }

    setWorkRequestedItems([...workRequestedItems, currentWorkRequested.trim()])
    setCurrentWorkRequested('')
  }

  const handleRemoveWorkRequested = (index: number) => {
    setWorkRequestedItems(workRequestedItems.filter((_, i) => i !== index))
  }

  const handleAddTechnicalDiagnosis = () => {
    if (!currentTechnicalDiagnosis.trim()) {
      return
    }

    setTechnicalDiagnosisItems([...technicalDiagnosisItems, currentTechnicalDiagnosis.trim()])
    setCurrentTechnicalDiagnosis('')
  }

  const handleRemoveTechnicalDiagnosis = (index: number) => {
    setTechnicalDiagnosisItems(technicalDiagnosisItems.filter((_, i) => i !== index))
  }

  // Customer Modal Handlers (preserved from original)
  const handleOpenCustomerModal = () => {
    // If a customer is already selected, open modal in "add vehicle" mode
    setModalMode(selectedCustomer ? 'add-vehicle' : 'create')
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
        chassisNumber: '',
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
        chassisNumber: '',
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
    // When adding a vehicle, only validate vehicle fields
    if (modalMode === 'add-vehicle') {
      const hasValidVehicle = customerVehicles.some(
        v => v.make && v.model && v.year && v.licensePlate.trim()
      )

      if (!hasValidVehicle) {
        return 'Please add at least one vehicle with make, model, year, and license plate'
      }

      return null
    }

    // When creating a new customer, validate all fields
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
        setCustomerModalError('User not authenticated')
        setIsCreatingCustomer(false)
        return
      }

      const parsedUser = JSON.parse(sessionUser)
      const garageId = parsedUser.garageId || parsedUser.garage_id

      if (!garageId) {
        setCustomerModalError('Garage ID not found')
        setIsCreatingCustomer(false)
        return
      }

      // If in add-vehicle mode, add vehicle to existing customer
      if (modalMode === 'add-vehicle' && selectedCustomer) {
        let newlyAddedVehicleId: string | undefined

        for (const vehicle of customerVehicles) {
          const vehicleData = {
            make: vehicle.make,
            model: vehicle.model,
            year: parseInt(vehicle.year),
            licensePlate: vehicle.licensePlate,
            color: vehicle.color || undefined,
            vin: vehicle.vin || undefined,
            engineNumber: vehicle.engineNumber || undefined,
            chassisNumber: vehicle.chassisNumber || undefined,
            category: vehicle.category || undefined,
            currentMileage: vehicle.mileage ? parseInt(vehicle.mileage) : undefined,
            notes: vehicle.notes || undefined,
          }

          const result = await addVehicleToCustomerAction(selectedCustomer.id, garageId, vehicleData)

          if (!result.success) {
            setCustomerModalError(result.error || 'Failed to add vehicle')
            setIsCreatingCustomer(false)
            return
          }

          // Store the newly added vehicle ID
          if (result.vehicleData?.id) {
            newlyAddedVehicleId = result.vehicleData.id
          }
        }

        // Reload customers to get updated vehicle list
        await loadCustomers()

        // Auto-select the newly added vehicle
        if (newlyAddedVehicleId) {
          const updatedCustomer = customers.find(c => c.id === selectedCustomer.id)
          if (updatedCustomer) {
            const newVehicle = updatedCustomer.vehicles.find(v => v.id === newlyAddedVehicleId)
            if (newVehicle) {
              setSelectedVehicle(newVehicle)
              setNewlyAddedVehicleId(newlyAddedVehicleId) // Track newly added vehicle for highlight animation

              // Clear the highlight after animation
              setTimeout(() => setNewlyAddedVehicleId(null), 3000)
            }
          }
        }

        setCustomerModalSuccess(true)
        setTimeout(() => {
          handleCloseCustomerModal()
        }, 1500)
        return
      }

      // Original customer creation logic
      const currentUser = JSON.parse(sessionUser)
      const userGarageId = currentUser.garageId

      if (!userGarageId) {
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
          chassisNumber: v.chassisNumber || undefined,
          currentMileage: v.mileage ? parseInt(v.mileage) : undefined,
          notes: v.notes || undefined,
        }))

      if (validVehicles.length === 0) {
        setCustomerModalError('Please add at least one vehicle with make, model, year, and license plate')
        setIsCreatingCustomer(false)
        return
      }

      const customerData: CreateCustomerInput = {
        garageId: userGarageId,
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
    let totalPartsCost = 0

    checklistItems.forEach(item => {
      totalLaborMinutes += item.estimatedMinutes
      totalLaborCost += (item.estimatedMinutes / 60) * item.laborRate
    })

    selectedParts.forEach(part => {
      totalPartsCost += part.totalPrice
    })

    const totalCost = totalLaborCost + totalPartsCost

    return {
      totalLaborMinutes,
      totalLaborHours: (totalLaborMinutes / 60).toFixed(1),
      totalLaborCost: totalLaborCost.toFixed(2),
      totalPartsCost: totalPartsCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      taskCount: checklistItems.length,
      partsCount: selectedParts.length,
    }
  }, [checklistItems, selectedParts])

  // ============================================================================
  // HELPERS
  // ============================================================================

  const filteredCustomers = customers.filter(customer => {
    const vehicleLicensePlates = customer.vehicles?.map(v => v.licensePlate).join(' ') || ''
    return `${customer.firstName} ${customer.lastName} ${customer.phoneNumber} ${customer.email || ''} ${vehicleLicensePlates}`.toLowerCase()
      .includes(customerSearchQuery.toLowerCase())
  })

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
    { value: 'labor-parts', label: 'Labor & Parts', icon: Wrench },
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-graphite-700 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-graphite-900 tracking-tight">
                {editJobCardId ? 'Continue Draft' : 'Create Job Card'}
              </h1>
              <p className="text-sm md:text-base text-graphite-600 mt-1">
                {editJobCardId
                  ? 'Continue working on your draft job card'
                  : 'Follow the steps to create a comprehensive job card'}
              </p>
            </div>
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

      {/* Job Card Creation Error Message */}
      <AnimatePresence>
        {jobCardCreationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-status-error text-sm">Failed to Create Job Card</p>
                  <p className="text-sm text-status-error/80 mt-1">{jobCardCreationError}</p>
                </div>
              </div>
              <button
                onClick={() => setJobCardCreationError(null)}
                className="shrink-0 p-1 hover:bg-status-error/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-status-error" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Card Creation Loading Overlay */}
      <AnimatePresence>
        {isCreatingJobCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-graphite-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-graphite-700" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">Creating Job Card</p>
                  <p className="text-sm text-gray-600 mt-1">Please wait while we set up your job card...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Navigation - Hidden when loading draft */}
      {!(isLoading && editJobCardId) && (
        <>
      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-4 md:mb-6"
      >
        {/* Desktop Tabs */}
        <div className="hidden md:block overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 -mb-px">
              {tabs.map((tab) => {
                const status = getTabStatus(tab.value)
                const accessibilityMessage = getTabAccessibilityMessage(tab.value)
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    title={accessibilityMessage}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      status === 'active' && "border-graphite-700 text-graphite-700",
                      status === 'complete' && "border-status-success hover:border-status-success",
                      status === 'accessible' && "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300",
                      status === 'inaccessible' && "border-transparent text-gray-400 cursor-not-allowed"
                    )}
                    style={status === 'complete' ? { color: '#0D9488', borderColor: '#2DD4BF' } : undefined}
                    disabled={status === 'inaccessible'}
                  >
                    {status === 'complete' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <tab.icon className="h-4 w-4" />
                    )}
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Tabs - Full Width */}
        <div className="md:hidden overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 -mb-px">
              {tabs.map((tab) => {
                const status = getTabStatus(tab.value)
                const accessibilityMessage = getTabAccessibilityMessage(tab.value)
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    title={accessibilityMessage}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                      status === 'active' && "border-graphite-700 text-graphite-700",
                      status === 'complete' && "border-status-success",
                      status === 'accessible' && "border-transparent text-gray-600",
                      status === 'inaccessible' && "border-transparent text-gray-400 cursor-not-allowed opacity-60"
                    )}
                    style={status === 'complete' ? { color: '#0D9488', borderColor: '#2DD4BF' } : undefined}
                    disabled={status === 'inaccessible'}
                  >
                    {status === 'complete' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <tab.icon className="h-3.5 w-3.5" />
                    )}
                    <span className="text-[10px]">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
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
              isLoading={isLoading}
              tabError={tabErrors.customer}
              tabValidation={tabValidation.customer}
              newlyAddedVehicleId={newlyAddedVehicleId}
              isCreatingJobCard={isCreatingJobCard}
            />
          )}

          {activeTab === 'job-details' && (
            <TabJobDetails
              jobType={jobType}
              setJobType={setJobType}
              priority={priority}
              setPriority={setPriority}
              customerReportIssues={customerReportIssues}
              currentReportIssue={currentReportIssue}
              setCurrentReportIssue={setCurrentReportIssue}
              onAddReportIssue={handleAddReportIssue}
              onRemoveReportIssue={handleRemoveReportIssue}
              workRequestedItems={workRequestedItems}
              currentWorkRequested={currentWorkRequested}
              setCurrentWorkRequested={setCurrentWorkRequested}
              onAddWorkRequested={handleAddWorkRequested}
              onRemoveWorkRequested={handleRemoveWorkRequested}
              customerNotes={customerNotes}
              setCustomerNotes={setCustomerNotes}
              technicalDiagnosisItems={technicalDiagnosisItems}
              currentTechnicalDiagnosis={currentTechnicalDiagnosis}
              setCurrentTechnicalDiagnosis={setCurrentTechnicalDiagnosis}
              onAddTechnicalDiagnosis={handleAddTechnicalDiagnosis}
              onRemoveTechnicalDiagnosis={handleRemoveTechnicalDiagnosis}
              onPreviousTab={() => handleTabChange('customer')}
              onNextTab={() => handleTabChange('tasks')}
              isLoading={isLoading}
              selectedCustomer={selectedCustomer}
              selectedVehicle={selectedVehicle}
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
              onAddTemplateItem={(item) => setChecklistItems([...checklistItems, item])}
              onPreviousTab={() => handleTabChange('job-details')}
              onNextTab={() => handleTabChange('labor-parts')}
              isLoading={isLoading}
              garageId={garageId}
              customerReportIssues={customerReportIssues}
              workRequestedItems={workRequestedItems}
              technicalDiagnosisItems={technicalDiagnosisItems}
            />
          )}

          {activeTab === 'labor-parts' && (
            <TabLaborParts
              checklistItems={checklistItems}
              selectedParts={selectedParts}
              setSelectedParts={setSelectedParts}
              calculateEstimatedCosts={calculateEstimatedCosts}
              onPreviousTab={() => handleTabChange('tasks')}
              onNextTab={() => handleTabChange('scheduling')}
              isLoading={isLoading}
              selectedCustomer={selectedCustomer}
              selectedVehicle={selectedVehicle}
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
              technicianNotes={technicianNotes}
              setTechnicianNotes={setTechnicianNotes}
              onPreviousTab={() => handleTabChange('labor-parts')}
              onNextTab={() => handleTabChange('review')}
              isLoading={isLoading}
              selectedCustomer={selectedCustomer}
              selectedVehicle={selectedVehicle}
            />
          )}

          {activeTab === 'review' && (
            <TabReview
              selectedCustomer={selectedCustomer}
              selectedVehicle={selectedVehicle}
              jobType={jobType}
              priority={priority}
              customerReportIssues={customerReportIssues}
              workRequestedItems={workRequestedItems}
              technicalDiagnosisItems={technicalDiagnosisItems}
              checklistItems={checklistItems}
              promisedDate={promisedDate}
              promisedTime={promisedTime}
              leadMechanicId={leadMechanicId}
              serviceAdvisorId={serviceAdvisorId}
              employees={employees}
              currentMileage={currentMileage}
              onPreviousTab={() => handleTabChange('scheduling')}
              isLoading={isLoading}
              success={success}
              tabError={tabErrors.review}
              getJobTypeLabel={getJobTypeLabel}
              getPriorityColor={getPriorityColor}
              calculateEstimatedCosts={calculateEstimatedCosts}
              isEditingDraft={isEditingDraft}
            />
          )}
        </div>
      </motion.div>
        </>
      )}

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
                      <h2 className="text-2xl font-bold text-gray-900">
                        {modalMode === 'add-vehicle' ? 'Add Vehicle to Customer' : 'Add New Customer'}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {modalMode === 'add-vehicle'
                          ? `Add a vehicle for ${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`
                          : 'Fill in the customer details below'}
                      </p>
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
                    {/* Personal Information - Only show for new customer creation */}
                    {modalMode === 'create' && (
                      <>
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
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-none"
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
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                      </>
                    )}

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
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer"
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
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    VIN Number
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.vin}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'vin', e.target.value)}
                                    placeholder="17-character VIN"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Engine Number
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.engineNumber}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'engineNumber', e.target.value)}
                                    placeholder="Engine number"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chassis Number
                                  </label>
                                  <input
                                    type="text"
                                    value={vehicle.chassisNumber}
                                    onChange={(e) => handleCustomerVehicleChange(index, 'chassisNumber', e.target.value)}
                                    placeholder="Chassis number"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
                        {modalMode === 'add-vehicle' ? 'Vehicle Notes' : 'Additional Notes'}
                      </label>
                      <textarea
                        name="notes"
                        value={customerFormData.notes}
                        onChange={handleCustomerFieldChange}
                        placeholder={modalMode === 'add-vehicle' ? 'Any additional notes about the vehicle...' : 'Any additional notes about the customer...'}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-none"
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
                            {modalMode === 'add-vehicle' ? 'Adding Vehicle...' : 'Adding Customer...'}
                          </>
                        ) : customerModalSuccess ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" style={{ color: '#0D9488' }} />
                            Added Successfully!
                          </>
                        ) : (
                          <>
                            {modalMode === 'add-vehicle' ? (
                              <>
                                <Car className="h-4 w-4" />
                                Add Vehicle
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4" />
                                Add Customer
                              </>
                            )}
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
  isLoading,
  tabError,
  tabValidation,
  newlyAddedVehicleId,
  isCreatingJobCard,
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
  isLoading: boolean
  tabError?: string
  tabValidation: boolean
  newlyAddedVehicleId?: string | null
  isCreatingJobCard?: boolean
}) {
  const filteredCustomers = customers.filter(customer => {
    const vehicleLicensePlates = customer.vehicles?.map(v => v.licensePlate).join(' ') || ''
    return `${customer.firstName} ${customer.lastName} ${customer.phoneNumber} ${customer.email || ''} ${vehicleLicensePlates}`.toLowerCase()
      .includes(customerSearchQuery.toLowerCase())
  })

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
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Customer Results */}
            {customerSearchQuery.trim() !== '' && (
              <div className="mb-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-h-80 overflow-y-auto">
                  {isLoadingCustomers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-graphite-700" />
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No matching customers found</p>
                      <p className="text-xs text-gray-500">Try a different search or add a new customer</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCustomers.map((customer, index) => (
                        <motion.button
                          key={customer.id}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onCustomerSelect(customer.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors"
                        >
                          {/* Avatar with initials */}
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-graphite-700 to-graphite-800 flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-sm font-semibold text-white">
                              {customer.firstName[0]}{customer.lastName[0]}
                            </span>
                          </div>

                          {/* Customer Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-500 truncate">{customer.phoneNumber}</p>
                              {customer.email && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Chevron indicator */}
                          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                {filteredCustomers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
                  </p>
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
          <div className="mb-6 bg-gradient-to-br from-graphite-800/5 to-white rounded-xl border-2 border-graphite-700/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-12 w-12 rounded-full bg-graphite-800/20 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-graphite-700" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-graphite-900 break-words overflow-wrap-anywhere">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-sm text-graphite-600 break-words overflow-wrap-anywhere">{selectedCustomer.phoneNumber}</p>
                  <p className="text-xs text-gray-500 break-words overflow-wrap-anywhere">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCustomerSelect('')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-graphite-900">Vehicle Information</h3>
            <button
              type="button"
              onClick={onOpenCustomerModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-graphite-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Vehicle
            </button>
          </div>

          {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
            <div className="mb-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {selectedCustomer.vehicles.map((vehicle, index) => {
                    const isSelected = selectedVehicle?.id === vehicle.id
                    const isNewlyAdded = newlyAddedVehicleId === vehicle.id
                    return (
                      <motion.button
                        key={vehicle.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          ...(isNewlyAdded && !isSelected && {
                            scale: [1, 1.02, 1],
                            backgroundColor: ['#f9fafb', '#e0f2fe', '#f9fafb'],
                          })
                        }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.05,
                          ...(isNewlyAdded && !isSelected && {
                            scale: { duration: 0.6, repeat: 2, repeatDelay: 0.2 },
                            backgroundColor: { duration: 1.5, repeat: 1 },
                          })
                        }}
                        whileHover={isSelected ? {} : { backgroundColor: '#f9fafb' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onVehicleSelect(vehicle)}
                        style={isSelected ? { backgroundColor: '#374151' } : undefined}
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 text-left transition-all relative",
                          !isSelected && isNewlyAdded && "ring-2 ring-status-success ring-opacity-50"
                        )}
                      >
                        {/* New Badge */}
                        {!isSelected && isNewlyAdded && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold text-white bg-status-success rounded-full"
                          >
                            NEW
                          </motion.span>
                        )}

                        {/* Vehicle Icon */}
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                          isSelected
                            ? "bg-white/20"
                            : isNewlyAdded && !isSelected
                            ? "bg-status-success"
                            : "bg-gradient-to-br from-gray-100 to-gray-200"
                        )}>
                          <Car className={cn(
                            "h-4.5 w-4.5",
                            isSelected ? "text-white" : "text-gray-700"
                          )} />
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-semibold truncate",
                            isSelected ? "text-white" : "text-gray-900"
                          )}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className={cn(
                              "text-xs truncate",
                              isSelected ? "text-white/80" : "text-gray-500"
                            )}>{vehicle.licensePlate}</p>
                            {vehicle.color && (
                              <>
                                <span className={cn(
                                  isSelected ? "text-white/40" : "text-gray-300"
                                )}>•</span>
                                <p className={cn(
                                  "text-xs truncate",
                                  isSelected ? "text-white/80" : "text-gray-500"
                                )}>{vehicle.color}</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected ? (
                          <div className="px-2.5 py-1 bg-lime-400 rounded-lg shrink-0">
                            <span className="text-[10px] font-bold text-graphite-900 uppercase tracking-wide">
                              Selected
                            </span>
                          </div>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
              {selectedCustomer.vehicles.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {selectedCustomer.vehicles.length} {selectedCustomer.vehicles.length === 1 ? 'vehicle' : 'vehicles'}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <Car className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No vehicles found</p>
                <p className="text-xs text-gray-500 mb-4">Add a vehicle to this customer to continue</p>
                <button
                  type="button"
                  onClick={onOpenCustomerModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-graphite-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add First Vehicle
                </button>
              </div>
            </div>
          )}

          {/* Current Mileage */}
          {selectedVehicle && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Current Mileage (km)
              </label>
              <input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                placeholder={selectedVehicle.currentMileage?.toString() || "Enter current mileage"}
                min="0"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onNextTab}
          disabled={!tabValidation || isCreatingJobCard}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingJobCard ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Creating Job Card...</span>
              <span className="sm:hidden">Creating...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Next: Job Details</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
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
  customerReportIssues,
  currentReportIssue,
  setCurrentReportIssue,
  onAddReportIssue,
  onRemoveReportIssue,
  workRequestedItems,
  currentWorkRequested,
  setCurrentWorkRequested,
  onAddWorkRequested,
  onRemoveWorkRequested,
  customerNotes,
  setCustomerNotes,
  technicalDiagnosisItems,
  currentTechnicalDiagnosis,
  setCurrentTechnicalDiagnosis,
  onAddTechnicalDiagnosis,
  onRemoveTechnicalDiagnosis,
  onPreviousTab,
  onNextTab,
  isLoading,
  selectedCustomer,
  selectedVehicle,
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
  customerReportIssues: string[]
  currentReportIssue: string
  setCurrentReportIssue: (value: string) => void
  onAddReportIssue: () => void
  onRemoveReportIssue: (index: number) => void
  workRequestedItems: string[]
  currentWorkRequested: string
  setCurrentWorkRequested: (value: string) => void
  onAddWorkRequested: () => void
  onRemoveWorkRequested: (index: number) => void
  customerNotes: string
  setCustomerNotes: (value: string) => void
  technicalDiagnosisItems: string[]
  currentTechnicalDiagnosis: string
  setCurrentTechnicalDiagnosis: (value: string) => void
  onAddTechnicalDiagnosis: () => void
  onRemoveTechnicalDiagnosis: (index: number) => void
  onPreviousTab: () => void
  onNextTab: () => void
  isLoading: boolean
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
  tabError?: string
  getJobTypeIcon: (type: JobType) => React.ReactNode
  getJobTypeLabel: (type: JobType) => string
  getPriorityColor: (priority: Priority) => string
  getPriorityBgColor: (priority: Priority) => string
}) {
  const jobTypes: JobType[] = ['repair', 'maintenance', 'routine', 'custom', 'diagnostic']
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']

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
                  ? "bg-graphite-800/10 border-graphite-700 shadow-glow"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div className={cn(jobType === type ? "text-graphite-700" : "text-gray-600")}>
                {getJobTypeIcon(type)}
              </div>
              <span className={cn(
                "text-sm font-medium text-center",
                jobType === type ? "text-graphite-700 font-bold" : "text-gray-700"
              )}>
                {getJobTypeLabel(type)}
              </span>
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

      {/* Customer Reported Issues Checklist */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Customer Reported Issues Checklist <span className="text-status-error">*</span>
        </label>
        <div className="space-y-3">
          {/* Input Area */}
          <div className="space-y-2">
            <textarea
              value={currentReportIssue}
              onChange={(e) => setCurrentReportIssue(e.target.value)}
              onKeyDown={(e) => {
                // Desktop: Enter to add, Shift+Enter for newline
                // Mobile: Enter for newline, use Add button
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onAddReportIssue()
                }
              }}
              placeholder="Enter an issue the customer reported..."
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-y break-words overflow-wrap-anywhere text-sm"
            />

            {/* Desktop Helper Text and Action Button */}
            <div className="hidden sm:flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Press Enter to add the issue (Shift+Enter for new line)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentReportIssue('')}
                  disabled={!currentReportIssue.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onAddReportIssue}
                  disabled={!currentReportIssue.trim()}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                    currentReportIssue.trim()
                      ? "bg-graphite-700 text-white hover:bg-graphite-800"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  <Plus className="h-3 w-3" />
                  Add Issue
                </button>
              </div>
            </div>

            {/* Mobile Helper Text and Action Buttons */}
            <div className="sm:hidden space-y-2">
              <p className="text-xs text-gray-500">
                Type multiple lines, then tap 'Add Issue' button
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentReportIssue('')}
                  disabled={!currentReportIssue.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onAddReportIssue}
                  disabled={!currentReportIssue.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-graphite-900 text-white hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Issue
                </button>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {customerReportIssues.length > 0 && (
            <div className="space-y-2">
              {customerReportIssues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
                >
                  <div className="h-2 w-2 rounded-full bg-graphite-700 shrink-0 mt-1.5" />
                  <p className="flex-1 text-sm text-graphite-900 break-words overflow-wrap-anywhere">{issue}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveReportIssue(index)}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Press Enter or click Add to add each issue. All reported issues will be displayed on the job card.
          </p>
        </div>
      </div>

      {/* Service Scope Checklist */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Service Scope Checklist <span className="text-status-error">*</span>
        </label>
        <div className="space-y-3">
          {/* Input Area */}
          <div className="space-y-2">
            <textarea
              value={currentWorkRequested}
              onChange={(e) => setCurrentWorkRequested(e.target.value)}
              onKeyDown={(e) => {
                // Desktop: Enter to add, Shift+Enter for newline
                // Mobile: Enter for newline, use Add button
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onAddWorkRequested()
                }
              }}
              placeholder="Enter a service item to be performed..."
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-y break-words overflow-wrap-anywhere text-sm"
            />

            {/* Desktop Helper Text and Action Button */}
            <div className="hidden sm:flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Press Enter to add the service item (Shift+Enter for new line)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentWorkRequested('')}
                  disabled={!currentWorkRequested.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onAddWorkRequested}
                  disabled={!currentWorkRequested.trim()}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                    currentWorkRequested.trim()
                      ? "bg-graphite-700 text-white hover:bg-graphite-800"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  <Plus className="h-3 w-3" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Mobile Helper Text and Action Buttons */}
            <div className="sm:hidden space-y-2">
              <p className="text-xs text-gray-500">
                Type multiple lines, then tap 'Add Item' button
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentWorkRequested('')}
                  disabled={!currentWorkRequested.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onAddWorkRequested}
                  disabled={!currentWorkRequested.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-graphite-900 text-white hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {workRequestedItems.length > 0 && (
            <div className="space-y-2">
              {workRequestedItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
                >
                  <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  <p className="flex-1 text-sm text-graphite-900 break-words overflow-wrap-anywhere">{item}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveWorkRequested(index)}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Add all service items to be performed. These will be tracked as part of the final delivery checklist.
          </p>
        </div>
      </div>

      {/* Technical Diagnosis */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Technical Diagnosis
        </label>
        <div className="space-y-3">
          {/* Input Area */}
          <div className="space-y-2">
            <textarea
              value={currentTechnicalDiagnosis}
              onChange={(e) => setCurrentTechnicalDiagnosis(e.target.value)}
              onKeyDown={(e) => {
                // Desktop: Enter to add, Shift+Enter for newline
                // Mobile: Enter for newline, use Add button
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onAddTechnicalDiagnosis()
                }
              }}
              placeholder="Enter a technical diagnosis or observed issue..."
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-y break-words overflow-wrap-anywhere text-sm"
            />

            {/* Desktop Helper Text and Action Button */}
            <div className="hidden sm:flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Press Enter to add the diagnosis (Shift+Enter for new line)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTechnicalDiagnosis('')}
                  disabled={!currentTechnicalDiagnosis.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onAddTechnicalDiagnosis}
                  disabled={!currentTechnicalDiagnosis.trim()}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                    currentTechnicalDiagnosis.trim()
                      ? "bg-graphite-700 text-white hover:bg-graphite-800"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  <Plus className="h-3 w-3" />
                  Add Diagnosis
                </button>
              </div>
            </div>

            {/* Mobile Helper Text and Action Buttons */}
            <div className="sm:hidden space-y-2">
              <p className="text-xs text-gray-500">
                Type multiple lines, then tap 'Add Diagnosis' button
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTechnicalDiagnosis('')}
                  disabled={!currentTechnicalDiagnosis.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onAddTechnicalDiagnosis}
                  disabled={!currentTechnicalDiagnosis.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-graphite-900 text-white hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Diagnosis
                </button>
              </div>
            </div>
          </div>

          {/* Diagnosis List */}
          {technicalDiagnosisItems.length > 0 && (
            <div className="space-y-2">
              {technicalDiagnosisItems.map((diagnosis, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
                >
                  <div className="h-2 w-2 rounded-full bg-graphite-700 shrink-0 mt-1.5" />
                  <p className="flex-1 text-sm text-graphite-900 break-words overflow-wrap-anywhere">{diagnosis}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveTechnicalDiagnosis(index)}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Press Enter or click Add to add each diagnosis. All diagnoses will be displayed on the job card.
          </p>
        </div>
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
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-graphite-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-y break-words overflow-wrap-anywhere"
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onNextTab}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          <span className="hidden sm:inline">Next: Tasks</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// ENHANCED TAB TASKS - World-Class Task Management System
// NOTE: TabTasks component moved to /app/job-cards/components/tasks/TabTasks.tsx
// ============================================================================

interface TabLaborPartsProps {
  checklistItems: ChecklistItem[]
  selectedParts: Array<{
    id: string
    partId: string | null
    partName: string
    partNumber: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  setSelectedParts: React.Dispatch<React.SetStateAction<Array<{
    id: string
    partId: string | null
    partName: string
    partNumber: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }>>>
  calculateEstimatedCosts: () => {
    totalLaborMinutes: number
    totalLaborHours: string
    totalLaborCost: string
    totalPartsCost: string
    totalCost: string
    taskCount: number
    partsCount: number
  }
  onPreviousTab: () => void
  onNextTab: () => void
  isLoading: boolean
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
}

function TabLaborParts({
  checklistItems,
  selectedParts,
  setSelectedParts,
  calculateEstimatedCosts,
  onPreviousTab,
  onNextTab,
  isLoading,
  selectedCustomer,
  selectedVehicle,
}: TabLaborPartsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingParts, setIsLoadingParts] = useState(false)
  const [partsSearchResults, setPartsSearchResults] = useState<any[]>([])

  // Calculate costs
  const costs = calculateEstimatedCosts()

  // Add part handler
  const handleAddPart = (part: any) => {
    // The API returns camelCase field names: sellingPrice, partName, partNumber
    const unitPrice = part.sellingPrice || part.selling_price || 0

    const newPart = {
      id: Date.now().toString(),
      partId: part.id || null,
      partName: part.partName || part.part_name,
      partNumber: part.partNumber || part.part_number || null,
      quantity: 1,
      unitPrice: unitPrice,
      totalPrice: unitPrice,
    }

    setSelectedParts([...selectedParts, newPart])
    setSearchQuery('')
    setPartsSearchResults([])
  }

  // Update part quantity
  const handleUpdatePartQuantity = (partId: string, quantity: number) => {
    setSelectedParts(selectedParts.map(part => {
      if (part.id === partId) {
        const newQuantity = Math.max(1, quantity)
        return {
          ...part,
          quantity: newQuantity,
          totalPrice: newQuantity * part.unitPrice
        }
      }
      return part
    }))
  }

  // Remove part
  const handleRemovePart = (partId: string) => {
    setSelectedParts(selectedParts.filter(part => part.id !== partId))
  }

  // Search parts
  const handleSearchParts = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setPartsSearchResults([])
      return
    }

    setIsLoadingParts(true)
    try {
      const response = await fetch('/api/inventory/list?' + new URLSearchParams({
        search: query,
        limit: '10'
      }))
      const data = await response.json()
      setPartsSearchResults(data.parts || [])
    } catch (error) {
      console.error('Error searching parts:', error)
      setPartsSearchResults([])
    } finally {
      setIsLoadingParts(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Wrench className="h-12 w-12 mx-auto mb-4 text-graphite-700" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Labor & Parts</h2>
        <p className="text-gray-600">Review labor time and manage parts for this job</p>
      </div>

      {/* Cost Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{costs.taskCount}</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-600 mt-2">{costs.totalLaborHours} hours</p>
        </div>

        {/* Est Labor Cost */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Est Labor Cost</p>
              <p className="text-2xl font-bold text-gray-900">₹{costs.totalLaborCost}</p>
            </div>
            <Timer className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-600 mt-2">{costs.totalLaborMinutes} minutes</p>
        </div>

        {/* Est Parts Cost */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Est Parts Cost</p>
              <p className="text-2xl font-bold text-gray-900">₹{costs.totalPartsCost}</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-600 mt-2">{costs.partsCount} parts</p>
        </div>

        {/* Total Est Cost */}
        <div className="bg-gradient-to-br from-graphite-700 to-graphite-900 rounded-xl border-2 border-graphite-800 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Total Est Cost</p>
              <p className="text-2xl font-bold text-white">₹{costs.totalCost}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Labor + Parts</p>
        </div>
      </div>

      {/* Labor Time Tracking Section */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Timer className="h-5 w-5 text-gray-600" />
          Labor Time Tracking
        </h3>
        <div className="space-y-3">
          {checklistItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No tasks added yet. Go to Tasks tab to add tasks.</p>
            </div>
          ) : (
            checklistItems.map((item) => {
              const laborCost = ((item.estimatedMinutes / 60) * item.laborRate).toFixed(2)
              return (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    <p className="text-sm text-gray-500">{item.estimatedMinutes} min × ₹{item.laborRate}/hr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">₹{laborCost}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Parts Management Section */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          Parts & Materials
        </h3>

        {/* Add Parts Search */}
        <div className="mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search parts by name or number..."
                value={searchQuery}
                onChange={(e) => handleSearchParts(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.length >= 2 && partsSearchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {partsSearchResults.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => handleAddPart(part)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{part.partName}</p>
                      <p className="text-sm text-gray-500">{part.partNumber} • {part.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{part.sellingPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Stock: {part.onHandStock}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isLoadingParts && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 mt-2">Searching parts...</p>
            </div>
          )}
        </div>

        {/* Selected Parts List */}
        {selectedParts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No parts added yet. Search and add parts above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedParts.map((part) => (
              <div key={part.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{part.partName}</p>
                  {part.partNumber && (
                    <p className="text-sm text-gray-500">SKU: {part.partNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdatePartQuantity(part.id, part.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-4 w-4 text-gray-700" />
                    </button>
                    <span className="w-12 text-center font-semibold text-graphite-900">{part.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdatePartQuantity(part.id, part.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-lg font-semibold text-gray-900">₹{part.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">₹{part.unitPrice.toFixed(2)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePart(part.id)}
                    className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onNextTab}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          <span className="hidden sm:inline">Next: Scheduling</span>
          <span className="sm:hidden">Next</span>
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
  technicianNotes,
  setTechnicianNotes,
  onPreviousTab,
  onNextTab,
  isLoading,
  selectedCustomer,
  selectedVehicle,
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
  technicianNotes: string
  setTechnicianNotes: (value: string) => void
  onPreviousTab: () => void
  onNextTab: () => void
  isLoading: boolean
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
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
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Unassigned</option>
              {employees
                .filter((employee) => employee.role === 'Manager')
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Unassigned</option>
              {employees
                .filter((employee) => employee.role === 'Mechanic')
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Technician Notes */}
      <div>
        <label className="block text-sm font-medium text-graphite-700 mb-2">
          Technician Notes
        </label>
        <textarea
          value={technicianNotes}
          onChange={(e) => setTechnicianNotes(e.target.value)}
          placeholder="Notes for the technician..."
          rows={3}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onNextTab}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all"
        >
          <span className="hidden sm:inline">Next: Review</span>
          <span className="sm:hidden">Next</span>
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
  customerReportIssues,
  workRequestedItems,
  technicalDiagnosisItems,
  checklistItems,
  promisedDate,
  promisedTime,
  leadMechanicId,
  serviceAdvisorId,
  employees,
  currentMileage,
  onPreviousTab,
  isLoading,
  success,
  tabError,
  getJobTypeLabel,
  getPriorityColor,
  calculateEstimatedCosts,
  isEditingDraft,
}: {
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
  jobType: JobType
  priority: Priority
  customerReportIssues: string[]
  workRequestedItems: string[]
  technicalDiagnosisItems: string[]
  checklistItems: ChecklistItem[]
  promisedDate: string
  promisedTime: string
  leadMechanicId: string
  serviceAdvisorId: string
  employees: EmployeeData[]
  currentMileage: string
  onPreviousTab: () => void
  isLoading: boolean
  success: boolean
  tabError?: string
  getJobTypeLabel: (type: JobType) => string
  getPriorityColor: (priority: Priority) => string
  calculateEstimatedCosts: () => { totalLaborMinutes: number; totalLaborHours: string; totalLaborCost: string; totalCost: string }
  isEditingDraft: boolean
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
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                <p className="font-medium text-gray-900 capitalize">Queued</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tasks</p>
                <p className="font-medium text-gray-900">{checklistItems.length} items</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-2">Customer Report Issues</p>
                {customerReportIssues.length > 0 ? (
                  <ul className="space-y-1">
                    {customerReportIssues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-graphite-700 mt-1.5 shrink-0" />
                        <span className="break-words overflow-wrap-anywhere">{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No issues reported</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Service Scope Checklist</p>
                {workRequestedItems.length > 0 ? (
                  <ul className="space-y-1">
                    {workRequestedItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span className="break-words overflow-wrap-anywhere">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No service items specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Tasks & Subtasks Summary */}
          {checklistItems.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Tasks & Subtasks
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {checklistItems.map((item, index) => (
                  <div key={item.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-semibold text-gray-900 break-words overflow-wrap-anywhere">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.estimatedMinutes} min • {item.category}</p>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {item.subtasks && item.subtasks.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Subtasks</p>
                        <ul className="space-y-1">
                          {item.subtasks.map((subtask) => (
                            <li key={subtask.id} className="flex items-start gap-2 text-xs text-gray-700">
                              <div className="h-1 w-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="break-words overflow-wrap-anywhere">{subtask.name}</span>
                                <span className="text-gray-400 ml-2">({subtask.estimatedMinutes}m)</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Linked Items */}
                    {(item.linkedToCustomerIssues?.length ||
                      item.linkedToServiceScope?.length ||
                      item.linkedToTechnicalDiagnosis?.length) && (
                      <div className="ml-4 mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Linked Items</p>

                        {/* Linked Customer Issues */}
                        {item.linkedToCustomerIssues && item.linkedToCustomerIssues.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.linkedToCustomerIssues.map((issueIndex) => (
                              <span
                                key={`issue-${index}-${issueIndex}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-graphite-100 text-graphite-700"
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Issue: {customerReportIssues[issueIndex]?.slice(0, 30)}...
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Linked Service Scope */}
                        {item.linkedToServiceScope && item.linkedToServiceScope.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.linkedToServiceScope.map((scopeIndex) => (
                              <span
                                key={`scope-${index}-${scopeIndex}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                              >
                                <Wrench className="h-3 w-3 mr-1" />
                                {workRequestedItems[scopeIndex]?.slice(0, 30)}...
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Linked Technical Diagnosis */}
                        {item.linkedToTechnicalDiagnosis && item.linkedToTechnicalDiagnosis.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.linkedToTechnicalDiagnosis.map((diagIndex) => (
                              <span
                                key={`diag-${index}-${diagIndex}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700"
                              >
                                <Search className="h-3 w-3 mr-1" />
                                Diagnosis: {technicalDiagnosisItems[diagIndex]?.slice(0, 30)}...
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parts & Labor Summary */}
          {checklistItems.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Parts & Labor
              </h3>
              <div className="space-y-3">
                {/* Labor Breakdown */}
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Labor Cost Breakdown</p>
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <div key={`labor-${item.id}`} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700 break-words overflow-wrap-anywhere flex-1 pr-4">{item.itemName}</span>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs text-gray-500">{item.estimatedMinutes}m @ ₹{item.laborRate}/hr</span>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{((item.estimatedMinutes / 60) * item.laborRate).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                  <span className="font-semibold text-gray-900">Total Estimated Cost</span>
                  <span className="text-xl font-bold text-graphite-700">
                    ₹{costs.totalCost}
                  </span>
                </div>

                {/* Labor Summary */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Labor Time</p>
                    <p className="text-sm font-semibold text-gray-900">{costs.totalLaborHours}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Labor Cost</p>
                    <p className="text-sm font-semibold text-gray-900">₹{costs.totalLaborCost}</p>
                  </div>
                </div>
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
            type="submit"
            disabled={isLoading || success}
            className="flex-1 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-xl hover:bg-graphite-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">{isEditingDraft ? 'Updating Draft...' : 'Creating Job Card...'}</span>
                <span className="sm:hidden">{isEditingDraft ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4" style={{ color: '#0D9488' }} />
                <span className="hidden sm:inline">{isEditingDraft ? 'Updated Successfully!' : 'Created Successfully!'}</span>
                <span className="sm:hidden">{isEditingDraft ? 'Updated!' : 'Created!'}</span>
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:inline">{isEditingDraft ? 'Send to queue' : 'Send to Queue'}</span>
                <span className="sm:hidden">{isEditingDraft ? 'Send' : 'Send'}</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

// Wrapper component with Suspense boundary
export default function CreateJobCardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-graphite-700" /></div>}>
      <CreateJobCardPageContent />
    </Suspense>
  )
}
