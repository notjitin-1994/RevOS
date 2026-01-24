// ============================================================================
// Component: TemplatesList
// Description: Lists and filters job card templates with search
// ============================================================================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search, Filter, ChevronDown, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TemplateCard } from './TemplateCard'
import type { JobCardTemplate, TaskCategory } from '@/lib/types/template.types'

interface TemplatesListProps {
  garageId: string
  onAddToChecklist: (template: JobCardTemplate) => void
  className?: string
}

const CATEGORIES: TaskCategory[] = ['Engine', 'Electrical', 'Body', 'Maintenance', 'Diagnostic', 'Custom']

export function TemplatesList({ garageId, onAddToChecklist, className }: TemplatesListProps) {
  const [templates, setTemplates] = useState<JobCardTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          garageId,
        })

        // Add category filter if selected
        if (selectedCategory !== 'All') {
          params.append('category', selectedCategory)
        }

        // Add search query if provided
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }

        const response = await fetch(`/api/job-card-templates?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch templates')
        }

        setTemplates(data.templates || [])

      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        setError(message)
        console.error('Error fetching templates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [garageId, selectedCategory, searchQuery])

  // Filter templates based on search query (additional client-side filtering)
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query) ||
      (template.description && template.description.toLowerCase().includes(query)) ||
      template.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<TaskCategory, JobCardTemplate[]>)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, description, or tags..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5',
              'bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-graphite-700 focus:border-transparent',
              'transition-all'
            )}
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 min-w-[180px]',
              'bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium',
              'hover:border-graphite-700 focus:outline-none focus:ring-2 focus:ring-graphite-700',
              'transition-all'
            )}
          >
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="truncate">
              {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600 ml-auto shrink-0" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showCategoryFilter && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryFilter(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="py-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCategory('All')
                        setShowCategoryFilter(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors',
                        selectedCategory === 'All' && 'bg-graphite-50 text-graphite-700 font-semibold'
                      )}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category)
                          setShowCategoryFilter(false)
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors',
                          selectedCategory === category && 'bg-graphite-50 text-graphite-700 font-semibold'
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-graphite-700 mb-3" />
          <p className="text-sm text-gray-600">Loading templates...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-status-error/10 border border-status-error/30 rounded-xl">
          <p className="text-status-error text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-sm text-gray-600 max-w-sm">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your filters or search query'
              : 'Create your first template to get started'}
          </p>
        </div>
      )}

      {/* Templates by Category */}
      {!loading && !error && Object.keys(groupedTemplates).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              {/* Category Header */}
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-graphite-700 rounded-full" />
                {category} <span className="text-sm font-normal text-gray-500">({categoryTemplates.length})</span>
              </h3>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onAddToChecklist={onAddToChecklist}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result Count */}
      {!loading && !error && filteredTemplates.length > 0 && (
        <div className="text-sm text-gray-600 text-center pt-2">
          Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
