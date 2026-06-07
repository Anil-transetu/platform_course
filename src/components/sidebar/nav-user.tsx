"use client";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, Bell, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavUser() {
  return (
    <div className="p-4 border-t border-[#2a374a]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-card/5 p-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600">
                <Image 
                  src="https://ui-avatars.com/api/?name=Alex+Thompson&background=random" 
                  alt="User" 
                  width={40}
                  height={40}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-white">Alex Thompson</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Super Admin</p>
              </div>
            </div>

            <button
              className="text-gray-400 hover:text-white transition-colors"
              title="More"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#1a2332] border-[#2a374a] text-white" side="top" align="end" sideOffset={10}>
          <DropdownMenuItem asChild className="hover:bg-card/10 cursor-pointer">
            <Link href="/settings/general" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>User Details</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-card/10 cursor-pointer">
            <Link href="/settings/notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-card/10 cursor-pointer">
            <Link href="/settings/general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2a374a]" />
          <DropdownMenuItem 
            className="hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-2"
            onClick={() => {
              document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/login";
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

