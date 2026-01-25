/**
 * Template Recommendation Algorithm
 *
 * Smart template recommendation system that learns from user behavior:
 * - Tracks template usage patterns
 * - Monitors search queries
 * - Calculates composite scores
 * - Provides personalized recommendations
 * - Syncs with backend usage_count
 */

import type {
  TemplateUsageData,
  TemplateUsageEntry,
  SearchHistoryEntry,
  TemplateScore,
  TemplateRecommendation,
  RecommendationConfig,
  CategoryUsageStats,
} from '../types/template-recommendation.types'
import type { JobCardTemplate, TaskCategory } from '../types/template.types'

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'revvos_template_usage'
const MAX_SEARCH_HISTORY = 100 // Keep last 100 searches
const DAYS_TO_MS = 24 * 60 * 60 * 1000

const DEFAULT_CONFIG: RecommendationConfig = {
  maxRecommendations: 4,
  recencyDecayDays: 30, // Usage from last 30 days is considered "recent"
  recencyWeight: 0.35, // 35% weight for recent usage
  frequencyWeight: 0.30, // 30% weight for total usage count
  searchWeight: 0.20, // 20% weight for search matches
  categoryAffinityWeight: 0.15, // 15% weight for category preferences
}

// ============================================================================
// LOCAL STORAGE MANAGEMENT
// ============================================================================

/**
 * Load usage data from localStorage
 */
export function loadUsageData(): TemplateUsageData {
  if (typeof window === 'undefined') {
    return {
      template_usage: {},
      search_history: [],
      last_synced: new Date().toISOString(),
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {
        template_usage: {},
        search_history: [],
        last_synced: new Date().toISOString(),
      }
    }

    const data = JSON.parse(stored) as TemplateUsageData

    // Validate structure
    if (!data.template_usage || !Array.isArray(data.search_history)) {
      console.warn('Invalid template usage data, resetting')
      return {
        template_usage: {},
        search_history: [],
        last_synced: new Date().toISOString(),
      }
    }

    return data
  } catch (error) {
    console.error('Error loading template usage data:', error)
    return {
      template_usage: {},
      search_history: [],
      last_synced: new Date().toISOString(),
    }
  }
}

/**
 * Save usage data to localStorage
 */
function saveUsageData(data: TemplateUsageData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving template usage data:', error)
  }
}

/**
 * Record template usage when user adds a template
 */
export function recordTemplateUsage(
  templateId: string,
  category: string
): void {
  const data = loadUsageData()

  const entry: TemplateUsageEntry = data.template_usage[templateId] || {
    useCount: 0,
    lastUsed: new Date().toISOString(),
    searchMatches: 0,
    categories: [],
  }

  entry.useCount += 1
  entry.lastUsed = new Date().toISOString()

  // Track category usage
  if (!entry.categories.includes(category)) {
    entry.categories.push(category)
  }

  data.template_usage[templateId] = entry
  data.last_synced = new Date().toISOString()

  saveUsageData(data)

  console.log(`📊 Recorded usage for template ${templateId}:`, {
    useCount: entry.useCount,
    category,
  })
}

/**
 * Record search query and matching templates
 */
export function recordSearchQuery(
  query: string,
  matchedTemplateIds: string[]
): void {
  if (!query.trim()) return

  const data = loadUsageData()

  // Add search to history
  const searchEntry: SearchHistoryEntry = {
    query: query.trim(),
    timestamp: new Date().toISOString(),
    matchedTemplateIds,
  }

  data.search_history.push(searchEntry)

  // Keep only recent searches
  if (data.search_history.length > MAX_SEARCH_HISTORY) {
    data.search_history = data.search_history.slice(-MAX_SEARCH_HISTORY)
  }

  // Update search match counts for templates
  matchedTemplateIds.forEach(templateId => {
    const entry = data.template_usage[templateId] || {
      useCount: 0,
      lastUsed: new Date().toISOString(),
      searchMatches: 0,
      categories: [],
    }
    entry.searchMatches += 1
    data.template_usage[templateId] = entry
  })

  data.last_synced = new Date().toISOString()
  saveUsageData(data)

  console.log(`🔍 Recorded search query: "${query}"`, {
    matches: matchedTemplateIds.length,
  })
}

