"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, Bell, User, ChevronUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuthStore";

export default function NavUser() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, logout } = useAuthStore();
  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const displaySubtitle = user?.email || role || "Guest";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="h-16 border-t border-[#2a374a] rounded-none hover:bg-card/5 transition-colors group-data-[collapsible=icon]:!border-t-0 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
              <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600 shrink-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
                  <Image 
                    src={`https://ui-avatars.com/api/?name=${displayName.replace(/\s+/g, '+')}&background=random`} 
                    alt="User" 
                    width={40}
                    height={40}
                    unoptimized
                  />
                </div>

                <div className="flex-1 text-left group-data-[collapsible=icon]:hidden truncate">
                  {/* in the first p tag we have to pass the user name and in the second one we have to pass the user mail and user profile image is mandatory. */}
                  <p className="text-sm font-medium text-white leading-tight truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{displaySubtitle}</p>
                </div>

                <div className="text-gray-400 mr-4 group-data-[collapsible=icon]:hidden transition-transform duration-200">
                  {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 bg-[#111827]/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-2 text-white shadow-[0_0_30px_rgba(0,0,0,0.35)]"
            side="top"
            align="end"
            sideOffset={12}
          >
            <DropdownMenuItem asChild className="rounded-xl hover:scale-[1.02] hover:bg-slate-800/50 hover:border-slate-600 border border-transparent transition-all duration-300 cursor-pointer py-3">
              <Link href="/settings/general" className="flex items-center gap-3 w-full">
                <User className="w-5 h-5 shrink-0" />
                <span>User Details</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl hover:scale-[1.02] hover:bg-slate-800/50 hover:border-slate-600 border border-transparent transition-all duration-300 cursor-pointer py-3">
              <Link href="/settings/notifications" className="flex items-center gap-3 w-full">
                <Bell className="w-5 h-5 shrink-0" />
                <span>Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl hover:scale-[1.02] hover:bg-slate-800/50 hover:border-slate-600 border border-transparent transition-all duration-300 cursor-pointer py-3">
              <Link href="/settings/appearance" className="flex items-center gap-3 w-full">
                <Settings className="w-5 h-5 shrink-0" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700 my-2" />
            <DropdownMenuItem 
              className="rounded-xl border border-transparent hover:border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-3 py-3 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => {
                logout();
                window.location.replace("/login");
              }}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

