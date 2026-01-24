// ============================================================================
// Component: CustomTasksTab
// Description: Tab for manually adding custom tasks with option to save as template
// ============================================================================

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  CheckSquare2,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChecklistItem, TaskCategory, TaskPriority } from '@/lib/types/template.types'

interface CustomTasksTabProps {
  checklistItems: ChecklistItem[]
  currentChecklistItem: ChecklistItem
  setCurrentChecklistItem: (item: ChecklistItem) => void
  onAddItem: (item: ChecklistItem) => void
  onRemoveItem: (id: string) => void
  customerReportIssues: string[]
  workRequestedItems: string[]
  technicalDiagnosisItems: string[]
  garageId: string
  className?: string
}

const CATEGORIES: TaskCategory[] = ['Engine', 'Electrical', 'Body', 'Maintenance', 'Diagnostic', 'Custom']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

export function CustomTasksTab({
  checklistItems,
  currentChecklistItem,
  setCurrentChecklistItem,
  onAddItem,
  onRemoveItem,
  customerReportIssues,
  workRequestedItems,
  technicalDiagnosisItems,
  garageId,
  className,
}: CustomTasksTabProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [templateSuccess, setTemplateSuccess] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)

  // Handle adding a new task
  const handleAddTask = async () => {
    if (!currentChecklistItem.itemName.trim()) {
      setTemplateError('Task name is required')
      return
    }

    // If "Save as Template" is checked, create template first
    if (saveAsTemplate) {
      setIsSavingTemplate(true)
      setTemplateError(null)

      try {
        const templateData = {
          garageId,
          name: currentChecklistItem.itemName,
          description: currentChecklistItem.description || '',
          category: (currentChecklistItem.category as TaskCategory) || 'Custom',
          priority: currentChecklistItem.priority as TaskPriority,
          estimatedMinutes: currentChecklistItem.estimatedMinutes,
          laborRate: currentChecklistItem.laborRate,
          tags: ['custom'],
          subtasks: currentChecklistItem.subtasks?.map(st => ({
            name: st.name,
            description: st.description || '',
            estimatedMinutes: st.estimatedMinutes,
            displayOrder: st.displayOrder,
          })) || [],
        }

        const response = await fetch('/api/job-card-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create template')
        }

        // Show success message
        setTemplateSuccess(true)
        setTimeout(() => setTemplateSuccess(false), 3000)

        // Add task to checklist
        onAddItem(currentChecklistItem)

        // Reset form
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

        setSaveAsTemplate(false)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create template'
        setTemplateError(message)
      } finally {
        setIsSavingTemplate(false)
      }
    } else {
      // Just add the task without saving as template
      onAddItem(currentChecklistItem)

      // Reset form
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
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success Message */}
      <AnimatePresence>
        {templateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-status-success/10 border border-status-success/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
              <p className="text-sm text-status-success font-medium">Template created successfully!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {templateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-status-error font-medium">Failed to create template</p>
                <p className="text-sm text-status-error/80 mt-1">{templateError}</p>
              </div>
              <button
                onClick={() => setTemplateError(null)}
                className="shrink-0 p-1 hover:bg-status-error/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-status-error" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Checklist */}
      {checklistItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckSquare2 className="h-5 w-5 text-graphite-700" />
            Current Checklist ({checklistItems.length})
          </h3>
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-200 rounded">{item.category}</span>
                      <span className="px-2 py-0.5 bg-gray-200 rounded">{item.priority}</span>
                      <span>{item.estimatedMinutes} min</span>
                      <span>₹{(item.estimatedMinutes / 60) * item.laborRate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="shrink-0 p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Subtasks */}
                {item.subtasks && item.subtasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Subtasks:</p>
                    <div className="space-y-1.5">
                      {item.subtasks.map((st, idx) => (
                        <div key={st.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {st.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Task Form */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-graphite-700" />
          Add Custom Task
        </h3>

        <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={currentChecklistItem.itemName}
              onChange={(e) =>
                setCurrentChecklistItem({ ...currentChecklistItem, itemName: e.target.value })
              }
              placeholder="e.g., Replace Front Brake Pads"
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={currentChecklistItem.description}
              onChange={(e) =>
                setCurrentChecklistItem({ ...currentChecklistItem, description: e.target.value })
              }
              placeholder="Provide details about the task..."
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={currentChecklistItem.category}
                onChange={(e) =>
                  setCurrentChecklistItem({ ...currentChecklistItem, category: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={currentChecklistItem.priority}
                onChange={(e) =>
                  setCurrentChecklistItem({
                    ...currentChecklistItem,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {PRIORITIES.map((prio) => (
                  <option key={prio} value={prio}>
                    {prio.charAt(0).toUpperCase() + prio.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Time and Labor Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={currentChecklistItem.estimatedMinutes}
                onChange={(e) =>
                  setCurrentChecklistItem({
                    ...currentChecklistItem,
                    estimatedMinutes: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labor Rate (₹/hour)
              </label>
              <input
                type="number"
                value={currentChecklistItem.laborRate}
                onChange={(e) =>
                  setCurrentChecklistItem({
                    ...currentChecklistItem,
                    laborRate: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Save as Template Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSaveAsTemplate(!saveAsTemplate)}
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded border-2 transition-all',
                saveAsTemplate
                  ? 'bg-graphite-700 border-graphite-700'
                  : 'bg-white border-gray-300 hover:border-graphite-700'
              )}
            >
              {saveAsTemplate && <CheckSquare2 className="h-4 w-4 text-white" />}
              {!saveAsTemplate && <Square className="h-4 w-4 text-gray-400" />}
            </button>
            <label
              htmlFor="save-as-template"
              className="text-sm font-medium text-gray-700 cursor-pointer select-none"
            >
              Save as Template
            </label>
          </div>

          {/* Add Task Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddTask}
              disabled={isSavingTemplate || !currentChecklistItem.itemName.trim()}
              className={cn(
                'flex items-center justify-center gap-2 px-6 py-3',
                'bg-graphite-900 text-white font-semibold rounded-xl',
                'hover:bg-graphite-800 active:bg-graphite-900',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all'
              )}
            >
              {isSavingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Template...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {saveAsTemplate ? 'Save Template & Add Task' : 'Add Task'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
