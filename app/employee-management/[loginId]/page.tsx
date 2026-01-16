'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Shield,
  Calendar,
  Edit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  Circle,
  BarChart3,
  Target,
  Award,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { EditEmployeeModal } from '@/components/settings/edit-employee-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Employee Profile Page
 *
 * Displays comprehensive employee information in a premium card layout
 * Dynamic route: /employee-management/[loginId]
 */

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

export default function EmployeeProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('employee-information')

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingField, setEditingField] = useState('')
  const [editingFieldLabel, setEditingFieldLabel] = useState('')
  const [editingFieldType, setEditingFieldType] = useState<'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country'>('text')

  useEffect(() => {
    loadEmployee()
  }, [params])

  const loadEmployee = async () => {
    try {
      // Get the loginId from the route parameter
      const loginId = params.loginId as string

      console.log('Fetching employee for login_id:', loginId)

      if (!loginId || loginId === 'undefined') {
        throw new Error('Invalid employee identifier')
      }

      // Fetch employee by login_id
      const response = await fetch(`/api/employees/by-login/${loginId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch employee')
      }

      const result = await response.json()

      if (!result.success || !result.employee) {
        throw new Error('Employee not found')
      }

      setEmployee(result.employee)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading employee:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  // Open edit modal for a specific field
  const openEditModal = (
    field: string,
    fieldLabel: string,
    fieldType: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country' = 'text'
  ) => {
    setEditingField(field)
    setEditingFieldLabel(fieldLabel)
    setEditingFieldType(fieldType)
    setIsEditModalOpen(true)
  }

  // Handle successful update
  const handleUpdateSuccess = (updatedData: Partial<EmployeeData>) => {
    if (employee) {
      const updatedEmployee = { ...employee, ...updatedData }
      setEmployee(updatedEmployee)
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efffb1]">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="inline-block h-16 w-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-brand/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-brand border-r-transparent border-b-transparent animate-spin" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-graphite-600 font-medium"
          >
            Loading employee profile...
          </motion.p>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efffb1] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-graphite-900">Error</h2>
              <p className="text-sm text-graphite-600 mt-0.5">{error || 'Employee not found'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/employee-management')}
            className="w-full bg-brand text-graphite-900 font-semibold py-3.5 px-4 rounded-xl hover:bg-brand/90 transition-all duration-200 shadow-lg shadow-brand/20 mt-6 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <main className="flex-1 overflow-y-auto bg-[#efffb1] pb-safe md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/employee-management')}
                className="p-3 h-11 min-h-[44px] hover:bg-white/50 rounded-xl transition-all active:bg-white/70"
              >
                <ArrowLeft className="h-5 w-5 text-graphite-700" />
              </motion.button>
              <div className="h-10 w-1 bg-graphite-600 rounded-full" />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                  Employee Profile
                </h1>
                <p className="text-sm md:text-base text-graphite-600 mt-1 line-clamp-1">
                  View and manage employee information
                </p>
              </div>
            </div>
          </motion.header>

          {/* Profile Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 md:mb-8"
          >
            <div className="hidden md:block relative overflow-hidden rounded-2xl bg-graphite-800 backdrop-blur-sm border border-graphite-700 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-graphite-600 via-graphite-600/80 to-transparent" />

              <div className="relative p-4 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group mx-auto lg:mx-0"
                  >
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border-2 border-brand/30 shadow-lg shadow-brand/20 overflow-hidden">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 md:h-12 md:w-12 text-brand" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-4 w-4 text-graphite-900" />
                    </div>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-brand mb-1">
                          {employee.firstName} {employee.lastName}
                        </h2>
                        <p className="text-sm md:text-base text-graphite-300 flex items-center justify-center lg:justify-start gap-2">
                          <Building className="h-4 w-4 text-brand" />
                          {employee.garageName}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <div className="flex items-center justify-center lg:justify-start gap-2 px-3 md:px-4 py-2 bg-brand/10 border border-brand/30 rounded-xl">
                        <Shield className="h-4 w-4 text-brand" />
                        <span className="text-brand font-semibold text-sm capitalize">
                          {employee.userRole}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile version */}
            <div className="md:hidden relative overflow-hidden rounded-2xl bg-graphite-800 backdrop-blur-sm border border-graphite-700 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-graphite-600 via-graphite-600/80 to-transparent" />
              <div className="relative p-6">
                <div className="flex flex-col gap-4">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="relative group mx-auto"
                  >
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border-2 border-brand/30 shadow-lg shadow-brand/20 overflow-hidden">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-brand" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand flex items-center justify-center shadow-lg border-2 border-graphite-800">
                      <CheckCircle2 className="h-4 w-4 text-graphite-900" />
                    </div>
                  </motion.div>

                  <div className="text-center">
                    <h2 className="text-xl font-bold text-brand mb-2">
                      {employee.firstName} {employee.lastName}
                    </h2>
                    <p className="text-sm text-graphite-300 flex items-center justify-center gap-2 mb-3">
                      <Building className="h-4 w-4 text-brand" />
                      {employee.garageName}
                    </p>

                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand/10 border border-brand/30 rounded-xl min-h-[44px]">
                      <Shield className="h-4 w-4 text-brand" />
                      <span className="text-brand font-semibold text-sm capitalize">
                        {employee.userRole}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-4 md:mb-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full md:w-auto md:justify-start justify-center bg-graphite-800/80 border border-graphite-700 gap-1 md:gap-1">
                <TabsTrigger
                  value="employee-information"
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1.5 md:gap-2 min-h-[44px] px-3 md:px-4 active:scale-[0.98] data-[state=active]:bg-brand data-[state=active]:text-graphite-900"
                >
                  <User className="hidden md:block h-4 w-4 shrink-0" strokeWidth={2.5} />
                  <span className="text-xs md:text-sm font-medium">Employee Information</span>
                </TabsTrigger>
                <TabsTrigger
                  value="work-allocation"
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1.5 md:gap-2 min-h-[44px] px-3 md:px-4 active:scale-[0.98] data-[state=active]:bg-brand data-[state=active]:text-graphite-900"
                >
                  <Briefcase className="hidden md:block h-4 w-4 shrink-0" strokeWidth={2.5} />
                  <span className="text-xs md:text-sm font-medium">Work Allocation</span>
                </TabsTrigger>
                <TabsTrigger
                  value="productivity"
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1.5 md:gap-2 min-h-[44px] px-3 md:px-4 active:scale-[0.98] data-[state=active]:bg-brand data-[state=active]:text-graphite-900"
                >
                  <TrendingUp className="hidden md:block h-4 w-4 shrink-0" strokeWidth={2.5} />
                  <span className="text-xs md:text-sm font-medium">Productivity</span>
                </TabsTrigger>
              </TabsList>

              {/* Employee Information Tab */}
              <TabsContent value="employee-information" className="mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Personal Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:row-span-2"
                  >
                    <InfoCard
                      title="Personal Information"
                      icon={User}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <InfoItem label="First Name" value={employee.firstName} field="firstName" onEdit={openEditModal} />
                      <InfoItem label="Last Name" value={employee.lastName} field="lastName" onEdit={openEditModal} />
                      <InfoItem label="Employee ID" value={employee.employeeId} field="employeeId" onEdit={openEditModal} />
                      <InfoItem label="Login ID" value={employee.loginId} />
                      <InfoItem label="Primary Email" value={employee.email} field="email" fieldType="email" onEdit={openEditModal} />
                      <InfoItem label="Alternate Email" value={employee.alternateEmail} field="alternateEmail" fieldType="email" onEdit={openEditModal} />
                      <InfoItem label="Primary Phone" value={employee.phoneNumber} field="phoneNumber" fieldType="tel" onEdit={openEditModal} />
                      <InfoItem label="Alternate Phone" value={employee.alternatePhone} field="alternatePhone" fieldType="tel" onEdit={openEditModal} />
                      <InfoItem
                        label="Date of Birth"
                        value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : undefined}
                        field="dateOfBirth"
                        fieldType="date"
                        onEdit={openEditModal}
                      />
                      <InfoItem label="Blood Group" value={employee.bloodGroup} field="bloodGroup" fieldType="bloodGroup" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Location Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="h-full"
                  >
                    <InfoCard
                      title="Location Information"
                      icon={MapPin}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                      className="h-full"
                    >
                      <InfoItem label="Street Address" value={employee.address} field="address" onEdit={openEditModal} />
                      <InfoItem label="City" value={employee.city} field="city" onEdit={openEditModal} />
                      <InfoItem label="State/Province" value={employee.state} field="state" onEdit={openEditModal} />
                      <InfoItem label="Postal Code" value={employee.zipCode} field="zipCode" onEdit={openEditModal} />
                      <InfoItem label="Country" value={employee.country} field="country" fieldType="country" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Emergency Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="h-full"
                  >
                    <InfoCard
                      title="Emergency Contact"
                      icon={Phone}
                      iconBg="bg-status-error/10"
                      iconColor="text-status-error"
                      className="h-full"
                    >
                      <InfoItem
                        label="Contact Name"
                        value={employee.emergencyContactName}
                        field="emergencyContactName"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Contact Phone"
                        value={employee.emergencyContactPhone}
                        field="emergencyContactPhone"
                        fieldType="tel"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Relationship"
                        value={employee.emergencyContactRelation}
                        field="emergencyContactRelation"
                        onEdit={openEditModal}
                      />
                    </InfoCard>
                  </motion.div>

                  {/* Identity Verification */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="h-full"
                  >
                    <InfoCard
                      title="Identity Verification"
                      icon={Shield}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                      className="h-full"
                    >
                      <InfoItem
                        label="ID Proof Type"
                        value={employee.idProofType}
                        field="idProofType"
                        onEdit={openEditModal}
                      />
                      <InfoItem label="ID Number" value={employee.idProofNumber} field="idProofNumber" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Account Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                  >
                    <InfoCard
                      title="Account Details"
                      icon={Calendar}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <InfoItem
                        label="Account Status"
                        value={employee.isActive ? 'Active' : 'Inactive'}
                        valueColor={employee.isActive ? 'text-status-success' : 'text-status-error'}
                      />
                      <InfoItem
                        label="Department"
                        value={employee.department}
                        field="department"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Date of Joining"
                        value={employee.dateOfJoining ? formatDate(employee.dateOfJoining) : undefined}
                        field="dateOfJoining"
                        fieldType="date"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Member Since"
                        value={formatDate(employee.createdAt)}
                      />
                      <InfoItem
                        label="Last Updated"
                        value={formatDate(employee.updatedAt)}
                      />
                    </InfoCard>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Work Allocation Tab */}
              <TabsContent value="work-allocation" className="mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Active Jobs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:row-span-2"
                  >
                    <InfoCard
                      title="Active Jobs"
                      icon={Briefcase}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      {/* Job Item 1 */}
                      <div className="py-3 px-3 -mx-3 border-b border-graphite-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium truncate">Job #2024-001</span>
                              <span className="px-2 py-0.5 bg-status-success/20 text-status-success text-xs font-medium rounded-full">In Progress</span>
                            </div>
                            <p className="text-sm text-graphite-400 mb-2">BMW R 1250 GS - Brake Pad Replacement</p>
                            <div className="flex items-center gap-2 text-xs text-graphite-500">
                              <Clock className="h-3 w-3" />
                              <span>Started 2 hours ago</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Item 2 */}
                      <div className="py-3 px-3 -mx-3 border-b border-graphite-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium truncate">Job #2024-003</span>
                              <span className="px-2 py-0.5 bg-brand/20 text-brand text-xs font-medium rounded-full">Assigned</span>
                            </div>
                            <p className="text-sm text-graphite-400 mb-2">Honda CBR 600RR - Oil Change & Filter</p>
                            <div className="flex items-center gap-2 text-xs text-graphite-500">
                              <Calendar className="h-3 w-3" />
                              <span>Scheduled for tomorrow</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Item 3 */}
                      <div className="py-3 px-3 -mx-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium truncate">Job #2024-005</span>
                              <span className="px-2 py-0.5 bg-brand/20 text-brand text-xs font-medium rounded-full">Assigned</span>
                            </div>
                            <p className="text-sm text-graphite-400 mb-2">Kawasaki Ninja 400 - Chain Adjustment</p>
                            <div className="flex items-center gap-2 text-xs text-graphite-500">
                              <Calendar className="h-3 w-3" />
                              <span>Scheduled for Jan 20</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </InfoCard>
                  </motion.div>

                  {/* Weekly Schedule */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <InfoCard
                      title="Weekly Schedule"
                      icon={Calendar}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                      className="h-full"
                    >
                      <div className="space-y-2">
                        {[
                          { day: 'Monday', date: 'Jan 13', hours: '9:00 AM - 6:00 PM', jobs: 4 },
                          { day: 'Tuesday', date: 'Jan 14', hours: '9:00 AM - 6:00 PM', jobs: 5 },
                          { day: 'Wednesday', date: 'Jan 15', hours: '9:00 AM - 6:00 PM', jobs: 3 },
                          { day: 'Thursday', date: 'Jan 16', hours: '9:00 AM - 6:00 PM', jobs: 6 },
                          { day: 'Friday', date: 'Jan 17', hours: '9:00 AM - 6:00 PM', jobs: 4 },
                        ].map((schedule, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-graphite-700/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                <span className="text-brand text-xs font-semibold">{schedule.day.slice(0, 3)}</span>
                              </div>
                              <div>
                                <p className="text-sm text-white font-medium">{schedule.day}</p>
                                <p className="text-xs text-graphite-500">{schedule.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-graphite-400">{schedule.hours}</p>
                              <p className="text-xs text-brand font-medium">{schedule.jobs} jobs</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </InfoCard>
                  </motion.div>

                  {/* Task Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    <InfoCard
                      title="Task Summary"
                      icon={CheckCircle}
                      iconBg="bg-status-success/10"
                      iconColor="text-status-success"
                      className="h-full"
                    >
                      <div className="grid grid-cols-2 gap-4 p-2">
                        <div className="text-center p-3 bg-graphite-700/30 rounded-xl">
                          <p className="text-2xl font-bold text-status-success mb-1">24</p>
                          <p className="text-xs text-graphite-400">Completed</p>
                        </div>
                        <div className="text-center p-3 bg-graphite-700/30 rounded-xl">
                          <p className="text-2xl font-bold text-brand mb-1">8</p>
                          <p className="text-xs text-graphite-400">In Progress</p>
                        </div>
                        <div className="text-center p-3 bg-graphite-700/30 rounded-xl">
                          <p className="text-2xl font-bold text-graphite-400 mb-1">5</p>
                          <p className="text-xs text-graphite-400">Pending</p>
                        </div>
                        <div className="text-center p-3 bg-graphite-700/30 rounded-xl">
                          <p className="text-2xl font-bold text-status-error mb-1">1</p>
                          <p className="text-xs text-graphite-400">Overdue</p>
                        </div>
                      </div>
                    </InfoCard>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Productivity Tab */}
              <TabsContent value="productivity" className="mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {/* Performance Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <InfoCard
                      title="Performance Overview"
                      icon={BarChart3}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-graphite-400">Job Completion Rate</span>
                            <span className="text-sm text-white font-semibold">94%</span>
                          </div>
                          <div className="h-2 bg-graphite-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand to-status-success rounded-full" style={{ width: '94%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-graphite-400">On-Time Delivery</span>
                            <span className="text-sm text-white font-semibold">89%</span>
                          </div>
                          <div className="h-2 bg-graphite-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand to-status-success rounded-full" style={{ width: '89%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-graphite-400">Customer Satisfaction</span>
                            <span className="text-sm text-white font-semibold">4.7/5.0</span>
                          </div>
                          <div className="h-2 bg-graphite-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand to-status-success rounded-full" style={{ width: '94%' }} />
                          </div>
                        </div>
                      </div>
                    </InfoCard>
                  </motion.div>

                  {/* Weekly Performance */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                  >
                    <InfoCard
                      title="Weekly Performance"
                      icon={Activity}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <div className="space-y-3">
                        {[
                          { day: 'Mon', jobs: 4, completed: 4 },
                          { day: 'Tue', jobs: 5, completed: 5 },
                          { day: 'Wed', jobs: 3, completed: 2 },
                          { day: 'Thu', jobs: 6, completed: 6 },
                          { day: 'Fri', jobs: 4, completed: 4 },
                        ].map((item) => (
                          <div key={item.day} className="flex items-center gap-3">
                            <span className="text-xs text-graphite-400 w-8">{item.day}</span>
                            <div className="flex-1 h-8 bg-graphite-700/30 rounded-lg flex items-end gap-1 p-1">
                              {Array.from({ length: item.jobs }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "flex-1 rounded-sm",
                                    i < item.completed ? "bg-brand" : "bg-graphite-600"
                                  )}
                                  style={{ height: '100%' }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-white font-medium w-12 text-right">{item.completed}/{item.jobs}</span>
                          </div>
                        ))}
                      </div>
                    </InfoCard>
                  </motion.div>

                  {/* Key Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <InfoCard
                      title="Key Metrics"
                      icon={Target}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 px-3 bg-graphite-700/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-brand" />
                            <span className="text-sm text-graphite-400">Total Jobs</span>
                          </div>
                          <span className="text-lg font-bold text-white">156</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 bg-graphite-700/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-brand" />
                            <span className="text-sm text-graphite-400">Avg. Job Time</span>
                          </div>
                          <span className="text-lg font-bold text-white">2.4h</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 bg-graphite-700/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-brand" />
                            <span className="text-sm text-graphite-400">Efficiency Score</span>
                          </div>
                          <span className="text-lg font-bold text-status-success">92%</span>
                        </div>
                      </div>
                    </InfoCard>
                  </motion.div>

                  {/* Monthly Trends */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="xl:col-span-2"
                  >
                    <InfoCard
                      title="Monthly Trends"
                      icon={TrendingUp}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { month: 'Oct', jobs: 142, trend: 'up' },
                          { month: 'Nov', jobs: 158, trend: 'up' },
                          { month: 'Dec', jobs: 165, trend: 'up' },
                          { month: 'Jan', jobs: 156, trend: 'down' },
                          { month: 'Feb', jobs: 0, trend: 'neutral' },
                          { month: 'Mar', jobs: 0, trend: 'neutral' },
                        ].map((item) => (
                          <div key={item.month} className="text-center p-3 bg-graphite-700/20 rounded-xl">
                            <p className="text-xs text-graphite-400 mb-1">{item.month}</p>
                            <p className="text-lg font-bold text-white mb-1">{item.jobs}</p>
                            <div className={cn(
                              "flex items-center justify-center gap-1 text-xs",
                              item.trend === 'up' ? "text-status-success" : item.trend === 'down' ? "text-status-error" : "text-graphite-500"
                            )}>
                              {item.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                              {item.trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
                              <span>{item.trend === 'up' ? '+12%' : item.trend === 'down' ? '-5%' : '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </InfoCard>
                  </motion.div>

                  {/* Skills & Specializations */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <InfoCard
                      title="Top Skills"
                      icon={Award}
                      iconBg="bg-brand/10"
                      iconColor="text-brand"
                    >
                      <div className="space-y-2">
                        {[
                          { skill: 'Engine Diagnostics', jobs: 45, rating: 98 },
                          { skill: 'Brake Systems', jobs: 38, rating: 95 },
                          { skill: 'Electrical Systems', jobs: 32, rating: 92 },
                          { skill: 'Suspension', jobs: 28, rating: 89 },
                        ].map((skill) => (
                          <div key={skill.skill} className="py-2 px-3 -mx-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white">{skill.skill}</span>
                              <span className="text-xs text-brand font-semibold">{skill.rating}%</span>
                            </div>
                            <div className="h-1.5 bg-graphite-700 rounded-full overflow-hidden">
                              <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${skill.rating}%` }} />
                            </div>
                            <p className="text-xs text-graphite-500 mt-1">{skill.jobs} jobs completed</p>
                          </div>
                        ))}
                      </div>
                    </InfoCard>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={employee}
        field={editingField}
        fieldLabel={editingFieldLabel}
        fieldType={editingFieldType}
        onSuccess={handleUpdateSuccess}
      />
    </React.Fragment>
  )
}

