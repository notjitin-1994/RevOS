'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  Trash2,
  Edit,
  Clock,
  IndianRupee,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Link as LinkIcon,
  Check,
  X,
  Search,
  Filter,
  CheckSquare,
  Square,
  Folder,
  Tag,
  Layers,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '../shared/PriorityBadge'
import type { ChecklistItem } from '@/lib/types/template.types'

interface ChecklistTabProps {
  checklistItems: ChecklistItem[]
  onRemoveItem: (id: string) => void
  onEditItem?: (item: ChecklistItem) => void
  onUpdateSubtask?: (taskId: string, subtaskId: string, completed: boolean) => void
  customerReportIssues?: string[]
  workRequestedItems?: string[]
  technicalDiagnosisItems?: string[]
}

type FilterType = 'all' | 'incomplete' | 'linked' | 'subtasks'

export function ChecklistTab({
  checklistItems,
  onRemoveItem,
  onEditItem,
  onUpdateSubtask,
  customerReportIssues = [],
  workRequestedItems = [],
  technicalDiagnosisItems = [],
}: ChecklistTabProps) {
  // State management
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expandedChecklistTasks')
    if (saved) {
      try {
        setExpandedTasks(new Set(JSON.parse(saved)))
      } catch (error) {
        console.error('Failed to parse expanded tasks:', error)
      }
    }
  }, [])

  // Persist expanded state to localStorage
  useEffect(() => {
    if (expandedTasks.size > 0) {
      localStorage.setItem('expandedChecklistTasks', JSON.stringify([...expandedTasks]))
    }
  }, [expandedTasks])

  // Toggle task expansion
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // Expand/Collapse all tasks
  const expandAll = () => {
    setExpandedTasks(new Set(checklistItems.map(item => item.id)))
  }

  const collapseAll = () => {
    setExpandedTasks(new Set())
  }

  // Get linked items for a task (defined before use in useMemo)
  const getLinkedItems = (item: ChecklistItem) => {
    const linked: Array<{
      type: 'Issue' | 'Service' | 'Diagnosis'
      text: string
    }> = []

    item.linkedToCustomerIssues?.forEach(index => {
      if (customerReportIssues[index]) {
        linked.push({
          type: 'Issue',
          text: customerReportIssues[index],
        })
      }
    })

    item.linkedToServiceScope?.forEach(index => {
      if (workRequestedItems[index]) {
        linked.push({
          type: 'Service',
          text: workRequestedItems[index],
        })
      }
    })

    item.linkedToTechnicalDiagnosis?.forEach(index => {
      if (technicalDiagnosisItems[index]) {
        linked.push({
          type: 'Diagnosis',
          text: technicalDiagnosisItems[index],
        })
      }
    })

    return linked
  }

  // Filter and search tasks
  const filteredItems = useMemo(() => {
    return checklistItems.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          item.itemName.toLowerCase().includes(query) ||
          (item.description?.toLowerCase().includes(query) ?? false) ||
          (item.category?.toLowerCase().includes(query) ?? false)
        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false
      }

      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
        return false
      }

      // Status filter
      switch (filter) {
        case 'incomplete':
          const hasIncompleteSubtasks = item.subtasks?.some(st => !st.completed) ?? true
          return hasIncompleteSubtasks
        case 'linked':
          return (
            (item.linkedToCustomerIssues?.length ?? 0) > 0 ||
            (item.linkedToServiceScope?.length ?? 0) > 0 ||
            (item.linkedToTechnicalDiagnosis?.length ?? 0) > 0
          )
        case 'subtasks':
          return (item.subtasks?.length ?? 0) > 0
        default:
          return true
      }
    })
  }, [checklistItems, filter, searchQuery, categoryFilter, priorityFilter])

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // Select all / deselect all
  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredItems.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredItems.map(item => item.id)))
    }
  }

  // Bulk remove
  const bulkRemove = () => {
    if (confirm(`Are you sure you want to remove ${selectedTasks.size} task(s)?`)) {
      selectedTasks.forEach(id => onRemoveItem(id))
      setSelectedTasks(new Set())
    }
  }

  // Calculate totals
  const totals = useMemo(() => {
    const totalMinutes = checklistItems.reduce((sum, item) => sum + item.estimatedMinutes, 0)
    const totalHours = (totalMinutes / 60).toFixed(1)
    const totalCost = checklistItems.reduce(
      (sum, item) => sum + (item.estimatedMinutes / 60) * item.laborRate,
      0
    )
    const formattedCost = totalCost.toFixed(2)

    // Subtask statistics
    const totalSubtasks = checklistItems.reduce(
      (sum, item) => sum + (item.subtasks?.length ?? 0),
      0
    )
    const completedSubtasks = checklistItems.reduce(
      (sum, item) => sum + (item.subtasks?.filter(st => st.completed).length ?? 0),
      0
    )
    const pendingSubtasks = totalSubtasks - completedSubtasks

    // Linked tasks count
    const linkedTasks = checklistItems.filter(item => {
      const links = getLinkedItems(item)
      return links.length > 0
    }).length

    // Overall progress
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

    return {
      totalTasks: checklistItems.length,
      totalHours,
      totalMinutes,
      formattedCost,
      totalSubtasks,
      completedSubtasks,
      pendingSubtasks,
      linkedTasks,
      progress,
    }
  }, [checklistItems])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(checklistItems.map(item => item.category).filter(Boolean))
    return ['all', ...Array.from(cats)] as string[]
  }, [checklistItems])

  // Handle subtask toggle
  const handleSubtaskToggle = (taskId: string, subtaskId: string, completed: boolean) => {
    if (onUpdateSubtask) {
      onUpdateSubtask(taskId, subtaskId, completed)
    }
  }

  // Calculate task progress
  const getTaskProgress = (item: ChecklistItem) => {
    if (!item.subtasks || item.subtasks.length === 0) return 0
    const completed = item.subtasks.filter(st => st.completed).length
    return (completed / item.subtasks.length) * 100
  }

  if (checklistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="h-10 w-10 text-graphite-400" />
          </div>
          <h3 className="text-xl font-semibold text-graphite-900 mb-2">
            No Tasks Added Yet
          </h3>
          <p className="text-graphite-600 max-w-md mx-auto">
            Add tasks from templates or create custom tasks to build your job card checklist.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-graphite-700">Total Tasks</p>
              <p className="text-3xl font-bold text-graphite-900 mt-1">{totals.totalTasks}</p>
              <p className="text-xs text-graphite-600 mt-1">{totals.linkedTasks} linked</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-graphite-800" />
            </div>
          </div>
        </motion.div>

        {/* Total Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-graphite-700">Total Time</p>
              <p className="text-3xl font-bold text-graphite-900 mt-1">{totals.totalHours}h</p>
              <p className="text-xs text-graphite-600 mt-1">{totals.totalMinutes} minutes</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Clock className="h-6 w-6 text-graphite-800" />
            </div>
          </div>
        </motion.div>

        {/* Est. Cost */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-graphite-700">Est. Cost</p>
              <p className="text-3xl font-bold text-graphite-900 mt-1">₹{totals.formattedCost}</p>
              <p className="text-xs text-graphite-600 mt-1">Labor only</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-graphite-800" />
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-graphite-700">Progress</p>
              <p className="text-2xl font-bold text-graphite-900 mt-1">{totals.progress.toFixed(0)}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Check className="h-6 w-6 text-graphite-800" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-graphite-600">
              <span>Subtasks</span>
              <span>{totals.completedSubtasks}/{totals.totalSubtasks}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totals.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="h-full bg-brand rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search, Filters, and Bulk Actions */}
      <div className="space-y-4">
        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400" />
            <input
              type="text"
              placeholder="Search tasks by name, description, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-graphite-400" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as FilterType)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Tasks</option>
              <option value="incomplete">Only Incomplete</option>
              <option value="linked">Only Linked</option>
              <option value="subtasks">With Subtasks</option>
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Select All Checkbox */}
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-3 py-2 text-sm text-graphite-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {selectedTasks.size === filteredItems.length && filteredItems.length > 0 ? (
              <CheckSquare className="h-4 w-4 text-brand" />
            ) : (
              <Square className="h-4 w-4 text-graphite-600" />
            )}
            <span>{selectedTasks.size === filteredItems.length ? 'Deselect All' : 'Select All'}</span>
          </button>

          {/* Collapse/Expand All */}
          <div className="h-6 w-px bg-gray-300" />
          <button
            onClick={expandAll}
            className="flex items-center gap-2 px-3 py-2 text-sm text-graphite-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Layers className="h-4 w-4" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-2 px-3 py-2 text-sm text-graphite-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Layers className="h-4 w-4 rotate-180" />
            Collapse All
          </button>

          {/* Bulk Actions */}
          {selectedTasks.size > 0 && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-sm text-graphite-600">{selectedTasks.size} selected</span>
              <button
                onClick={bulkRemove}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Remove Selected
              </button>
            </>
          )}

          {/* Clear Filters */}
          {(filter !== 'all' || searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all') && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <button
                onClick={() => {
                  setFilter('all')
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setPriorityFilter('all')
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-graphite-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </>
          )}

          <div className="flex-1" />
          <span className="text-sm text-graphite-600">
            Showing {filteredItems.length} of {checklistItems.length} tasks
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const linkedItems = getLinkedItems(item)
            const hasLinks = linkedItems.length > 0
            const isExpanded = expandedTasks.has(item.id)
            const isSelected = selectedTasks.has(item.id)
            const progress = getTaskProgress(item)
            const hasSubtasks = (item.subtasks?.length ?? 0) > 0

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn(
                  'group bg-white rounded-xl border-2 transition-all duration-200',
                  'hover:border-graphite-300 hover:shadow-md',
                  isSelected ? 'border-brand ring-2 ring-brand/20' : 'border-gray-200',
                  !hasLinks && 'border-l-4 border-l-amber-400'
                )}
              >
                {/* Collapsed State - Click to Expand */}
                <div
                  onClick={() => toggleTaskExpanded(item.id)}
                  className="p-4 cursor-pointer"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleTaskExpanded(item.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-3">
                    {/* Select Checkbox */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleTaskSelection(item.id)
                      }}
                      className="mt-1 flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-brand" />
                      ) : (
                        <Square className="h-5 w-5 text-graphite-400 hover:text-graphite-600 transition-colors" />
                      )}
                    </button>

                    {/* Drag Handle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <GripVertical className="h-5 w-5 text-graphite-400 cursor-move hover:text-graphite-600 transition-colors" />
                      <span className="text-sm font-mono text-graphite-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Header Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Task Name (Truncated) */}
                            <h4 className="font-semibold text-graphite-900 group-hover:text-graphite-700 transition-colors">
                              {item.itemName.length > 40 ? `${item.itemName.substring(0, 40)}...` : item.itemName}
                            </h4>

                            {/* Category Badge */}
                            {item.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-graphite-700 border border-gray-200">
                                <Wrench className="h-3 w-3 mr-1" />
                                {item.category}
                              </span>
                            )}

                            {/* Expand Icon */}
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-graphite-600"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.div>
                          </div>

                          {/* Quick Stats Row */}
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {/* Priority Badge */}
                            <PriorityBadge priority={item.priority} size="sm" />

                            {/* Time */}
                            <span className="inline-flex items-center gap-1 text-xs text-graphite-600">
                              <Clock className="h-3 w-3" />
                              {item.estimatedMinutes}m
                            </span>

                            {/* Cost */}
                            <span className="inline-flex items-center gap-1 text-xs text-graphite-600">
                              <IndianRupee className="h-3 w-3" />
                              {((item.estimatedMinutes / 60) * item.laborRate).toFixed(0)}
                            </span>

                            {/* Subtasks Count */}
                            {hasSubtasks && (
                              <span className="inline-flex items-center gap-1 text-xs text-graphite-600">
                                <Check className="h-3 w-3" />
                                {item.subtasks?.length} subtasks
                              </span>
                            )}

                            {/* Link Status */}
                            {hasLinks ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                <LinkIcon className="h-3 w-3" />
                                {linkedItems.length} linked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                <AlertCircle className="h-3 w-3" />
                                Not linked
                              </span>
                            )}

                            {/* Progress Bar (if subtasks) */}
                            {hasSubtasks && progress > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full bg-brand rounded-full"
                                  />
                                </div>
                                <span className="text-xs text-graphite-600">{progress.toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditItem && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                onEditItem(item)
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 text-graphite-600 hover:text-graphite-900 transition-colors"
                              title="Edit task"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (confirm(`Remove task "${item.itemName}"?`)) {
                                onRemoveItem(item.id)
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-graphite-600 hover:text-red-600 transition-colors"
                            title="Remove task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded State */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 mt-2">
                        <div className="space-y-4">
                          {/* Full Description */}
                          {item.description && (
                            <div>
                              <p className="text-sm text-graphite-700">{item.description}</p>
                            </div>
                          )}

                          {/* Complete Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Category */}
                            <div>
                              <p className="text-xs text-graphite-600 mb-1">Category</p>
                              <div className="flex items-center gap-1.5">
                                <Wrench className="h-4 w-4 text-graphite-500" />
                                <span className="text-sm font-medium text-graphite-900">
                                  {item.category || 'None'}
                                </span>
                              </div>
                            </div>

                            {/* Priority */}
                            <div>
                              <p className="text-xs text-graphite-600 mb-1">Priority</p>
                              <PriorityBadge priority={item.priority} size="sm" />
                            </div>

                            {/* Labor Rate */}
                            <div>
                              <p className="text-xs text-graphite-600 mb-1">Labor Rate</p>
                              <div className="flex items-center gap-1.5">
                                <IndianRupee className="h-4 w-4 text-graphite-500" />
                                <span className="text-sm font-medium text-graphite-900">
                                  {item.laborRate}/hr
                                </span>
                              </div>
                            </div>

                            {/* Estimated Time */}
                            <div>
                              <p className="text-xs text-graphite-600 mb-1">Estimated Time</p>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-graphite-500" />
                                <span className="text-sm font-medium text-graphite-900">
                                  {item.estimatedMinutes} minutes
                                  <span className="text-graphite-600 font-normal">
                                    ({(item.estimatedMinutes / 60).toFixed(1)}h)
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cost Calculation */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-graphite-700">Estimated Cost</span>
                              <div className="flex items-center gap-1.5">
                                <IndianRupee className="h-4 w-4 text-graphite-700" />
                                <span className="text-lg font-semibold text-graphite-900">
                                  {((item.estimatedMinutes / 60) * item.laborRate).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-graphite-600 mt-1">
                              {item.estimatedMinutes} min × ₹{item.laborRate}/hr
                            </p>
                          </div>

                          {/* Subtasks Section */}
                          {hasSubtasks && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-semibold text-graphite-900 flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Subtasks ({item.subtasks!.length})
                                </h5>
                                <span className="text-xs text-graphite-600">
                                  {item.subtasks!.filter(st => st.completed).length} / {item.subtasks!.length} completed
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-brand rounded-full"
                                  />
                                </div>
                                <p className="text-xs text-graphite-600 mt-1">{progress.toFixed(0)}% complete</p>
                              </div>

                              {/* Subtasks List */}
                              <div className="space-y-2">
                                {item.subtasks!.map(subtask => (
                                  <div
                                    key={subtask.id}
                                    className={cn(
                                      'flex items-start gap-3 p-3 rounded-lg border transition-all',
                                      subtask.completed
                                        ? 'bg-gray-50 border-gray-200 opacity-60'
                                        : 'bg-white border-gray-300 hover:border-graphite-400'
                                    )}
                                  >
                                    {/* Checkbox */}
                                    <button
                                      onClick={() =>
                                        handleSubtaskToggle(item.id, subtask.id, !subtask.completed)
                                      }
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {subtask.completed ? (
                                        <CheckSquare className="h-5 w-5 text-brand" />
                                      ) : (
                                        <Square className="h-5 w-5 text-graphite-400 hover:text-graphite-600 transition-colors" />
                                      )}
                                    </button>

                                    {/* Subtask Details */}
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={cn(
                                          'text-sm font-medium text-graphite-900',
                                          subtask.completed && 'line-through text-graphite-600'
                                        )}
                                      >
                                        {subtask.name}
                                      </p>
                                      {subtask.description && (
                                        <p
                                          className={cn(
                                            'text-xs text-graphite-600 mt-0.5',
                                            subtask.completed && 'line-through'
                                          )}
                                        >
                                          {subtask.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1 text-xs text-graphite-600">
                                          <Clock className="h-3 w-3" />
                                          {subtask.estimatedMinutes}m
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Linked Items Section */}
                          {hasLinks ? (
                            <div>
                              <h5 className="text-sm font-semibold text-graphite-900 flex items-center gap-2 mb-2">
                                <LinkIcon className="h-4 w-4" />
                                Linked Items ({linkedItems.length})
                              </h5>
                              <div className="space-y-2">
                                {linkedItems.map((link, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex-shrink-0 mt-0.5">
                                      {link.type === 'Issue' && <AlertCircle className="h-4 w-4 text-amber-600" />}
                                      {link.type === 'Service' && <Wrench className="h-4 w-4 text-blue-600" />}
                                      {link.type === 'Diagnosis' && <Check className="h-4 w-4 text-green-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className={cn(
                                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                            link.type === 'Issue' && 'bg-amber-100 text-amber-700',
                                            link.type === 'Service' && 'bg-blue-100 text-blue-700',
                                            link.type === 'Diagnosis' && 'bg-green-100 text-green-700'
                                          )}
                                        >
                                          {link.type}
                                        </span>
                                      </div>
                                      <p className="text-sm text-graphite-700">{link.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-900">
                                  This task is not linked
                                </p>
                                <p className="text-xs text-amber-800 mt-1">
                                  Please link this task to at least one customer issue, service scope item, or
                                  diagnosis item before proceeding.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* No Results */}
        {filteredItems.length === 0 && checklistItems.length > 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-graphite-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-graphite-900 mb-1">No tasks found</h3>
            <p className="text-sm text-graphite-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {checklistItems.some(item => getLinkedItems(item).length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Some tasks are not linked</p>
              <p className="text-sm text-amber-800 mt-1">
                {checklistItems.filter(item => getLinkedItems(item).length === 0).length} task(s) must be linked to
                at least one customer issue, service scope item, or diagnosis item before proceeding.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
