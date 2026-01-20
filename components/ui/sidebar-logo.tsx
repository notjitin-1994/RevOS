'use client'

import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar'

/**
 * Sidebar Logo Component
 *
 * Displays the RevOS logo with smooth animations:
 * - Icon-only when collapsed
 * - Icon + text when expanded
 * - Simple, clean fade transitions
 */
export function SidebarLogo() {
  const { open, animate } = useSidebar()

  return (
    <a
      href="/"
      className="relative z-20 flex items-center text-sm font-normal text-graphite-900 group"
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
        RevOS
      </span>
    </a>
  )
}
