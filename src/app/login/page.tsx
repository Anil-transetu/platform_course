"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { loginToApi } from "@/features/login/api/login-api";
import ForgotPasswordPage from "./forgot-password";
import ContactAdministratorPage from "./contact-admin";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { RoleDashboards, DEFAULT_REDIRECT } from "@/constants/roles";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showContactAdmin, setShowContactAdmin] = useState(false);

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  if (showContactAdmin) {
    return <ContactAdministratorPage onBackToLogin={() => setShowContactAdmin(false)} />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginToApi(email, password);
      
      // Normalize role and add fallback based on email if backend role is missing
      let rawRole = data?.role;
      if (!rawRole) {
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes("admin")) {
          rawRole = "admin";
        } else if (lowerEmail.includes("tutor")) {
          rawRole = "tutor";
        } else if (lowerEmail.includes("institution") || lowerEmail.includes("rep")) {
          rawRole = "institution";
        } else {
          rawRole = "student";
        }
      }
      const role = rawRole.toLowerCase();
      
      document.cookie = `mock_auth_role=${role}; path=/;`;
      
      const token = data?.token || data?.accessToken;
      if (token) {
        document.cookie = `token=${token}; path=/;`;
        
        // Update global auth state
        setAuth(token, role, data?.user);
      }

      // Determine redirect path
      const redirectPath = RoleDashboards[role] || DEFAULT_REDIRECT;

      toast.success("Login successful");
      // The `<PublicRoute>` wrapper will automatically detect `isAuthenticated` 
      // becoming true and perform the redirect to the dashboard.
    } catch (error: unknown) {
      console.error("Login Error:", error);
      const message = error instanceof Error ? error.message : "Access Denied: Unrecognized role or invalid credentials.";
      toast.error(message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">
            Welcome to LMS Portal
          </h2>
          <p className="text-slate-400 text-[14px] font-medium">
            Please enter your details to sign in to your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold text-slate-700 block"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-slate-900 pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[14px] placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-slate-700 block"
              >
                Password
              </label>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
                className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-slate-900 pl-11 pr-11 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[14px] placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="ml-2.5 block text-[13px] text-slate-500 font-medium cursor-pointer"
            >
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[13px] text-slate-400 font-medium">
            Don&apos;t have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowContactAdmin(true); }} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
