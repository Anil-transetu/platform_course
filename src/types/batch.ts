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
}
