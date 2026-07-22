"use client";

import RolesSidebar from "@/components/sidebar/roles-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function InstitutionalRepresentativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <RolesSidebar role="INSTITUTION_REP" />
      <SidebarInset className="flex flex-col overflow-hidden bg-muted">
        <main className="flex-1 overflow-hidden flex flex-col h-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


