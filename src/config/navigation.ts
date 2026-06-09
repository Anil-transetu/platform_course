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
  FileText,
  CalendarCheck,
  GraduationCap
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export type RoleNavConfig = {
  brand: {
    title: string;
    subtitle: string;
    logoText?: string;
    logoIcon?: React.ElementType;
    theme: {
      background: string;
      foreground: string;
      border: string;
      accent: string;
      accentForeground: string;
    };
  };
  mainNav: NavItem[];
};

export const navigationConfig: Record<string, RoleNavConfig> = {
  ADMIN: {
    brand: {
      title: "LMS Admin",
      subtitle: "Management Portal",
      logoText: "L",
      theme: {
        background: "#111827",
        foreground: "#f8fafc",
        border: "#334155",
        accent: "#2563eb",
        accentForeground: "#ffffff",
      }
    },
    mainNav: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User", href: "/admin/users", icon: User },
      { label: "Institutions", href: "/admin/institutions", icon: Building2 },
      { label: "Students", href: "/admin/students", icon: Users },
      { label: "Batches", href: "/admin/batches", icon: Layers },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Tutors", href: "/admin/tutors", icon: UserCheck },
      { label: "Quizzes", href: "/admin/quizzes", icon: HelpCircle },
      { label: "Assignments", href: "/admin/assignments", icon: FileEdit },
    ],
  },
  STUDENT: {
    brand: {
      title: "CourseHub",
      subtitle: "Student Portal",
      logoIcon: GraduationCap,
      theme: {
        background: "#0B1221",
        foreground: "#9ca3af",
        border: "#1f2937",
        accent: "#1e2d42",
        accentForeground: "#ffffff",
      }
    },
    mainNav: [
      { label: "Dashboard", href: "/student", icon: LayoutDashboard },
      { label: "Courses", href: "/student/courses", icon: BookOpen },
      { label: "Assignments", href: "/student/assignments", icon: FileText },
      { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
    ],
  }
};
