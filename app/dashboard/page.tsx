import React from 'react'
import {
  ClipboardList,
  Users,
  UserPlus,
  Package,
  IndianRupee,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { HubCard, type StatItem } from '@/components/dashboard/hub-card'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { CalendarSection } from '@/components/dashboard/calendar-section'
import { getAllDashboardStats, getDashboardCalendarJobCards } from '@/lib/supabase/dashboard-queries'
import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/lib/supabase/dashboard-queries'

/**
 * Dashboard Page - Garage Management Hub
 *
 * A modern, mobile-first navigation hub providing quick access to all main sections.
 * Features:
 * - Responsive grid layout (1/2/3 columns)
 * - Animated entrance with stagger effects
 * - Real-time statistics from database
 * - Accessible with 44x44px touch targets
 * - Server-side data fetching for performance
 */

export default async function DashboardPage() {
  // Get garage ID from session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let garageId = ''
  if (user) {
    const { data: garageAuth } = await supabase
      .from('garage_auth')
      .select('garage_id')
      .eq('user_uid', user.id)
      .single()

    garageId = garageAuth?.garage_id || ''
  }

  // Fetch all dashboard stats
  let stats: DashboardStats | null = null
  let statsError: string | null = null

  // Fetch calendar job cards
  let calendarJobCards: Awaited<ReturnType<typeof getDashboardCalendarJobCards>> = []
  let calendarError: string | null = null

  if (garageId) {
    try {
      stats = await getAllDashboardStats(garageId)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      statsError = error instanceof Error ? error.message : 'Failed to load statistics'
    }

    try {
      calendarJobCards = await getDashboardCalendarJobCards(garageId)
    } catch (error) {
      console.error('Error fetching calendar job cards:', error)
      calendarError = error instanceof Error ? error.message : 'Failed to load calendar'
    }
  }

  // Helper function to format stats for display
  const formatJobCardStats = (): StatItem[] => {
    if (!stats) return []

    return [
      { label: 'Total Jobs', value: stats.jobCards.total },
      { label: 'Active', value: stats.jobCards.active, color: 'text-blue-600' },
      { label: 'Ready for Delivery', value: stats.jobCards.ready, color: 'text-green-600' },
    ]
  }

  const formatEmployeeStats = (): StatItem[] => {
    if (!stats) return []

    return [
      { label: 'Total Employees', value: stats.employees.total },
      { label: 'Active', value: stats.employees.active, color: 'text-green-600' },
      { label: 'On Leave', value: stats.employees.onLeave, color: 'text-orange-600' },
    ]
  }

  const formatCustomerStats = (): StatItem[] => {
    if (!stats) return []

    return [
      { label: 'Total Customers', value: stats.customers.total },
      { label: 'With Vehicles', value: stats.customers.activeWithVehicles, color: 'text-blue-600' },
      { label: 'New This Month', value: stats.customers.newThisMonth, color: 'text-green-600' },
    ]
  }

  const formatVehicleStats = (): StatItem[] => {
    if (!stats) return []

    return [
      { label: 'Registered Vehicles', value: stats.vehicles.total },
    ]
  }

  const formatInventoryStats = (): StatItem[] => {
    if (!stats) return []

    return [
      { label: 'Total Parts', value: stats.inventory.total },
      { label: 'Low Stock', value: stats.inventory.lowStock, color: 'text-orange-600' },
      { label: 'Out of Stock', value: stats.inventory.outOfStock, color: 'text-red-600' },
    ]
  }

  const formatBillingStats = (): StatItem[] => {
    if (!stats) return []

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount)
    }

    return [
      { label: 'Pending Invoices', value: stats.billing.pendingInvoices },
      { label: 'Amount Due', value: formatCurrency(stats.billing.amountDue), color: 'text-red-600' },
      { label: 'Paid This Month', value: formatCurrency(stats.billing.paidThisMonth), color: 'text-green-600' },
    ]
  }

  // Navigation hub cards configuration
  const hubCards = [
    {
      href: '/job-cards',
      icon: <ClipboardList className="h-6 w-6 text-gray-700" />,
      title: 'Service Center',
      description: 'Manage job cards, track service progress, and view schedules',
      stats: formatJobCardStats(),
    },
    {
      href: '/employee-management',
      icon: <Users className="h-6 w-6 text-gray-700" />,
      title: 'Crew Station',
      description: 'Oversee team, manage roles, and track employee performance',
      stats: formatEmployeeStats(),
    },
    {
      href: '/customer-management',
      icon: <UserPlus className="h-6 w-6 text-gray-700" />,
      title: 'Client Hub',
      description: 'Manage customers, view history, and track communications',
      stats: formatCustomerStats(),
    },
    {
      href: '/vehicles',
      icon: <MotorcycleIcon className="h-6 w-6 text-gray-700" />,
      title: 'Vehicle Registry',
      description: 'Register vehicles, track ownership, and manage records',
      stats: formatVehicleStats(),
    },
    {
      href: '/inventory',
      icon: <Package className="h-6 w-6 text-gray-700" />,
      title: 'Parts Repository',
      description: 'Monitor stock, manage parts, and track inventory levels',
      stats: formatInventoryStats(),
    },
    {
      href: '/settings',
      icon: <IndianRupee className="h-6 w-6 text-gray-700" />,
      title: 'Billing & Invoicing',
      description: 'Manage invoices, track payments, and view billing history',
      stats: formatBillingStats(),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <DashboardHeader statsError={statsError} />

      {/* Navigation Hub Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubCards.map((card, index) => (
            <HubCard
              key={card.href}
              href={card.href}
              icon={card.icon}
              title={card.title}
              description={card.description}
              stats={card.stats}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats Section - Overview */}
      {stats && (
        <DashboardOverview
          stats={[
            {
              label: 'Active Jobs',
              value: stats.jobCards.active.toString(),
              color: 'bg-graphite-900',
              subtext: `${stats.jobCards.ready} ready`,
            },
            {
              label: 'Team Members',
              value: stats.employees.active.toString(),
              color: 'bg-gray-700',
              subtext: `${stats.employees.onLeave} on leave`,
            },
            {
              label: 'Customers',
              value: stats.customers.total.toString(),
              color: 'bg-gray-600',
              subtext: `${stats.customers.newThisMonth} new this month`,
            },
            {
              label: 'Low Stock Items',
              value: stats.inventory.lowStock.toString(),
              color: 'bg-status-error/20 text-status-error',
              subtext: `${stats.inventory.outOfStock} out of stock`,
            },
          ]}
        />
      )}

      {/* Calendar Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="h-6 w-6 text-gray-700" />
          <h2 className="text-2xl font-display font-semibold text-gray-900">Calendar</h2>
        </div>
        <CalendarSection jobCards={calendarJobCards} isLoading={false} />
      </div>
    </div>
  )
}
