import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// TYPES
// ============================================================================

type JobType = 'routine' | 'repair' | 'maintenance' | 'custom' | 'diagnostic'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type TabValue = 'customer' | 'job-details' | 'tasks' | 'labor-parts' | 'scheduling' | 'review'

export interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export interface VehicleFormData {
  make: string
  model: string
  year: string
  licensePlate: string
  vin?: string
  vehicleType?: 'motorcycle' | 'scooter'
  color?: string
}

export interface ChecklistItem {
  id: string
  name: string
  description?: string
  category?: string
  priority: Priority
  estimatedMinutes: number
  laborRate?: number
  completed: boolean
  displayOrder: number
  subtasks?: Array<{
    id: string
    name: string
    completed: boolean
  }>
}

export interface PartItem {
  id: string
  partId: string
  name: string
  partNumber?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface DraftState {
  // Meta data
  draftId: string | null
  isDirty: boolean
  lastSaved: string | null
  lastAutoSaved: string | null
  activeTab: TabValue

  // Customer & Vehicle Tab
  selectedCustomerId: string | null
  selectedVehicleId: string | null
  currentMileage: string

  // Customer Form Data (for new customers)
  customerFormData: CustomerFormData | null
  vehicleFormData: VehicleFormData | null

  // Job Details Tab
  jobType: JobType
  priority: Priority
  customerReportIssues: string[]
  workRequestedItems: string[]
  customerNotes: string
  technicalDiagnosisItems: string[]

  // Tasks Tab
  checklistItems: ChecklistItem[]

  // Labor & Parts Tab
  selectedParts: PartItem[]

  // Scheduling Tab
  promisedDate: string
  promisedTime: string
  leadMechanicId: string
  serviceAdvisorId: string
  technicianNotes: string

  // Validation state
  tabValidation: Record<TabValue, boolean>
}

export interface DraftActions {
  // Meta actions
  setDraftId: (id: string | null) => void
  setActiveTab: (tab: TabValue) => void
  markDirty: () => void
  markClean: () => void
  updateLastSaved: (timestamp?: string) => void
  updateLastAutoSaved: (timestamp?: string) => void

  // Customer & Vehicle actions
  setSelectedCustomer: (customerId: string | null) => void
  setSelectedVehicle: (vehicleId: string | null) => void
  setCurrentMileage: (mileage: string) => void

  // Customer Form actions
  setCustomerFormData: (data: CustomerFormData | null) => void
  setVehicleFormData: (data: VehicleFormData | null) => void

  // Job Details actions
  setJobType: (type: JobType) => void
  setPriority: (priority: Priority) => void
  setCustomerReportIssues: (issues: string[]) => void
  addCustomerReportIssue: (issue: string) => void
  removeCustomerReportIssue: (index: number) => void
  setWorkRequestedItems: (items: string[]) => void
  addWorkRequestedItem: (item: string) => void
  removeWorkRequestedItem: (index: number) => void
  setCustomerNotes: (notes: string) => void
  setTechnicalDiagnosisItems: (items: string[]) => void
  addTechnicalDiagnosis: (diagnosis: string) => void
  removeTechnicalDiagnosis: (index: number) => void

  // Tasks actions
  setChecklistItems: (items: ChecklistItem[]) => void
  addChecklistItem: (item: ChecklistItem) => void
  updateChecklistItem: (id: string, updates: Partial<ChecklistItem>) => void
  removeChecklistItem: (id: string) => void

  // Labor & Parts actions
  setSelectedParts: (parts: PartItem[]) => void
  addPart: (part: PartItem) => void
  updatePart: (id: string, updates: Partial<PartItem>) => void
  removePart: (id: string) => void

  // Scheduling actions
  setPromisedDate: (date: string) => void
  setPromisedTime: (time: string) => void
  setLeadMechanicId: (mechanicId: string) => void
  setServiceAdvisorId: (advisorId: string) => void
  setTechnicianNotes: (notes: string) => void

  // Validation actions
  setTabValidation: (tab: TabValue, isValid: boolean) => void

