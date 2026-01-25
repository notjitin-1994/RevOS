// ============================================================================
// Component: TabTasks (Enhanced with Templates + Separate Checklist)
// Description: Tasks tab with Templates, Custom Tasks, and Checklist sub-tabs
// ============================================================================

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ClipboardCheck, Plus, Loader2, ListChecks, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TemplatesList } from './TemplatesList'
import { CustomTasksTab } from './CustomTasksTab'
import { ChecklistTab } from './ChecklistTab'
import type { ChecklistItem, TaskCategory, TaskPriority } from '@/lib/types/template.types'
import type { JobCardTemplate } from '@/lib/types/template.types'

type SubTabValue = 'templates' | 'checklist' | 'custom'

interface TabTasksProps {
  checklistItems: ChecklistItem[]
  currentChecklistItem: ChecklistItem
  setCurrentChecklistItem: (item: ChecklistItem) => void
  onAddItem: (item: ChecklistItem) => void
  onRemoveItem: (id: string) => void
  onAddTemplateItem: (item: ChecklistItem) => void
  onPreviousTab: () => void
  onNextTab: () => void
  isLoading: boolean
  garageId?: string
  customerReportIssues?: string[]
  workRequestedItems?: string[]
  technicalDiagnosisItems?: string[]
}

export function TabTasks({
  checklistItems,
  currentChecklistItem,
  setCurrentChecklistItem,
  onAddItem,
  onRemoveItem,
  onAddTemplateItem,
  onPreviousTab,
  onNextTab,
  isLoading,
  garageId,
  customerReportIssues = [],
  workRequestedItems = [],
  technicalDiagnosisItems = [],
}: TabTasksProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabValue>('templates')
  const [successNotification, setSuccessNotification] = useState<{ message: string; templateName: string } | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  // Handle adding template to checklist
  const handleAddTemplateToChecklist = (
    template: JobCardTemplate,
    links: {
      customerIssues: number[]
      serviceScope: number[]
      technicalDiagnosis: number[]
    }
  ) => {
    // Convert template to checklist item
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      itemName: template.name,
      description: template.description || '',
      category: template.category,
      priority: template.priority,
      estimatedMinutes: template.estimated_minutes || 0,
      laborRate: template.labor_rate || 0, // Ensure laborRate is never undefined
      displayOrder: checklistItems.length + 1,
      subtasks: template.subtasks?.map(st => ({
        id: st.id,
        name: st.name,
        description: st.description || '',
        estimatedMinutes: st.estimated_minutes || 0,
        completed: false,
        displayOrder: st.display_order || 0,
      })) || [],
      linkedToCustomerIssues: links.customerIssues,
      linkedToServiceScope: links.serviceScope,
      linkedToTechnicalDiagnosis: links.technicalDiagnosis,
    }

    onAddTemplateItem(newItem)

    // Show success notification
    setSuccessNotification({
      message: 'Task added successfully!',
      templateName: template.name
    })

    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    // Auto-hide notification after 3 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setSuccessNotification(null)
    }, 3000)
  }

  // If no garage ID yet, show message
  if (!garageId) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h2>
          <p className="text-gray-600">
            Add tasks from templates or create custom tasks for this job card
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Loading garage information...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Success Notification */}
      <AnimatePresence>
        {successNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <div className="bg-green-50 border-2 border-green-500 rounded-xl shadow-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">
                  {successNotification.message}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  "{successNotification.templateName}" has been added to your checklist
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h2>
        <p className="text-gray-600">
          Add tasks from templates, create custom tasks, or view your checklist
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="border-b-2 border-gray-200">
        <nav className="flex gap-1 -mb-0.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeSubTab === 'templates'
                ? 'border-graphite-700 text-graphite-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <ClipboardCheck className="h-4 w-4" />
            Templates
            {checklistItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-graphite-100 text-graphite-700 rounded-full text-xs font-semibold">
                {checklistItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('custom')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeSubTab === 'custom'
                ? 'border-graphite-700 text-graphite-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <Plus className="h-4 w-4" />
            Custom Tasks
          </button>
          <button
            onClick={() => setActiveSubTab('checklist')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeSubTab === 'checklist'
                ? 'border-graphite-700 text-graphite-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <ListChecks className="h-4 w-4" />
            Checklist
            {checklistItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-graphite-100 text-graphite-700 rounded-full text-xs font-semibold">
                {checklistItems.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Sub-Tab Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TemplatesList
              garageId={garageId}
              onAddToChecklist={handleAddTemplateToChecklist}
              checklistItemsCount={checklistItems.length}
              customerReportIssues={customerReportIssues}
              workRequestedItems={workRequestedItems}
              technicalDiagnosisItems={technicalDiagnosisItems}
            />
          </motion.div>
        )}

        {activeSubTab === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CustomTasksTab
              checklistItems={checklistItems}
              currentChecklistItem={currentChecklistItem}
              setCurrentChecklistItem={setCurrentChecklistItem}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
              customerReportIssues={customerReportIssues}
              workRequestedItems={workRequestedItems}
              technicalDiagnosisItems={technicalDiagnosisItems}
              garageId={garageId}
            />
          </motion.div>
        )}

        {activeSubTab === 'checklist' && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ChecklistTab
              checklistItems={checklistItems}
              onRemoveItem={onRemoveItem}
              customerReportIssues={customerReportIssues}
              workRequestedItems={workRequestedItems}
              technicalDiagnosisItems={technicalDiagnosisItems}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPreviousTab}
          className={cn(
            'flex items-center gap-2 px-6 py-3',
            'bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl',
            'hover:bg-gray-50 hover:border-gray-400',
            'transition-all'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="text-sm text-gray-600">
          {checklistItems.length} task{checklistItems.length !== 1 ? 's' : ''} added
        </div>

        <button
          onClick={onNextTab}
          className={cn(
            'flex items-center gap-2 px-6 py-3',
            'bg-graphite-900 text-white font-semibold rounded-xl',
            'hover:bg-graphite-800',
            'transition-all',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
