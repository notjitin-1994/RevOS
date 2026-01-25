// ============================================================================
// Component: TemplateConnectionModal
// Description: Modal for connecting template to customer issues, service scope, and diagnosis
// ============================================================================

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Link2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobCardTemplate } from '@/lib/types/template.types'

interface TemplateConnectionModalProps {
  template: JobCardTemplate | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (links: {
    customerIssues: number[]
    serviceScope: number[]
    technicalDiagnosis: number[]
  }) => void
  customerReportIssues: string[]
  workRequestedItems: string[]
  technicalDiagnosisItems: string[]
}

export function TemplateConnectionModal({
  template,
  isOpen,
  onClose,
  onConfirm,
  customerReportIssues,
  workRequestedItems,
  technicalDiagnosisItems,
}: TemplateConnectionModalProps) {
  const [selectedCustomerIssues, setSelectedCustomerIssues] = useState<number[]>([])
  const [selectedServiceScope, setSelectedServiceScope] = useState<number[]>([])
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<number[]>([])

  const [expandedSections, setExpandedSections] = useState({
    customerIssues: true,
    serviceScope: true,
    technicalDiagnosis: true,
  })

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCustomerIssues([])
      setSelectedServiceScope([])
      setSelectedDiagnosis([])
    }
  }, [isOpen])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleItem = (
    index: number,
    selected: number[],
    setSelected: (items: number[]) => void
  ) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index))
    } else {
      setSelected([...selected, index])
    }
  }

  const handleConfirm = () => {
    onConfirm({
      customerIssues: selectedCustomerIssues,
      serviceScope: selectedServiceScope,
      technicalDiagnosis: selectedDiagnosis,
    })
    onClose()
  }

  const hasAnyLinks =
    selectedCustomerIssues.length > 0 ||
    selectedServiceScope.length > 0 ||
    selectedDiagnosis.length > 0

  const totalLinks =
    selectedCustomerIssues.length + selectedServiceScope.length + selectedDiagnosis.length

  return (
    <AnimatePresence>
      {isOpen && template && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-graphite-900 mb-2">
                    Connect Template to Job Details
                  </h2>
                  <p className="text-gray-600">
                    Link <span className="font-semibold text-graphite-900">{template.name}</span> to
                    relevant items for better tracking
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Customer Reported Issues */}
                {customerReportIssues.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('customerIssues')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-brand rounded-lg">
                          <AlertCircle className="h-4 w-4 text-graphite-900" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-graphite-900">
                            Customer Reported Issues
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedCustomerIssues.length} of {customerReportIssues.length} selected
                          </p>
                        </div>
                      </div>
                      {expandedSections.customerIssues ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.customerIssues && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-2 bg-white">
                            {customerReportIssues.map((issue, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  toggleItem(index, selectedCustomerIssues, setSelectedCustomerIssues)
                                }
                                className={cn(
                                  'w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left',
                                  selectedCustomerIssues.includes(index)
                                    ? 'border-brand bg-brand/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0 mt-0.5',
                                    selectedCustomerIssues.includes(index)
                                      ? 'border-brand bg-brand'
                                      : 'border-gray-300'
                                  )}
                                >
                                  {selectedCustomerIssues.includes(index) && (
                                    <CheckCircle2 className="h-3 w-3 text-graphite-900" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-900">{issue}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Service Scope / Work Requested */}
                {workRequestedItems.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('serviceScope')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-brand rounded-lg">
                          <Link2 className="h-4 w-4 text-graphite-900" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-graphite-900">
                            Service Scope / Work Requested
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedServiceScope.length} of {workRequestedItems.length} selected
                          </p>
                        </div>
                      </div>
                      {expandedSections.serviceScope ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.serviceScope && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-2 bg-white">
                            {workRequestedItems.map((item, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  toggleItem(index, selectedServiceScope, setSelectedServiceScope)
                                }
                                className={cn(
                                  'w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left',
                                  selectedServiceScope.includes(index)
                                    ? 'border-brand bg-brand/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0 mt-0.5',
                                    selectedServiceScope.includes(index)
                                      ? 'border-brand bg-brand'
                                      : 'border-gray-300'
                                  )}
                                >
                                  {selectedServiceScope.includes(index) && (
                                    <CheckCircle2 className="h-3 w-3 text-graphite-900" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-900">{item}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Technical Diagnosis */}
                {technicalDiagnosisItems.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('technicalDiagnosis')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-brand rounded-lg">
                          <Link2 className="h-4 w-4 text-graphite-900" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-graphite-900">Technical Diagnosis</h3>
                          <p className="text-sm text-gray-600">
                            {selectedDiagnosis.length} of {technicalDiagnosisItems.length} selected
                          </p>
                        </div>
                      </div>
                      {expandedSections.technicalDiagnosis ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.technicalDiagnosis && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-2 bg-white">
                            {technicalDiagnosisItems.map((diagnosis, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  toggleItem(index, selectedDiagnosis, setSelectedDiagnosis)
                                }
                                className={cn(
                                  'w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left',
                                  selectedDiagnosis.includes(index)
                                    ? 'border-brand bg-brand/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0 mt-0.5',
                                    selectedDiagnosis.includes(index)
                                      ? 'border-brand bg-brand'
                                      : 'border-gray-300'
                                  )}
                                >
                                  {selectedDiagnosis.includes(index) && (
                                    <CheckCircle2 className="h-3 w-3 text-graphite-900" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-900">{diagnosis}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* No Items Message */}
                {customerReportIssues.length === 0 &&
                  workRequestedItems.length === 0 &&
                  technicalDiagnosisItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Link2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Items to Connect
                    </h3>
                    <p className="text-sm text-gray-600 max-w-sm">
                      Add customer reported issues, service scope items, or technical diagnosis in the
                      Job Details tab first
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-6 py-3 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  {totalLinks > 0 && (
                    <span className="text-sm text-gray-600">
                      {totalLinks} link{totalLinks !== 1 ? 's' : ''} selected
                    </span>
                  )}
                  <button
                    onClick={handleConfirm}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                      hasAnyLinks || totalLinks === 0
                        ? 'bg-graphite-900 text-white hover:bg-graphite-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Add to Checklist
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