  // Draft management
  clearDraft: () => void
  loadDraftData: (data: Partial<DraftState>) => void
  getDraftDataForSubmit: () => Omit<DraftState, 'isDirty' | 'lastSaved' | 'lastAutoSaved' | 'tabValidation' | 'activeTab'>
}

export type DraftStore = DraftState & DraftActions

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DraftState = {
  // Meta data
  draftId: null,
  isDirty: false,
  lastSaved: null,
  lastAutoSaved: null,
  activeTab: 'customer',

  // Customer & Vehicle Tab
  selectedCustomerId: null,
  selectedVehicleId: null,
  currentMileage: '',

  // Customer Form Data
  customerFormData: null,
  vehicleFormData: null,

  // Job Details Tab
  jobType: 'repair',
  priority: 'medium',
  customerReportIssues: [],
  workRequestedItems: [],
  customerNotes: '',
  technicalDiagnosisItems: [],

  // Tasks Tab
  checklistItems: [],

  // Labor & Parts Tab
  selectedParts: [],

  // Scheduling Tab
  promisedDate: '',
  promisedTime: '',
  leadMechanicId: '',
  serviceAdvisorId: '',
  technicianNotes: '',

  // Validation state
  tabValidation: {
    customer: false,
    'job-details': false,
    tasks: false,
    'labor-parts': false,
    scheduling: false,
    review: false,
  },
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useJobCardDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Meta actions
      setDraftId: (id) => set({ draftId: id }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      markDirty: () => set({ isDirty: true }),

      markClean: () => set({ isDirty: false }),

      updateLastSaved: (timestamp) => set({
        lastSaved: timestamp || new Date().toISOString()
      }),

      updateLastAutoSaved: (timestamp) => set({
        lastAutoSaved: timestamp || new Date().toISOString()
      }),

      // Customer & Vehicle actions
      setSelectedCustomer: (customerId) => {
        set({ selectedCustomerId: customerId, isDirty: true })
      },

      setSelectedVehicle: (vehicleId) => {
        set({ selectedVehicleId: vehicleId, isDirty: true })
      },

      setCurrentMileage: (mileage) => {
        set({ currentMileage: mileage, isDirty: true })
      },

      // Customer Form actions
      setCustomerFormData: (data) => {
        set({ customerFormData: data, isDirty: true })
      },

      setVehicleFormData: (data) => {
        set({ vehicleFormData: data, isDirty: true })
      },

      // Job Details actions
      setJobType: (type) => {
        set({ jobType: type, isDirty: true })
      },

      setPriority: (priority) => {
        set({ priority, isDirty: true })
      },

      setCustomerReportIssues: (issues) => {
        set({ customerReportIssues: issues, isDirty: true })
      },

      addCustomerReportIssue: (issue) => {
        set((state) => ({
          customerReportIssues: [...state.customerReportIssues, issue],
          isDirty: true
        }))
      },

      removeCustomerReportIssue: (index) => {
        set((state) => ({
          customerReportIssues: state.customerReportIssues.filter((_, i) => i !== index),
          isDirty: true
        }))
      },

      setWorkRequestedItems: (items) => {
        set({ workRequestedItems: items, isDirty: true })
      },

      addWorkRequestedItem: (item) => {
        set((state) => ({
          workRequestedItems: [...state.workRequestedItems, item],
          isDirty: true
        }))
      },

      removeWorkRequestedItem: (index) => {
        set((state) => ({
          workRequestedItems: state.workRequestedItems.filter((_, i) => i !== index),
          isDirty: true
        }))
      },

      setCustomerNotes: (notes) => {
        set({ customerNotes: notes, isDirty: true })
      },

      setTechnicalDiagnosisItems: (items) => {
        set({ technicalDiagnosisItems: items, isDirty: true })
      },

      addTechnicalDiagnosis: (diagnosis) => {
        set((state) => ({
          technicalDiagnosisItems: [...state.technicalDiagnosisItems, diagnosis],
          isDirty: true
        }))
      },

      removeTechnicalDiagnosis: (index) => {
        set((state) => ({
          technicalDiagnosisItems: state.technicalDiagnosisItems.filter((_, i) => i !== index),
          isDirty: true
        }))
      },

      // Tasks actions
      setChecklistItems: (items) => {
        set({ checklistItems: items, isDirty: true })
      },

      addChecklistItem: (item) => {
        set((state) => ({
          checklistItems: [...state.checklistItems, item],
          isDirty: true
        }))
      },

      updateChecklistItem: (id, updates) => {
        set((state) => ({
          checklistItems: state.checklistItems.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
          isDirty: true
        }))
      },

      removeChecklistItem: (id) => {
        set((state) => ({
          checklistItems: state.checklistItems.filter(item => item.id !== id),
          isDirty: true
        }))
      },

      // Labor & Parts actions
      setSelectedParts: (parts) => {
        set({ selectedParts: parts, isDirty: true })
      },

      addPart: (part) => {
        set((state) => ({
          selectedParts: [...state.selectedParts, part],
          isDirty: true
        }))
      },

      updatePart: (id, updates) => {
        set((state) => ({
          selectedParts: state.selectedParts.map(part =>
            part.id === id ? { ...part, ...updates } : part
          ),
          isDirty: true
        }))
      },

      removePart: (id) => {
        set((state) => ({
          selectedParts: state.selectedParts.filter(part => part.id !== id),
          isDirty: true
        }))
      },

      // Scheduling actions
      setPromisedDate: (date) => {
        set({ promisedDate: date, isDirty: true })
      },

      setPromisedTime: (time) => {
        set({ promisedTime: time, isDirty: true })
      },

      setLeadMechanicId: (mechanicId) => {
        set({ leadMechanicId: mechanicId, isDirty: true })
      },

      setServiceAdvisorId: (advisorId) => {
        set({ serviceAdvisorId: advisorId, isDirty: true })
      },

      setTechnicianNotes: (notes) => {
        set({ technicianNotes: notes, isDirty: true })
      },

      // Validation actions
      setTabValidation: (tab, isValid) => {
        set((state) => ({
          tabValidation: { ...state.tabValidation, [tab]: isValid }
        }))
      },

      // Draft management
      clearDraft: () => {
        set(initialState)
      },

      loadDraftData: (data) => {
        set((state) => ({
          ...state,
          ...data,
          isDirty: false
        }))
      },

      getDraftDataForSubmit: () => {
        const state = get()
        return {
          draftId: state.draftId,
          activeTab: state.activeTab,
          selectedCustomerId: state.selectedCustomerId,
          selectedVehicleId: state.selectedVehicleId,
          currentMileage: state.currentMileage,
          customerFormData: state.customerFormData,
          vehicleFormData: state.vehicleFormData,
          jobType: state.jobType,
          priority: state.priority,
          customerReportIssues: state.customerReportIssues,
          workRequestedItems: state.workRequestedItems,
          customerNotes: state.customerNotes,
          technicalDiagnosisItems: state.technicalDiagnosisItems,
          checklistItems: state.checklistItems,
          selectedParts: state.selectedParts,
          promisedDate: state.promisedDate,
          promisedTime: state.promisedTime,
          leadMechanicId: state.leadMechanicId,
          serviceAdvisorId: state.serviceAdvisorId,
          technicianNotes: state.technicianNotes,
          tabValidation: state.tabValidation,
        }
      },
    }),
    {
      name: 'job-card-draft-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields (exclude non-serializable functions)
      partialize: (state) => ({
        draftId: state.draftId,
        isDirty: state.isDirty,
        lastSaved: state.lastSaved,
        lastAutoSaved: state.lastAutoSaved,
        activeTab: state.activeTab,
        selectedCustomerId: state.selectedCustomerId,
        selectedVehicleId: state.selectedVehicleId,
        currentMileage: state.currentMileage,
        customerFormData: state.customerFormData,
        vehicleFormData: state.vehicleFormData,
        jobType: state.jobType,
        priority: state.priority,
        customerReportIssues: state.customerReportIssues,
        workRequestedItems: state.workRequestedItems,
        customerNotes: state.customerNotes,
        technicalDiagnosisItems: state.technicalDiagnosisItems,
        checklistItems: state.checklistItems,
        selectedParts: state.selectedParts,
        promisedDate: state.promisedDate,
        promisedTime: state.promisedTime,
        leadMechanicId: state.leadMechanicId,
        serviceAdvisorId: state.serviceAdvisorId,
        technicianNotes: state.technicianNotes,
        tabValidation: state.tabValidation,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migrations if needed in the future
        if (version === 0) {
          // Example migration from version 0 to 1
          return {
            ...persistedState,
            tabValidation: {
              customer: false,
              'job-details': false,
              tasks: false,
              'labor-parts': false,
              scheduling: false,
              review: false,
            }
          }
        }
        return persistedState
      },
    }
  )
)

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get draft summary for display
 */
