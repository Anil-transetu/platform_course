"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

import { verifySession } from "@/features/login/api/login-api";

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
  const setIsInitializing = useAuthStore((state) => state.setIsInitializing);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = getCookie("token");
    const role = getCookie("mock_auth_role");

    const validateSession = async () => {
      try {
        if (token && role) {
          // Validate token with the backend API
          const isValid = await verifySession(token);
          
          if (isValid) {
            setAuth(token, role, { 
              email: `${role}@example.com`, 
              name: role.charAt(0).toUpperCase() + role.slice(1) 
            });
          } else {
            // Token is invalid or expired
            useAuthStore.getState().logout();
          }
        } else {
          // If there's no valid token/role
          useAuthStore.getState().logout();
        }
      } catch (err) {
        useAuthStore.getState().logout();
      } finally {
        setLoading(false);
        setIsInitializing(false);
        setMounted(true);
      }
    };

    validateSession();
  }, [setAuth, setLoading, setIsInitializing]);

  // We allow children to render immediately to prevent white screen flashes.
  // The server-side proxy already guarantees the route is protected.
  return <>{children}</>;
}
