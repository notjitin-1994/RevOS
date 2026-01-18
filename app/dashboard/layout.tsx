import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'

export const metadata: Metadata = {
  title: 'RevOS - Dashboard',
  description: 'Your garage overview and analytics',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
