import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'
import { JobCardQueryProvider } from './lib/providers/query-provider'

export const metadata: Metadata = {
  title: 'RevvOS - Service Center',
  description: 'Track and manage all service job cards',
}

export default function JobCardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <JobCardQueryProvider>
      <AppLayout>{children}</AppLayout>
    </JobCardQueryProvider>
  )
}