/**
 * Get category usage statistics
 */
export function getCategoryUsageStats(): CategoryUsageStats[] {
  const data = loadUsageData()
  const categoryMap = new Map<string, CategoryUsageStats>()

  // Aggregate category data from all template usage
  Object.values(data.template_usage).forEach(entry => {
    entry.categories.forEach(category => {
      const existing = categoryMap.get(category)

      if (existing) {
        existing.useCount += entry.useCount
        if (new Date(entry.lastUsed) > existing.lastUsed) {
          existing.lastUsed = new Date(entry.lastUsed)
        }
      } else {
        categoryMap.set(category, {
          category,
          useCount: entry.useCount,
          lastUsed: new Date(entry.lastUsed),
          averageScore: 0,
        })
      }
    })
  })

  // Convert to array and calculate average scores
  const stats = Array.from(categoryMap.values())
  stats.forEach(stat => {
    stat.averageScore = stat.useCount / Math.max(1, data.search_history.length)
  })

  // Sort by usage count
  return stats.sort((a, b) => b.useCount - a.useCount)
}

// ============================================================================
// SCORING ALGORITHM
// ============================================================================

/**
 * Calculate recency score with exponential decay
 * Recent usage gets higher score
 */
function calculateRecencyScore(lastUsed: Date, config: RecommendationConfig): number {
  const now = new Date()
  const daysSinceLastUse = (now.getTime() - lastUsed.getTime()) / DAYS_TO_MS

  // Exponential decay: score = e^(-days / decay_period)
  const decayPeriod = config.recencyDecayDays
  const score = Math.exp(-daysSinceLastUse / decayPeriod)

  return Math.max(0, Math.min(1, score))
}

/**
 * Calculate frequency score (normalized usage count)
 */
function calculateFrequencyScore(useCount: number, maxCount: number): number {
  if (maxCount === 0) return 0

  // Logarithmic normalization to prevent extreme values
  const normalized = Math.log(useCount + 1) / Math.log(maxCount + 1)
  return Math.max(0, Math.min(1, normalized))
}

/**
 * Calculate search affinity score
 */
function calculateSearchScore(searchMatches: number, maxSearches: number): number {
  if (maxSearches === 0) return 0

  const normalized = searchMatches / maxSearches
  return Math.max(0, Math.min(1, normalized))
}

/**
 * Calculate category affinity score
 */
function calculateCategoryAffinityScore(
  templateCategory: string,
  categoryStats: CategoryUsageStats[]
): number {
  const categoryStat = categoryStats.find(s => s.category === templateCategory)

  if (!categoryStat) return 0

  // Score based on how much this category is used
  const maxCategoryUse = Math.max(...categoryStats.map(s => s.useCount), 1)

  // Normalize and add recency boost for category
  const baseScore = categoryStat.useCount / maxCategoryUse
  const daysSinceLastUse = (new Date().getTime() - categoryStat.lastUsed.getTime()) / DAYS_TO_MS
  const recencyBoost = Math.exp(-daysSinceLastUse / 60) // 60-day decay for categories

  return baseScore * (1 + recencyBoost * 0.5)
}

/**
 * Calculate composite template score
 */
