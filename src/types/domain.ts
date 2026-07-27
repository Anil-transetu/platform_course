export interface Domain extends Record<string, any> {
  id: number;
  name: string;
  category?: string;
  courses?: number;
  total_courses?: number;
  created_at?: string;
  created_date?: string;
  updated_at?: string;
  updated?: string;
  status: "active" | "inactive" | string;
  description: string;
  tags?: string[];
  course_ids?: number[];
  assignment_ids?: number[];
  courses_list?: any[];
  assignments_list?: any[];
  domain_image_url?: string;
  view?: number;
}

export interface DomainStats {
  total_domains?: number;
  active_domains?: number;
  inactive_domains?: number;
  total?: number;
  active?: number;
}
