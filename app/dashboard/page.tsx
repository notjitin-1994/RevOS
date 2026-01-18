'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FilePlus,
  UserPlus,
  Wrench,
  Package,
  TrendingUp,
  BarChart3,
  PieChart,
  Brain,
  Sparkles,
  Megaphone,
  ArrowRight,
  Activity,
  IndianRupee,
  Users,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

/**
 * Dashboard Page
 *
 * The central hub for RevOS providing:
 * - Quick Actions for common tasks
 * - Data Analytics overview
 * - AI Analysis and Insights
 * - Marketing section
 */

interface StatCard {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}

interface QuickAction {
  label: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

interface InsightCard {
  title: string
  description: string
  type: 'warning' | 'info' | 'success' | 'trend'
  icon: React.ReactNode
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const quickActions: QuickAction[] = [
    {
      label: 'New Job Card',
      description: 'Create a service job card',
      icon: <FilePlus className="h-6 w-6" />,
      href: '/job-cards/new',
      color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100',
    },
    {
      label: 'New Customer',
      description: 'Add a new customer',
      icon: <UserPlus className="h-6 w-6" />,
      href: '/customer-management/add',
      color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100',
    },
    {
      label: 'New Make/Model',
      description: 'Add vehicle make/model',
      icon: <Wrench className="h-6 w-6" />,
      href: '/vehicles/new-make-model',
      color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100',
    },
    {
      label: 'New Part',
      description: 'Add inventory part',
      icon: <Package className="h-6 w-6" />,
      href: '/inventory/new',
      color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100',
    },
  ]

  const stats: StatCard[] = [
    {
      title: 'Active Jobs',
      value: 12,
      change: '+3 this week',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-graphite-900/10 text-graphite-900',
    },
    {
      title: 'Revenue (MTD)',
      value: '6,45,230',
      change: '+18% vs last month',
      trend: 'up',
      icon: <IndianRupee className="h-5 w-5" />,
      color: 'bg-gray-700/10 text-gray-700',
    },
    {
      title: 'Total Customers',
      value: 248,
      change: '+12 new',
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-graphite-700/10 text-graphite-700',
    },
    {
      title: 'Low Stock Items',
      value: 5,
      change: 'Action needed',
      trend: 'down',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'bg-gray-600/10 text-gray-600',
    },
  ]

