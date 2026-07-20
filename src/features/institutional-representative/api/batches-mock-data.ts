export interface MockBatch extends Record<string, any> {
  id: string; // e.g., 'CS-2024-B1'
  batchName: string; // duplicate for convenience
  courseName: string;
  assignedTutor: string;
  tutorInitials: string;
  tutorAvatarBg: string;
  totalStudents: number;
  progress: number;
  department: string;
}

export interface MockBatchStats {
  averageScore: number;
  assignmentCompletion: number;
  atRiskStudents: number;
}

export interface MockStudent extends Record<string, any> {
  id: string; // e.g., 'STU-2024-042'
  studentName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | string; // ACTIVE, INACTIVE
  attendancePercent: number;
  attendanceLabel: string; // e.g. "Above average attendance"
  quizAverage: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  completedAssessments: number;
  totalAssessments: number;
  completedQuizzes: number;
  totalQuizzes: number;
  performanceStatus: "ON TRACK" | "AT RISK" | "EXCELLENT" | string;
}

export interface MockAcademicPerformance extends Record<string, any> {
  id: string;
  title: string;
  type: "Quiz" | "Assignment";
  moduleName?: string;
  submissionDate: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export const MOCK_BATCHES: MockBatch[] = [
  {
    id: "CS-2024-B1",
    batchName: "CS-2024-B1",
    courseName: "Advanced Web Architecture",
    assignedTutor: "Dr. Robert Fox",
    tutorInitials: "RF",
    tutorAvatarBg: "bg-blue-100 text-blue-600",
    totalStudents: 42,
    progress: 78,
    department: "Computer Science",
  },
  {
    id: "Cę-2024-B1", // Alternate spelling / ID as requested by screenshot
    batchName: "Cę-2024-B1",
    courseName: "Advanced Web Architecture",
    assignedTutor: "Dr. Robert Fox",
    tutorInitials: "RF",
    tutorAvatarBg: "bg-blue-100 text-blue-600",
    totalStudents: 42,
    progress: 78,
    department: "Computer Science",
  },
  {
    id: "CS-2024-B2",
    batchName: "CS-2024-B2",
    courseName: "Database Systems Design",
    assignedTutor: "Sarah Jenkins",
    tutorInitials: "SJ",
    tutorAvatarBg: "bg-orange-200 text-orange-600",
    totalStudents: 35,
    progress: 88,
    department: "Computer Science",
  },
  {
    id: "DS-2024-B1",
    batchName: "DS-2024-B1",
    courseName: "Machine Learning Fundamentals",
    assignedTutor: "Michael Chang",
    tutorInitials: "MC",
    tutorAvatarBg: "bg-purple-100 text-purple-600",
    totalStudents: 28,
    progress: 62,
    department: "Data Science",
  },
  {
    id: "SE-2024-B3",
    batchName: "SE-2024-B3",
    courseName: "Software Testing & QA",
    assignedTutor: "Sarah Jenkins",
    tutorInitials: "SJ",
    tutorAvatarBg: "bg-pink-100 text-pink-600",
    totalStudents: 15,
    progress: 95,
    department: "Software Engineering",
  }
];

export const MOCK_BATCH_STATS: Record<string, MockBatchStats> = {
  "CS-2024-B1": {
    averageScore: 78,
    assignmentCompletion: 92,
    atRiskStudents: 3,
  },
  "Cę-2024-B1": {
    averageScore: 78,
    assignmentCompletion: 92,
    atRiskStudents: 3,
  },
  "CS-2024-B2": {
    averageScore: 84,
    assignmentCompletion: 95,
    atRiskStudents: 1,
  },
  "DS-2024-B1": {
    averageScore: 68,
    assignmentCompletion: 76,
    atRiskStudents: 5,
  },
  "SE-2024-B3": {
    averageScore: 91,
    assignmentCompletion: 98,
    atRiskStudents: 0,
  }
};

export const MOCK_STUDENTS: Record<string, MockStudent[]> = {
  "CS-2024-B1": [
    {
      id: "STU-2024-042",
      studentName: "Alex Thompson",
      email: "alex.t@university.edu",
      status: "ACTIVE",
      attendancePercent: 94,
      attendanceLabel: "Above average attendance",
      quizAverage: 88.5,
      assignmentsCompleted: 12,
      totalAssignments: 12,
      completedAssessments: 24,
      totalAssessments: 24,
      completedQuizzes: 18,
      totalQuizzes: 20,
      performanceStatus: "ON TRACK",
    },
    {
      id: "STU-2024-043",
      studentName: "Benjamin Clarke",
      email: "b.clarke@university.edu",
      status: "ACTIVE",
      attendancePercent: 62,
      attendanceLabel: "Below average attendance",
      quizAverage: 42.0,
      assignmentsCompleted: 8,
      totalAssignments: 12,
      completedAssessments: 16,
      totalAssessments: 24,
      completedQuizzes: 8,
      totalQuizzes: 20,
      performanceStatus: "AT RISK",
    },
    {
      id: "STU-2024-044",
      studentName: "Catherine Liu",
      email: "c.liu@university.edu",
      status: "ACTIVE",
      attendancePercent: 88,
      attendanceLabel: "Average attendance",
      quizAverage: 79.2,
      assignmentsCompleted: 11,
      totalAssignments: 12,
      completedAssessments: 21,
      totalAssessments: 24,
      completedQuizzes: 15,
      totalQuizzes: 20,
      performanceStatus: "ON TRACK",
    },
    {
      id: "STU-2024-045",
      studentName: "David Miller",
      email: "d.miller@university.edu",
      status: "ACTIVE",
      attendancePercent: 100,
      attendanceLabel: "Excellent attendance",
      quizAverage: 95.0,
      assignmentsCompleted: 12,
      totalAssignments: 12,
      completedAssessments: 24,
      totalAssessments: 24,
      completedQuizzes: 20,
      totalQuizzes: 20,
      performanceStatus: "EXCELLENT",
    }
  ],
  "Cę-2024-B1": [
    {
      id: "STU-2024-042",
      studentName: "Alex Thompson",
      email: "alex.t@university.edu",
      status: "ACTIVE",
      attendancePercent: 94,
      attendanceLabel: "Above average attendance",
      quizAverage: 88.5,
      assignmentsCompleted: 12,
      totalAssignments: 12,
      completedAssessments: 24,
      totalAssessments: 24,
      completedQuizzes: 18,
      totalQuizzes: 20,
      performanceStatus: "ON TRACK",
    },
    {
      id: "STU-2024-043",
      studentName: "Benjamin Clarke",
      email: "b.clarke@university.edu",
      status: "ACTIVE",
      attendancePercent: 62,
      attendanceLabel: "Below average attendance",
      quizAverage: 42.0,
      assignmentsCompleted: 8,
      totalAssignments: 12,
      completedAssessments: 16,
      totalAssessments: 24,
      completedQuizzes: 8,
      totalQuizzes: 20,
      performanceStatus: "AT RISK",
    },
    {
      id: "STU-2024-044",
      studentName: "Catherine Liu",
      email: "c.liu@university.edu",
      status: "ACTIVE",
      attendancePercent: 88,
      attendanceLabel: "Average attendance",
      quizAverage: 79.2,
      assignmentsCompleted: 11,
      totalAssignments: 12,
      completedAssessments: 21,
      totalAssessments: 24,
      completedQuizzes: 15,
      totalQuizzes: 20,
      performanceStatus: "ON TRACK",
    },
    {
      id: "STU-2024-045",
      studentName: "David Miller",
      email: "d.miller@university.edu",
      status: "ACTIVE",
      attendancePercent: 100,
      attendanceLabel: "Excellent attendance",
      quizAverage: 95.0,
      assignmentsCompleted: 12,
      totalAssignments: 12,
      completedAssessments: 24,
      totalAssessments: 24,
      completedQuizzes: 20,
      totalQuizzes: 20,
      performanceStatus: "EXCELLENT",
    }
  ]
};

// Generate 24 academic performance results for Alex Thompson
export const MOCK_ACADEMIC_PERFORMANCE: Record<string, MockAcademicPerformance[]> = {
  "STU-2024-042": [
    {
      id: "P01",
      title: "SQL Performance Tuning Quiz",
      moduleName: "Database Optimization Module",
      type: "Quiz",
      submissionDate: "Oct 28, 2024",
      score: 18,
      maxScore: 20,
      percentage: 90,
    },
    {
      id: "P02",
      title: "React State MGMT Lab",
      moduleName: "Advanced React Patterns",
      type: "Assignment",
      submissionDate: "Oct 24, 2024",
      score: 95,
      maxScore: 100,
      percentage: 95,
    },
    {
      id: "P03",
      title: "Backend Architectural Patterns",
      moduleName: "Foundations of Architecture",
      type: "Quiz",
      submissionDate: "Oct 15, 2024",
      score: 14,
      maxScore: 20,
      percentage: 70,
    },
    {
      id: "P04",
      title: "API Design Midterm",
      moduleName: "System Integration",
      type: "Assignment",
      submissionDate: "Oct 02, 2024",
      score: 42,
      maxScore: 50,
      percentage: 84,
    },
    {
      id: "P05",
      title: "Docker Containerization Lab",
      moduleName: "DevOps & Deployment",
      type: "Assignment",
      submissionDate: "Sep 28, 2024",
      score: 46,
      maxScore: 50,
      percentage: 92,
    },
    {
      id: "P06",
      title: "CI/CD Pipeline Setup",
      moduleName: "DevOps & Deployment",
      type: "Assignment",
      submissionDate: "Sep 22, 2024",
      score: 98,
      maxScore: 100,
      percentage: 98,
    },
    {
      id: "P07",
      title: "Kubernetes Pods & Services Quiz",
      moduleName: "DevOps & Deployment",
      type: "Quiz",
      submissionDate: "Sep 15, 2024",
      score: 17,
      maxScore: 20,
      percentage: 85,
    },
    {
      id: "P08",
      title: "GraphQL Schema Design",
      moduleName: "API Design & GraphQL",
      type: "Assignment",
      submissionDate: "Sep 09, 2024",
      score: 88,
      maxScore: 100,
      percentage: 88,
    },
    {
      id: "P09",
      title: "REST APIs vs GraphQL Quiz",
      moduleName: "API Design & GraphQL",
      type: "Quiz",
      submissionDate: "Sep 02, 2024",
      score: 19,
      maxScore: 20,
      percentage: 95,
    },
    {
      id: "P10",
      title: "Redis Cache Implementation",
      moduleName: "Caching & Sessions",
      type: "Assignment",
      submissionDate: "Aug 26, 2024",
      score: 48,
      maxScore: 50,
      percentage: 96,
    },
    {
      id: "P11",
      title: "Data Replication Quiz",
      moduleName: "Database Scaling",
      type: "Quiz",
      submissionDate: "Aug 18, 2024",
      score: 15,
      maxScore: 20,
      percentage: 75,
    },
    {
      id: "P12",
      title: "Sharding and Partitioning Lab",
      moduleName: "Database Scaling",
      type: "Assignment",
      submissionDate: "Aug 12, 2024",
      score: 82,
      maxScore: 100,
      percentage: 82,
    },
    {
      id: "P13",
      title: "OAuth2 & JWT Auth Lab",
      moduleName: "Security & Middleware",
      type: "Assignment",
      submissionDate: "Aug 05, 2024",
      score: 90,
      maxScore: 100,
      percentage: 90,
    },
    {
      id: "P14",
      title: "Web Security Basics Quiz",
      moduleName: "Security & Middleware",
      type: "Quiz",
      submissionDate: "Jul 29, 2024",
      score: 18,
      maxScore: 20,
      percentage: 90,
    },
    {
      id: "P15",
      title: "CSS Grid & Flexbox Lab",
      moduleName: "Modern UI layouts",
      type: "Assignment",
      submissionDate: "Jul 22, 2024",
      score: 47,
      maxScore: 50,
      percentage: 94,
    },
    {
      id: "P16",
      title: "Responsive Web Design Quiz",
      moduleName: "Modern UI layouts",
      type: "Quiz",
      submissionDate: "Jul 15, 2024",
      score: 20,
      maxScore: 20,
      percentage: 100,
    },
    {
      id: "P17",
      title: "NextJS Dynamic Routing Lab",
      moduleName: "Advanced Routing & Layouts",
      type: "Assignment",
      submissionDate: "Jul 08, 2024",
      score: 85,
      maxScore: 100,
      percentage: 85,
    },
    {
      id: "P18",
      title: "Server Side Rendering Quiz",
      moduleName: "Advanced Routing & Layouts",
      type: "Quiz",
      submissionDate: "Jul 01, 2024",
      score: 16,
      maxScore: 20,
      percentage: 80,
    },
    {
      id: "P19",
      title: "NodeJS Event Loop Lab",
      moduleName: "Asynchronous Backend Logic",
      type: "Assignment",
      submissionDate: "Jun 24, 2024",
      score: 42,
      maxScore: 50,
      percentage: 84,
    },
    {
      id: "P20",
      title: "Promises & Async/Await Quiz",
      moduleName: "Asynchronous Backend Logic",
      type: "Quiz",
      submissionDate: "Jun 18, 2024",
      score: 18,
      maxScore: 20,
      percentage: 90,
    },
    {
      id: "P21",
      title: "HTML5 Semantic Tags Quiz",
      moduleName: "Foundation Web Concepts",
      type: "Quiz",
      submissionDate: "Jun 10, 2024",
      score: 19,
      maxScore: 20,
      percentage: 95,
    },
    {
      id: "P22",
      title: "Git Rebase vs Merge Lab",
      moduleName: "Version Control Systems",
      type: "Assignment",
      submissionDate: "Jun 04, 2024",
      score: 92,
      maxScore: 100,
      percentage: 92,
    },
    {
      id: "P23",
      title: "CSS Variables Practice",
      moduleName: "Foundation Web Concepts",
      type: "Assignment",
      submissionDate: "May 28, 2024",
      score: 48,
      maxScore: 50,
      percentage: 96,
    },
    {
      id: "P24",
      title: "Command Line Basics Quiz",
      moduleName: "Foundation Web Concepts",
      type: "Quiz",
      submissionDate: "May 20, 2024",
      score: 20,
      maxScore: 20,
      percentage: 100,
    }
  ],
  // Fallback performance records for other students
  "STU-2024-043": [
    {
      id: "P01",
      title: "SQL Performance Tuning Quiz",
      moduleName: "Database Optimization Module",
      type: "Quiz",
      submissionDate: "Oct 28, 2024",
      score: 8,
      maxScore: 20,
      percentage: 40,
    },
    {
      id: "P02",
      title: "React State MGMT Lab",
      moduleName: "Advanced React Patterns",
      type: "Assignment",
      submissionDate: "Oct 24, 2024",
      score: 55,
      maxScore: 100,
      percentage: 55,
    },
    {
      id: "P03",
      title: "Backend Architectural Patterns",
      moduleName: "Foundations of Architecture",
      type: "Quiz",
      submissionDate: "Oct 15, 2024",
      score: 9,
      maxScore: 20,
      percentage: 45,
    },
    {
      id: "P04",
      title: "API Design Midterm",
      moduleName: "System Integration",
      type: "Assignment",
      submissionDate: "Oct 02, 2024",
      score: 24,
      maxScore: 50,
      percentage: 48,
    }
  ],
  "STU-2024-044": [
    {
      id: "P01",
      title: "SQL Performance Tuning Quiz",
      moduleName: "Database Optimization Module",
      type: "Quiz",
      submissionDate: "Oct 28, 2024",
      score: 16,
      maxScore: 20,
      percentage: 80,
    },
    {
      id: "P02",
      title: "React State MGMT Lab",
      moduleName: "Advanced React Patterns",
      type: "Assignment",
      submissionDate: "Oct 24, 2024",
      score: 82,
      maxScore: 100,
      percentage: 82,
    },
    {
      id: "P03",
      title: "Backend Architectural Patterns",
      moduleName: "Foundations of Architecture",
      type: "Quiz",
      submissionDate: "Oct 15, 2024",
      score: 15,
      maxScore: 20,
      percentage: 75,
    },
    {
      id: "P04",
      title: "API Design Midterm",
      moduleName: "System Integration",
      type: "Assignment",
      submissionDate: "Oct 02, 2024",
      score: 40,
      maxScore: 50,
      percentage: 80,
    }
  ],
  "STU-2024-045": [
    {
      id: "P01",
      title: "SQL Performance Tuning Quiz",
      moduleName: "Database Optimization Module",
      type: "Quiz",
      submissionDate: "Oct 28, 2024",
      score: 19,
      maxScore: 20,
      percentage: 95,
    },
    {
      id: "P02",
      title: "React State MGMT Lab",
      moduleName: "Advanced React Patterns",
      type: "Assignment",
      submissionDate: "Oct 24, 2024",
      score: 98,
      maxScore: 100,
      percentage: 98,
    },
    {
      id: "P03",
      title: "Backend Architectural Patterns",
      moduleName: "Foundations of Architecture",
      type: "Quiz",
      submissionDate: "Oct 15, 2024",
      score: 18,
      maxScore: 20,
      percentage: 90,
    },
    {
      id: "P04",
      title: "API Design Midterm",
      moduleName: "System Integration",
      type: "Assignment",
      submissionDate: "Oct 02, 2024",
      score: 48,
      maxScore: 50,
      percentage: 96,
    }
  ]
};

export function getBatches(): MockBatch[] {
  // Return deduped by ID (ignoring the alternate ID unless explicitly requested)
  return MOCK_BATCHES.filter((b) => b.id !== "Cę-2024-B1");
}

export function getBatchById(id: string): MockBatch | undefined {
  const normalizedId = decodeURIComponent(id).toLowerCase();
  return MOCK_BATCHES.find(
    (b) => b.id.toLowerCase() === normalizedId || b.id.replace("ę", "S").toLowerCase() === normalizedId
  );
}

export function getBatchStats(id: string): MockBatchStats | undefined {
  const normalizedId = decodeURIComponent(id);
  const found = MOCK_BATCH_STATS[normalizedId];
  if (found) return found;

  // Try mapping spelling variations (e.g. Cę-2024-B1 to CS-2024-B1 or vice versa)
  const fallbackKey = Object.keys(MOCK_BATCH_STATS).find(
    (k) => k.toLowerCase() === normalizedId.toLowerCase() ||
           k.replace("ę", "S").toLowerCase() === normalizedId.toLowerCase() ||
           normalizedId.replace("ę", "S").toLowerCase() === k.toLowerCase()
  );
  return fallbackKey ? MOCK_BATCH_STATS[fallbackKey] : MOCK_BATCH_STATS["CS-2024-B1"];
}

export function getStudentsForBatch(batchId: string): MockStudent[] {
  const normalizedId = decodeURIComponent(batchId);
  const found = MOCK_STUDENTS[normalizedId];
  if (found) return found;

  const fallbackKey = Object.keys(MOCK_STUDENTS).find(
    (k) => k.toLowerCase() === normalizedId.toLowerCase() ||
           k.replace("ę", "S").toLowerCase() === normalizedId.toLowerCase() ||
           normalizedId.replace("ę", "S").toLowerCase() === k.toLowerCase()
  );
  return fallbackKey ? MOCK_STUDENTS[fallbackKey] : MOCK_STUDENTS["CS-2024-B1"];
}

export function getStudentDetails(batchId: string, studentId: string): MockStudent | undefined {
  const students = getStudentsForBatch(batchId);
  return students.find((s) => s.id === studentId);
}

export function getStudentPerformance(studentId: string): MockAcademicPerformance[] {
  return MOCK_ACADEMIC_PERFORMANCE[studentId] || MOCK_ACADEMIC_PERFORMANCE["STU-2024-042"];
}
