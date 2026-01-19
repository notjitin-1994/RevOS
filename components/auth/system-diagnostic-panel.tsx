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
 * System Diagnostic Panel - Features Display
 *
 * Design Philosophy: "The Digital Volt" - Industrial precision meets digital velocity
 *
 * Features:
 * - System module cards with technical specifications
 * - Hover-to-reveal interaction pattern
 * - Monospace typography for data fields
 * - Brand lime accents on active states
 * - Smooth expand/collapse animations
 * - MOBILE-FIRST: Optimized for small screens with proper spacing and typography
 *
 * Design System Compliance:
 * - Background: bg-graphite-800 (cards), bg-graphite-900 (main)
 * - Borders: border-graphite-700 (subtle), border-brand/50 (active)
 * - Typography: font-display (headers), font-mono (specs)
 * - Icons: Lucide React with technical containers
 * - Depth: shadow-glow for active states
 * - Mobile: Touch targets 44px+, readable typography, proper spacing
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
    <div className="h-full overflow-y-auto px-4 sm:px-5 md:px-6 py-6 md:py-8 mb-6 lg:mb-0 backdrop-blur-[3px] bg-graphite-900/30 border border-graphite-700/50 lg:border-0 rounded-xl">
      {/* Subtle shine effect for entire panel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl" />
      <div className="relative z-10">
      {/* RevOS Brand Header */}
      <div className="mb-8 md:mb-8">
        <h1 className="text-4xl sm:text-3xl md:text-3xl font-display font-bold text-white tracking-tight mb-3">
          RevOS
        </h1>
        <p className="text-base sm:text-sm md:text-sm text-brand font-display tracking-wide">
          AUTOMOTIVE SERVICE INTELLIGENCE
        </p>
        <div className="h-px w-full bg-graphite-700 mt-5" />
      </div>

      {/* Value Proposition - Animated Tiles */}
      <div className="mb-8 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tile 1 - Real-time Visibility */}
          <div className="group relative overflow-hidden rounded-lg backdrop-blur-md bg-graphite-800/40 transition-all duration-300 hover:bg-graphite-800/60 border border-transparent hover:border-graphite-700/30">
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-lg bg-graphite-900/60 backdrop-blur-sm group-hover:bg-graphite-900/80 transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-400 group-hover:text-brand transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-white leading-snug">
                  Real-time Tracking
                </h3>
              </div>
            </div>
          </div>

          {/* Tile 2 - Efficiency */}
          <div className="group relative overflow-hidden rounded-lg backdrop-blur-md bg-graphite-800/40 transition-all duration-300 hover:bg-graphite-800/60 border border-transparent hover:border-graphite-700/30">
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-lg bg-graphite-900/60 backdrop-blur-sm group-hover:bg-graphite-900/80 transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-400 group-hover:text-brand transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-white leading-snug">
                  Work Smarter
                </h3>
              </div>
            </div>
          </div>

          {/* Tile 3 - Customer Experience */}
          <div className="group relative overflow-hidden rounded-lg backdrop-blur-md bg-graphite-800/40 transition-all duration-300 hover:bg-graphite-800/60 border border-transparent hover:border-graphite-700/30">
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-lg bg-graphite-900/60 backdrop-blur-sm group-hover:bg-graphite-900/80 transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-400 group-hover:text-brand transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-white leading-snug">
                  Happy Customers
                </h3>
              </div>
            </div>
          </div>

          {/* Tile 4 - Growth */}
          <div className="group relative overflow-hidden rounded-lg backdrop-blur-md bg-graphite-800/40 transition-all duration-300 hover:bg-graphite-800/60 border border-transparent hover:border-graphite-700/30">
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-4 md:p-3">
              <div className="flex items-center gap-4 sm:gap-3 md:gap-2">
                <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-lg bg-graphite-900/60 backdrop-blur-sm group-hover:bg-graphite-900/80 transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-graphite-400 group-hover:text-brand transition-colors duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-sm md:text-xs font-display font-semibold text-white leading-snug">
                  Grow Faster
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Text */}
      <div className="mb-6 md:mb-6">
        <p className="text-base sm:text-sm md:text-sm text-white leading-loose sm:leading-relaxed md:leading-relaxed">
          Discover how RevOS transforms garage operations with intelligent features designed for automotive excellence below.
        </p>
      </div>

      {/* CTA Link */}
      <div className="mb-10 md:mb-8">
        <a
          href="/sign-up"
          className="group inline-flex items-center gap-2 text-base sm:text-sm md:text-sm text-brand hover:text-brand-hover transition-colors duration-200 font-semibold"
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
        <h2 className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400 mb-3">
          SYSTEM DIAGNOSTICS
        </h2>
        <div className="h-px w-full bg-graphite-700" />
      </div>

      {/* System Status Banner */}
      <div className="mb-10 p-6 sm:p-4 md:p-4 bg-graphite-800 rounded-lg border border-graphite-700/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400 mb-2">
              System Status
            </p>
            <p className="font-mono text-base sm:text-sm md:text-sm text-brand font-semibold">
              ALL SYSTEMS OPERATIONAL
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-2">
            <div className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-sm sm:text-xs md:text-xs text-graphite-400 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400 mb-5">
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
                  relative overflow-hidden rounded-lg transition-all duration-300 ease-out cursor-pointer
                  ${
                    isActive
                      ? 'bg-graphite-800 shadow-glow border border-brand/30'
                      : 'bg-graphite-800/50 hover:bg-graphite-800/70 border border-transparent hover:border-graphite-700/50'
                  }
                `}
              >
                {/* Card Header - Always Visible */}
                <div className="flex items-center gap-4 sm:gap-3 p-5 sm:p-4 md:p-4">
                  {/* Icon Container */}
                  <div
                    className={`
                      flex-shrink-0 w-14 h-14 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300
                      ${
                        isActive
                          ? 'bg-graphite-900'
                          : 'bg-graphite-900/80'
                      }
                    `}
                  >
                    <Icon
                      className={`w-7 h-7 sm:w-6 sm:h-6 md:w-5 md:h-5 transition-colors duration-300 ${
                        isActive ? 'text-brand' : 'text-graphite-400'
                      }`}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`
                        font-display font-semibold uppercase tracking-wide transition-colors duration-300 text-sm sm:text-sm md:text-sm
                        ${isActive ? 'text-brand' : 'text-white'}
                      `}
                    >
                      {module.title}
                    </h4>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <ChevronDown
                      className={`w-6 h-6 sm:w-5 sm:h-5 md:w-5 md:h-5 transition-all duration-300 ${
                        isActive ? 'text-brand' : 'text-graphite-600'
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
                    <div className="border-t border-graphite-700 pt-5 sm:pt-4 md:pt-4">
                      <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400 mb-4">
                        SPECIFICATIONS
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 md:gap-2">
                        {module.specs.map((spec, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 px-4 py-3 sm:px-3 sm:py-2 md:px-3 md:py-2 bg-graphite-900/50 rounded border border-graphite-700/30"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-brand/60 flex-shrink-0" />
                            <code className="font-mono text-sm sm:text-sm md:text-xs text-graphite-200">
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
                    absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300
                    ${isActive ? 'bg-brand' : 'bg-transparent'}
                  `}
                />
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-10 pt-8 border-t border-graphite-700">
        <div className="grid grid-cols-3 gap-6 sm:gap-4 md:gap-4">
          <div className="text-center">
            <p className="font-mono text-3xl sm:text-2xl md:text-2xl font-bold text-brand mb-2">7</p>
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400">
              Modules
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl sm:text-2xl md:text-2xl font-bold text-brand mb-2">24</p>
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400">
              Features
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl sm:text-2xl md:text-2xl font-bold text-brand mb-2">99.9%</p>
            <p className="text-sm sm:text-xs md:text-xs font-medium uppercase tracking-wider text-graphite-400">
              Uptime
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
