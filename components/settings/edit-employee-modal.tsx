'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DatePicker } from '@/components/ui/date-picker'

interface EmployeeData {
  userUid: string
  firstName: string
  lastName: string
  employeeId: string | null
  loginId: string
  email: string | null
  alternateEmail: string | null
  phoneNumber: string | null
  alternatePhone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  dateOfBirth: string | null
  bloodGroup: string | null
  department: string | null
  userRole: string
  dateOfJoining: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  garageName: string
  profilePicture?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  idProofType?: string | null
  idProofNumber?: string | null
}

interface EditEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  employee: EmployeeData | null
  field: string
  fieldLabel: string
  fieldType?: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country'
  onSuccess: (updatedData: Partial<EmployeeData>) => void
}

/**
 * EditEmployeeModal - A modal for editing employee profile fields
 *
 * Features:
 * - Client-side validation
 * - Loading states
 * - Error handling
 * - Success feedback
 * - Accessible UI
 */
export function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  field,
  fieldLabel,
  fieldType = 'text',
  onSuccess,
}: EditEmployeeModalProps) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isShowingSuccess = useRef(false)

  useEffect(() => {
    if (isOpen && employee) {
      // Set initial value based on field
      const fieldValue = getInitialValue(employee, field)
      setValue(fieldValue)
      setError(null)
      setSuccess(false)
      isShowingSuccess.current = false
    }
  }, [isOpen, employee, field])

  const getInitialValue = (emp: EmployeeData, fieldName: string): string => {
    const value = (emp as any)[fieldName]
    return value || ''
  }

  const validateField = (fieldName: string, val: string): string | null => {
    if (!val.trim()) {
      return `${fieldLabel} cannot be empty`
    }

    switch (fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(val)) {
          return 'Please enter a valid email address'
        }
        break
      case 'tel':
        const phoneRegex = /^[\d\s\+\-\(\)]+$/
        if (!phoneRegex.test(val) || val.replace(/\D/g, '').length < 10) {
          return 'Please enter a valid phone number (minimum 10 digits)'
        }
        break
      case 'date':
        try {
          new Date(val)
        } catch {
          return 'Please enter a valid date'
        }
        break
      case 'bloodGroup':
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if (!validBloodGroups.includes(val)) {
          return 'Please select a valid blood group'
        }
        break
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    // Validate
    const validationError = validateField(field, value)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Map field names to database column names
      const fieldMapping: Record<string, string> = {
        firstName: 'first_name',
        lastName: 'last_name',
        employeeId: 'employee_id',
        email: 'email',
        alternateEmail: 'alternate_email',
        phoneNumber: 'phone_number',
        alternatePhone: 'alternate_phone',
        address: 'address',
        city: 'city',
        state: 'state',
        zipCode: 'zip_code',
        country: 'country',
        dateOfBirth: 'date_of_birth',
        bloodGroup: 'blood_group',
        department: 'department',
        dateOfJoining: 'date_of_joining',
        emergencyContactName: 'emergency_contact_name',
        emergencyContactPhone: 'emergency_contact_phone',
        emergencyContactRelation: 'emergency_contact_relation',
        idProofType: 'id_proof_type',
        idProofNumber: 'id_proof_number',
      }

      const response = await fetch('/api/employees/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUid: employee.userUid,
          [fieldMapping[field] || field]: value.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update employee')
      }

      // Show success feedback
      setSuccess(true)
      isShowingSuccess.current = true

      // Call onSuccess with updated data
      onSuccess({ [field]: value.trim() } as Partial<EmployeeData>)

      // Close modal after delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderInput = () => {
    switch (fieldType) {
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            className="w-full px-4 py-3 text-base bg-graphite-800 border border-graphite-600 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            autoFocus
          />
        )

      case 'tel':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            className="w-full px-4 py-3 text-base bg-graphite-800 border border-graphite-600 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            autoFocus
          />
        )

      case 'date':
        return (
          <DatePicker
            value={value}
            onChange={setValue}
            placeholder={`Select ${fieldLabel.toLowerCase()}`}
          />
        )

      case 'bloodGroup':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 text-base bg-graphite-800 border border-graphite-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        )

      case 'country':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 text-base bg-graphite-800 border border-graphite-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="">Select Country</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            className="w-full px-4 py-3 text-base bg-graphite-800 border border-graphite-600 rounded-xl text-white placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            autoFocus
          />
        )
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm md:items-center md:justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.2 }}
          className="md:fixed md:inset-0 md:flex md:items-center md:justify-center"
        >
          <div className="md:inline-block bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden md:mt-0 mt-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand/20 to-brand/5 px-6 py-4 border-b border-graphite-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-graphite-900">Edit {fieldLabel}</h2>
                  <p className="text-sm text-graphite-600 mt-1">
                    {employee?.firstName} {employee?.lastName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading || isShowingSuccess.current}
                  className="p-3 h-11 min-h-[44px] w-11 hover:bg-graphite-100 active:bg-graphite-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-graphite-500" />
                </button>
              </div>
            </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Updated successfully!</p>
              </motion.div>
            )}

            {/* Input Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                {fieldLabel}
              </label>
              {renderInput()}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading || isShowingSuccess.current}
                className="flex-1 px-6 py-3.5 min-h-[44px] border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 active:bg-graphite-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isShowingSuccess.current}
                className="flex-1 px-6 py-3.5 min-h-[44px] bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 active:bg-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </form>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
