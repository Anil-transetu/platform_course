import RolesSidebar from "@/components/sidebar/roles-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <RolesSidebar role="ADMIN" />
      <SidebarInset className="flex flex-col overflow-hidden bg-slate-50 relative">
        <header className="flex h-14 items-center px-4 lg:hidden shrink-0">
          <SidebarTrigger className="text-slate-900 bg-slate-200/50 hover:bg-slate-300/50 transition-colors" />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}





