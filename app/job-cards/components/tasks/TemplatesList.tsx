// ============================================================================
// Component: TemplatesList (Enhanced with Smart Recommendations)
// Description: Lists and filters job card templates with search and AI recommendations
// ============================================================================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search, Filter, ChevronDown, Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TemplateCard } from './TemplateCard'
import { TemplateConnectionModal } from './TemplateConnectionModal'
import { getTemplateRecommendations, recordSearchQuery, recordTemplateUsage } from '@/lib/utils/template-recommendation'
import type { JobCardTemplate, TaskCategory } from '@/lib/types/template.types'
import type { TemplateRecommendation } from '@/lib/types/template-recommendation.types'

interface TemplatesListProps {
  garageId: string
  onAddToChecklist: (template: JobCardTemplate, links: {
    customerIssues: number[]
    serviceScope: number[]
    technicalDiagnosis: number[]
  }) => void
  checklistItemsCount?: number
  customerReportIssues?: string[]
  workRequestedItems?: string[]
  technicalDiagnosisItems?: string[]
  className?: string
}

const CATEGORIES: TaskCategory[] = ['Engine', 'Electrical', 'Body', 'Maintenance', 'Diagnostic', 'Custom']

export function TemplatesList({
  garageId,
  onAddToChecklist,
  checklistItemsCount = 0,
  customerReportIssues = [],
  workRequestedItems = [],
  technicalDiagnosisItems = [],
  className,
}: TemplatesListProps) {
  const [templates, setTemplates] = useState<JobCardTemplate[]>([])
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [allTemplatesCollapsed, setAllTemplatesCollapsed] = useState(true) // START COLLAPSED

  // Pagination for search results
  const [searchPage, setSearchPage] = useState(1)
  const RESULTS_PER_PAGE = 5

  // Modal state
  const [connectionModalOpen, setConnectionModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<JobCardTemplate | null>(null)

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

        const fetchedTemplates = data.templates || []
        setTemplates(fetchedTemplates)

        // Generate recommendations when we have templates and no category filter and no search
        if (selectedCategory === 'All' && !searchQuery.trim()) {
          const recs = getTemplateRecommendations(fetchedTemplates)
          setRecommendations(recs)
        } else {
          setRecommendations([])
        }

        // Record search query for learning
        if (searchQuery.trim()) {
          const matchedIds = fetchedTemplates.map((t: JobCardTemplate) => t.id)
          recordSearchQuery(searchQuery, matchedIds)
        }

        // Reset search page when query changes
        setSearchPage(1)

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

  // Handle template card click - open modal
  const handleTemplateClick = (template: JobCardTemplate) => {
    setSelectedTemplate(template)
    setConnectionModalOpen(true)
  }

  // Handle confirm add with links
  const handleConfirmAdd = (links: {
    customerIssues: number[]
    serviceScope: number[]
    technicalDiagnosis: number[]
  }) => {
    if (selectedTemplate) {
      // Record the usage
      recordTemplateUsage(selectedTemplate.id, selectedTemplate.category)
      // Add to checklist with links
      onAddToChecklist(selectedTemplate, links)
    }
  }

  // Filter templates based on search query (additional client-side filtering)
  const filteredTemplates = templates.filter(template => {
    // Exclude recommended templates from the main list ONLY when viewing all categories with no search
    if (selectedCategory === 'All' && !searchQuery.trim()) {
      const isRecommended = recommendations.some(r => r.template.id === template.id)
      if (isRecommended) return false
    }

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

  const hasRecommendations = recommendations.length > 0 && selectedCategory === 'All' && !searchQuery.trim()

  // SEARCH RESULTS with pagination
  const isSearching = searchQuery.trim().length > 0 || selectedCategory !== 'All'
  const searchResultsCount = filteredTemplates.length
  const totalPages = Math.ceil(searchResultsCount / RESULTS_PER_PAGE)
  const paginatedResults = filteredTemplates.slice(
    (searchPage - 1) * RESULTS_PER_PAGE,
    searchPage * RESULTS_PER_PAGE
  )

  return (
    <div className={cn('space-y-6', className)}>
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
      {!loading && !error && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-sm text-gray-600 max-w-sm">
            Create your first template to get started
          </p>
        </div>
      )}

      {/* SEARCH RESULTS SECTION - Shows when searching or filtering by category */}
      {!loading && !error && isSearching && filteredTemplates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-graphite-800 flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-graphite-900">
                  {searchQuery.trim() ? `Search Results for "${searchQuery}"` : `${selectedCategory} Templates`}
                </h3>
                <p className="text-sm text-gray-600">
                  Found {searchResultsCount} template{searchResultsCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedResults.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onAddToChecklist={handleTemplateClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {(searchPage - 1) * RESULTS_PER_PAGE + 1} - {Math.min(searchPage * RESULTS_PER_PAGE, searchResultsCount)} of {searchResultsCount}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchPage(p => Math.max(1, p - 1))}
                  disabled={searchPage === 1}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all',
                    'bg-white border-2 border-gray-300 text-gray-700',
                    'hover:bg-gray-50 hover:border-gray-400',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setSearchPage(page)}
                      className={cn(
                        'w-10 h-10 rounded-lg font-medium transition-all',
                        searchPage === page
                          ? 'bg-graphite-900 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSearchPage(p => Math.min(totalPages, p + 1))}
                  disabled={searchPage === totalPages}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all',
                    'bg-white border-2 border-gray-300 text-gray-700',
                    'hover:bg-gray-50 hover:border-gray-400',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* SEARCH EMPTY STATE */}
      {!loading && !error && isSearching && filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Package className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-sm text-gray-600 max-w-sm">
            {searchQuery.trim()
              ? `No templates match "${searchQuery}"`
              : `No templates found in ${selectedCategory} category`
            }
          </p>
        </motion.div>
      )}

      {/* Recommended Section - Brand Compliant Colors */}
      {!loading && !error && hasRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-graphite-900" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-graphite-900">Recommended for You</h3>
                <p className="text-sm text-graphite-600">
                  Smart picks based on your usage patterns
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <TemplateCard
                key={rec.template.id}
                template={rec.template}
                onAddToChecklist={handleTemplateClick}
                isRecommended={true}
                recommendationReasons={rec.reasons}
                recommendationScore={rec.score}
                recommendationRank={rec.rank}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Templates Section - Collapsible with Graphite/White Theme */}
      {!loading && !error && !isSearching && filteredTemplates.length > 0 && (
        <div className="space-y-4">
          {/* Collapsible Section Header */}
          {hasRecommendations && (
            <button
              onClick={() => setAllTemplatesCollapsed(!allTemplatesCollapsed)}
              className="w-full flex items-center justify-between p-4 bg-graphite-50 hover:bg-graphite-100 rounded-xl transition-all group border-2 border-graphite-200"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-graphite-800 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-graphite-900">All Templates</h3>
                  <p className="text-sm text-gray-600">
                    Browse and search all available templates
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: allTemplatesCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronLeft className="h-6 w-6 text-graphite-700" />
              </motion.div>
            </button>
          )}

          {/* Collapsible Content */}
          <AnimatePresence>
            {!allTemplatesCollapsed && (
              <motion.div
                initial={hasRecommendations ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={hasRecommendations ? 'overflow-hidden' : ''}
              >
                <div className="space-y-6">
                  {/* Templates by Category */}
                  {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                    <div key={category}>
                      {/* Category Header */}
                      <h3 className="text-base font-bold text-graphite-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-graphite-700 rounded-full" />
                        {category} <span className="text-sm font-normal text-gray-600">({categoryTemplates.length})</span>
                      </h3>

                      {/* Templates Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onAddToChecklist={handleTemplateClick}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Connection Modal */}
      <TemplateConnectionModal
        template={selectedTemplate}
        isOpen={connectionModalOpen}
        onClose={() => {
          setConnectionModalOpen(false)
          setSelectedTemplate(null)
        }}
        onConfirm={handleConfirmAdd}
        customerReportIssues={customerReportIssues}
        workRequestedItems={workRequestedItems}
        technicalDiagnosisItems={technicalDiagnosisItems}
      />
    </div>
  )
}
