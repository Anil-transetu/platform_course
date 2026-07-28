import { create } from 'zustand';
import { Role } from '@/constants/roles';
import { useSidebarStore } from '@/store/sidebar-store';

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
  isInitializing: boolean;
  setAuth: (token: string, role: string, user?: User) => void;
  setIsInitializing: (isInitializing: boolean) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  isLoading: true, // Initially true until we verify auth state
  isInitializing: true,

  setAuth: (token, role, user) => set({
    isAuthenticated: true,
    token,
    role,
    user: user || null,
    isLoading: false,
    isInitializing: false,
  }),

  setIsInitializing: (isInitializing) => set({ isInitializing }),

  logout: () => {
    // Reset persisted sidebar state so next login defaults to expanded
    useSidebarStore.getState().resetSidebar();

    // Clear cookies explicitly so middleware immediately recognizes unauthenticated state
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'mock_auth_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    set({
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
      isLoading: false,
      isInitializing: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));

