import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'

export const metadata: Metadata = {
  title: 'RevvOs - Vehicle Management',
  description: 'Manage all registered vehicles',
}

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
