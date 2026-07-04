"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListingScreenTemplateProps {
  /**
   * Main heading text (e.g., "User Management")
   */
  headerText: string;

  /**
   * Subtitle/description text
   */
  subHeaderText?: React.ReactNode;

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
   * Optional extra buttons/elements to render in the header
   */
  extraActions?: React.ReactNode;

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
  extraActions,
  children,
}: ListingScreenTemplateProps) {
  const hasActions = buttonRequired || Boolean(extraActions);

  return (
    <div className="flex flex-col h-full w-full bg-card rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-slate-100">
        
        {/* Title and Mobile Overflow Row */}
        <div className="flex items-center justify-between gap-4 w-full sm:w-auto flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{headerText}</h1>
            {subHeaderText && (
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{subHeaderText}</div>
            )}
          </div>

          {/* Mobile Actions Overflow Menu */}
          {hasActions && (
            <div className="flex sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EllipsisVertical size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 flex flex-col gap-2">
                  <div className="flex flex-col gap-2 [&>button]:w-full [&>a]:w-full">
                    {extraActions}
                    {buttonRequired && (
                      <Button
                        onClick={buttonOnclick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 h-auto gap-2 flex items-center justify-start text-sm w-full"
                      >
                        <Plus size={18} className="flex-shrink-0" />
                        {buttonLabel}
                      </Button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Desktop/Tablet Actions */}
        {hasActions && (
          <div className="hidden sm:flex items-center gap-3 justify-end w-auto">
            {extraActions}
            {buttonRequired && (
              <Button
                onClick={buttonOnclick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 h-auto gap-2 flex items-center text-sm justify-center"
              >
                <Plus size={18} className="flex-shrink-0" />
                {buttonLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
