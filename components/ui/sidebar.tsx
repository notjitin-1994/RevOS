"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
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
    <>
      <motion.div
        className={cn(
          "h-full py-4 hidden md:flex md:flex-col bg-graphite-900 w-[300px] shrink-0 border-r border-gray-800 sidebar-scroll-hide",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "80px") : "300px",
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for smooth feel
        }}
        onMouseEnter={() => setOpen?.(true)}
        onMouseLeave={() => setOpen?.(false)}
        {...props}
      >
        <div className={cn(
          "flex flex-col h-full min-w-0 overflow-hidden",
          open ? "px-4" : "items-center px-2"
        )}>
          {children as React.ReactNode}
        </div>
      </motion.div>
    </>
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
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-graphite-900 w-full border-b border-gray-800"
        )}
        {...props}
      >
        <div className="flex justify-between z-20 w-full items-center">
          <span className="text-brand font-bold text-lg">RevOS</span>
          <IconMenu2
            className="text-brand cursor-pointer"
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
              "fixed h-full w-[280px] inset-0 top-16 left-0 bg-graphite-900 z-[100] flex flex-col justify-between p-6 border-r border-gray-800",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 text-brand cursor-pointer"
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

  return (
    <a
      href={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-lg hover:bg-graphite-800 transition-all duration-300 cursor-pointer overflow-hidden min-w-0",
        open ? "justify-start gap-3 px-3 py-3" : "justify-center py-3",
        className
      )}
      style={{
        overflow: 'hidden',
        minWidth: 0
      } as any}
      {...props}
    >
      <motion.div
        animate={{
          scale: open ? 1 : 1.1,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="shrink-0"
      >
        {link.icon}
      </motion.div>

      <motion.span
        initial={false}
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          x: animate ? (open ? 0 : -10) : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="text-white text-sm group-hover/sidebar:translate-x-1 transition-transform duration-200 whitespace-nowrap font-medium overflow-hidden"
        style={{
          display: animate && !open ? 'none' : 'block',
          overflow: 'hidden',
          minWidth: 0,
          flexShrink: 1
        } as any}
      >
        {link.label}
      </motion.span>
    </a>
  );
};
