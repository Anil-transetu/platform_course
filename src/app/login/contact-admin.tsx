"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Mail, ArrowLeft, User, IdCard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactAdministratorPageProps {
  onBackToLogin?: () => void;
}

export default function ContactAdministratorPage({ onBackToLogin }: ContactAdministratorPageProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/contact-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to send contact request");
      }

      toast.success("Contact request sent successfully");
      setIsSubmitted(true);
      setFormData({
        full_name: "",
        email: "",
        role: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact Admin Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Back Link - Top Right */}
        <div className="flex justify-end mb-6">
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

        {/* Header */}
        <div className="mb-8 text-left">
          <h2 className="text-[28px] font-bold text-slate-900 mb-3 tracking-tight">
            Contact Administrator
          </h2>
          <p className="text-slate-500 text-[15px] leading-relaxed">
            Need help with your account? Fill out the form below to reach out to our administration team.
          </p>
        </div>

        {/* Form or Success State */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-[13px] font-semibold text-slate-700 block">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full text-slate-900 pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[14px]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-semibold text-slate-700 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@institution.edu"
                  className="w-full text-slate-900 pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[14px]"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-[13px] font-semibold text-slate-700 block">
                Role
              </label>
              <Select value={formData.role} onValueChange={handleRoleChange} required>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                    <IdCard size={18} />
                  </div>
                  <SelectTrigger className="w-full text-slate-900 pl-10 pr-4 py-6 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[14px]">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="institution_representative">Institution Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message/Request */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-[13px] font-semibold text-slate-700 block">
                Message/Request
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe the issue you're experiencing..."
                className="w-full text-slate-900 px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[14px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-6  border border-transparent rounded-xl text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? "Sending..." : "Send Request"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 text-green-700 p-6 rounded-xl mb-6 text-[15px] border border-green-200 text-center font-medium">
            Your request has been successfully submitted! The administration team will contact you soon.
          </div>
        )}


   
      </div>
    </AuthLayout>
  );
}
