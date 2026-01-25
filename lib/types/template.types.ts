// ============================================================================
// Job Card Task Templates System - Type Definitions
// ============================================================================

/**
 * Task categories available in the system
 */
export type TaskCategory = 'Engine' | 'Electrical' | 'Body' | 'Maintenance' | 'Diagnostic' | 'Custom'

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Subtask belonging to a checklist item
 */
export interface Subtask {
  id: string
  name: string
  description?: string
  estimatedMinutes: number
  completed: boolean
  displayOrder: number
}

/**
 * Checklist item - a task added to a job card
 */
export interface ChecklistItem {
  id: string
  itemName: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed' | 'skipped' // Added status field
  category?: string
  priority: TaskPriority
  estimatedMinutes: number
  laborRate: number
  displayOrder: number
  subtasks?: Subtask[]
  linkedToCustomerIssues?: number[] // indices of customerReportIssues
  linkedToServiceScope?: number[] // indices of workRequestedItems
  linkedToTechnicalDiagnosis?: number[] // indices of technicalDiagnosisItems
}

/**
 * Complete job card template with subtasks and parts
 */
export interface JobCardTemplate {
  id: string
  garage_id: string
  name: string
  slug: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  estimated_minutes: number
  labor_rate: number
  tags: string[]
  is_active: boolean
  is_system_template: boolean
  usage_count: number
  created_by: string
  created_at: string
  updated_at: string
  subtasks?: TemplateSubtask[]
  parts?: TemplatePart[]
}

/**
 * Subtask belonging to a template
 */
export interface TemplateSubtask {
  id: string
  template_id: string
  name: string
  description: string | null
  estimated_minutes: number
  display_order: number
}

/**
 * Part used in a template
 */
export interface TemplatePart {
  id: string
  template_id: string
  part_name: string
  part_number: string | null
  quantity: number
  unit_cost: number
  is_optional: boolean
  notes: string | null
}

/**
 * Request payload for creating a new template
 */
export interface CreateTemplateRequest {
  garageId: string
  name: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  estimatedMinutes: number
  laborRate: number
  tags?: string[]
  subtasks?: CreateTemplateSubtask[]
  parts?: CreateTemplatePart[]
}

/**
 * Subtask creation payload
 */
export interface CreateTemplateSubtask {
  name: string
  description?: string
  estimatedMinutes: number
  displayOrder: number
}

/**
 * Part creation payload
 */
export interface CreateTemplatePart {
  partName: string
  partNumber?: string
  quantity: number
  unitCost: number
  isOptional?: boolean
  notes?: string
}

/**
 * Request payload for updating a template
 */
export interface UpdateTemplateRequest {
  name?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  estimatedMinutes?: number
  laborRate?: number
  tags?: string[]
  isActive?: boolean
}

/**
 * Query parameters for listing templates
 */
export interface ListTemplatesQuery {
  garageId: string
  category?: TaskCategory
  tags?: string[]
  search?: string
  includeInactive?: boolean
}

/**
 * Template summary from database view
 */
export interface TemplateSummary {
  id: string
  garage_id: string
  name: string
  slug: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  estimated_minutes: number
  labor_rate: number
  tags: string[]
  usage_count: number
  is_active: boolean
  subtask_count: number
  parts_count: number
  created_at: string
}

/**
 * Template usage statistics
 */
export interface TemplateUsageStats {
  totalTemplates: number
  activeTemplates: number
  systemTemplates: number
  customTemplates: number
  mostUsedTemplates: TemplateSummary[]
  recentlyUsedTemplates: TemplateSummary[]
}
