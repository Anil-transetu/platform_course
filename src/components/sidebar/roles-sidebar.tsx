"use client";

import NavMain from "./nav-main";
import NavUser from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChevronLeft } from "lucide-react";
import { navigationConfig } from "@/config/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface RolesSidebarProps {
  role: string;
}

export default function RolesSidebar({ role }: RolesSidebarProps) {
  const pathname = usePathname();
  const [isCourseViewOrEdit, setIsCourseViewOrEdit] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const isViewOrEdit =
        pathname.startsWith("/admin/courses/create") ||
        pathname.startsWith("/admin/courses/view") ||
        (pathname.startsWith("/student/courses/") && pathname.length > "/student/courses/".length) ||
        searchParams.get("view") !== null ||
        searchParams.get("edit") !== null;
      setIsCourseViewOrEdit(isViewOrEdit);
    }
  }, [pathname]);

  if (isCourseViewOrEdit) {
    return null;
  }

  const config = navigationConfig[role] || navigationConfig.ADMIN;
  const { brand, mainNav } = config;
  const LogoIcon = brand.logoIcon;

  return (
    <>
      <Sidebar
        collapsible="icon"
        style={{
          "--sidebar": brand.theme.background,
          "--sidebar-foreground": brand.theme.foreground,
          "--sidebar-border": brand.theme.border,
          "--sidebar-accent": brand.theme.accent,
          "--sidebar-accent-foreground": brand.theme.accentForeground,
        } as React.CSSProperties}
      >
        <SidebarHeader className="p-6 border-b border-slate-700/50 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:h-20 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center min-h-[80px] relative">
          <div className="flex items-center justify-between w-full gap-3 group-data-[collapsible=icon]:justify-center relative">
            <div className="flex items-center gap-3 group/logo relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-data-[collapsible=icon]:group-hover/logo:opacity-0 transition-opacity">
                {LogoIcon ? (
                  <LogoIcon className="text-white" size={24} />
                ) : (
                  <span className="text-white font-bold">{brand.logoText}</span>
                )}
              </div>
              <div className="absolute inset-0 hidden items-center justify-center group-data-[collapsible=icon]:flex opacity-0 group-hover/logo:opacity-100 transition-all duration-200">
                <SidebarTrigger
                  className="
                  h-9 w-9 rounded-xl 
                  bg-slate-800/90 border border-slate-700
                  text-slate-300
                  hover:text-white
                  hover:border-white/20
                  hover:bg-white dark:bg-card/10
                  hover:shadow-lg hover:shadow-black/20
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                "
                />
              </div>
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <h2 className="text-lg font-bold leading-tight truncate text-white">{brand.title}</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                  {brand.subtitle}
                </p>
              </div>
            </div>

            {/* Default close button on expanded state */}
            <div className="hidden md:flex group-data-[collapsible=icon]:hidden absolute top-1 right-[-10] z-10">
              <SidebarTrigger
                className="
                h-8 w-8 rounded-xl
                bg-transparent border border-transparent
                text-transparent
                hover:border-white/20
                hover:bg-white dark:bg-card/10
                shadow-none hover:shadow-none
                hover:scale-105 active:scale-95
                transition-all duration-200
              "
              />
              <ChevronLeft
                size={18}
                className="absolute inset-0 m-auto pointer-events-none text-slate-200"
              />
            </div>

          </div>
        </SidebarHeader>

        <SidebarContent className="scrollbar-none">
          <NavMain items={mainNav} />
        </SidebarContent>

        <SidebarFooter className="p-0 border-t border-slate-700/50 group-data-[collapsible=icon]:border-t-0 group-data-[collapsible=icon]:!border-0">
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Global Floating Trigger for Mobile/Tablet (Rendered outside the Sidebar so it isn't unmounted when the mobile Sheet closes) */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <SidebarTrigger
          className="
          h-10 w-10
          rounded-xl
          bg-slate-900
          border border-white/10
          text-white/90
          shadow-lg
          hover:bg-slate-800
          hover:border-white/20
          hover:scale-105
          active:scale-95
          flex items-center justify-center
          transition-all duration-300
        "
        />
      </div>
    </>
  );
}
