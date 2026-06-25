import PublicRoute from "@/components/auth/PublicRoute";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
}
