"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/config/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavMainProps {
  items: NavItem[];
}

export default function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for base dashboard, partial match for sub-routes
    if (href === "/student") return pathname === "/student";
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const activeClass =
    "bg-gradient-to-r from-blue-600 to-blue-500 text-white min-h-12 px-4 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(37,99,235,0.45)] transition-all duration-300 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:shadow-none";

  const inactiveClass =
    "text-gray-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 border border-transparent min-h-12 px-4 rounded-2xl hover:scale-[1.02] transition-all duration-300 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:border-0";

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:px-1.5">
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1.5 group-data-[collapsible=icon]:space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className={active ? activeClass : inactiveClass}
                >
                  <Link href={item.href}>
                    <Icon size={22} className="shrink-0" />
                    <span className="text-[15px] font-medium ml-3 group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
