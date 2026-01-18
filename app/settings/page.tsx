'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Shield,
  Calendar,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  FileText,
  Camera,
  Wrench,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getUserByUserUid, type UserData } from '@/lib/supabase/user-queries'
import { getGarageByOwnerId, type GarageData } from '@/lib/supabase/garage-queries'
import { EditUserModal } from '@/components/settings/edit-user-modal'
import { ProfilePictureUploadModal } from '@/components/settings/profile-picture-upload'


/**
 * Settings Page - Premium Display with Tabs
 *
 * A modern, tabbed interface displaying both user and garage settings.
 * Implements industry-standard tabs with WCAG 2.2 Level AA compliance.
 */
export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [garageSettings, setGarageSettings] = useState<GarageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('user-settings')

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingField, setEditingField] = useState('')
  const [editingFieldLabel, setEditingFieldLabel] = useState('')
  const [editingFieldType, setEditingFieldType] = useState<'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country' | 'operatingHours' | 'multiSelect' | 'password'>('text')

  // Profile picture modal state
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get user_uid from sessionStorage
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      const parsedUser = JSON.parse(sessionUser)
      const userUid = parsedUser.userUid || parsedUser.user_uid

      if (!userUid) {
        setError('User ID not found in session')
        setIsLoading(false)
        return
      }

      // Fetch user data from Supabase
      const user = await getUserByUserUid(userUid)

      if (!user) {
        setError('User not found in database')
        setIsLoading(false)
        return
      }

      setUserData(user)

      // Fetch garage settings from garages table using owner_id (user_uid)
      const garageData = await getGarageByOwnerId(userUid)

      if (garageData) {
        setGarageSettings(garageData)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Open edit modal for a specific field
  const openEditModal = (
    field: string,
    fieldLabel: string,
    fieldType: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country' | 'operatingHours' | 'multiSelect' | 'password' = 'text'
  ) => {
    setEditingField(field)
    setEditingFieldLabel(fieldLabel)
    setEditingFieldType(fieldType)
    setIsEditModalOpen(true)
  }

  // Handle successful update
  const handleUpdateSuccess = (updatedData: Partial<UserData>) => {
    // Update local state with the new data
    if (userData) {
      const updatedUserData = { ...userData, ...updatedData }
      setUserData(updatedUserData)

      // Also update sessionStorage
      const sessionUser = sessionStorage.getItem('user')
      if (sessionUser) {
        const parsedUser = JSON.parse(sessionUser)
        const updatedSessionUser = { ...parsedUser, ...updatedData }

        // If login ID was updated, show it in the session
        if (updatedData.loginId) {
          console.log('Login ID updated in session to:', updatedData.loginId)
        }

        sessionStorage.setItem('user', JSON.stringify(updatedSessionUser))
      }
    }
  }

  // Handle successful garage update
  const handleGarageUpdateSuccess = async (updatedData: Partial<GarageData>) => {
    if (garageSettings && userData) {
      // Merge operatingHours if it exists in the update
      let finalData = { ...updatedData }

      if (updatedData.operatingHours && garageSettings.operatingHours) {
        // Merge the operating hours objects
        finalData = {
          ...updatedData,
          operatingHours: {
            ...garageSettings.operatingHours,
            ...updatedData.operatingHours,
          },
        }
      }

      // Update in database via API route (uses admin client to bypass RLS)
      try {
        const response = await fetch('/api/garage/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            garageId: garageSettings.garageId,
            updates: finalData,
          }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          console.error('Failed to update garage:', result.error)
          return
        }

        // Update local state - merge nested objects properly
        const updatedGarageSettings = {
          ...garageSettings,
          ...finalData,
          // Special handling for operating hours
          operatingHours: finalData.operatingHours
            ? { ...garageSettings.operatingHours, ...finalData.operatingHours }
            : garageSettings.operatingHours,
        }
        setGarageSettings(updatedGarageSettings)
      } catch (error) {
        console.error('Error updating garage:', error)
      }
    }
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async (base64Image: string) => {
    if (!userData?.userUid) {
      return { success: false, error: 'User information not available' }
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUid: userData.userUid,
          updates: {
            profilePicture: base64Image,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to upload profile picture' }
      }

      // Update local state
      if (userData) {
        const updatedUserData = { ...userData, profilePicture: base64Image }
        setUserData(updatedUserData)

        // Also update sessionStorage
        const sessionUser = sessionStorage.getItem('user')
        if (sessionUser) {
          const parsedUser = JSON.parse(sessionUser)
          const updatedSessionUser = { ...parsedUser, profilePicture: base64Image }
          sessionStorage.setItem('user', JSON.stringify(updatedSessionUser))
        }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      return { success: false, error: message }
    }
  }

  // Unified handler for both user and garage updates
  const handleEditSuccess = async (updatedData: any) => {
    if (activeTab === 'garage-settings') {
      // Handle garage update
      await handleGarageUpdateSuccess(updatedData)
    } else {
      // Handle user update
      handleUpdateSuccess(updatedData)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#dfe5ef' }}>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="inline-block h-16 w-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-300" />
              <div className="absolute inset-0 rounded-full border-4 border-t-gray-600 border-r-transparent border-b-transparent animate-spin" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-graphite-600 font-medium"
          >
            Loading settings...
          </motion.p>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#dfe5ef' }}>
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
              <h2 className="text-xl font-semibold text-graphite-900">Error Loading Settings</h2>
              <p className="text-sm text-graphite-600 mt-0.5">{error || 'Failed to load data'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login')}
            className="w-full bg-gray-700 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg shadow-gray-300/20 mt-6"
          >
            Back to Login
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <React.Fragment>
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ backgroundColor: '#dfe5ef' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Header - Visible on mobile and desktop */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 bg-graphite-600 rounded-full" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                  Settings
                </h1>
                <p className="text-sm md:text-base text-graphite-600 mt-1">
                  Manage your account and garage settings
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
            {userData.profilePicture ? (
              // Mobile: Premium blurred zoomed background with glassmorphic overlay
              <div className="md:hidden relative overflow-hidden rounded-3xl shadow-2xl h-64">
                {/* Layer 1: Blurred zoomed-in background image */}
                <div className="absolute inset-0">
                  <img
                    src={userData.profilePicture}
                    alt="Profile background"
                    className="h-full w-full object-cover scale-125 blur-xl"
                  />
                </div>

                {/* Layer 2: Multi-stop gradient overlay for depth and readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

                {/* Layer 3: Subtle noise texture for premium feel */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }} />

                {/* Layer 4: Glassmorphic content area */}
                <div className="relative h-full flex flex-col justify-end p-5">
                  {/* Subtle edit button - minimal and clean */}
                  <button
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-full border border-white/10 active:scale-90 transition-all duration-200"
                    aria-label="Edit profile picture"
                  >
                    <Camera className="h-3.5 w-3.5 text-white/80" strokeWidth={2.5} />
                  </button>

                  {/* Content container with subtle glass effect */}
                  <div className="bg-white/12 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-xl">
                    <div className="flex gap-4">
                      {/* Unblurred profile picture */}
                      <div className="relative shrink-0">
                        <div className="h-20 w-16 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                          <img
                            src={userData.profilePicture}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {/* Status indicator overlapping photo */}
                        <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white/30 shadow-md" />
                      </div>

                      {/* Name and info */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white mb-0.5 tracking-tight drop-shadow-lg leading-tight">
                          {userData.firstName} {userData.lastName}
                        </h2>
                        <p className="text-xs text-white/90 flex items-center gap-1.5 mb-2 font-medium drop-shadow-md truncate">
                          <Building className="h-3 w-3" strokeWidth={2.5} />
                          {userData.garageName}
                        </p>

                        {/* Role Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full w-fit">
                          <Shield className="h-3 w-3 text-white" strokeWidth={2.5} />
                          <span className="text-white font-semibold text-[10px] uppercase tracking-wide">
                            {userData.userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Mobile: No profile picture - current treatment
              <div className="md:hidden relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-brand/80 to-transparent" />
                <div className="relative p-4">
                  <div className="flex flex-col gap-4">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group mx-auto"
                    >
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center border-2 border-gray-300 shadow-lg shadow-gray-300/20 overflow-hidden">
                        <User className="h-10 w-10 text-gray-700" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 text-center">
                      <div className="flex flex-col gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {userData.firstName} {userData.lastName}
                          </h2>
                          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                            <Building className="h-4 w-4 text-gray-600" />
                            {userData.garageName}
                          </p>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl min-h-[44px]">
                          <Shield className="h-4 w-4 text-gray-700" />
                          <span className="text-gray-700 font-semibold text-sm capitalize">
                            {userData.userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop: Original card for both cases */}
            <div className="hidden md:block relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-2xl">
              {/* Decorative accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-brand/80 to-transparent" />

              <div className="relative p-4 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group mx-auto lg:mx-0"
                  >
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center border-2 border-gray-300 shadow-lg shadow-gray-300/20 overflow-hidden">
                      {userData.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 md:h-12 md:w-12 text-gray-700" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    {/* Edit Button - Larger touch target on mobile */}
                    <button
                      onClick={() => setIsProfilePictureModalOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-200 rounded-2xl min-h-[44px]"
                      aria-label="Edit profile picture"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </button>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                          {userData.firstName} {userData.lastName}
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 flex items-center justify-center lg:justify-start gap-2">
                          <Building className="h-4 w-4 text-gray-600" />
                          {userData.garageName}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <div className="flex items-center justify-center lg:justify-start gap-2 px-3 md:px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl min-h-[44px]">
                        <Shield className="h-4 w-4 text-gray-700" />
                        <span className="text-gray-700 font-semibold text-sm capitalize">
                          {userData.userRole}
                        </span>
                      </div>
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
              <TabsList className="hidden md:flex items-center gap-1">
                <TabsTrigger value="user-settings" className="flex items-center gap-2">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                  <span>User Information</span>
                </TabsTrigger>
                <TabsTrigger value="garage-settings" className="flex items-center gap-2">
                  <Building className="h-4 w-4" strokeWidth={2.5} />
                  <span>Garage Information</span>
                </TabsTrigger>
              </TabsList>

              {/* Mobile Tabs List - Full Width */}
              <TabsList className="md:hidden flex w-full">
                <TabsTrigger value="user-settings" className="flex-1 flex items-center justify-center gap-2">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                  <span>User</span>
                </TabsTrigger>
                <TabsTrigger value="garage-settings" className="flex-1 flex items-center justify-center gap-2">
                  <Building className="h-4 w-4" strokeWidth={2.5} />
                  <span>Garage</span>
                </TabsTrigger>
              </TabsList>

              {/* User Information Tab */}
              <TabsContent value="user-settings" className="mt-4 md:mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="First Name" value={userData.firstName} field="firstName" onEdit={openEditModal} />
                      <InfoItem label="Last Name" value={userData.lastName} field="lastName" onEdit={openEditModal} />
                      <InfoItem label="Employee ID" value={userData.employeeId} field="employeeId" onEdit={openEditModal} />
                      <InfoItem label="Login ID" value={userData.loginId} />
                      <InfoItem label="Password" value="••••••••" field="password" fieldType="password" onEdit={openEditModal} />
                      <InfoItem label="Primary Email" value={userData.email} field="email" fieldType="email" onEdit={openEditModal} />
                      <InfoItem label="Alternate Email" value={userData.alternateEmail} field="alternateEmail" fieldType="email" onEdit={openEditModal} />
                      <InfoItem label="Primary Phone" value={userData.phoneNumber} field="phoneNumber" fieldType="tel" onEdit={openEditModal} />
                      <InfoItem label="Alternate Phone" value={userData.alternatePhone} field="alternatePhone" fieldType="tel" onEdit={openEditModal} />
                      <InfoItem
                        label="Date of Birth"
                        value={userData.dateOfBirth ? formatDate(userData.dateOfBirth) : undefined}
                        field="dateOfBirth"
                        fieldType="date"
                        onEdit={openEditModal}
                      />
                      <InfoItem label="Blood Group" value={userData.bloodGroup} field="bloodGroup" fieldType="bloodGroup" onEdit={openEditModal} />
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
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                      className="h-full"
                    >
                      <InfoItem label="Street Address" value={userData.address} field="address" onEdit={openEditModal} />
                      <InfoItem label="City" value={userData.city} field="city" onEdit={openEditModal} />
                      <InfoItem label="State/Province" value={userData.state} field="state" onEdit={openEditModal} />
                      <InfoItem label="Postal Code" value={userData.zipCode} field="zipCode" onEdit={openEditModal} />
                      <InfoItem label="Country" value={userData.country} field="country" fieldType="country" onEdit={openEditModal} />
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
                        value={userData.emergencyContactName}
                        field="emergencyContactName"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Contact Phone"
                        value={userData.emergencyContactPhone}
                        field="emergencyContactPhone"
                        fieldType="tel"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Relationship"
                        value={userData.emergencyContactRelation}
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
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                      className="h-full"
                    >
                      <InfoItem
                        label="ID Proof Type"
                        value={userData.idProofType}
                      />
                      <InfoItem label="ID Number" value={userData.idProofNumber} />
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
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem
                        label="Account Status"
                        value="Active"
                        valueColor="text-status-success"
                      />
                      <InfoItem
                        label="Date of Joining"
                        value={userData.dateOfJoining ? formatDate(userData.dateOfJoining) : undefined}
                      />
                      <InfoItem
                        label="Member Since"
                        value={formatDate(userData.createdAt)}
                      />
                      <InfoItem
                        label="Last Updated"
                        value={formatDate(userData.updatedAt)}
                      />
                    </InfoCard>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Garage Information Tab */}
              <TabsContent value="garage-settings" className="mt-4 md:mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">

                  {/* Basic Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="xl:col-span-2"
                  >
                    <InfoCard
                      title="Contact Information"
                      icon={Building}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="Garage Name" value={garageSettings?.garageName} field="garageName" onEdit={openEditModal} />
                      <InfoItem label="Email Address" value={garageSettings?.email} field="email" fieldType="email" onEdit={openEditModal} />
                      <InfoItem label="Primary Phone" value={garageSettings?.phoneNumber} field="phoneNumber" fieldType="tel" onEdit={openEditModal} />
                      <InfoItem label="Alternate Phone" value={garageSettings?.alternatePhoneNumber} field="alternatePhoneNumber" fieldType="tel" onEdit={openEditModal} />
                      <InfoItem label="WhatsApp Number" value={garageSettings?.whatsappNumber} field="whatsappNumber" fieldType="tel" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Business Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                  >
                    <InfoCard
                      title="Business Details"
                      icon={Building}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="GSTIN" value={garageSettings?.gstin} field="gstin" onEdit={openEditModal} />
                      <InfoItem label="PAN Number" value={garageSettings?.panNumber} field="panNumber" onEdit={openEditModal} />
                      <InfoItem label="Business Registration No." value={garageSettings?.businessRegistrationNumber} field="businessRegistrationNumber" onEdit={openEditModal} />
                      <InfoItem label="Business Type" value={garageSettings?.businessType} field="businessType" onEdit={openEditModal} />
                      <InfoItem label="Year Established" value={garageSettings?.yearEstablished} field="yearEstablished" onEdit={openEditModal} />
                      <InfoItem label="Website" value={garageSettings?.website} field="website" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Address Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <InfoCard
                      title="Address Information"
                      icon={MapPin}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="Street Address" value={garageSettings?.address} field="address" onEdit={openEditModal} />
                      <InfoItem label="City" value={garageSettings?.city} field="city" onEdit={openEditModal} />
                      <InfoItem label="State/Province" value={garageSettings?.state} field="state" onEdit={openEditModal} />
                      <InfoItem label="Postal Code" value={garageSettings?.zipCode} field="zipCode" onEdit={openEditModal} />
                      <InfoItem label="Country" value={garageSettings?.country} field="country" fieldType="country" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Operating Hours */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    <InfoCard
                      title="Operating Hours"
                      icon={Clock}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem
                        label="Monday - Friday"
                        value={garageSettings?.operatingHours?.weekdays || '9:00 AM - 6:00 PM'}
                        field="operatingHours.weekdays"
                        fieldType="operatingHours"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Saturday"
                        value={garageSettings?.operatingHours?.saturday || '9:00 AM - 4:00 PM'}
                        field="operatingHours.saturday"
                        fieldType="operatingHours"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Sunday"
                        value={garageSettings?.operatingHours?.sunday || 'Closed'}
                        field="operatingHours.sunday"
                        fieldType="operatingHours"
                        onEdit={openEditModal}
                      />
                    </InfoCard>
                  </motion.div>

                  {/* Operational Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <InfoCard
                      title="Operational Details"
                      icon={Wrench}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="Service Types" value={garageSettings?.serviceTypes?.join(', ')} field="serviceTypes" fieldType="multiSelect" onEdit={openEditModal} />
                      <InfoItem label="Vehicle Types Serviced" value={garageSettings?.vehicleTypesServiced?.join(', ')} field="vehicleTypesServiced" fieldType="multiSelect" onEdit={openEditModal} />
                      <InfoItem label="Number of Service Bays" value={garageSettings?.numberOfServiceBays} field="numberOfServiceBays" onEdit={openEditModal} />
                      <InfoItem label="Certifications" value={garageSettings?.certifications?.join(', ')} field="certifications" onEdit={openEditModal} />
                      <InfoItem label="Insurance Details" value={garageSettings?.insuranceDetails} field="insuranceDetails" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Financial Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                  >
                    <InfoCard
                      title="Financial Details"
                      icon={DollarSign}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="Payment Methods" value={garageSettings?.paymentMethods?.join(', ')} field="paymentMethods" onEdit={openEditModal} />
                      <InfoItem label="Bank Name" value={garageSettings?.bankName} field="bankName" onEdit={openEditModal} />
                      <InfoItem label="Account Number" value={garageSettings?.accountNumber} field="accountNumber" onEdit={openEditModal} />
                      <InfoItem label="IFSC Code" value={garageSettings?.ifscCode} field="ifscCode" onEdit={openEditModal} />
                      <InfoItem label="Branch" value={garageSettings?.branch} field="branch" onEdit={openEditModal} />
                      <InfoItem label="Default Labor Rate" value={garageSettings?.defaultLaborRate} field="defaultLaborRate" onEdit={openEditModal} />
                      <InfoItem label="Invoice Prefix" value={garageSettings?.invoicePrefix} field="invoicePrefix" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Facilities & Services */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <InfoCard
                      title="Facilities & Services"
                      icon={Wrench}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem label="Parking Capacity" value={garageSettings?.parkingCapacity} field="parkingCapacity" onEdit={openEditModal} />
                      <InfoItem label="Waiting Area Amenities" value={garageSettings?.waitingAreaAmenities?.join(', ')} field="waitingAreaAmenities" onEdit={openEditModal} />
                      <InfoItem
                        label="Tow Service Available"
                        value={garageSettings?.towServiceAvailable ? 'Yes' : 'No'}
                        valueColor={garageSettings?.towServiceAvailable ? 'text-status-success' : 'text-graphite-400'}
                        field="towServiceAvailable"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Pickup/Drop Service"
                        value={garageSettings?.pickupDropServiceAvailable ? 'Yes' : 'No'}
                        valueColor={garageSettings?.pickupDropServiceAvailable ? 'text-status-success' : 'text-graphite-400'}
                        field="pickupDropServiceAvailable"
                        onEdit={openEditModal}
                      />
                    </InfoCard>
                  </motion.div>

                  {/* Tax & Billing Configuration */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                  >
                    <InfoCard
                      title="Tax & Billing"
                      icon={FileText}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-700"
                    >
                      <InfoItem
                        label="GST/Tax Rate"
                        value={`${garageSettings?.taxRate || '18'}%`}
                        field="taxRate"
                        onEdit={openEditModal}
                      />
                      <InfoItem
                        label="Currency"
                        value={garageSettings?.currency || 'INR'}
                        field="currency"
                        onEdit={openEditModal}
                      />
                      <InfoItem label="Billing Cycle" value={garageSettings?.billingCycle} field="billingCycle" onEdit={openEditModal} />
                      <InfoItem label="Credit Terms" value={garageSettings?.creditTerms} field="creditTerms" onEdit={openEditModal} />
                    </InfoCard>
                  </motion.div>

                  {/* Additional Notes */}
                  {(garageSettings?.notes || true) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="xl:col-span-3"
                    >
                      <InfoCard
                        title="Additional Notes"
                        icon={FileText}
                        iconBg="bg-gray-100"
                        iconColor="text-gray-700"
                      >
                        <div className="py-4 px-3 -mx-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium mb-2">Notes</p>
                              <p className="text-gray-700 whitespace-pre-wrap">{garageSettings?.notes || 'Not provided'}</p>
                            </div>
                            <Edit
                              className="h-4 w-4 text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                              onClick={() => openEditModal('notes', 'Additional Notes', 'text')}
                            />
                          </div>
                        </div>
                      </InfoCard>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </main>

      {/* Edit Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        garageData={garageSettings}
        field={editingField}
        fieldLabel={editingFieldLabel}
        fieldType={editingFieldType}
        onSuccess={handleEditSuccess}
        isGarageEdit={activeTab === 'garage-settings'}
      />

      {/* Profile Picture Upload Modal */}
      <ProfilePictureUploadModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        currentPicture={userData?.profilePicture || null}
        onUpload={handleProfilePictureUpload}
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
    <div className={cn("h-full bg-white backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden active:border-gray-400 transition-colors duration-300 shadow-card flex flex-col", className)}>
      {/* Card Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-4 w-4 md:h-5 md:w-5", iconColor)} />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 md:p-6 space-y-1 flex-1">{children}</div>
    </div>
  )
}

/**
 * InfoItem - Individual information row with enhanced styling
 */
interface InfoItemProps {
  label: string
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  valueColor?: string
  field?: string
  fieldType?: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country' | 'operatingHours' | 'multiSelect' | 'password'
  onEdit?: (field: string, label: string, type: 'text' | 'email' | 'tel' | 'date' | 'bloodGroup' | 'country' | 'operatingHours' | 'multiSelect' | 'password') => void
}

function InfoItem({ label, value, icon: Icon, iconColor, valueColor, field, fieldType = 'text', onEdit }: InfoItemProps) {
  const isEditable = field && onEdit

  return (
    <div
      className={cn(
        "group flex items-start justify-between py-3 md:py-4 px-3 -mx-3 rounded-xl active:bg-gray-100 transition-colors duration-200",
        isEditable && "cursor-pointer min-h-[44px] items-center" // Minimum touch target for editable items
      )}
      onClick={() => isEditable && onEdit(field, label, fieldType)}
    >
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 active:bg-gray-200 transition-colors duration-200">
            <Icon className={cn("h-4 w-4", iconColor || "text-gray-500")} />
          </div>
        )}
        <span className="text-sm md:text-base text-gray-600 font-medium truncate">{label}</span>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 md:gap-2 text-right shrink-0 ml-2",
          isEditable && "group-active:gap-3 transition-all duration-200"
        )}
      >
        {value ? (
          <span className={cn("text-sm md:text-base text-gray-900 font-medium truncate max-w-[150px] md:max-w-[200px]", valueColor)}>
            {value}
          </span>
        ) : (
          <span className="text-sm md:text-base text-gray-400 italic">Not provided</span>
        )}
        {isEditable && (
          <Edit className="h-4 w-4 text-gray-400 group-active:text-gray-700 transition-colors duration-200 shrink-0" />
        )}
      </div>
    </div>
  )
}
