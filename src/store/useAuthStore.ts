import { create } from 'zustand';
import { Role } from '@/constants/roles';

interface User {
  email: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: Role | string | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, role: string, user?: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  isLoading: true, // Initially true until we verify auth state

  setAuth: (token, role, user) => set({
    isAuthenticated: true,
    token,
    role,
    user: user || null,
    isLoading: false,
  }),

  logout: () => {
    // We also need to clear cookies here, but the actual clearing 
    // should happen in the component or utility calling this to keep store pure.
    set({
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
