'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useSidebar } from './sidebar'

/**
 * Sidebar Logo Component
 *
 * Displays the RevOS logo with smooth animations:
 * - Icon-only when collapsed
 * - Icon + text when expanded
 * - Smooth scale and slide transitions
 */
export function SidebarLogo() {
  const { open, animate } = useSidebar()

  return (
    <a
      href="/"
      className="relative z-20 flex items-center text-sm font-normal text-graphite-900 group"
    >
      <motion.div
        className="h-8 w-8 shrink-0 rounded-lg bg-graphite-900 flex items-center justify-center shadow-lg shadow-graphite-900/20 group-hover:shadow-graphite-900/40 transition-shadow duration-300"
        animate={{
          scale: open ? 1 : 1.1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <span className="text-brand font-bold text-xl">R</span>
      </motion.div>
      <motion.span
        initial={false}
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          x: animate ? (open ? 0 : -8) : 0,
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
          delay: animate && open ? 0.05 : 0,
        }}
        className="font-bold text-lg whitespace-pre text-graphite-900 inline-block tracking-tight ml-2"
        style={{
          display: animate && !open ? 'none' : 'inline-block',
        }}
      >
        RevOS
      </motion.span>
    </a>
  )
}
