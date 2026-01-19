'use client'

import { useRouter } from 'next/navigation'
import {
  LogOut,
  Building,
  ClipboardList,
  Users,
  UserPlus,
  Wrench,
  Package,
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
      label: 'Garage Management Hub',
      href: '/dashboard',
      icon: <Building className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Service Center',
      href: '/job-cards',
      icon: <Settings className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Crew Station',
      href: '/employee-management',
      icon: <Users className="h-5 w-5 shrink-0 text-graphite-900" />,
    },
    {
      label: 'Client Hub',
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
      label: 'Parts Repository',
      href: '/inventory',
      icon: <Package className="h-5 w-5 shrink-0 text-graphite-900" />,
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
