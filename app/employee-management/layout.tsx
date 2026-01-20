import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'

export const metadata: Metadata = {
  title: 'RevvOs - Crew Station',
  description: 'Manage your garage employees',
}

export default function EmployeeManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
