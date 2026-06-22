import React from "react";
import { cn } from "@/lib/utils";

interface CircleChartProps {
  percentage: number;
  label: string;
  subLabel: string;
  colorType: "green" | "blue" | "orange" | "red";
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function CircleChart({
  percentage,
  label,
  subLabel,
  colorType,
  size = 130,
  strokeWidth = 10,
  className,
}: CircleChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  // Determine colors based on design mockup
  const colorMap = {
    green: {
      stroke: "stroke-emerald-500",
      bgStroke: "stroke-emerald-100/50",
      text: "text-emerald-600",
    },
    blue: {
      stroke: "stroke-blue-500",
      bgStroke: "stroke-blue-100/50",
      text: "text-blue-600",
    },
    orange: {
      stroke: "stroke-orange-500",
      bgStroke: "stroke-orange-100/50",
      text: "text-orange-600",
    },
    red: {
      stroke: "stroke-rose-500",
      bgStroke: "stroke-rose-100/50",
      text: "text-rose-600",
    },
  };

  const selectedColors = colorMap[colorType];

  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-2", className)}>
      {/* SVG Circular Indicator */}
      <div className="relative mb-4" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("fill-transparent", selectedColors.bgStroke)}
            strokeWidth={strokeWidth}
          />
          {/* Active progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("fill-transparent transition-all duration-500 ease-out", selectedColors.stroke)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage Label inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-800 dark:text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Label and Student Count underneath */}
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {subLabel}
      </span>
    </div>
  );
}
