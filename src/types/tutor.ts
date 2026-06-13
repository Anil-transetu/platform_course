export interface Tutor {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  domains: string[];
  tags: string[];
  status: string;
  avatar?: string | null;
  assignedBatches?: any[];
  [key: string]: any;
}

export interface TutorStats {
  total_tutors?: number;
  active_tutors?: number;
  inactive_tutors?: number;
  total?: number;
  active?: number;
  inactive?: number;
  newTutors?: number;
  [key: string]: any;
}
