"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  User,
  Building2,
  Users,
  Layers,
  BookOpen,
  UserCheck,
  HelpCircle,
  FileEdit,
  Settings,
} from "lucide-react";

export default function NavMain() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User", href: "/admin/users", icon: User },
    { label: "Institutions", href: "/admin/institutions", icon: Building2 },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Batches", href: "/admin/batches", icon: Layers },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Tutors", href: "/admin/tutors", icon: UserCheck },
    { label: "Quizzes", href: "/admin/quizzes", icon: HelpCircle },
    { label: "Assignments", href: "/admin/assignments", icon: FileEdit },
  ];

  return (
    <nav className="p-4">
      <ul className="space-y-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#2a374a]"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 px-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">Configuration</p>
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive("/admin/settings")
              ? "bg-blue-600 text-white font-medium"
              : "text-gray-400 hover:text-white hover:bg-[#2a374a]"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}
