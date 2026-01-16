'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#efffb1]">
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} hideMobile={true} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#efffb1] pb-16 md:pb-0">
        {children}
      </main>

      {/* Global Mobile Bottom Navigation */}
      <MobileBottomNav onLogout={handleLogout} />
    </div>
  )
}
