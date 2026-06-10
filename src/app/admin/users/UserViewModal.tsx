"use client";
import React from "react";
import { useUser } from "@/features/admin/users/api/user-api";
import { Modal } from "@/components/ui/modal";
import { Loader2, Mail, Building, Briefcase, Calendar, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  userId?: string | number | null;
}

export default function UserViewModal({ open, onClose, userId }: Props) {
  const { data: user, isLoading } = useUser(userId || "");

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="User Details" size="md">
      <div className="p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 font-medium">Loading user details...</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                {getInitials(user.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  ID: #USR-{user.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-gray-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-gray-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Role</p>
                  <p className="text-sm font-medium text-gray-900">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-gray-400">
                  <Building size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Institution</p>
                  <p className="text-sm font-medium text-gray-900">{user.institution}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-gray-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Joined Date</p>
                  <p className="text-sm font-medium text-gray-900">{user.joinedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-gray-400">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
                  <p className="text-sm font-medium text-gray-900">{user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            Failed to load user details.
          </div>
        )}
      </div>
    </Modal>
  );
}
