import RolesSidebar from "@/components/sidebar/roles-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider className="h-screen overflow-hidden">
        <RolesSidebar role="ADMIN" />
        <SidebarInset className="flex flex-col overflow-hidden bg-muted">
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}





