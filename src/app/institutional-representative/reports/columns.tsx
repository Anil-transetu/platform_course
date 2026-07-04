"use client";

import React from "react";
import { ReportItem } from "@/features/institutional-representative/api/reports-api";
import { Column } from "@/components/reusable/DataTable";
import { FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuildReportColumnsProps {
  downloadingType: string | null;
  onDownload: (type: string, title: string) => void;
}

export function buildReportColumns({
  downloadingType,
  onDownload,
}: BuildReportColumnsProps): Column<ReportItem>[] {
  return [
    {
      key: "title",
      label: "Report Title",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-500 shrink-0">
            <FileText size={16} />
          </div>
          <span className="font-semibold text-slate-800 dark:text-foreground text-sm truncate">
            {String(value)}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value) => {
        const category = String(value || "").toUpperCase();
        let badgeStyles = "";
        if (category === "ATTENDANCE") {
          badgeStyles = "bg-[#EFF6FF] text-[#1D4ED8]";
        } else if (category === "PERFORMANCE") {
          badgeStyles = "bg-[#ECFDF5] text-[#047857]";
        } else if (category === "PROGRESS") {
          badgeStyles = "bg-[#F5F3FF] text-[#6D28D9]";
        } else if (category === "CRITICAL" || category === "AT_RISK") {
          badgeStyles = "bg-[#FEE2E2] text-[#991B1B]";
        } else {
          badgeStyles = "bg-slate-100 text-slate-700";
        }
        return (
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center justify-center min-w-[120px] text-center",
            badgeStyles
          )}>
            {category}
          </span>
        );
      }
    },
    {
      key: "date_generated",
      label: "Date Generated",
      render: (value) => (
        <span className="text-slate-500 dark:text-muted-foreground text-sm">
          {String(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        <button
          onClick={() => onDownload(row.report_type, row.title)}
          disabled={downloadingType !== null}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
        >
          <Download size={14} />
          <span>Download</span>
        </button>
      ),
    }
  ];
}
