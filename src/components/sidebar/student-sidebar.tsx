"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  CalendarCheck, 
  Settings, 
  LogOut,
  GraduationCap,
  HelpCircle
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Courses", href: "/student/courses", icon: BookOpen },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
];

const accountLinks = [
  { label: "Settings", href: "/student/settings", icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/student") return pathname === "/student";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-64 h-screen bg-[#0B1221] text-gray-400 flex flex-col border-r border-gray-800 shrink-0 overflow-hidden">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <GraduationCap className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">CourseHub</h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-500 font-semibold">Student Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-8 scrollbar-none">
        <div>
          <ul className="space-y-1">
            {sidebarLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      active 
                        ? "bg-blue-600/10 text-blue-500 font-medium border border-blue-600/20" 
                        : "hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon size={20} className={cn("transition-colors", active ? "text-blue-500" : "group-hover:text-white")} />
                    <span>{link.label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="px-4 text-[10px] uppercase tracking-widest font-bold text-gray-600 mb-4">Account</p>
          <ul className="space-y-1">
            {accountLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      active 
                        ? "bg-blue-600/10 text-blue-500 font-medium border border-blue-600/20" 
                        : "hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon size={20} className={cn("transition-colors", active ? "text-blue-500" : "group-hover:text-white")} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="p-4 bg-white/5 mt-auto border-t border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative group cursor-pointer">
            <Image 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
              alt="Profile" 
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0B1221] rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-sm font-semibold truncate leading-tight">Alex Thompson</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Student</p>
          </div>
          <button className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-lg">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Support Footer */}
      <div className="px-6 py-4">
        <div className="bg-blue-600/5 rounded-xl p-3 border border-blue-600/10">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Academic Support</p>
          <button className="flex items-center gap-2 text-xs text-blue-500 font-medium hover:text-blue-400">
            <HelpCircle size={14} />
            Help Center
          </button>
        </div>
      </div>
    </aside>
  );
}
