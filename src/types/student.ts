export interface Student extends Record<string, any> {
  id: string | number;
  first_name: string;
  last_name?: string;
  email: string;
  mobile_number?: string;
  status: string;
  course_id?: number | string;
  course_name?: string;
  name?: string;
  notes?: string;
  created_at?: string;
}

export interface StudentStats {
  total_students: number;
  active_students: number;
  average_students_per_course: number;
}

export interface StudentsResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
}