export const useDraftSummary = () => {
  const state = useJobCardDraftStore()

  return {
    hasDraft: !!state.draftId || state.isDirty,
    isDirty: state.isDirty,
    lastSaved: state.lastSaved,
    lastAutoSaved: state.lastAutoSaved,
    draftId: state.draftId,
    activeTab: state.activeTab,
  }
}

/**
 * Hook to check if draft has any data
 */
export const useHasDraftData = () => {
  const state = useJobCardDraftStore()

  return !!(
    state.selectedCustomerId ||
    state.selectedVehicleId ||
    state.customerReportIssues.length > 0 ||
    state.workRequestedItems.length > 0 ||
    state.checklistItems.length > 0 ||
    state.selectedParts.length > 0 ||
    state.leadMechanicId ||
    state.serviceAdvisorId
  )
}

/**
 * Hook to get validation status
 */
export const useDraftValidation = () => {
  const tabValidation = useJobCardDraftStore((state) => state.tabValidation)

  return {
    isCustomerValid: tabValidation.customer,
    isJobDetailsValid: tabValidation['job-details'],
    isTasksValid: tabValidation.tasks,
    isLaborPartsValid: tabValidation['labor-parts'],
    isSchedulingValid: tabValidation.scheduling,
    isReviewValid: tabValidation.review,
    allValid: Object.values(tabValidation).every(Boolean),
  }
}
