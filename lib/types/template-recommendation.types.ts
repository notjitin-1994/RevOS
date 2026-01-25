/**
 * Template Recommendation System Type Definitions
 *
 * Smart template recommendation algorithm with usage tracking,
 * scoring, and learning capabilities
 */

import type { JobCardTemplate } from './template.types'

/**
 * Local storage structure for template usage tracking
 */
export interface TemplateUsageData {
  template_usage: Record<string, TemplateUsageEntry>
  search_history: SearchHistoryEntry[]
  last_synced: string // ISO timestamp
}

/**
 * Individual template usage entry
 */
export interface TemplateUsageEntry {
  useCount: number
  lastUsed: string // ISO timestamp
  searchMatches: number // How often this template matched search queries
  categories: string[] // Categories used with this template
}

/**
 * Search history entry
 */
export interface SearchHistoryEntry {
  query: string
  timestamp: string // ISO timestamp
  matchedTemplateIds: string[] // Templates that matched this search
}

/**
 * Template score for recommendation
 */
export interface TemplateScore {
  templateId: string
  score: number // Composite score from multiple factors
  lastUsed: Date
  useCount: number
  searchMatches: number
  recencyBonus: number // Bonus for recent usage
  categoryAffinity: number // Bonus based on category preferences
}

/**
 * Recommendation configuration
 */
export interface RecommendationConfig {
  maxRecommendations: number // Top N to show
  recencyDecayDays: number // Days before usage becomes "old"
  recencyWeight: number // Weight for recency in scoring (0-1)
  frequencyWeight: number // Weight for use count in scoring (0-1)
  searchWeight: number // Weight for search matches in scoring (0-1)
  categoryAffinityWeight: number // Weight for category preferences (0-1)
}

/**
 * Recommendation result
 */
export interface TemplateRecommendation {
  template: JobCardTemplate
  score: number
  reasons: string[] // Human-readable reasons for recommendation
  rank: number
}

/**
 * Category usage statistics
 */
export interface CategoryUsageStats {
  category: string
  useCount: number
  lastUsed: Date
  averageScore: number
}

/**
 * Template performance metrics
 */
export interface TemplatePerformanceMetrics {
  totalUsage: number
  uniqueUsers: number
  averageRating: number
  completionRate: number
  lastUsed: Date
}
