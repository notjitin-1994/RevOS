'use client'

import { useState } from 'react'
import {
  Users,
  Wrench,
  Settings,
  CarFront,
  Package,
  Calendar,
  FileText,
  ChevronDown,
  Activity,
  Zap,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'

/**
 * System Diagnostic Panel - Features Display (Light Mode Glassmorphic)
 *
 * Design Philosophy: Modern Glassmorphism with Graphite Accents
 *
 * Features:
 * - System module cards with technical specifications
 * - Hover-to-reveal interaction pattern
 * - Clean typography for data fields
 * - Graphite accent colors on active states
 * - Smooth expand/collapse animations
 * - Glassmorphic cards with backdrop blur and subtle borders
 *
 * Design System:
 * - Background: Glassmorphic white/gray (bg-white/70, bg-gray-50/60)
 * - Borders: Subtle gray borders (border-gray-200/50, border-graphite-200/30)
 * - Typography: font-display (headers), font-mono (specs)
 * - Icons: Lucide React with soft containers
 * - Depth: Soft shadows for depth, glassmorphic overlays
 * - Accents: Graphite colors (text-graphite-600, bg-graphite-100)
 */

interface Module {
  id: string
  title: string
  icon: React.ElementType
  specs: string[]
  status: 'operational' | 'active' | 'standby'
}

const modules: Module[] = [
  {
    id: 'employee',
    title: 'EMPLOYEE MANAGEMENT SERVICE',
    icon: Users,
    specs: ['Owner Role', 'Admin Role', 'Mechanic Role', 'Customer Role'],
    status: 'operational',
  },
  {
    id: 'customer',
    title: 'CUSTOMER RELATIONSHIP MANAGEMENT',
    icon: Users,
    specs: ['Bike Registry', 'Service History', 'Labor Tracking', 'Parts Tracking'],
    status: 'operational',
  },
  {
    id: 'service',
    title: 'SERVICE SCOPE',
    icon: Settings,
    specs: ['Make Config', 'Model Config', 'Year Configuration', 'Variant Setup'],
    status: 'active',
  },
  {
    id: 'bike',
    title: 'VEHICLE MANAGEMENT',
    icon: CarFront,
    specs: ['Owner Mapping', 'Engine Number', 'Chassis Number', 'VIN Registry'],
    status: 'operational',
  },
  {
    id: 'inventory',
    title: 'PARTS & INVENTORY MANAGEMENT',
    icon: Package,
    specs: ['Stock Levels', 'Margin Tracking', 'Low-Stock Alerts', 'Supplier Data'],
    status: 'standby',
  },
  {
    id: 'calendar',
    title: 'CALENDAR AND SCHEDULE MANAGEMENT',
    icon: Calendar,
    specs: ['Employee Tracker', 'Workslot Manager', 'Bay Assignment', 'Time Logs'],
    status: 'active',
  },
  {
    id: 'jobcards',
    title: 'JOB CARD MANAGEMENT',
    icon: FileText,
    specs: ['Synced History', 'Status Tracking', 'Invoicing', 'Parts Linkage'],
    status: 'operational',
  },
]

export function SystemDiagnosticPanel() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  return (
    <div className="relative h-full overflow-hidden">
      {/* Blurred Background Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

      {/* Content Container */}
      <div className="relative h-full overflow-y-auto px-4 sm:px-5 md:px-6 py-6 md:py-8 mb-6 lg:mb-0">
      <div className="relative">
      {/* RevOS Brand Header */}
      <div className="mb-8 md:mb-8">
        <h1 className="text-4xl sm:text-3xl md:text-3xl font-display font-bold text-graphite-900 tracking-tight mb-3">
          RevOS
        </h1>
        <p className="text-base sm:text-sm md:text-sm text-graphite-600 font-display tracking-wide">
          AUTOMOTIVE SERVICE INTELLIGENCE
        </p>
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-graphite-300 via-graphite-400 to-transparent mt-5" />
      </div>

      {/* Value Proposition - Animated Glassmorphic Tiles */}
      <div className="mb-8 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tile 1 - Real-time Visibility */}
          <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 transition-all duration-300 hover:bg-white/90 border-2 border-graphite-300/50 hover:border-graphite-400 shadow-sm hover:shadow-md">
            {/* Subtle glassmorphic shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 bg-graphite-50/80 backdrop-blur-sm group-hover:bg-graphite-100 transition-colors duration-300 flex items-center justify-center flex-shrink-0 border-2 border-graphite-400/50 rounded-full">
                  <Activity className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-600 group-hover:text-graphite-800 transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-graphite-800 leading-snug">
                  Real-time Tracking
                </h3>
              </div>
            </div>
          </div>

          {/* Tile 2 - Efficiency */}
          <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 transition-all duration-300 hover:bg-white/90 border-2 border-graphite-300/50 hover:border-graphite-400 shadow-sm hover:shadow-md">
            {/* Subtle glassmorphic shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 bg-graphite-50/80 backdrop-blur-sm group-hover:bg-graphite-100 transition-colors duration-300 flex items-center justify-center flex-shrink-0 border-2 border-graphite-400/50 rounded-full">
                  <Zap className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-600 group-hover:text-graphite-800 transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-graphite-800 leading-snug">
                  Work Smarter
                </h3>
              </div>
            </div>
          </div>

          {/* Tile 3 - Customer Experience */}
          <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 transition-all duration-300 hover:bg-white/90 border-2 border-graphite-300/50 hover:border-graphite-400 shadow-sm hover:shadow-md">
            {/* Subtle glassmorphic shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 bg-graphite-50/80 backdrop-blur-sm group-hover:bg-graphite-100 transition-colors duration-300 flex items-center justify-center flex-shrink-0 border-2 border-graphite-400/50 rounded-full">
                  <MessageSquare className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-600 group-hover:text-graphite-800 transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-graphite-800 leading-snug">
                  Happy Customers
                </h3>
              </div>
            </div>
          </div>

          {/* Tile 4 - Growth */}
          <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 transition-all duration-300 hover:bg-white/90 border-2 border-graphite-300/50 hover:border-graphite-400 shadow-sm hover:shadow-md">
            {/* Subtle glassmorphic shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 bg-graphite-50/80 backdrop-blur-sm group-hover:bg-graphite-100 transition-colors duration-300 flex items-center justify-center flex-shrink-0 border-2 border-graphite-400/50 rounded-full">
                  <TrendingUp className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-600 group-hover:text-graphite-800 transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-graphite-800 leading-snug">
                  Grow Faster
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Text */}
      <div className="mb-6 md:mb-6">
        <p className="text-base sm:text-sm md:text-sm text-graphite-700 leading-loose sm:leading-relaxed md:leading-relaxed">
          Discover how RevOS transforms garage operations with intelligent features designed for automotive excellence below.
        </p>
      </div>

      {/* CTA Link */}
      <div className="mb-10 md:mb-8">
        <a
          href="/sign-up"
          className="group inline-flex items-center gap-2 text-base sm:text-sm md:text-sm text-graphite-700 hover:text-graphite-900 transition-colors duration-200 font-semibold"
        >
          <span>Start using RevOS to manage your Garage now</span>
          <svg
            className="w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      {/* Section Header */}
      <div className="mb-8 md:mb-8">
        <h2 className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600 mb-3">
          SYSTEM DIAGNOSTICS
        </h2>
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-graphite-300 via-graphite-400 to-transparent" />
      </div>

      {/* System Status Banner */}
      <div className="mb-10 p-6 sm:p-4 md:p-4 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-graphite-300/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600 mb-2">
              System Status
            </p>
            <p className="font-mono text-base sm:text-sm md:text-sm text-graphite-900 font-semibold">
              ALL SYSTEMS OPERATIONAL
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-2">
            <div className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-graphite-600 animate-pulse shadow-md" />
            <span className="font-mono text-sm sm:text-xs md:text-xs text-graphite-600 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600 mb-5">
          SYSTEM MODULES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3">
          {modules.map((module, index) => {
          const Icon = module.icon
          const isActive = activeModule === module.id

          return (
            <div
              key={module.id}
              className={`group relative ${module.id === 'jobcards' ? 'md:col-span-2' : ''}`}
              onMouseEnter={() => setActiveModule(module.id)}
              onMouseLeave={() => setActiveModule(null)}
            >
              {/* Module Card */}
              <div
                className={`
                  relative overflow-hidden rounded-2xl transition-all duration-300 ease-out cursor-pointer backdrop-blur-xl
                  ${
                    isActive
                      ? 'bg-white/95 shadow-lg border-2 border-graphite-400'
                      : 'bg-white/70 hover:bg-white/85 border-2 border-graphite-300/50 hover:border-graphite-400 shadow-sm hover:shadow-md'
                  }
                `}
              >
                {/* Card Header - Always Visible */}
                <div className="flex items-center gap-4 sm:gap-3 p-5 sm:p-4 md:p-4">
                  {/* Icon Container */}
                  <div
                    className={`
                      flex-shrink-0 w-14 h-14 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                      ${
                        isActive
                          ? 'bg-graphite-100 border-graphite-500'
                          : 'bg-gray-50/80 border-graphite-400/50'
                      }
                    `}
                  >
                    <Icon
                      className={`w-7 h-7 sm:w-6 sm:h-6 md:w-5 md:h-5 transition-colors duration-300 ${
                        isActive ? 'text-graphite-700' : 'text-graphite-600'
                      }`}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`
                        font-display font-semibold uppercase tracking-wide transition-colors duration-300 text-sm sm:text-sm md:text-sm
                        ${isActive ? 'text-graphite-900' : 'text-graphite-800'}
                      `}
                    >
                      {module.title}
                    </h4>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <ChevronDown
                      className={`w-6 h-6 sm:w-5 sm:h-5 md:w-5 md:h-5 transition-all duration-300 ${
                        isActive ? 'text-graphite-700' : 'text-graphite-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Specifications - Expandable Section */}
                <div
                  className={`
                    overflow-hidden transition-all duration-300 ease-out
                    ${isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="px-5 sm:px-4 md:px-4 pb-5 sm:pb-4 md:pb-4 pt-0">
                    <div className="border-t-2 border-graphite-300/50 rounded-full pt-5 sm:pt-4 md:pt-4">
                      <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600 mb-4">
                        SPECIFICATIONS
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 md:gap-2">
                        {module.specs.map((spec, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 px-4 py-3 sm:px-3 sm:py-2 md:px-3 md:py-2 bg-gray-50/80 backdrop-blur-sm border-2 border-graphite-400/50 rounded-full"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-graphite-600 flex-shrink-0" />
                            <code className="font-mono text-sm sm:text-sm md:text-xs text-graphite-700">
                              {spec}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active State Indicator Line */}
                <div
                  className={`
                    absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl transition-all duration-300 rounded-r-full
                    ${isActive ? 'bg-graphite-600' : 'bg-transparent'}
                  `}
                />
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-10 pt-8 border-t-2 border-graphite-300/50 rounded-full">
        <div className="grid grid-cols-3 gap-6 sm:gap-4 md:gap-4">
          <div className="text-center">
            <p className="font-mono text-3xl sm:text-2xl md:text-2xl font-bold text-graphite-800 mb-2">7</p>
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600">
              Modules
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl sm:text-2xl md:text-2xl font-bold text-graphite-800 mb-2">24</p>
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600">
              Features
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl sm:text-2xl md:text-2xl font-bold text-graphite-800 mb-2">99.9%</p>
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-600">
              Uptime
            </p>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}
