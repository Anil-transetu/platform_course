"use client";

import React, { useState } from "react";
import { User } from "@/types/user";
import UserFormModal from "./UserFormModal";
import UserDeleteDialog from "./UserDeleteDialog";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Toaster } from "@/components/ui/sonner";
import AcceptedUsersTab from "./AcceptedUsersTab";
import PendingRequestsTab from "./PendingRequestsTab";

export default function UsersPage() {
  // Modal state
  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    user?: User | null;
  }>({
    open: false,
    mode: "add",
    user: null,
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  const [activeTab, setActiveTab] = useState<"accepted" | "pending">("accepted");

  const tabsElement = (
    <div className="flex items-center gap-6 border-b border-gray-200 mt-6 mb-2">
      <button
        onClick={() => setActiveTab("accepted")}
        className={`pb-2.5 font-semibold text-sm transition-colors border-b-2
        ${activeTab === "accepted" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}
      `}
      >
        Accepted Requests
      </button>
      <button
        onClick={() => setActiveTab("pending")}
        className={`pb-2.5 font-semibold text-sm transition-colors border-b-2
        ${activeTab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}
      `}
      >
        Pending
      </button>
    </div>
  );

  return (
    <ListingScreenTemplate
      headerText="User Management"
      subHeaderText="Oversee administrators and institution representatives."
      buttonLabel="Create New User"
      buttonRequired={true}
      buttonOnclick={() => setFormModal({ open: true, mode: "add", user: null })}
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
        <Toaster position="top-right" />
        
        {activeTab === "accepted" ? (
          <AcceptedUsersTab 
            formModal={formModal} 
            setFormModal={setFormModal} 
            deleteDialog={deleteDialog} 
            setDeleteDialog={setDeleteDialog}
            tabsElement={tabsElement}
          />
        ) : (
          <PendingRequestsTab 
            tabsElement={tabsElement}
          />
        )}
      </div>

      {/* MODALS */}
      <UserFormModal
        open={formModal.open}
        mode={formModal.mode}
        user={formModal.user}
        onClose={() => setFormModal({ open: false, mode: "add", user: null })}
      />
      <UserDeleteDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      />
    </ListingScreenTemplate>
  );
}
