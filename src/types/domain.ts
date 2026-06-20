export interface Domain {
  id: number;
  name: string;
  category: string;
  courses: number;
  updated: string;
  status: string;
  description: string;
  tags: string[];
  course_ids?: number[];
  assignment_ids?: number[];
  courses_list?: any[];
  assignments_list?: any[];
  view?: number;
}

export interface DomainStats {
  total: number;
  active: number;
}
