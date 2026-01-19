/**
 * AnalyticsDashboard Component
 *
 * Comprehensive analytics view for job cards
 * Features:
 * - Job completion rates
 * - Average cycle time
 * - Mechanic performance
 * - Priority distribution
 * - Status distribution
 * - Revenue tracking
 */

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react'
import type { JobCardViewData } from '../../types/job-card-view.types'
import { StatCard } from './StatCard'
import {
  generateAnalyticsSummary,
  calculateStatusDistribution,
  calculatePriorityDistribution,
  calculateMechanicPerformance,
  calculateRevenueByStatus,
} from '../../lib/utils/analytics-utils'

interface AnalyticsDashboardProps {
  jobCards: JobCardViewData[]
  garageId: string
}

export function AnalyticsDashboard({
  jobCards,
  garageId,
}: AnalyticsDashboardProps) {
  // Calculate all analytics
  const analytics = useMemo(() => {
    const summary = generateAnalyticsSummary(jobCards)
    const statusDistribution = calculateStatusDistribution(jobCards)
    const priorityDistribution = calculatePriorityDistribution(jobCards)
    const mechanicPerformance = calculateMechanicPerformance(jobCards)
    const revenueByStatus = calculateRevenueByStatus(jobCards)

    return {
      summary,
      statusDistribution,
      priorityDistribution,
      mechanicPerformance,
      revenueByStatus,
    }
  }, [jobCards])

  if (jobCards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-12 text-center">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No analytics data available
        </h3>
        <p className="text-gray-600">
          Create some job cards to see analytics
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <StatCard
          title="Total Jobs"
          value={analytics.summary.totalJobs}
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />

        {/* Completion Rate */}
        <StatCard
          title="Completion Rate"
          value={`${analytics.summary.completionRate}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{
            direction: analytics.summary.completionRate >= 50 ? 'up' : 'neutral',
            value: `${analytics.summary.completionRate}%`,
            label: 'of all jobs',
          }}
          color="green"
        />

        {/* Average Cycle Time */}
        <StatCard
          title="Avg. Cycle Time"
          value={`${analytics.summary.avgCycleTime}d`}
          icon={<Clock className="h-5 w-5" />}
          trend={{
            direction: analytics.summary.avgCycleTime <= 3 ? 'up' : 'neutral',
            value: `${analytics.summary.avgCycleTime} days`,
            label: 'per job',
          }}
          color="yellow"
        />

        {/* Overdue Jobs */}
        <StatCard
          title="Overdue Jobs"
          value={analytics.summary.overdue}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{
            direction: analytics.summary.overdue === 0 ? 'up' : 'down',
            value: `${analytics.summary.overdue} jobs`,
            label: 'need attention',
          }}
          color={analytics.summary.overdue > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-graphite-700" />
          Status Distribution
        </h2>

        <div className="space-y-3">
          {analytics.statusDistribution.map((item) => (
            <div key={item.status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-graphite-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-graphite-700" />
          Priority Distribution
        </h2>

        <div className="space-y-3">
          {analytics.priorityDistribution.map((item) => {
            const colorClass =
              item.priority === 'urgent'
                ? 'bg-red-500'
                : item.priority === 'high'
                ? 'bg-orange-500'
                : item.priority === 'medium'
                ? 'bg-yellow-500'
                : 'bg-green-500'

            return (
              <div key={item.priority}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.priority}
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mechanic Performance */}
      {analytics.mechanicPerformance.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-graphite-700" />
            Mechanic Performance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Mechanic
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Total Jobs
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Completed
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    In Progress
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Completion Rate
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Avg Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.mechanicPerformance.map((mechanic) => (
                  <tr key={mechanic.mechanicId} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {mechanic.mechanicId}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-center">
                      {mechanic.totalJobs}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-center">
                      {mechanic.completed}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-center">
                      {mechanic.inProgress}
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          mechanic.completionRate >= 80
                            ? 'bg-green-100 text-green-700'
                            : mechanic.completionRate >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {mechanic.completionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-center">
                      {mechanic.avgProgress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue by Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-graphite-700" />
          Revenue by Status
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.revenueByStatus).map(([status, revenue]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1 capitalize">
                {status.replace('_', ' ')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${revenue.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