/**
 * InfoCard - Premium card component for information sections
 */
interface InfoCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconBg?: string
  iconColor?: string
  children: React.ReactNode
  className?: string
}

function InfoCard({ title, icon: Icon, iconBg, iconColor, children, className }: InfoCardProps) {
  return (
    <div className={cn("h-full bg-graphite-800 backdrop-blur-sm rounded-xl border border-graphite-700 overflow-hidden active:border-brand/40 transition-colors duration-300 shadow-card flex flex-col", className)}>
      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-graphite-700 bg-gradient-to-r from-graphite-900 to-graphite-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <h3 className="text-base font-semibold text-brand">{title}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-1 flex-1">{children}</div>
    </div>
  )
}

/**
 * InfoItem - Individual information row
 */
interface InfoItemProps {
  label: string
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  valueColor?: string
  field?: string
  fieldType?: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country'
  onEdit?: (field: string, label: string, type: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country') => void
}

function InfoItem({ label, value, icon: Icon, iconColor, valueColor, field, fieldType = 'text', onEdit }: InfoItemProps) {
  const isEditable = field && onEdit

  return (
    <div
      className={cn(
        "group flex flex-col md:flex-row md:items-start md:justify-between py-3 md:py-4 px-3 -mx-3 rounded-xl active:bg-graphite-700/50 transition-colors duration-200 gap-1 md:gap-0",
        isEditable && "cursor-pointer min-h-[44px]"
      )}
      onClick={() => isEditable && onEdit(field, label, fieldType)}
    >
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="hidden md:flex h-8 w-8 rounded-lg bg-graphite-700/50 items-center justify-center shrink-0 active:bg-graphite-700 transition-colors duration-200">
            <Icon className={cn("h-4 w-4", iconColor || "text-graphite-400")} />
          </div>
        )}
        <span className="text-sm md:text-base text-graphite-400 font-medium">{label}</span>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 md:gap-2 text-right shrink-0 md:ml-2 self-end",
          isEditable && "group-active:gap-3 transition-all duration-200"
        )}
      >
        {value ? (
          <span className={cn("text-sm md:text-base text-white font-medium text-left md:text-right break-words", valueColor)}>
            {value}
          </span>
        ) : (
          <span className="text-sm md:text-base text-graphite-500 italic text-left md:text-right">Not provided</span>
        )}
        {isEditable && (
          <Edit className="h-4 w-4 text-graphite-500 group-active:text-brand transition-colors duration-200 shrink-0" />
        )}
      </div>
    </div>
  )
}
