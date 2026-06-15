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
  GraduationCap,
  LineChart
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
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "Courses", href: "/student/courses", icon: BookOpen },
      { label: "Assignments", href: "/student/assignments", icon: FileText },
      { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
    ],
  }
  ,
  TUTOR: {
    brand: {
      title: "Tutor Portal",
      subtitle: "Teaching Dashboard",
      logoIcon: undefined,
      theme: {
        background: "#0b1221",
        foreground: "#f8fafc",
        border: "#1f2937",
        accent: "#0ea5e9",
        accentForeground: "#ffffff",
      },
    },
    mainNav: [
      { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
      { label: "Quizzes", href: "/tutor/quizzes", icon: HelpCircle },
      { label: "Assignments", href: "/tutor/assignments", icon: FileEdit },
    ],
  },
  INSTITUTION: {
    brand: {
      title: "Institution",
      subtitle: "Organization Portal",
      logoIcon: undefined,
      theme: {
        background: "#0b1221",
        foreground: "#f8fafc",
        border: "#1f2937",
        accent: "#7c3aed",
        accentForeground: "#ffffff",
      },
    },
    mainNav: [
      { label: "Dashboard", href: "/institutional-representative/dashboard", icon: LayoutDashboard },
      { label: "Batches", href: "/institutional-representative/batches", icon: Layers },
      { label: "Student Performance", href: "/institutional-representative/student-performance", icon: LineChart },
      { label: "Reports", href: "/institutional-representative/reports", icon: FileText },
    ],
  },
};
