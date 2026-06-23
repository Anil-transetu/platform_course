"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Mail, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ForgotPasswordPageProps {
  onBackToLogin?: () => void;
}

export default function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.success("Password reset email sent successfully. Please check your inbox.");
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <RotateCcw className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            No worries, we&apos;ll send you reset instructions. Please enter
            the email address linked to your account.
          </p>
        </div>

        {/* Form or Success State */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Check */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 block"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-slate-900 pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm border border-green-200">
            Check your email! We&apos;ve sent reset instructions to{" "}
            <strong>{email}</strong>.
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            onClick={(e) => {
              if (onBackToLogin) {
                e.preventDefault();
                onBackToLogin();
              }
            }}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
