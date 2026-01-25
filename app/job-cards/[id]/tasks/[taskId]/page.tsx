'use client'

/**
 * Task Detail Page
 *
 * Comprehensive page for viewing and editing individual task details.
 * Features:
 * - Status change with quick actions
 * - Mechanic notes editing
 * - Subtask management (add, toggle, delete)
 * - Image attachments
 * - Mobile-optimized with 44px touch targets
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, Circle, Plus, Camera,
  Image as ImageIcon, X, Edit2, Save, Timer,
  Wrench, User, AlertCircle, Play, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
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
// TYPES
// ============================================================================

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

interface ChecklistSubtask {
  id: string
  name: string
  description?: string
  completed: boolean
  displayOrder: number
}

interface ChecklistItem {
  id: string
  itemName: string
  description: string | null
  status: TaskStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  estimatedMinutes: number
  actualMinutes: number | null
  laborRate: number
  displayOrder: number
  mechanicId: string | null
  mechanicNotes: string | null
  subtasks: ChecklistSubtask[]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { id: jobCardId, taskId } = params
  const queryClient = useQueryClient()

  // Form state
  const [mechanicNotes, setMechanicNotes] = useState('')
  const [actualMinutes, setActualMinutes] = useState(0)
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [newSubtaskName, setNewSubtaskName] = useState('')
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  // Fetch task and job card details
  const { data: task, isLoading } = useQuery({
    queryKey: ['task-detail', jobCardId, taskId],
    queryFn: async () => {
      const response = await fetch(`/api/job-cards/${jobCardId}`)
      if (!response.ok) throw new Error('Failed to fetch job card')
      const result = await response.json()
      const task = result.jobCard.checklistItems.find((t: ChecklistItem) => t.id === taskId)
      return task
    },
    enabled: !!jobCardId && !!taskId
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: TaskStatus) => {
      const response = await fetch(`/api/job-cards/${jobCardId}/checklist/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update status')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-card', jobCardId] })
      queryClient.invalidateQueries({ queryKey: ['task-detail'] })
    }
  })

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await fetch(`/api/job-cards/${jobCardId}/checklist/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mechanicNotes: notes })
      })
      if (!response.ok) throw new Error('Failed to update notes')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-card', jobCardId] })
      queryClient.invalidateQueries({ queryKey: ['task-detail'] })
    }
  })

  // Add subtask mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async (subtask: { name: string; description?: string }) => {
      const response = await fetch(`/api/job-cards/${jobCardId}/checklist/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subtask)
      })
      if (!response.ok) throw new Error('Failed to add subtask')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-card', jobCardId] })
      queryClient.invalidateQueries({ queryKey: ['task-detail'] })
      setShowAddSubtask(false)
      setNewSubtaskName('')
      setNewSubtaskDesc('')
    }
  })

  // Toggle subtask mutation
  const toggleSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const subtask = task?.subtasks.find((st: any) => st.id === subtaskId)
      const response = await fetch(`/api/job-cards/${jobCardId}/checklist/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !subtask?.completed })
      })
      if (!response.ok) throw new Error('Failed to update subtask')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-card', jobCardId] })
      queryClient.invalidateQueries({ queryKey: ['task-detail'] })
    }
  })

  // Initialize form state when task loads
  useEffect(() => {
    if (task) {
      setMechanicNotes(task.mechanicNotes || '')
      setActualMinutes(task.actualMinutes || 0)
    }
  }, [task])

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf0f5]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-t-graphite-900 border-r-transparent border-b-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="mt-6 text-gray-700 font-semibold text-base">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf0f5] p-4">
        <div className="max-w-md w-full bg-white rounded-xl border-2 border-red-200 p-8">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Task Not Found</h2>
          <button
            onClick={() => router.back()}
            className="w-full min-h-[48px] mt-4 flex items-center justify-center gap-2 bg-graphite-900 text-white font-semibold rounded-lg active:scale-[0.98] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ecf0f5] pb-safe">
      {/* Header - Fixed on mobile, sticky on desktop */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-display font-bold text-gray-900 truncate">
                {task.itemName}
              </h1>
              <p className="text-sm text-gray-600">Task #{task.displayOrder}</p>
            </div>

            {/* Quick Status Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {task.status === 'pending' && (
                <button
                  onClick={() => updateStatusMutation.mutate('in_progress')}
                  disabled={updateStatusMutation.isPending}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  Start
                </button>
              )}

              {task.status === 'in_progress' && (
                <button
                  onClick={() => updateStatusMutation.mutate('completed')}
                  disabled={updateStatusMutation.isPending}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-teal-50 text-teal-700 font-semibold rounded-lg border border-teal-200 hover:bg-teal-100 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900">Task Status</h2>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold border',
              task.status === 'pending' && 'bg-gray-100 text-gray-700 border-gray-300',
              task.status === 'in_progress' && 'bg-blue-50 text-blue-700 border-blue-200',
              task.status === 'completed' && 'bg-teal-50 text-teal-700 border-teal-200',
              task.status === 'blocked' && 'bg-red-50 text-red-700 border-red-200'
            )}>
              {task.status.replace('_', ' ')}
            </span>
          </div>

          {/* Quick Status Change Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => updateStatusMutation.mutate('pending')}
              disabled={updateStatusMutation.isPending}
              className={cn(
                "min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
                task.status === 'pending'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              )}
            >
              <Clock className="h-4 w-4" />
              Pending
            </button>

            <button
              onClick={() => updateStatusMutation.mutate('in_progress')}
              disabled={updateStatusMutation.isPending}
              className={cn(
                "min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
                task.status === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              )}
            >
              <Play className="h-4 w-4" />
              In Progress
            </button>

            <button
              onClick={() => updateStatusMutation.mutate('completed')}
              disabled={updateStatusMutation.isPending}
              className={cn(
                "min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
                task.status === 'completed'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </button>

            <button
              onClick={() => updateStatusMutation.mutate('blocked')}
              disabled={updateStatusMutation.isPending}
              className={cn(
                "min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
                task.status === 'blocked'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              )}
            >
              <AlertCircle className="h-4 w-4" />
              Blocked
            </button>
          </div>
        </motion.div>

        {/* Task Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-6"
        >
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Details</h2>

          <div className="space-y-4">
            {task.description && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1 block">
                  Description
                </label>
                <p className="text-sm text-gray-900">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1 block">
                  Category
                </label>
                <p className="text-sm text-gray-900">{task.category}</p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1 block">
                  Priority
                </label>
                <span className={cn(
                  'inline-flex px-2.5 py-0.5 rounded-lg text-xs font-semibold border',
                  task.priority === 'urgent' && 'bg-red-50 text-red-700 border-red-200',
                  task.priority === 'high' && 'bg-orange-50 text-orange-700 border-orange-200',
                  task.priority === 'medium' && 'bg-amber-50 text-amber-700 border-amber-200',
                  task.priority === 'low' && 'bg-gray-50 text-gray-700 border-gray-300'
                )}>
                  {task.priority}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1 block">
                  Estimated Time
                </label>
                <p className="text-sm font-mono text-gray-900">
                  <Timer className="h-3 w-3 inline mr-1" />
                  {formatDuration(task.estimatedMinutes)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1 block">
                  Labor Rate
                </label>
                <p className="text-sm font-mono text-gray-900">₹{task.laborRate}/hr</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subtasks Section */}
        {task.subtasks && task.subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-gray-900">Subtasks</h2>
              <span className="text-sm text-gray-600">
                {task.subtasks.filter((st: ChecklistSubtask) => st.completed).length} of {task.subtasks.length} completed
              </span>
            </div>

            <div className="space-y-3">
              {task.subtasks.map((subtask: ChecklistSubtask, idx: number) => (
                <div
                  key={subtask.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all",
                    subtask.completed
                      ? "bg-teal-50 border-teal-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <button
                    onClick={() => toggleSubtaskMutation.mutate(subtask.id)}
                    disabled={toggleSubtaskMutation.isPending}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center flex-shrink-0 rounded-lg hover:bg-white/50 active:bg-white/80 transition-colors disabled:opacity-50"
                    aria-label={subtask.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-teal-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-base font-medium",
                      subtask.completed ? "text-gray-500 line-through" : "text-gray-900"
                    )}>
                      <span className="text-gray-600 mr-2">{idx + 1}.</span>
                      {subtask.name}
                    </p>

                    {subtask.description && (
                      <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subtask Button */}
            <button
              onClick={() => setShowAddSubtask(true)}
              className="w-full min-h-[48px] mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Subtask
            </button>
          </motion.div>
        )}

        {/* Add Subtask Modal/Inline Form */}
        {showAddSubtask && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-6"
          >
            <h3 className="text-base font-display font-bold text-gray-900 mb-4">Add New Subtask</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Subtask Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  placeholder="Enter subtask name"
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-graphite-900 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description (optional)
                </label>
                <textarea
                  value={newSubtaskDesc}
                  onChange={(e) => setNewSubtaskDesc(e.target.value)}
                  placeholder="Add details about this subtask"
                  rows={3}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-graphite-900 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => addSubtaskMutation.mutate({
                    name: newSubtaskName,
                    description: newSubtaskDesc || undefined
                  })}
                  disabled={!newSubtaskName.trim() || addSubtaskMutation.isPending}
                  className="flex-1 min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-lg hover:bg-graphite-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Subtask
                </button>

                <button
                  onClick={() => {
                    setShowAddSubtask(false)
                    setNewSubtaskName('')
                    setNewSubtaskDesc('')
                  }}
                  className="flex-1 min-h-[48px] px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mechanic Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-6"
        >
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Mechanic Notes</h2>

          <textarea
            value={mechanicNotes}
            onChange={(e) => setMechanicNotes(e.target.value)}
            placeholder="Add notes about work performed, issues encountered, parts used..."
            rows={6}
            className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-graphite-900 focus:border-transparent resize-none"
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={() => updateNotesMutation.mutate(mechanicNotes)}
              disabled={updateNotesMutation.isPending}
              className="min-h-[44px] flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-lg hover:bg-graphite-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Notes
            </button>
          </div>
        </motion.div>

        {/* Attachments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-6"
        >
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Attachments</h2>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block">
              <div className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  Tap to add photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setSelectedImages([...selectedImages, ...files])
                  }}
                />
              </div>
            </label>
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 min-h-[32px] min-w-[32px] flex items-center justify-center bg-red-500 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {selectedImages.length > 0 && (
            <button
              onClick={() => {
                // TODO: Implement image upload mutation
                console.log('Uploading images:', selectedImages)
              }}
              className="w-full min-h-[48px] mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-graphite-900 text-white font-semibold rounded-lg hover:bg-graphite-700 active:scale-[0.98] transition-all"
            >
              <ImageIcon className="h-4 w-4" />
              Upload {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''}
            </button>
          )}
        </motion.div>
      </main>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 pb-safe">
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <button
              onClick={() => updateStatusMutation.mutate('in_progress')}
              disabled={updateStatusMutation.isPending}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
          )}

          {task.status === 'in_progress' && (
            <button
              onClick={() => updateStatusMutation.mutate('completed')}
              disabled={updateStatusMutation.isPending}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold rounded-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
