export interface Batch extends Record<string, any> {
  id: string | number;
  name: string;
  institution?: string;
  course?: string;
  instructor?: string;
  start_date?: string;
  end_date?: string;
  students: number;
  status: string;
  completion_percentage?: number;
  institution_id?: number;
  tutor_id?: number;
  course_id?: number | null;
  domain_id?: number | null;
  domain?: string;
  department?: string;
  Enrollments?: any[];
}

export interface EnrolledStudent extends Record<string, any> {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  enrollmentDate: string;
  completionPercentage: number;
  status: "ACTIVE" | "COMPLETED" | string;
}
