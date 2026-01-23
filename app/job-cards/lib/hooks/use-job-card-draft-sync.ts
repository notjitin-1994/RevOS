'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useJobCardDraftStore } from '../stores/job-card-draft-store'

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
  alternatePhone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
}

export interface VehicleFormData {
  category: string
  make: string
  model: string
  year: string
  licensePlate: string
  color?: string
  vin?: string
  engineNumber?: string
  chassisNumber?: string
  mileage?: string
  notes?: string
}

export interface ChecklistItem {
  id: string
  itemName: string
  description?: string
  category?: string
  priority: Priority
  estimatedMinutes: number
  laborRate: number
  displayOrder: number
  subtasks?: Array<{
    id: string
    name: string
    completed: boolean
  }>
  linkedToCustomerIssues?: number[]
  linkedToServiceScope?: number[]
  linkedToTechnicalDiagnosis?: number[]
}

export interface PartItem {
  id: string
  partId: string | null
  partName: string
  partNumber: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface UseJobCardDraftSyncOptions {
  // Current state values (from useState)
  activeTab: TabValue
  selectedCustomer: { id: string } | null
  selectedVehicle: { id: string } | null
  currentMileage: string
  customerFormData?: CustomerFormData | null
  vehicleFormData?: VehicleFormData[] | null
  jobType: JobType
  priority: Priority
  customerReportIssues: string[]
  workRequestedItems: string[]
  customerNotes: string
  technicalDiagnosisItems: string[]
  technicianNotes: string
  promisedDate: string
  promisedTime: string
  leadMechanicId: string
  serviceAdvisorId: string
  checklistItems: ChecklistItem[]
  selectedParts: PartItem[]

  // State setters
  setActiveTab: (tab: TabValue) => void
  setSelectedCustomer: (customer: any) => void
  setSelectedVehicle: (vehicle: any) => void
  setCurrentMileage: (mileage: string) => void
  setCustomerFormData: (data: any) => void
  setCustomerVehicles: (data: any) => void
  setJobType: (type: JobType) => void
  setPriority: (priority: Priority) => void
  setCustomerReportIssues: (issues: string[]) => void
  setWorkRequestedItems: (items: string[]) => void
  setCustomerNotes: (notes: string) => void
  setTechnicalDiagnosisItems: (items: string[]) => void
  setTechnicianNotes: (notes: string) => void
  setPromisedDate: (date: string) => void
  setPromisedTime: (time: string) => void
  setLeadMechanicId: (id: string) => void
  setServiceAdvisorId: (id: string) => void
  setChecklistItems: (items: ChecklistItem[]) => void
  setSelectedParts: (parts: PartItem[]) => void

  // Whether to enable sync (disable when loading existing draft)
  enabled?: boolean
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to synchronize existing form state with the draft store.
 * This bridges the gap between existing useState-based form and the new Zustand draft store.
 *
 * This hook:
 * 1. Syncs state changes to the draft store
 * 2. Loads draft data into state on mount
 * 3. Prevents sync loops by tracking source of changes
 */
export function useJobCardDraftSync({
  // Current state values
  activeTab,
  selectedCustomer,
  selectedVehicle,
  currentMileage,
  customerFormData,
  vehicleFormData,
  jobType,
  priority,
  customerReportIssues,
  workRequestedItems,
  customerNotes,
  technicalDiagnosisItems,
  technicianNotes,
  promisedDate,
  promisedTime,
  leadMechanicId,
  serviceAdvisorId,
  checklistItems,
  selectedParts,

  // State setters
  setActiveTab,
  setSelectedCustomer,
  setSelectedVehicle,
  setCurrentMileage,
  setCustomerFormData,
  setCustomerVehicles,
  setJobType,
  setPriority,
  setCustomerReportIssues,
  setWorkRequestedItems,
  setCustomerNotes,
  setTechnicalDiagnosisItems,
  setTechnicianNotes,
  setPromisedDate,
  setPromisedTime,
  setLeadMechanicId,
  setServiceAdvisorId,
  setChecklistItems,
  setSelectedParts,

  enabled = true,
}: UseJobCardDraftSyncOptions) {
  // Track whether we're loading from draft to prevent sync loops
  const isLoadingFromDraftRef = useRef(false)

  // Get draft store actions (using stable references)
  const markDirty = useJobCardDraftStore((state) => state.markDirty)
  const setActiveTabDraft = useJobCardDraftStore((state) => state.setActiveTab)
  const setSelectedCustomerDraft = useJobCardDraftStore((state) => state.setSelectedCustomer)
  const setSelectedVehicleDraft = useJobCardDraftStore((state) => state.setSelectedVehicle)
  const setCurrentMileageDraft = useJobCardDraftStore((state) => state.setCurrentMileage)
  const setCustomerFormDataDraft = useJobCardDraftStore((state) => state.setCustomerFormData)
  const setVehicleFormDataDraft = useJobCardDraftStore((state) => state.setVehicleFormData)
  const setJobTypeDraft = useJobCardDraftStore((state) => state.setJobType)
  const setPriorityDraft = useJobCardDraftStore((state) => state.setPriority)
  const setCustomerReportIssuesDraft = useJobCardDraftStore((state) => state.setCustomerReportIssues)
  const setWorkRequestedItemsDraft = useJobCardDraftStore((state) => state.setWorkRequestedItems)
  const setCustomerNotesDraft = useJobCardDraftStore((state) => state.setCustomerNotes)
  const setTechnicalDiagnosisItemsDraft = useJobCardDraftStore((state) => state.setTechnicalDiagnosisItems)
  const setTechnicianNotesDraft = useJobCardDraftStore((state) => state.setTechnicianNotes)
  const setPromisedDateDraft = useJobCardDraftStore((state) => state.setPromisedDate)
  const setPromisedTimeDraft = useJobCardDraftStore((state) => state.setPromisedTime)
  const setLeadMechanicIdDraft = useJobCardDraftStore((state) => state.setLeadMechanicId)
  const setServiceAdvisorIdDraft = useJobCardDraftStore((state) => state.setServiceAdvisorId)
  const setChecklistItemsDraft = useJobCardDraftStore((state) => state.setChecklistItems)
  const setSelectedPartsDraft = useJobCardDraftStore((state) => state.setSelectedParts)

  // Get draft data for loading
  const draftData = useJobCardDraftStore((state) => ({
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
    technicianNotes: state.technicianNotes,
    promisedDate: state.promisedDate,
    promisedTime: state.promisedTime,
    leadMechanicId: state.leadMechanicId,
    serviceAdvisorId: state.serviceAdvisorId,
    checklistItems: state.checklistItems,
    selectedParts: state.selectedParts,
    lastSaved: state.lastSaved,
  }))

  // Track previous values to detect actual changes
  const prevValuesRef = useRef({
    activeTab,
    customerId: selectedCustomer?.id,
    vehicleId: selectedVehicle?.id,
    currentMileage,
    jobType,
    priority,
  })

  // Effect: Sync state changes to draft store
  // NOTE: This is disabled by default to prevent infinite loops.
  // The draft store relies on Zustand's persist middleware for localStorage persistence,
  // and the auto-save hook handles database saves.
  // Uncomment this effect if you want automatic syncing (be careful of infinite loops).
  /*
  useEffect(() => {
    if (!enabled || isLoadingFromDraftRef.current) return

    const prev = prevValuesRef.current
    let hasChanges = false

    // Check for actual changes
    if (prev.activeTab !== activeTab) {
      setActiveTabDraft(activeTab)
      prev.activeTab = activeTab
      hasChanges = true
    }
    if (prev.customerId !== (selectedCustomer?.id || null)) {
      setSelectedCustomerDraft(selectedCustomer?.id || null)
      prev.customerId = selectedCustomer?.id || null
      hasChanges = true
    }
    if (prev.vehicleId !== (selectedVehicle?.id || null)) {
      setSelectedVehicleDraft(selectedVehicle?.id || null)
      prev.vehicleId = selectedVehicle?.id || null
      hasChanges = true
    }
    if (prev.currentMileage !== currentMileage) {
      setCurrentMileageDraft(currentMileage)
      prev.currentMileage = currentMileage
      hasChanges = true
    }
    if (prev.jobType !== jobType) {
      setJobTypeDraft(jobType)
      prev.jobType = jobType
      hasChanges = true
    }
    if (prev.priority !== priority) {
      setPriorityDraft(priority)
      prev.priority = priority
      hasChanges = true
    }

    // Always sync arrays/objects (they're cheap to compare in practice)
    setCustomerFormDataDraft(customerFormData || null)
    setVehicleFormDataDraft(vehicleFormData?.[0] || null)
    setCustomerReportIssuesDraft(customerReportIssues)
    setWorkRequestedItemsDraft(workRequestedItems)
    setCustomerNotesDraft(customerNotes)
    setTechnicalDiagnosisItemsDraft(technicalDiagnosisItems)
    setTechnicianNotesDraft(technicianNotes)
    setPromisedDateDraft(promisedDate)
    setPromisedTimeDraft(promisedTime)
    setLeadMechanicIdDraft(leadMechanicId)
    setServiceAdvisorIdDraft(serviceAdvisorId)
    setChecklistItemsDraft(
      checklistItems.map(item => ({
        id: item.id,
        name: item.itemName,
        description: item.description,
        category: item.category,
        priority: item.priority,
        estimatedMinutes: item.estimatedMinutes,
        laborRate: item.laborRate,
        completed: false, // Default to false for new items
        displayOrder: item.displayOrder,
        subtasks: item.subtasks,
      }))
    )
    setSelectedPartsDraft(
      selectedParts.map(part => ({
        id: part.id,
        partId: part.partId || '',
        name: part.partName,
        partNumber: part.partNumber || '',
        quantity: part.quantity,
        unitPrice: part.unitPrice,
        totalPrice: part.totalPrice,
      }))
    )

    // Mark draft as dirty since data changed
    if (hasChanges) {
      markDirty()
    }
  }, [
    enabled,
    activeTab,
    selectedCustomer?.id,
    selectedVehicle?.id,
    currentMileage,
    customerFormData,
    vehicleFormData,
    jobType,
    priority,
    customerReportIssues,
    workRequestedItems,
    customerNotes,
    technicalDiagnosisItems,
    technicianNotes,
    promisedDate,
    promisedTime,
    leadMechanicId,
    serviceAdvisorId,
    checklistItems,
    selectedParts,
    setActiveTabDraft,
    setSelectedCustomerDraft,
    setSelectedVehicleDraft,
    setCurrentMileageDraft,
    setCustomerFormDataDraft,
    setVehicleFormDataDraft,
    setJobTypeDraft,
    setPriorityDraft,
    setCustomerReportIssuesDraft,
    setWorkRequestedItemsDraft,
    setCustomerNotesDraft,
    setTechnicalDiagnosisItemsDraft,
    setTechnicianNotesDraft,
    setPromisedDateDraft,
    setPromisedTimeDraft,
    setLeadMechanicIdDraft,
    setServiceAdvisorIdDraft,
    setChecklistItemsDraft,
    setSelectedPartsDraft,
    markDirty,
  ])
  */

  /**
   * Function to load draft data into state
   * Call this when continuing a draft
   */
  const loadDraftIntoState = (customerData: any[], vehicleData: any[]) => {
    isLoadingFromDraftRef.current = true

    try {
      // Only load if there's actual draft data
      if (!draftData.draftId && !draftData.lastSaved) {
        return
      }

      // Load tab
      if (draftData.activeTab) setActiveTab(draftData.activeTab)

      // Load customer
      if (draftData.selectedCustomerId) {
        const customer = customerData.find(c => c.id === draftData.selectedCustomerId)
        if (customer) setSelectedCustomer(customer)
      }

      // Load vehicle
      if (draftData.selectedVehicleId && vehicleData) {
        const vehicle = vehicleData.find(v => v.id === draftData.selectedVehicleId)
        if (vehicle) setSelectedVehicle(vehicle)
      }

      // Load other fields
      if (draftData.currentMileage) setCurrentMileage(draftData.currentMileage)
      if (draftData.jobType) setJobType(draftData.jobType)
      if (draftData.priority) setPriority(draftData.priority)
      if (draftData.customerReportIssues) setCustomerReportIssues(draftData.customerReportIssues)
      if (draftData.workRequestedItems) setWorkRequestedItems(draftData.workRequestedItems)
      if (draftData.customerNotes) setCustomerNotes(draftData.customerNotes)
      if (draftData.technicalDiagnosisItems) setTechnicalDiagnosisItems(draftData.technicalDiagnosisItems)
      if (draftData.technicianNotes) setTechnicianNotes(draftData.technicianNotes)
      if (draftData.promisedDate) setPromisedDate(draftData.promisedDate)
      if (draftData.promisedTime) setPromisedTime(draftData.promisedTime)
      if (draftData.leadMechanicId) setLeadMechanicId(draftData.leadMechanicId)
      if (draftData.serviceAdvisorId) setServiceAdvisorId(draftData.serviceAdvisorId)
      if (draftData.checklistItems) {
        setChecklistItems(
          draftData.checklistItems.map(item => ({
            id: item.id,
            itemName: item.name,
            description: item.description,
            category: item.category,
            priority: item.priority,
            estimatedMinutes: item.estimatedMinutes,
            laborRate: item.laborRate || 500,
            displayOrder: item.displayOrder,
            subtasks: item.subtasks?.map(st => ({
              id: st.id,
              name: st.name,
              completed: st.completed,
            })) || [],
          }))
        )
      }
      if (draftData.selectedParts) {
        setSelectedParts(
          draftData.selectedParts.map(part => ({
            id: part.id,
            partId: part.partId || null,
            partName: part.name,
            partNumber: part.partNumber || null,
            quantity: part.quantity,
            unitPrice: part.unitPrice,
            totalPrice: part.totalPrice,
          }))
        )
      }
      if (draftData.customerFormData) setCustomerFormData(draftData.customerFormData)
      if (draftData.vehicleFormData) setCustomerVehicles([draftData.vehicleFormData])
    } finally {
      isLoadingFromDraftRef.current = false
    }
  }

  /**
   * Clear draft data from store
   */
  const clearDraft = () => {
    useJobCardDraftStore.getState().clearDraft()
  }

  return {
    loadDraftIntoState,
    clearDraft,
    draftId: draftData.draftId,
    hasDraft: !!draftData.draftId || !!draftData.lastSaved,
  }
}
