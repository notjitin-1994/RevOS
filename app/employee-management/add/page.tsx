'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  Check,
  Loader2,
  ChevronDown,
  Wand2,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Add Employee Page
 *
 * Form to add a new employee with session-based auto-save.
 * Collects: first_name, last_name, user_role, email, phone_number
 */

interface FormData {
  firstName: string
  lastName: string
  employeeId: string
  userRole: string
  email: string
  phoneNumber: string
}

const STORAGE_KEY = 'add_employee_form_data'

export default function AddEmployeePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    employeeId: '',
    userRole: '',
    email: '',
    phoneNumber: '',
  })
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  // Employee ID Generator Modal state
  const [showEmployeeIdModal, setShowEmployeeIdModal] = useState(false)
  const [prefix, setPrefix] = useState('EMP')
  const [suffix, setSuffix] = useState('')
  const [generatedNumber, setGeneratedNumber] = useState('')

  // Fetch user roles from database on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/user-roles')
        const result = await response.json()

        console.log('User roles API response:', result)

        if (result.success && result.roles) {
          console.log('Fetched roles:', result.roles)
          setUserRoles(result.roles)
        } else {
          console.error('Failed to fetch user roles:', result.error)
        }
      } catch (error) {
        console.error('Error fetching user roles:', error)
      } finally {
        setIsLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  // Load saved data from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Restore all fields except employeeId (always start fresh)
        setFormData((prev) => ({
          ...prev,
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          employeeId: '', // Always empty on initialization
          userRole: parsed.userRole || '',
          email: parsed.email || '',
          phoneNumber: parsed.phoneNumber || '',
        }))
        if (parsed.timestamp) {
          setLastSaved(new Date(parsed.timestamp))
        }
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
  }, [])

  // Auto-save to session storage whenever form data changes
  useEffect(() => {
    if (formData.firstName || formData.lastName || formData.userRole || formData.email || formData.phoneNumber) {
      const dataToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userRole: formData.userRole,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        timestamp: new Date().toISOString(),
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
      setLastSaved(new Date())

      // Show saved indicator
      setShowSavedIndicator(true)
      const timer = setTimeout(() => setShowSavedIndicator(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [formData])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const openEmployeeIdModal = () => {
    // Generate a new random 6-digit number
    const randomNum = Math.floor(Math.random() * 900000) + 100000
    setGeneratedNumber(randomNum.toString())
    setShowEmployeeIdModal(true)
  }

  const applyGeneratedId = () => {
    const id = `${prefix}${generatedNumber}${suffix}`
    handleInputChange('employeeId', id)
    setShowEmployeeIdModal(false)
  }

  const regenerateNumber = () => {
    const randomNum = Math.floor(Math.random() * 900000) + 100000
    setGeneratedNumber(randomNum.toString())
  }

  const handleBack = () => {
    router.push('/employee-management')
  }

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear the form? This will remove all saved data.')) {
      setFormData({
        firstName: '',
        lastName: '',
        employeeId: '',
        userRole: '',
        email: '',
        phoneNumber: '',
      })
      sessionStorage.removeItem(STORAGE_KEY)
      setLastSaved(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.userRole || !formData.email || !formData.phoneNumber) {
      alert('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    // Phone validation (basic check for numbers and common formats)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(formData.phoneNumber) || formData.phoneNumber.length < 10) {
      alert('Please enter a valid phone number (minimum 10 digits)')
      return
    }

    setIsSubmitting(true)

    try {
      // Get current user from sessionStorage to inherit garage details
      const userStr = sessionStorage.getItem('user')
      if (!userStr) {
        alert('You must be logged in to add an employee')
        router.push('/login')
        return
      }

      const currentUser = JSON.parse(userStr)
      const parentUserUid = currentUser.userUid

      if (!parentUserUid) {
        alert('Invalid user session. Please login again.')
        router.push('/login')
        return
      }

      console.log('Adding employee with parent UID:', parentUserUid)

      // Call the API to create the employee
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeId: formData.employeeId || null,
          userRole: formData.userRole,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          parentUserUid: parentUserUid,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error adding employee:', result)
        alert(`Failed to add employee: ${result.error || 'Unknown error'}`)
        setIsSubmitting(false)
        return
      }

      console.log('Employee added successfully:', result)

      // Clear form and session storage after successful submission
      sessionStorage.removeItem(STORAGE_KEY)
      setFormData({
        firstName: '',
        lastName: '',
        employeeId: '',
        userRole: '',
        email: '',
        phoneNumber: '',
      })
      setLastSaved(null)

      setIsSubmitting(false)
      alert(`Employee added successfully!\n\nLogin ID: ${result.employee.loginId}\nPassword: To be set by user`)
      router.push('/employee-management')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred while adding the employee. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dfe5ef' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                Add New Employee
              </h1>
              <p className="text-sm md:text-base text-graphite-600 mt-1">
                Fill in the details to add a new team member
              </p>
            </div>

            {/* Auto-save indicator */}
            {showSavedIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-status-success/10 text-status-success border border-status-success/20 rounded-xl text-sm font-medium"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Auto-saved</span>
              </motion.div>
            )}

            {lastSaved && !showSavedIndicator && (
              <div className="text-xs text-graphite-500">
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </motion.header>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Single Card with All Sections */}
          <div className="bg-white backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            {/* Name Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600">Basic details about the employee</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    First Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Last Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Employee ID */}
                <div className="space-y-2">
                  <label htmlFor="employeeId" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Employee ID <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      placeholder="e.g., EMP001"
                      className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openEmployeeIdModal}
                      className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-md flex items-center justify-center"
                      title="Generate Employee ID"
                    >
                      <Wand2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Role & Position</h2>
                  <p className="text-sm text-gray-600">Job role and responsibilities</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="userRole" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  User Role <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="userRole"
                    value={formData.userRole}
                    onChange={(e) => handleInputChange('userRole', e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                    required
                    disabled={isLoadingRoles}
                  >
                    <option value="">{isLoadingRoles ? 'Loading roles...' : 'Select a role'}</option>
                    {userRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-600">How to reach the employee</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Email Address <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="employee@example.com"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Phone Number <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-end"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearForm}
                  className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-md border-2 border-gray-300"
                >
                  Clear Form
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Add Employee
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.form>

        {/* Employee ID Generator Modal */}
        {showEmployeeIdModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Wand2 className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Generate Employee ID</h3>
                    <p className="text-sm text-gray-600">Customize your employee ID format</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmployeeIdModal(false)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Preview</p>
                    <div className="flex items-center justify-center gap-2 text-xl font-mono font-bold">
                      <span className="text-gray-700">{prefix}</span>
                      <span className="text-gray-900">{generatedNumber}</span>
                      <span className="text-gray-700">{suffix}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {prefix}{generatedNumber}{suffix}
                    </p>
                  </div>
                </div>

                {/* Prefix Input */}
                <div className="space-y-2">
                  <label htmlFor="prefix" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Prefix
                  </label>
                  <input
                    type="text"
                    id="prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g., EMP"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>

                {/* Number Display with Regenerate Button */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Generated Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedNumber}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-900 font-mono text-center focus:outline-none cursor-default"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={regenerateNumber}
                      className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-md flex items-center justify-center"
                      title="Regenerate Number"
                    >
                      <Loader2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500">6-digit random number (100000-999999)</p>
                </div>

                {/* Suffix Input */}
                <div className="space-y-2">
                  <label htmlFor="suffix" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Suffix <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="suffix"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value.toUpperCase())}
                    placeholder="e.g., -2024"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEmployeeIdModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyGeneratedId}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-md"
                >
                  Apply ID
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
