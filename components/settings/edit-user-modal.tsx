'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserData } from '@/lib/supabase/user-queries'
import type { GarageData } from '@/lib/supabase/garage-queries'
import { DatePicker } from '@/components/ui/date-picker'
import { validateGarageField } from '@/lib/validation/garage-validation'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
  garageData?: GarageData | null
  field: string
  fieldLabel: string
  fieldType?: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country' | 'operatingHours' | 'multiSelect' | 'password'
  onSuccess: (updatedData: Partial<UserData> | any) => void
  isGarageEdit?: boolean
}

/**
 * EditUserModal - A secure modal for editing user profile and garage settings fields
 *
 * Features:
 * - Client-side validation
 * - Loading states
 * - Error handling
 * - Success feedback
 * - Accessible UI
 * - Supports both user and garage fields
 */
export function EditUserModal({
  isOpen,
  onClose,
  userData,
  garageData,
  field,
  fieldLabel,
  fieldType = 'text',
  onSuccess,
  isGarageEdit = false,
}: EditUserModalProps) {
  const [value, setValue] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [updatedLoginId, setUpdatedLoginId] = useState<string | null>(null)
  const isShowingSuccess = useRef(false)

  // Operating hours state
  const [isClosed, setIsClosed] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')

  // Multi-select state
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  // Determine if this is a garage field
  const garageFields = [
    'garageName', 'email', 'phoneNumber', 'alternatePhoneNumber', 'whatsappNumber',
    'address', 'city', 'state', 'zipCode', 'country',
    'gstin', 'businessRegistrationNumber', 'businessType', 'yearEstablished', 'website', 'panNumber',
    'serviceTypes', 'vehicleTypesServiced', 'numberOfServiceBays', 'certifications', 'insuranceDetails',
    'paymentMethods', 'bankName', 'accountNumber', 'ifscCode', 'branch', 'defaultLaborRate', 'invoicePrefix',
    'parkingCapacity', 'waitingAreaAmenities', 'towServiceAvailable', 'pickupDropServiceAvailable',
    'operatingHours', 'taxRate', 'currency', 'billingCycle', 'creditTerms', 'notes'
  ]

  const isGarageField = garageFields.some(f => field.startsWith(f))

  // Helper function to convert 24-hour format (HH:MM) to 12-hour format with AM/PM
  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Helper function to convert 12-hour format with AM/PM to 24-hour format (HH:MM)
  const formatTo24Hour = (time12: string): string => {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!match) return time12

    let [, hours, minutes, ampm] = match
    let hour = parseInt(hours, 10)

    if (ampm?.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12
    } else if (ampm?.toUpperCase() === 'AM' && hour === 12) {
      hour = 0
    }

    return `${hour.toString().padStart(2, '0')}:${minutes}`
  }

  // Reset form when modal opens or field changes
  // Note: We don't reset when showing success to prevent clearing the success message
  useEffect(() => {
    if (isOpen && !isShowingSuccess.current) {
      let currentValue = ''

      if (isGarageField && garageData) {
        // Get value from garage data
        if (field.startsWith('operatingHours.')) {
          const subField = field.split('.')[1]
          currentValue = garageData.operatingHours?.[subField as keyof typeof garageData.operatingHours] || ''
        } else {
          currentValue = (garageData as any)[field] || ''
        }
      } else if (userData) {
        // Get value from user data
        currentValue = (userData as any)[field] || ''
      }

      setValue(currentValue)

      // Parse operating hours value
      if (fieldType === 'operatingHours') {
        if (currentValue.toLowerCase() === 'closed') {
          setIsClosed(true)
        } else {
          setIsClosed(false)
          // Parse time range like "9:00 AM - 6:00 PM"
          const timeMatch = currentValue.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–to]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
          if (timeMatch) {
            // Convert to 24-hour format for time inputs
            const start24 = formatTo24Hour(timeMatch[1])
            const end24 = formatTo24Hour(timeMatch[2])
            setStartTime(start24)
            setEndTime(end24)
            // Set value in proper format
            setValue(`${formatTo12Hour(start24)} - ${formatTo12Hour(end24)}`)
          }
        }
      }

      // Parse multi-select value
      if (fieldType === 'multiSelect') {
        const arrayValue = Array.isArray((garageData as any)[field])
          ? (garageData as any)[field]
          : []
        setSelectedOptions(arrayValue || [])
      }

      setError(null)
      setSuccess(false)
      setUpdatedLoginId(null)
    }

    // Reset the success flag when modal closes
    if (!isOpen) {
      isShowingSuccess.current = false
      setUpdatedLoginId(null)
    }

    // Reset confirm password when modal opens or field changes
    if (isOpen && !isShowingSuccess.current) {
      setConfirmPassword('')
      setOldPassword('')
      setUpdatedLoginId(null)
    }
  }, [isOpen, field, userData, garageData, isGarageField, fieldType])

  if (!isOpen) return null

  // Blood group options
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  // Country options - comprehensive list
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
    'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador',
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
    'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
    'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
    'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ].sort()

  // Service types options for motorcycle garage
  const serviceTypesOptions = [
    'Routine Maintenance',
    'Oil Change',
    'Brake Service',
    'Tire Services',
    'Engine Repair',
    'Transmission Service',
    'Electrical Systems',
    'Suspension Work',
    'Body Work & Paint',
    'Custom Modifications',
    'Performance Tuning',
    'Inspection Services',
    'Battery Services',
    'Chain & Sprocket Service',
    'Wheel Alignment',
    'Exhaust Systems',
    'Fuel System Service',
    'Diagnostics',
    'Restoration',
    'Accessories Installation'
  ]

  // Vehicle types serviced options for motorcycle garage
  const vehicleTypesOptions = [
    'Street Bikes/Motorcycles',
    'Sport Bikes',
    'Cruiser',
    'Touring Bikes',
    'Dual-Sport/Adventure',
    'Off-Road/Dirt Bikes',
    'Scooters',
    'Mopeds',
    'Electric Motorcycles',
    'ATV/Quads',
    'Sidecars',
    'Trikes',
    'Vintage/Classic Motorcycles',
    'Supermoto',
    'Motards'
  ]

  // Get options for multi-select based on field
  const getMultiSelectOptions = (): string[] => {
    if (field === 'serviceTypes') return serviceTypesOptions
    if (field === 'vehicleTypesServiced') return vehicleTypesOptions
    return []
  }

  const validateInput = (inputValue: string): string | null => {
    // Check if this is a garage field
    const garageFields = [
      'garageName', 'email', 'phoneNumber', 'alternatePhoneNumber', 'whatsappNumber',
      'address', 'city', 'state', 'zipCode', 'country',
      'gstin', 'businessRegistrationNumber', 'businessType', 'yearEstablished', 'website', 'panNumber',
      'serviceTypes', 'vehicleTypesServiced', 'numberOfServiceBays', 'certifications', 'insuranceDetails',
      'paymentMethods', 'bankName', 'accountNumber', 'ifscCode', 'branch', 'defaultLaborRate', 'invoicePrefix',
      'parkingCapacity', 'waitingAreaAmenities', 'towServiceAvailable', 'pickupDropServiceAvailable',
      'operatingHours', 'taxRate', 'currency', 'billingCycle', 'creditTerms', 'notes'
    ]

    const isGarageField = garageFields.some(f => field.startsWith(f))

    // Use garage validation for garage fields
    if (isGarageField) {
      const result = validateGarageField(field, inputValue)
      if (!result.isValid && result.error) {
        return result.error
      }
      if (result.warning) {
        // Warning is shown but doesn't block submission
        console.log('Validation warning:', result.warning)
      }
      return null
    }

    // User field validation
    if (!inputValue.trim()) {
      return `${fieldLabel} cannot be empty`
    }

    // Field-specific validation for user fields
    switch (field) {
      case 'email':
      case 'alternateEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(inputValue)) {
          return 'Please enter a valid email address'
        }
        break

      case 'phoneNumber':
      case 'alternatePhone':
      case 'emergencyContactPhone':
        const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/
        if (!phoneRegex.test(inputValue)) {
          return 'Please enter a valid phone number (10-15 digits)'
        }
        break

      case 'zipCode':
        const zipRegex = /^[a-zA-Z0-9\s\-]{3,10}$/
        if (!zipRegex.test(inputValue)) {
          return 'Please enter a valid postal code'
        }
        break

      case 'dateOfBirth':
      case 'dateOfJoining':
        const date = new Date(inputValue)
        if (isNaN(date.getTime())) {
          return 'Please enter a valid date'
        }
        // Check if date is not in the future for date of birth
        if (field === 'dateOfBirth' && date > new Date()) {
          return 'Date of birth cannot be in the future'
        }
        break

      case 'password':
        if (inputValue.length < 6) {
          return 'Password must be at least 6 characters long'
        }
        break
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // For password fields, validate old password and confirmation
    if (fieldType === 'password') {
      if (!oldPassword) {
        setError('Please enter your current password')
        return
      }
      if (value !== confirmPassword) {
        setError('New passwords do not match')
        return
      }
    }

    // For multi-select, validate that at least one option is selected
    if (fieldType === 'multiSelect' && selectedOptions.length === 0) {
      setError(`Please select at least one ${fieldLabel.toLowerCase()}`)
      return
    }

    // Validate input (skip for multi-select as it's handled above)
    const validationError = fieldType !== 'multiSelect' ? validateInput(value) : null
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      if (isGarageEdit) {
        // Handle garage update - call onSuccess directly without API call
        // The parent component will handle the database update
        let updateData: any = {}

        // Handle multi-select fields
        if (fieldType === 'multiSelect') {
          updateData = {
            [field]: selectedOptions,
          }
        }
        // Handle nested fields like operatingHours.weekdays
        else if (field.includes('.')) {
          const [parent, child] = field.split('.')
          updateData = {
            [parent]: {
              [child]: value,
            },
          }
        } else {
          updateData = {
            [field]: value,
          }
        }

        onSuccess(updateData)

        // Show success message
        isShowingSuccess.current = true
        setSuccess(true)

        // Close modal after a delay
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        // Handle user update - call API
        if (!userData?.userUid) {
          setError('User information not available')
          setIsLoading(false)
          return
        }

        // Call the update API
        const response = await fetch('/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userUid: userData.userUid,
            updates: fieldType === 'password' ? {
              [field]: value,
              oldPassword: oldPassword,
            } : {
              [field]: value,
            },
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to update. Please try again.')
        }

        // Show success message
        isShowingSuccess.current = true
        setSuccess(true)

        // Extract new login ID if present (for name changes)
        const newLoginId = data.newLoginId

        // Call success callback with updated data
        onSuccess({
          [field]: value,
          ...(newLoginId && { loginId: newLoginId }),
        })

        // If login ID changed, update the success message
        if (newLoginId) {
          console.log('Login ID updated to:', newLoginId)
          // Store the new login ID to display in the modal
          setUpdatedLoginId(newLoginId)
          // Close modal after a longer delay to show the new login ID
          setTimeout(() => {
            onClose()
          }, 3500)
        } else {
          // Close modal after normal delay
          setTimeout(() => {
            onClose()
          }, 1500)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      isShowingSuccess.current = false
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-graphite-800 rounded-2xl border border-graphite-700 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-graphite-700">
            <h3 className="text-xl font-semibold text-brand">Edit {fieldLabel}</h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg hover:bg-graphite-700 transition-colors",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <X className="h-5 w-5 text-graphite-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current Value Display - don't show for password */}
            {fieldType !== 'password' && ((isGarageEdit && garageData && (garageData as any)[field]) || (!isGarageEdit && userData && (userData as any)[field])) ? (
              <div className="p-3 bg-graphite-900/50 rounded-lg border border-graphite-700">
                <p className="text-sm text-graphite-400 mb-1">Current value</p>
                <p className="text-white font-medium">
                  {isGarageEdit && garageData ? (garageData as any)[field] : (userData as any)[field]}
                </p>
              </div>
            ) : null}

            {/* Input Field */}
            <div>
              {fieldType !== 'password' && (
                <label htmlFor={field} className="block text-sm font-medium text-graphite-300 mb-2">
                  New {fieldLabel}
                </label>
              )}
              {fieldType === 'date' ? (
                <DatePicker
                  value={value}
                  onChange={(date) => setValue(date)}
                  placeholder={`Select ${fieldLabel.toLowerCase()}`}
                />
              ) : fieldType === 'bloodGroup' ? (
                /* Blood Group Selector - Click to select balloon */
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((group) => (
                    <motion.button
                      key={group}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setValue(group)}
                      disabled={isLoading || success}
                      className={cn(
                        "relative px-3 py-3 rounded-xl border-2 font-bold text-lg transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        value === group
                          ? "bg-brand border-brand text-graphite-900 shadow-lg shadow-brand/30"
                          : "bg-graphite-900 border-graphite-700 text-white hover:border-brand/50 hover:bg-graphite-800"
                      )}
                    >
                      {group}
                      {value === group && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-3 w-3 text-graphite-900" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : fieldType === 'country' ? (
                /* Country Dropdown Selector */
                <div className="relative">
                  <select
                    id={field}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isLoading || success}
                    className={cn(
                      "w-full px-4 py-3 bg-graphite-900 border border-graphite-700 rounded-xl appearance-none",
                      "text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-200 cursor-pointer"
                    )}
                  >
                    <option value="" disabled className="bg-graphite-800 text-graphite-400">
                      Select a country
                    </option>
                    {countries.map((country) => (
                      <option
                        key={country}
                        value={country}
                        className="bg-graphite-800 text-white"
                      >
                        {country}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-brand"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              ) : fieldType === 'operatingHours' ? (
                /* Operating Hours Selector - Closed toggle or time range */
                <div className="space-y-4">
                  {/* Closed toggle */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const newClosedState = !isClosed
                      setIsClosed(newClosedState)
                      if (newClosedState) {
                        setValue('Closed')
                      } else {
                        setValue(`${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`)
                      }
                    }}
                    disabled={isLoading || success}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isClosed
                        ? "bg-status-error border-status-error text-white shadow-lg shadow-status-error/30"
                        : "bg-graphite-900 border-graphite-700 text-graphite-300 hover:border-status-error/50"
                    )}
                  >
                    {isClosed ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Closed
                      </span>
                    ) : (
                      'Mark as Closed'
                    )}
                  </motion.button>

                  {/* Time range selector - shown when not closed */}
                  {!isClosed && (
                    <div className="space-y-3">
                      <p className="text-sm text-graphite-400">Or select operating hours:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Start Time */}
                        <div>
                          <label className="block text-sm font-medium text-graphite-300 mb-2">
                            Open Time
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => {
                              const newStartTime = e.target.value
                              setStartTime(newStartTime)
                              setValue(`${formatTo12Hour(newStartTime)} - ${formatTo12Hour(endTime)}`)
                            }}
                            disabled={isLoading || success}
                            className={cn(
                              "w-full px-4 py-3 bg-graphite-900 border border-graphite-700 rounded-xl",
                              "text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "transition-all duration-200"
                            )}
                          />
                        </div>

                        {/* End Time */}
                        <div>
                          <label className="block text-sm font-medium text-graphite-300 mb-2">
                            Close Time
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => {
                              const newEndTime = e.target.value
                              setEndTime(newEndTime)
                              setValue(`${formatTo12Hour(startTime)} - ${formatTo12Hour(newEndTime)}`)
                            }}
                            disabled={isLoading || success}
                            className={cn(
                              "w-full px-4 py-3 bg-graphite-900 border border-graphite-700 rounded-xl",
                              "text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "transition-all duration-200"
                            )}
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="p-3 bg-brand/10 border border-brand/30 rounded-lg">
                        <p className="text-xs text-brand font-medium mb-1">Preview:</p>
                        <p className="text-white font-semibold">{formatTo12Hour(startTime)} - {formatTo12Hour(endTime)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : fieldType === 'multiSelect' ? (
                /* Multi-Select Balloon Selector */
                <div className="space-y-4">
                  <p className="text-sm text-graphite-400">Select all that apply:</p>
                  <div className="flex flex-wrap gap-2">
                    {getMultiSelectOptions().map((option) => {
                      const isSelected = selectedOptions.includes(option)
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedOptions(selectedOptions.filter((o) => o !== option))
                            } else {
                              setSelectedOptions([...selectedOptions, option])
                            }
                          }}
                          disabled={isLoading || success}
                          className={cn(
                            "relative px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            isSelected
                              ? "bg-brand border-brand text-graphite-900 shadow-lg shadow-brand/30"
                              : "bg-graphite-900 border-graphite-700 text-white hover:border-brand/50 hover:bg-graphite-800"
                          )}
                        >
                          {option}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand flex items-center justify-center"
                            >
                              <CheckCircle2 className="h-3 w-3 text-graphite-900" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Selection Summary */}
                  {selectedOptions.length > 0 && (
                    <div className="p-3 bg-brand/10 border border-brand/30 rounded-lg">
                      <p className="text-xs text-brand font-medium mb-1">
                        {selectedOptions.length} {selectedOptions.length === 1 ? 'option' : 'options'} selected
                      </p>
                      <p className="text-white text-sm">{selectedOptions.join(', ')}</p>
                    </div>
                  )}
                </div>
              ) : fieldType === 'password' ? (
                /* Password fields with old password, new password, and confirmation */
                <div className="space-y-4">
                  {/* Old Password */}
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-graphite-300 mb-2">
                      Old Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={isLoading || success}
                        className={cn(
                          "w-full px-4 py-3 pr-12 bg-graphite-900 border border-graphite-700 rounded-xl",
                          "text-white placeholder:text-graphite-500",
                          "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "transition-all duration-200"
                        )}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        disabled={isLoading || success}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-graphite-200 transition-colors disabled:opacity-50"
                        aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                      >
                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-graphite-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isLoading || success}
                        className={cn(
                          "w-full px-4 py-3 pr-12 bg-graphite-900 border border-graphite-700 rounded-xl",
                          "text-white placeholder:text-graphite-500",
                          "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "transition-all duration-200"
                        )}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading || success}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-graphite-200 transition-colors disabled:opacity-50"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-graphite-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading || success}
                        className={cn(
                          "w-full px-4 py-3 pr-12 bg-graphite-900 border border-graphite-700 rounded-xl",
                          "text-white placeholder:text-graphite-500",
                          "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "transition-all duration-200"
                        )}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading || success}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-graphite-200 transition-colors disabled:opacity-50"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type={fieldType}
                  id={field}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isLoading || success}
                  className={cn(
                    "w-full px-4 py-3 bg-graphite-900 border border-graphite-700 rounded-xl",
                    "text-white placeholder:text-graphite-500",
                    "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200"
                  )}
                  placeholder={`Enter new ${fieldLabel.toLowerCase()}`}
                  autoComplete="off"
                />
              )}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-status-error/10 border border-status-error/30 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
                  <p className="text-sm text-status-error flex-1">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-status-success/10 border border-status-success/30 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-status-success shrink-0 mt-0.5" />
                  <div className="text-sm text-status-success flex-1">
                    <p className="font-medium mb-1">{fieldLabel} updated successfully!</p>
                    {/* Show special message for login ID changes */}
                    {updatedLoginId && (field === 'firstName' || field === 'lastName') && (
                      <>
                        <p className="text-xs opacity-90 mb-2">
                          Your login ID has been automatically updated to:
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand/20 rounded-lg border border-brand/30">
                          <span className="text-xs font-mono font-bold text-brand">{updatedLoginId}</span>
                        </div>
                        <p className="text-xs opacity-90 mt-2">
                          Please use this new ID for your next login.
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading || success}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl font-semibold",
                  "bg-graphite-700 text-white",
                  "hover:bg-graphite-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200"
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || success}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl font-semibold",
                  "bg-brand text-graphite-900",
                  "hover:bg-brand/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200",
                  "shadow-lg shadow-brand/20"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : success ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
