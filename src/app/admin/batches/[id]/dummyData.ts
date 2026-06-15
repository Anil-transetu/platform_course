export interface EnrolledStudent extends Record<string, any> {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  enrollmentDate: string;
  completionPercentage: number;
  status: "ACTIVE" | "COMPLETED";
}

export const DUMMY_ENROLLED_STUDENTS: EnrolledStudent[] = [
  {
    id: 1,
    name: "Sarah Connor",
    email: "sarah.c@techmail.com",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    enrollmentDate: "Jan 12, 2024",
    completionPercentage: 85,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Marcus Miller",
    email: "m.miller@global.org",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    enrollmentDate: "Jan 14, 2024",
    completionPercentage: 100,
    status: "COMPLETED",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    email: "elena.rod@design.com",
    avatar: "https://i.pravatar.cc/150?u=elena",
    enrollmentDate: "Jan 15, 2024",
    completionPercentage: 42,
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "m.chen@edu.com",
    avatar: "https://i.pravatar.cc/150?u=michael",
    enrollmentDate: "Jan 16, 2024",
    completionPercentage: 75,
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "Sophia Garcia",
    email: "s.garcia@mail.com",
    avatar: "https://i.pravatar.cc/150?u=sophia",
    enrollmentDate: "Jan 18, 2024",
    completionPercentage: 100,
    status: "COMPLETED",
  },
  {
    id: 6,
    name: "David Smith",
    email: "d.smith@tech.com",
    avatar: "https://i.pravatar.cc/150?u=david",
    enrollmentDate: "Jan 20, 2024",
    completionPercentage: 12,
    status: "ACTIVE",
  },
];
