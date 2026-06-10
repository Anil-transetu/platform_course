export interface User extends Record<string, unknown> {
  id: string | number;
  name?: string;
  full_name?: string;
  email: string;
  role: string;
  institution?: string;
  status?: string;
  joinedDate?: string;
  created_at?: string;
  avatar?: string;
  password?: string;
}

export interface UserStats {
  admins: number;
  representatives: number;
  institutions: number;
}
