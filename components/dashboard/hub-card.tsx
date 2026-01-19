'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatItem {
  label: string
  value: number | string
  color?: string
}

interface HubCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  index?: number
  stats?: StatItem[]
  isLoading?: boolean
}

export function HubCard({
  href,
  icon,
  title,
  description,
  index = 0,
  stats = [],
  isLoading = false,
}: HubCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href} className="block h-full">
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            {/* Icon with gradient background */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 w-fit">
              {icon}
            </div>

            <CardTitle className="mt-4">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </CardHeader>

          {/* Stats Section */}
          {stats.length > 0 && (
            <CardContent className="pb-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">{stat.label}</span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          stat.color || 'text-gray-900'
                        )}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </Link>
    </motion.div>
  )
}
