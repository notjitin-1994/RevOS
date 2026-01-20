import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'

export const metadata: Metadata = {
  title: 'RevvOs - Service Scope Management',
  description: 'Manage service scope master data',
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
