import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarStoreState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  resetSidebar: () => void;
}

export const useSidebarStore = create<SidebarStoreState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false, // Default state: expanded (sidebarCollapsed = false)
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      resetSidebar: () => set({ sidebarCollapsed: false }),
    }),
    {
      name: 'sidebar_state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

