import RolesSidebar from "@/components/sidebar/roles-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Pencil } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <RolesSidebar role="ADMIN" />
      <SidebarInset className="flex flex-col overflow-hidden bg-muted">
        <header className="h-14 border-b border-[#2a374a] flex items-center px-4 bg-[#111827] lg:hidden shrink-0 relative z-[100]">
          <SidebarTrigger className="text-white hover:bg-white/10">
            <Pencil className="w-5 h-5" />
          </SidebarTrigger>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}





