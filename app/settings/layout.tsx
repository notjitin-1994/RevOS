import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'

export const metadata: Metadata = {
  title: 'RevvOs - Settings',
  description: 'Manage your RevvOs account settings',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
