"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

function getCookie(name: string) {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = getCookie("token");
    const role = getCookie("mock_auth_role");

    if (token && role) {
      // In a real app, you might also decode the JWT here to get the user's email/name
      // For now, we simulate user data since the backend mock doesn't always provide it
      setAuth(token, role, { 
        email: `${role}@example.com`, // Fallback display email
        name: role.charAt(0).toUpperCase() + role.slice(1) // Fallback display name
      });
    } else {
      setLoading(false);
    }
    setMounted(true);
  }, [setAuth, setLoading]);

  // Prevent hydration mismatch by optionally rendering children only after mounting,
  // but since we want SEO and fast paints, we just let it render.
  // We can return null if strict hydration matching is needed, but for layout it's usually fine.
  if (!mounted) return <div className="min-h-screen bg-background" />;

  return <>{children}</>;
}