  const insights: InsightCard[] = [
    {
      title: 'Peak Hours Identified',
      description: 'Most job cards are created between 10 AM - 2 PM. Consider scheduling accordingly.',
      type: 'trend',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: 'Low Stock Alert',
      description: '5 parts are below minimum threshold. Review inventory soon.',
      type: 'warning',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    {
      title: 'Revenue Growth',
      description: 'Monthly revenue increased by 18% compared to last month.',
      type: 'success',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: 'Customer Retention',
      description: '76% of customers are returning for repeat service.',
      type: 'info',
      icon: <Users className="h-5 w-5" />,
    },
  ]

  const getInsightColor = (type: InsightCard['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-gray-600/10 text-gray-600 border-gray-600/20'
      case 'info':
        return 'bg-graphite-700/10 text-graphite-700 border-graphite-700/20'
      case 'success':
        return 'bg-gray-700/10 text-gray-700 border-gray-700/20'
      case 'trend':
        return 'bg-graphite-900/10 text-graphite-900 border-graphite-900/20'
      default:
        return 'bg-gray-200 text-gray-700 border-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="h-12 w-12 border-4 border-graphite-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-graphite-900 rounded-full" />
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Welcome back! Here's your garage overview
            </p>
          </div>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-xl border border-gray-200 p-4 md:p-6 shadow-card bg-graphite-900"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-white/10 text-white">
                {stat.icon}
              </div>
              {stat.trend && (
                <span
                  className={cn(
                    'text-xs font-medium text-white'
                  )}
                >
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-white">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-graphite-900" />
          <h2 className="font-display font-semibold text-lg md:text-xl text-gray-900">
            Quick Actions
          </h2>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className={cn(
                'relative group p-6 rounded-xl border text-left transition-all duration-200',
                'active:scale-[0.98]',
                action.color
              )}
            >
              <div className="mb-3">{action.icon}</div>
              <h3 className="font-display text-base font-semibold mb-1 text-gray-900">{action.label}</h3>
              <p className="text-sm text-gray-700 opacity-70">{action.description}</p>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-700" />
            </motion.button>
          ))}
        </div>

        {/* Mobile: 2x2 Grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(action.href)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all duration-200',
                'active:scale-[0.95]',
                action.color
              )}
            >
              <div className="mb-2">{action.icon}</div>
              <h3 className="font-display text-sm font-semibold mb-0.5 text-gray-900">{action.label}</h3>
              <p className="text-xs text-gray-700 opacity-70">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Upcoming Schedule - Full Width */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6 md:mb-8 bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-graphite-900" />
            <h2 className="font-display font-semibold text-base md:text-lg text-gray-900">
              Today's Schedule
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/calendar')}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            View All
          </motion.button>
        </div>

        <div className="space-y-2">
          {[
            { time: '09:00', task: 'Oil Change - Honda CBR650R', status: 'completed' },
            { time: '11:00', task: 'Brake Service - Yamaha MT-07', status: 'in-progress' },
            { time: '14:00', task: 'Engine Check - Kawasaki Ninja 400', status: 'pending' },
            { time: '16:30', task: 'General Service - Royal Enfield Classic', status: 'pending' },
          ].map((item, index) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-sm font-mono text-graphite-900 shrink-0">{item.time}</span>
              <span className="flex-1 text-sm text-gray-900">{item.task}</span>
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-md font-medium',
                  item.status === 'completed'
                    ? 'bg-gray-700/10 text-gray-700 border border-gray-700/20'
                    : item.status === 'in-progress'
                    ? 'bg-graphite-700/10 text-graphite-700 border border-graphite-700/20'
                    : 'bg-gray-200 text-gray-700 border border-gray-300'
                )}
              >
                {item.status === 'completed'
                  ? 'Done'
                  : item.status === 'in-progress'
                  ? 'Active'
                  : 'Upcoming'}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Data Analytics Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-graphite-900" />
            <h2 className="font-display font-semibold text-lg md:text-xl text-gray-900">
              Data Analytics
            </h2>
          </div>

          <div className="space-y-4">
            {/* Revenue Chart Placeholder */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Revenue Overview</h3>
                <span className="text-xs text-gray-600">Last 7 days</span>
              </div>
              <div className="h-32 flex items-end justify-between gap-2">
                {[18500, 32500, 22000, 45000, 28000, 52000, 38000].map((revenue, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${(revenue / 52000) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                    className="flex-1 bg-brand hover:bg-brand/80 rounded-t transition-colors relative group"
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity font-medium whitespace-nowrap">
                      ₹{revenue.toLocaleString('en-IN')}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Service Distribution */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Service Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Engine Services', value: 35, color: 'bg-lime-700' },
                  { label: 'Brake Services', value: 25, color: 'bg-lime-600' },
                  { label: 'Electrical', value: 20, color: 'bg-lime-500' },
                  { label: 'General Maintenance', value: 20, color: 'bg-lime-400' },
                ].map((item, index) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="text-gray-900 font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        className={cn('h-full rounded-full', item.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/analytics')}
            className="w-full mt-6 py-3 bg-graphite-900 hover:bg-graphite-800 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            View Full Analytics
          </motion.button>
        </motion.section>

        {/* Right Column: AI Insights & Marketing */}
        <div className="space-y-6 md:space-y-8">
          {/* AI Analysis & Insights Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-6 w-6 text-graphite-900" />
              <h2 className="font-display font-semibold text-lg md:text-xl text-gray-900">
                AI Analysis & Insights
              </h2>
            </div>

            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg border',
                    getInsightColor(insight.type)
                  )}
                >
                  <div className="shrink-0 mt-0.5">{insight.icon}</div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-gray-900">{insight.title}</h4>
                    <p className="text-xs opacity-80 text-gray-700">{insight.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/insights')}
              className="w-full mt-6 py-3 bg-graphite-900 hover:bg-graphite-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-graphite-900/20"
            >
              <Sparkles className="h-4 w-4" />
              View AI Insights
            </motion.button>
          </motion.section>

          {/* Marketing Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="h-6 w-6 text-graphite-700" />
              <h2 className="font-display font-semibold text-lg md:text-xl text-gray-900">
                Marketing
              </h2>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              Grow your garage with powerful marketing tools. Send promotional offers, reminders, and engage with your customers.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-graphite-900 shrink-0" />
                <span>Send promotional SMS/Email campaigns</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-graphite-900 shrink-0" />
                <span>Service reminders & follow-ups</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-graphite-900 shrink-0" />
                <span>Customer loyalty programs</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/marketing')}
              className="w-full py-3 bg-graphite-900 hover:bg-graphite-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Megaphone className="h-4 w-4" />
              Open Marketing Center
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
