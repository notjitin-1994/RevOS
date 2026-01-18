"use client";

import { cn } from "@/lib/utils";
import React, { createContext, useContext, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Users, UserPlus, Wrench, Package, Calendar, Settings, LogOut } from "lucide-react";
import { MotorcycleIcon } from "@/components/ui/motorcycle-icon";

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface MobileBottomNavContextProps {
  activePath: string;
  handleLogout?: () => void;
}

const MobileBottomNavContext = createContext<MobileBottomNavContextProps | undefined>(undefined);

export const useMobileBottomNav = () => {
  const context = useContext(MobileBottomNavContext);
  if (!context) {
    throw new Error("useMobileBottomNav must be used within MobileBottomNavProvider");
  }
  return context;
};

export const MobileBottomNavProvider = ({
  children,
  activePath,
  handleLogout,
}: {
  children: React.ReactNode;
  activePath: string;
  handleLogout?: () => void;
}) => {
  return (
    <MobileBottomNavContext.Provider value={{ activePath, handleLogout }}>
      {children}
    </MobileBottomNavContext.Provider>
  );
};

interface MobileBottomNavProps {
  onLogout?: () => void;
}

export const MobileBottomNav = ({ onLogout }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  const navLinks: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Job Cards', href: '/job-cards', icon: ClipboardList },
    { label: 'Employees', href: '/employee-management', icon: Users },
    { label: 'Customers', href: '/customer-management', icon: UserPlus },
    { label: 'Catalog', href: '/vehicle-catalog', icon: Wrench },
    { label: 'Vehicles', href: '/vehicles', icon: MotorcycleIcon },
    { label: 'Inventory', href: '/inventory', icon: Package },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Logout', href: '#', icon: LogOut, onClick: onLogout },
  ];

  // Scroll active item into view when pathname changes
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [pathname]);

  return (
    <MobileBottomNavProvider activePath={pathname} handleLogout={onLogout}>
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "md:hidden", // Only visible on mobile
          "bg-brand/95 backdrop-blur-md",
          "border-t border-brand-hover",
          "h-16 pb-safe" // Safe area for iPhone home bar
        )}
        aria-label="Mobile navigation"
      >
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex items-center gap-1",
            "h-full px-2",
            "overflow-x-auto",
            "scrollbar-hide", // Hide scrollbar for clean look
            // Horizontal scroll snapping
            "snap-x snap-mandatory"
          )}
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          } as any}
        >
          {navLinks.map((link, index) => (
            <MobileNavItem
              key={index}
              link={link}
              isActive={pathname === link.href || (link.href !== '#' && pathname.startsWith(link.href))}
              itemRef={
                pathname === link.href || (link.href !== '#' && pathname.startsWith(link.href))
                  ? activeItemRef
                  : undefined
              }
            />
          ))}
        </div>

        {/* Fade indicators for scroll */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand to-transparent pointer-events-none" />
      </nav>

      {/* Spacer for content to not be hidden behind nav */}
      <div className="h-16 md:hidden" />
    </MobileBottomNavProvider>
  );
};

interface MobileNavItemProps {
  link: NavLink;
  isActive: boolean;
  itemRef?: React.RefObject<HTMLAnchorElement>;
}

const MobileNavItem = ({ link, isActive, itemRef }: MobileNavItemProps) => {
  const { activePath, handleLogout } = useMobileBottomNav();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation if already on this page
    if (activePath === link.href) {
      e.preventDefault();
      return;
    }

    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  const Icon = link.icon;

  return (
    <a
      ref={itemRef}
      href={link.href}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center",
        "min-w-[72px] h-full", // Minimum 72px width, full height
        "px-3 py-2",
        "rounded-lg",
        "transition-all duration-200",
        "active:scale-[0.95]", // Active state for touch feedback
        "snap-start", // Scroll snap
        // Active state styling
        isActive
          ? "text-graphite-900 bg-graphite-900/10"
          : "text-graphite-900/70 hover:text-graphite-900 hover:bg-graphite-900/10"
      )}
      aria-label={link.label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon - larger than desktop for mobile */}
      <div className={cn(
        "h-6 w-6 flex items-center justify-center",
        "transition-transform duration-200",
        isActive && "scale-110"
      )}>
        <Icon className={cn("h-5 w-5 shrink-0")} />
      </div>

      {/* Label - shown below icon */}
      <span
        className={cn(
          "text-[10px] font-medium mt-1", // Small but readable
          "text-center",
          "whitespace-nowrap",
          "truncate max-w-[72px]", // Prevent overflow
          isActive && "font-semibold"
        )}
      >
        {link.label}
      </span>
    </a>
  );
};
