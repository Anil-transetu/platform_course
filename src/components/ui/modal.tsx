"use client";

import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  closeOnBackdropClick?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-3xl",
  "3xl": "max-w-4xl",
};

/**
 * Reusable Modal component
 * Can be used for any modal dialog in the application
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdropClick = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[95vh] overflow-y-auto rounded-lg bg-card shadow-lg`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-accent hover:text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-accent hover:text-muted-foreground z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
