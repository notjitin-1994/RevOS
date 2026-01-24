// ============================================================================
// Component: TabTasks (Enhanced with Templates)
// Description: Tasks tab with Templates and Custom Tasks sub-tabs
// ============================================================================

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ClipboardCheck, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TemplatesList } from './TemplatesList'
import { CustomTasksTab } from './CustomTasksTab'
import type { ChecklistItem, TaskCategory, TaskPriority } from '@/lib/types/template.types'
import type { JobCardTemplate } from '@/lib/types/template.types'

type SubTabValue = 'templates' | 'custom'

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

  // Handle adding template to checklist
  const handleAddTemplateToChecklist = (template: JobCardTemplate) => {
    // Convert template to checklist item
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      itemName: template.name,
      description: template.description || '',
      category: template.category,
      priority: template.priority,
      estimatedMinutes: template.estimated_minutes,
      laborRate: template.labor_rate,
      displayOrder: checklistItems.length + 1,
      subtasks: template.subtasks?.map(st => ({
        id: st.id,
        name: st.name,
        description: st.description || '',
        estimatedMinutes: st.estimated_minutes,
        completed: false,
        displayOrder: st.display_order,
      })) || [],
      linkedToCustomerIssues: [],
      linkedToServiceScope: [],
      linkedToTechnicalDiagnosis: [],
    }

    onAddTemplateItem(newItem)
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h2>
        <p className="text-gray-600">
          Add tasks from templates or create custom tasks for this job card
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="border-b-2 border-gray-200">
        <nav className="flex gap-6 -mb-0.5">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={cn(
              'flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors',
              activeSubTab === 'templates'
                ? 'border-graphite-700 text-graphite-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <ClipboardCheck className="h-4 w-4" />
            Templates
          </button>
          <button
            onClick={() => setActiveSubTab('custom')}
            className={cn(
              'flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors',
              activeSubTab === 'custom'
                ? 'border-graphite-700 text-graphite-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <Plus className="h-4 w-4" />
            Custom Tasks
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
