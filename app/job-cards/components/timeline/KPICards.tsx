/**
 * KPICards Component
 *
 * Displays KPI metrics for the Gantt Calendar dashboard
 * Shows total jobs, in progress, completed today, revenue, and utilization
 */

'use client'

import React from 'react'
import { Activity, Clock, DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'
import type { TimelineKPIMetrics } from '../../types/timeline.types'

interface KPICardsProps {
  metrics: TimelineKPIMetrics
}

export function KPICards({ metrics }: KPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const kpiCards = [
    {
      title: 'Total Jobs',
      value: metrics.totalJobs.toString(),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: null,
    },
    {
      title: 'In Progress',
      value: metrics.inProgress.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: null,
    },
    {
      title: 'Completed Today',
      value: metrics.completedToday.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: null,
    },
    {
      title: 'Overdue',
      value: metrics.overdueJobs.toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: metrics.overdueJobs > 0 ? 'warning' : null,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: null,
    },
    {
      title: 'Revenue Today',
      value: formatCurrency(metrics.revenueToday),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: null,
    },
    {
      title: 'Avg Utilization',
      value: `${metrics.averageUtilization}%`,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: metrics.averageUtilization >= 80 ? 'high' : metrics.averageUtilization <= 30 ? 'low' : null,
    },
    {
      title: 'Overloaded',
      value: metrics.overloadedResources.toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: metrics.overloadedResources > 0 ? 'warning' : null,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4 mb-6">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon
        const hasWarning = kpi.trend === 'warning'
        const isHigh = kpi.trend === 'high'
        const isLow = kpi.trend === 'low'

        return (
          <div
            key={kpi.title}
            className={`
              rounded-xl border p-3 md:p-4 transition-all duration-200
              ${hasWarning
                ? 'bg-red-50 border-red-300 shadow-md'
                : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${kpi.color}`} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 hidden sm:block">
                {kpi.title}
              </p>
            </div>

            <p className={`text-xl md:text-2xl font-bold ${
              hasWarning ? 'text-red-700' :
              isHigh ? 'text-orange-700' :
              isLow ? 'text-gray-500' :
              'text-gray-900'
            }`}>
              {kpi.value}
            </p>

            <p className="text-xs font-medium uppercase tracking-wider text-gray-600 sm:hidden mt-1">
              {kpi.title}
            </p>

            {hasWarning && (
              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>Needs attention</span>
              </div>
            )}

            {isHigh && (
              <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                <TrendingUp className="h-3 w-3" />
                <span>High utilization</span>
              </div>
            )}

            {isLow && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <span>Below optimal</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * CompactKPIRow Component
 *
 * Horizontal row of KPIs for mobile or condensed view
 */
interface CompactKPIRowProps {
  metrics: TimelineKPIMetrics
}

export function CompactKPIRow({ metrics }: CompactKPIRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const compactKPIs = [
    { label: 'Jobs', value: metrics.totalJobs },
    { label: 'Active', value: metrics.inProgress },
    { label: 'Today', value: metrics.completedToday },
    { label: 'Overdue', value: metrics.overdueJobs, warning: metrics.overdueJobs > 0 },
    { label: 'Revenue', value: formatCurrency(metrics.revenueToday) },
  ]

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {compactKPIs.map((kpi) => (
        <div
          key={kpi.label}
          className={`
            flex-shrink-0 px-3 py-2 rounded-lg border
            ${kpi.warning ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}
          `}
        >
          <p className="text-xs text-gray-600 font-medium">{kpi.label}</p>
          <p className={`text-sm font-bold ${kpi.warning ? 'text-red-700' : 'text-gray-900'}`}>
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  )
}
