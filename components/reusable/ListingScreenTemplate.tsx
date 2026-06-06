"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ListingScreenTemplateProps {
  /**
   * Main heading text (e.g., "User Management")
   */
  headerText: string;

  /**
   * Subtitle/description text
   */
  subHeaderText?: string;

  /**
   * Text for the "Add New" button
   */
  buttonLabel?: string;

  /**
   * Whether to show the "Add New" button
   */
  buttonRequired?: boolean;

  /**
   * Callback when "Add New" button is clicked
   */
  buttonOnclick?: () => void;

  /**
   * Page content (table + filters)
   */
  children: React.ReactNode;
}

/**
 * Reusable wrapper component for all listing/table pages
 * Provides consistent header layout with optional "Add New" button
 */
export default function ListingScreenTemplate({
  headerText,
  subHeaderText,
  buttonLabel = "Add New",
  buttonRequired = false,
  buttonOnclick,
  children,
}: ListingScreenTemplateProps) {
  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-100">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{headerText}</h1>
          {subHeaderText && (
            <p className="text-sm text-slate-500 mt-1">{subHeaderText}</p>
          )}
        </div>

        {buttonRequired && (
          <Button
            onClick={buttonOnclick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 h-auto gap-2 flex items-center"
          >
            <Plus size={18} />
            {buttonLabel}
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