function calculateTemplateScore(
  template: JobCardTemplate,
  usageData: TemplateUsageData,
  categoryStats: CategoryUsageStats[],
  config: RecommendationConfig
): TemplateScore {
  const entry = usageData.template_usage[template.id]

  // Start with backend usage_count as baseline
  const backendUseCount = template.usage_count || 0
  const localUseCount = entry?.useCount || 0
  const totalUseCount = backendUseCount + localUseCount

  // Get last used date (prefer local, fallback to created_at)
  const lastUsed = entry?.lastUsed
    ? new Date(entry.lastUsed)
    : new Date(template.created_at)

  const searchMatches = entry?.searchMatches || 0

  // Calculate component scores
  const recencyScore = calculateRecencyScore(lastUsed, config)
  const frequencyScore = calculateFrequencyScore(totalUseCount, 50) // Assume 50 as max
  const searchScore = calculateSearchScore(searchMatches, 20) // Assume 20 as max
  const categoryScore = calculateCategoryAffinityScore(template.category, categoryStats)

  // Calculate weighted composite score
  const compositeScore =
    (recencyScore * config.recencyWeight) +
    (frequencyScore * config.frequencyWeight) +
    (searchScore * config.searchWeight) +
    (categoryScore * config.categoryAffinityWeight)

  return {
    templateId: template.id,
    score: compositeScore * 100, // Scale to 0-100
    lastUsed,
    useCount: totalUseCount,
    searchMatches,
    recencyBonus: recencyScore * 100,
    categoryAffinity: categoryScore * 100,
  }
}

/**
 * Generate human-readable reasons for recommendation
 */
function generateReasons(score: TemplateScore, template: JobCardTemplate): string[] {
  const reasons: string[] = []

  if (score.useCount > 10) {
    reasons.push(`Popular choice (${score.useCount} uses)`)
  } else if (score.useCount > 5) {
    reasons.push(`Frequently used (${score.useCount} uses)`)
  }

  if (score.recencyBonus > 70) {
    reasons.push('Recently used')
  } else if (score.recencyBonus > 40) {
    reasons.push('Used within last month')
  }

  if (score.searchMatches > 5) {
    reasons.push('Matches your searches')
  }

  if (score.categoryAffinity > 60) {
    reasons.push(`${template.category} specialist`)
  }

  if (reasons.length === 0) {
    reasons.push('Recommended for you')
  }

  return reasons
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

/**
 * Get personalized template recommendations
 */
export function getTemplateRecommendations(
  templates: JobCardTemplate[],
  config: Partial<RecommendationConfig> = {}
): TemplateRecommendation[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Load usage data
  const usageData = loadUsageData()
  const categoryStats = getCategoryUsageStats()

  // Calculate scores for all templates
  const scores = templates.map(template =>
    calculateTemplateScore(template, usageData, categoryStats, finalConfig)
  )

  // Filter out templates with zero score
  const validScores = scores.filter(s => s.score > 0)

  // Sort by score (descending)
  validScores.sort((a, b) => b.score - a.score)

  // Take top N
  const topScores = validScores.slice(0, finalConfig.maxRecommendations)

  // Map to recommendations
  const recommendations: TemplateRecommendation[] = topScores
    .map((score, index) => {
      const template = templates.find(t => t.id === score.templateId)
      if (!template) return null

      return {
        template,
        score: score.score,
        reasons: generateReasons(score, template),
        rank: index + 1,
      }
    })
    .filter((r): r is TemplateRecommendation => r !== null)

  console.log(`🎯 Generated ${recommendations.length} recommendations:`, {
    topScores: recommendations.map(r => ({
      name: r.template.name,
      score: r.score,
      reasons: r.reasons,
    })),
  })

  return recommendations
}

/**
 * Clear all usage data (for testing or reset)
 */
export function clearUsageData(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ Cleared template usage data')
  } catch (error) {
    console.error('Error clearing template usage data:', error)
  }
}

/**
 * Export usage data (for backup/sync)
 */
export function exportUsageData(): TemplateUsageData | null {
  return loadUsageData()
}

/**
 * Import usage data (for backup/sync)
 */
export function importUsageData(data: TemplateUsageData): void {
  saveUsageData(data)
  console.log('📥 Imported template usage data')
}
