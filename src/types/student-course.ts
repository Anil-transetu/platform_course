// Common Types
export interface Attachment {
  id: string | number;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export type SidebarItemType = 'course' | 'module' | 'lesson' | 'topic' | 'quiz' | 'assignment';

export interface ActiveSidebarItem {
  type: SidebarItemType;
  id: string | number;
  data: any;
}

// ----------------------------------------------------
// NEW SIDEBAR API TYPES
// ----------------------------------------------------

export interface SidebarLesson {
  id: string | number;
  name: string;
  progressPct?: number;
  isLocked?: boolean;
  status?: string;
  lessons?: SidebarLesson[]; // Recursive support for nested topics inside lessons
  topics?: any[]; // The actual array for topics returned by API
}

export interface SidebarModule {
  id: string | number;
  name: string;
  progressPct?: number;
  isLocked?: boolean;
  status?: string;
  lessons?: SidebarLesson[];
  quiz?: any;
  quizzes?: any[];
  assignment?: any;
  assignments?: any[];
}

export interface CourseSidebarResponse {
  courseId: string | number;
  courseName: string;
  sidebar: SidebarModule[];
  finalAssignment?: any;
  courseAssignment?: any;
}

// ----------------------------------------------------
// NEW COURSE HOME API TYPES
// ----------------------------------------------------

export interface CourseStatistics {
  completed_count: number;
  total_count: number;
  progress_percentage: number;
}

export interface CourseHomeResponse {
  course_id: string | number;
  course_name: string;
  description: string;
  course_image?: string;
  tags?: string[];
  modules: CourseStatistics;
  lessons: CourseStatistics;
  topics: CourseStatistics;
  quizzes: CourseStatistics;
  assignments: CourseStatistics;
}

// ----------------------------------------------------
// VIEW API TYPES
// ----------------------------------------------------

export interface CourseContent {
  id: string | number;
  type: SidebarItemType;
  title: string;
  description?: string;
  content_text?: string;
  video_url?: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  data?: any;
}

// ----------------------------------------------------
// LEGACY TYPES (Used for View Component typing)
// ----------------------------------------------------
export interface Module {
  id: string | number;
  name: string;
  description?: string;
}

export interface Lesson {
  id: string | number;
  name: string;
  content_text?: string;
}

export interface Topic {
  id: string | number;
  name: string;
  duration_minutes?: number;
  video_url?: string;
  content_text?: string;
}

export interface QuizOption {
  optionId: string | number;
  option: string;
}

export interface QuizQuestion {
  questionId: string | number;
  question: string;
  type?: 'mcq' | 'boolean';
  options?: QuizOption[]; 
  marks?: number;
}

export interface Quiz {
  quizId?: string | number;
  id?: string | number;
  name?: string;
  quizTitle?: string;
  quiz_title?: string;
  title?: string;
  instructions?: string;
  quizTime?: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  total_marks?: number;
  passing_score?: number;
  description?: string;
  total_questions?: number;
  courseId?: string | number;
  questions?: QuizQuestion[];
}

export interface QuizSubmitPayload {
  submittedAt: string;
  isAutoSubmitted: boolean;
  answers: Array<{ questionId: string; selectedOptionId: string }>;
}


export interface Assignment {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  submission_type?: string;
  max_score?: number | string;
}

export interface QuizResultQuestion {
  questionId: string | number;
  question: string;
  type?: 'mcq' | 'boolean';
  options: QuizOption[];
  correctOptionId?: string | number;
  studentOptionId?: string | number;
  isCorrect: boolean;
  marksAwarded: number;
  marksTotal: number;
  explanation?: string;
}

export interface QuizResultSummary {
  quizTitle: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passingMarks: number;
  isPass: boolean;
  status: string;
  submissionDate?: string;
  canRetake?: boolean;
}

export interface QuizResultResponse {
  summary: QuizResultSummary;
  questions: QuizResultQuestion[];
}
