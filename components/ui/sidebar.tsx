"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface SidebarContextProps {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  hideMobile?: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
  hideMobile = false,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  hideMobile?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, hideMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  hideMobile = false,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  hideMobile?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      <SidebarContext.Provider value={{ open, setOpen, animate, hideMobile }}>
        {children}
      </SidebarContext.Provider>
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-full py-4 hidden md:flex md:flex-col bg-brand w-[300px] shrink-0 border-r border-brand-hover sidebar-scroll-hide overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? 300 : 80) : 300,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 30,
        mass: 1,
        velocity: 0,
      }}
      onMouseEnter={() => setOpen?.(true)}
      onMouseLeave={() => setOpen?.(false)}
      {...props}
    >
      <div className={cn(
        "flex flex-col h-full min-w-0",
        open ? "px-4" : "items-center px-2"
      )}>
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen, hideMobile } = useSidebar();

  // If hideMobile is true, don't render the mobile sidebar at all
  if (hideMobile) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-brand w-full border-b border-brand-hover"
        )}
        {...props}
      >
        <div className="flex justify-between z-20 w-full items-center">
          <span className="text-graphite-900 font-bold text-lg">RevvOs</span>
          <IconMenu2
            className="text-graphite-900 cursor-pointer"
            onClick={() => setOpen?.(!open)}
          />
        </div>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-[280px] inset-0 top-16 left-0 bg-brand z-[100] flex flex-col justify-between p-6 border-r border-brand-hover",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 text-graphite-900 cursor-pointer"
              onClick={() => setOpen?.(!open)}
            >
              <IconX size={24} />
            </div>
            {children}
          </motion.div>
        )}
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation if already on this page
    if (pathname === link.href) {
      e.preventDefault();
      return;
    }

    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');

  return (
    <a
      href={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center transition-all cursor-pointer overflow-visible relative h-12",
        open ? "rounded-lg justify-start px-3 w-full" : "rounded-xl justify-center px-2 w-12",
        "hover:bg-graphite-700/50",
        isActive && "bg-graphite-700 shadow-md",
        className
      )}
      {...props}
    >
      <div
        className="shrink-0 flex items-center justify-center transition-all duration-200"
        style={{ color: isActive ? '#a3e635' : '#334155' }}
      >
        {React.cloneElement(link.icon as React.ReactElement, {
          className: cn(
            "h-5 w-5 shrink-0 transition-colors duration-200",
            isActive && "!text-lime-400",
            !isActive && "!text-graphite-700",
            (link.icon as React.ReactElement).props.className
          ),
          style: { color: isActive ? '#a3e635' : '#334155' },
        } as any)}
      </div>

      <span
        className={cn(
          "text-sm whitespace-nowrap font-medium ml-3 transition-opacity duration-200",
          !open && "opacity-0 pointer-events-none absolute",
          isActive ? "text-lime-400" : "text-graphite-700"
        )}
        style={{
          opacity: open ? 1 : 0,
        }}
      >
        {link.label}
      </span>
    </a>
  );
};
