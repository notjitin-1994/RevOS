'use client'

import React, { useState } from 'react'
import {
  X,
  Loader2,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Order Logging Bottom Sheet
 *
 * Appears after calling/emailing vendor to log:
 * - Communication type (phone/email)
 * - Order outcome
 * - Quantity ordered
 * - Expected delivery date
 * - Notes
 *
 * Features:
 * - Bottom sheet on mobile, modal on desktop
 * - Auto-populated vendor name
 * - Form validation
 * - Success/error states
 */

export type CommunicationType = 'phone' | 'email'
export type OrderOutcome =
  | 'order-placed'
  | 'price-quote'
  | 'follow-up-required'
  | 'no-answer'
  | 'other'

interface OrderLogSheetProps {
  isOpen: boolean
  onClose: () => void
  vendorName: string
  communicationType: CommunicationType
  partId: string
  partName: string
  onSubmit: (data: OrderLogData) => Promise<void>
}

export interface OrderLogData {
  partId: string
  vendorName: string
  communicationType: CommunicationType
  outcome: OrderOutcome
  quantityOrdered?: number
  expectedDeliveryDate?: string
  notes: string
}

const OUTCOME_OPTIONS: Array<{ value: OrderOutcome; label: string; icon: React.ComponentType<{ className?: string }> }> =
  [
    { value: 'order-placed', label: 'Order Placed', icon: CheckCircle },
    { value: 'price-quote', label: 'Price Quote', icon: FileText },
    { value: 'follow-up-required', label: 'Follow-up Required', icon: Calendar },
    { value: 'no-answer', label: 'No Answer', icon: Phone },
    { value: 'other', label: 'Other', icon: FileText },
  ]

export function OrderLogSheet({
  isOpen,
  onClose,
  vendorName,
  communicationType,
  partId,
  partName,
  onSubmit,
}: OrderLogSheetProps) {
  const [formData, setFormData] = useState({
    outcome: '' as OrderOutcome | '',
    quantityOrdered: '',
    expectedDeliveryDate: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when sheet opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        outcome: '',
        quantityOrdered: '',
        expectedDeliveryDate: '',
        notes: '',
      })
      setErrors({})
      setSubmitStatus('idle')
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.outcome) {
      newErrors.outcome = 'Please select an outcome'
    }

    if (formData.outcome === 'order-placed' && !formData.quantityOrdered) {
      newErrors.quantityOrdered = 'Quantity is required when order is placed'
    }

    if (formData.outcome === 'order-placed' && !formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required when order is placed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const data: OrderLogData = {
        partId,
        vendorName,
        communicationType,
        outcome: formData.outcome as OrderOutcome,
        quantityOrdered: formData.quantityOrdered ? parseInt(formData.quantityOrdered) : undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        notes: formData.notes,
      }

      await onSubmit(data)
      setSubmitStatus('success')

      // Close after success
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error logging order:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
          >
            {/* Bottom Sheet / Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: '100%' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: '100%' }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17,
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'bg-white w-full sm:rounded-2xl rounded-t-3xl',
                'shadow-2xl border border-gray-200',
                'max-h-[90vh] sm:max-h-auto sm:max-w-lg',
                'flex flex-col'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    communicationType === 'phone' ? 'bg-blue-100' : 'bg-purple-100'
                  )}>
                    {communicationType === 'phone' ? (
                      <Phone className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Mail className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-semibold text-gray-900">
                      Log Communication
                    </h2>
                    <p className="text-sm text-gray-600">
                      with {vendorName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Part Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Part
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {partName}
                  </p>
                </div>

                {/* Communication Type */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  {communicationType === 'phone' ? (
                    <>
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Phone Call</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Email</span>
                    </>
                  )}
                </div>

                {/* Order Outcome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Outcome <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {OUTCOME_OPTIONS.map((option) => {
                      const Icon = option.icon
                      const isSelected = formData.outcome === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, outcome: option.value })
                            setErrors({ ...errors, outcome: '' })
                          }}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all',
                            'text-left text-sm font-medium',
                            isSelected
                              ? 'border-brand bg-brand/5 text-graphite-900'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          )}
                        >
                          <Icon className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-brand' : 'text-gray-500'
                          )} />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  {errors.outcome && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.outcome}
                    </p>
                  )}
                </div>

                {/* Conditional fields for order-placed */}
                {formData.outcome === 'order-placed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 pt-2"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Ordered <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantityOrdered}
                        onChange={(e) => {
                          setFormData({ ...formData, quantityOrdered: e.target.value })
                          setErrors({ ...errors, quantityOrdered: '' })
                        }}
                        className={cn(
                          'w-full px-4 py-3 bg-white border rounded-xl text-base transition-all',
                          'focus:ring-2 focus:ring-brand focus:border-transparent',
                          errors.quantityOrdered ? 'border-red-300' : 'border-gray-300'
                        )}
                        placeholder="Enter quantity"
                      />
                      {errors.quantityOrdered && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantityOrdered}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => {
                          setFormData({ ...formData, expectedDeliveryDate: e.target.value })
                          setErrors({ ...errors, expectedDeliveryDate: '' })
                        }}
                        className={cn(
                          'w-full px-4 py-3 bg-white border rounded-xl text-base transition-all',
                          'focus:ring-2 focus:ring-brand focus:border-transparent',
                          errors.expectedDeliveryDate ? 'border-red-300' : 'border-gray-300'
                        )}
                      />
                      {errors.expectedDeliveryDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expectedDeliveryDate}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                    placeholder="Add any additional notes about this communication..."
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
                    'bg-brand text-graphite-900 font-semibold',
                    'hover:bg-brand-hover transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'shadow-glow'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Logged!
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Log Communication
                    </>
                  )}
                </button>
              </div>

              {/* Error message */}
              {submitStatus === 'error' && (
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Failed to log communication. Please try again.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
