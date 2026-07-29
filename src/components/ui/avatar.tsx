"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getAvatarColorClass } from "@/lib/avatar";

interface AvatarProps {
  src?: string | null;
  name?: string;
  id?: string | number;
  className?: string;
  sizeClassName?: string;
}

export function Avatar({
  src,
  name = "User",
  id = 0,
  className,
  sizeClassName = "h-9 w-9",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  if (src) {
    return (
      <div className={cn("relative rounded-full overflow-hidden shrink-0", sizeClassName, className)}>
        <img src={src} alt={name} className="object-cover w-full h-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 text-xs font-bold uppercase",
        sizeClassName,
        getAvatarColorClass(id),
        className
      )}
    >
      <span>{initials}</span>
    </div>
  );
}

export default Avatar;
