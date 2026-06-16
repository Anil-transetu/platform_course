import RolesSidebar from "@/components/sidebar/roles-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <RolesSidebar role="TUTOR" />
      <SidebarInset className="flex flex-col overflow-hidden bg-muted">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
