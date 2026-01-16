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
  DollarSign,
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
      color: 'bg-brand/10 text-brand border-brand/20 hover:bg-brand/20',
    },
    {
      label: 'New Customer',
      description: 'Add a new customer',
      icon: <UserPlus className="h-6 w-6" />,
      href: '/customer-management/new',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    },
    {
      label: 'New Make/Model',
      description: 'Add vehicle make/model',
      icon: <Wrench className="h-6 w-6" />,
      href: '/vehicles/new-make-model',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
    },
    {
      label: 'New Part',
      description: 'Add inventory part',
      icon: <Package className="h-6 w-6" />,
      href: '/inventory/new',
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
    },
  ]

  const stats: StatCard[] = [
    {
      title: 'Active Jobs',
      value: 12,
      change: '+3 this week',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-brand/10 text-brand',
    },
    {
      title: 'Revenue (MTD)',
      value: '₹45,230',
      change: '+18% vs last month',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-green-500/10 text-green-400',
    },
    {
      title: 'Total Customers',
      value: 248,
      change: '+12 new',
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      title: 'Low Stock Items',
      value: 5,
      change: 'Action needed',
      trend: 'down',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'bg-red-500/10 text-red-400',
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
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'info':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'trend':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default:
        return 'bg-graphite-700 text-graphite-300 border-graphite-600'
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
          <div className="h-12 w-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-graphite-400 font-medium">Loading dashboard...</p>
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
          <div className="h-10 w-1 bg-brand rounded-full" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-graphite-400 mt-1">
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
            className="bg-graphite-800 rounded-xl border border-graphite-700 p-4 md:p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                {stat.icon}
              </div>
              {stat.trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-graphite-400">{stat.title}</p>
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
          <Sparkles className="h-6 w-6 text-brand" />
          <h2 className="text-lg md:text-xl font-semibold text-white">
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
              <h3 className="text-base font-semibold mb-1">{action.label}</h3>
              <p className="text-sm opacity-70">{action.description}</p>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>

        {/* Mobile: Scrollable Row */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(action.href)}
                className={cn(
                  'flex-shrink-0 w-36 p-4 rounded-xl border text-left transition-all duration-200',
                  'active:scale-[0.95]',
                  action.color
                )}
              >
                <div className="mb-2">{action.icon}</div>
                <h3 className="text-sm font-semibold mb-0.5">{action.label}</h3>
                <p className="text-xs opacity-70">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Data Analytics Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-graphite-800 rounded-xl border border-graphite-700 p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-brand" />
            <h2 className="text-lg md:text-xl font-semibold text-white">
              Data Analytics
            </h2>
          </div>

          <div className="space-y-4">
            {/* Revenue Chart Placeholder */}
            <div className="bg-graphite-900 rounded-lg p-4 border border-graphite-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Revenue Overview</h3>
                <span className="text-xs text-graphite-400">Last 7 days</span>
              </div>
              <div className="h-32 flex items-end justify-between gap-2">
                {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                    className="flex-1 bg-brand/20 hover:bg-brand/40 rounded-t transition-colors relative group"
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {height * 100}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-graphite-500">
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
            <div className="bg-graphite-900 rounded-lg p-4 border border-graphite-700">
              <h3 className="text-sm font-medium text-white mb-4">Service Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Engine Services', value: 35, color: 'bg-brand' },
                  { label: 'Brake Services', value: 25, color: 'bg-blue-400' },
                  { label: 'Electrical', value: 20, color: 'bg-purple-400' },
                  { label: 'General Maintenance', value: 20, color: 'bg-orange-400' },
                ].map((item, index) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-graphite-400">{item.label}</span>
                      <span className="text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-graphite-700 rounded-full overflow-hidden">
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
            className="w-full mt-6 py-3 bg-graphite-700 hover:bg-graphite-600 border border-graphite-600 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
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
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-brand/10 to-purple-500/10 rounded-xl border border-brand/20 p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-6 w-6 text-brand" />
              <h2 className="text-lg md:text-xl font-semibold text-white">
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
                    <h4 className="text-sm font-semibold mb-1">{insight.title}</h4>
                    <p className="text-xs opacity-80">{insight.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/insights')}
              className="w-full mt-6 py-3 bg-brand hover:bg-brand/90 text-graphite-900 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
            >
              <Sparkles className="h-4 w-4" />
              View AI Insights
            </motion.button>
          </motion.section>

          {/* Marketing Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="h-6 w-6 text-blue-400" />
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Marketing
              </h2>
            </div>

            <p className="text-sm text-graphite-300 mb-6">
              Grow your garage with powerful marketing tools. Send promotional offers, reminders, and engage with your customers.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-graphite-300">
                <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                <span>Send promotional SMS/Email campaigns</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-graphite-300">
                <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                <span>Service reminders & follow-ups</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-graphite-300">
                <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                <span>Customer loyalty programs</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/marketing')}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Megaphone className="h-4 w-4" />
              Open Marketing Center
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.section>
        </div>
      </div>

      {/* Upcoming Schedule - Mobile Full Width */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6 md:mt-8 bg-graphite-800 rounded-xl border border-graphite-700 p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-brand" />
            <h2 className="text-base md:text-lg font-semibold text-white">
              Today's Schedule
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/calendar')}
            className="text-sm text-brand hover:text-brand/80 font-medium transition-colors"
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
              transition={{ duration: 0.3, delay: 0.65 + index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-graphite-900 rounded-lg border border-graphite-700"
            >
              <span className="text-sm font-mono text-brand shrink-0">{item.time}</span>
              <span className="flex-1 text-sm text-white">{item.task}</span>
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-md font-medium',
                  item.status === 'completed'
                    ? 'bg-green-500/10 text-green-400'
                    : item.status === 'in-progress'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-graphite-700 text-graphite-400'
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
    </div>
  )
}
