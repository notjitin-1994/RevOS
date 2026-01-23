'use client'

import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar'

/**
 * Sidebar Logo Component
 *
 * Displays the RevvOS logo with smooth animations:
 * - Icon-only when collapsed (centered like nav icons)
 * - Icon + text when expanded
 * - Simple, clean fade transitions
 */
export function SidebarLogo() {
  const { open, animate } = useSidebar()

  return (
    <a
      href="/"
      className={cn(
        "relative z-20 flex items-center text-sm font-normal text-graphite-900 group transition-all duration-300",
        open ? "justify-start" : "justify-center w-12"
      )}
    >
      <div className="h-8 w-8 shrink-0 rounded-lg bg-graphite-900 flex items-center justify-center shadow-lg shadow-graphite-900/20 group-hover:shadow-graphite-900/40 transition-shadow duration-300">
        <span className="text-brand font-bold text-xl">R</span>
      </div>

      <span
        className={cn(
          "font-bold text-lg whitespace-pre text-graphite-900 inline-block tracking-tight ml-2 transition-opacity duration-200 overflow-hidden",
          !open && "opacity-0 pointer-events-none absolute"
        )}
        style={{
          opacity: open ? 1 : 0,
        }}
      >
        RevvOS
      </span>
    </a>
  )
}
