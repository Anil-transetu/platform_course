"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { RoleDashboards } from "@/constants/roles";
import { Role } from "@/types/user";
import { Loader2 } from "lucide-react";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && isAuthenticated && role) {
      const redirectPath = RoleDashboards[role as Role] || "/admin/dashboard";
      router.replace(redirectPath);
    }
  }, [isInitializing, isAuthenticated, role, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Initializing...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
