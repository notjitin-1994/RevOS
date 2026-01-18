'use client'

import { useRouter } from 'next/navigation'
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Users,
  UserPlus,
  Wrench,
  Package,
  Calendar as CalendarIcon,
  Settings,
} from 'lucide-react'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { SidebarLogo } from '@/components/ui/sidebar-logo'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'

interface AppSidebarProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  hideMobile?: boolean
}

export function AppSidebar({ open, setOpen, hideMobile = false }: AppSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    router.push('/login')
  }

  interface NavLink {
    label: string
    href: string
    icon: React.JSX.Element
    onClick?: () => void
  }

  const mainLinks: NavLink[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Job Card Management',
      href: '/job-cards',
      icon: <ClipboardList className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Employee Management',
      href: '/employee-management',
      icon: <Users className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Customer Management',
      href: '/customer-management',
      icon: <UserPlus className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Vehicle Catalog',
      href: '/vehicle-catalog',
      icon: <Wrench className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Vehicle Registry',
      href: '/vehicles',
      icon: <MotorcycleIcon className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Parts & Inventory',
      href: '/inventory',
      icon: <Package className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Calendar & Schedule',
      href: '/calendar',
      icon: <CalendarIcon className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
  ]

  const bottomLinks: NavLink[] = [
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Logout',
      href: '#',
      icon: <LogOut className="h-5 w-5 shrink-0 text-graphite-900" />,
      onClick: handleLogout,
    },
  ]

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true} hideMobile={hideMobile}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-hidden">
          <SidebarLogo />
          <div className="mt-8 flex flex-col gap-2">
            {mainLinks.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={{
                  label: link.label,
                  href: link.href,
                  icon: link.icon,
                  onClick: link.onClick,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {bottomLinks.map((link, idx) => (
            <SidebarLink
              key={idx}
              link={{
                label: link.label,
                href: link.href,
                icon: link.icon,
                onClick: link.onClick,
              }}
            />
          ))}
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
