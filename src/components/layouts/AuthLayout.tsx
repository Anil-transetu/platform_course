import Image from "next/image";
import { BookOpen } from "lucide-react";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[45%_1fr] font-sans selection:bg-blue-100 bg-white">
      {/* Left Pane (Branding & Image) */}
      <div className="hidden lg:flex bg-[#E8F2FF] flex-col p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16 z-20">
          <div className="bg-[#2563EB] p-2 rounded-lg text-white">
            <BookOpen size={20} fill="currentColor" />
          </div>
          <span className="text-[#2563EB] font-bold text-xl tracking-tight">
            LMS Portal
          </span>
        </div>

        {/* Central Content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full z-20">
          {/* Image Container with Floating Badge */}
          <div className="relative w-full mb-10">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-[8px] border-white bg-white">
              <Image
                src="/auth-image.png"
                alt="Students studying"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 z-30 border border-slate-50 animate-in fade-in zoom-in duration-500 delay-300">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  Excellence in Learning
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Over 10,000 active students
                </p>
              </div>
            </div>
          </div>

          {/* Copy Text */}
          <div className="space-y-4">
            <h1 className="text-[32px] font-bold text-slate-900 leading-tight tracking-tight">
              Empower your academic<br />journey.
            </h1>
            <p className="text-slate-500 text-[14px] leading-relaxed font-normal max-w-[380px]">
              Access your courses, track your progress, and collaborate
              with your peers in a unified digital learning environment
              designed for modern education.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto text-[12px] text-slate-400 font-medium z-20">
          © 2024 LMS Portal. All rights reserved.
        </div>
      </div>

      {/* Right Pane (Dynamic Content) */}
      <div className="flex flex-col justify-center px-6 sm:px-16 md:px-24 xl:px-32 relative bg-white">
        <div className="w-full max-w-[400px] mx-auto py-12 lg:py-0">
          {children}
        </div>
        
        {/* Right Footer Links */}
        <div className="absolute bottom-10 left-0 right-0 hidden sm:flex justify-center gap-8 text-[12px] font-medium text-slate-400">
          <a href="#" className="hover:text-slate-600 transition-colors">Help Center</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
