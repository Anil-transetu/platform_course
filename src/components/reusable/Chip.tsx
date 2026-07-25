"use client";

import React from "react";
import { X, LucideIcon } from "lucide-react";

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  icon?: LucideIcon;
  variant?: "domain" | "tag";
  disabled?: boolean;
  className?: string;
}

// Color palette — each unique label gets a consistent color from this pool,
// picked deterministically by hashing the label text.
const COLOR_PALETTE = [
  { bg: "#EFF6FF", text: "#2563EB" }, // blue
  { bg: "#EEF2FF", text: "#4F46E5" }, // indigo
  { bg: "#FAF5FF", text: "#9333EA" }, // purple
  { bg: "#FFF7ED", text: "#EA580C" }, // orange
  { bg: "#F0FDF4", text: "#16A34A" }, // green
  { bg: "#FDF2F8", text: "#DB2777" }, // pink
  { bg: "#F0FDFA", text: "#0D9488" }, // teal
  { bg: "#FFFBEB", text: "#D97706" }, // amber
  { bg: "#FEF2F2", text: "#DC2626" }, // red
  { bg: "#ECFEFF", text: "#0891B2" }, // cyan
];

function getColorForLabel(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

export function Chip({
  label,
  onRemove,
  icon: IconComponent,
  disabled = false,
  className = "",
}: ChipProps) {
  const { bg, text } = getColorForLabel(label);

  return (
    <span
      style={{ backgroundColor: bg, color: text }}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-tight shrink-0 max-w-full transition-colors ${className}`}
    >
      {IconComponent && <IconComponent size={12} className="shrink-0" style={{ color: text }} />}
      <span className="truncate max-w-[160px] sm:max-w-[240px] leading-none font-bold">{label}</span>
      {!disabled && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ color: text }}
          className="inline-flex items-center justify-center h-3 w-3 shrink-0 -mr-0.5 opacity-80 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}

export default Chip;