"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/tables/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export interface StatCard {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: React.ReactNode;
  accent?: "primary" | "success" | "warning" | "info";
}

interface TableCardsProps<TData, TValue> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  stats: StatCard[];
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pageSize?: number;
  pageCount?: number;
  rowCount?: number;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  emptyMessage?: string;
}

const accentClasses: Record<NonNullable<StatCard["accent"]>, string> = {
  primary: "border-blue-500/60 bg-blue-50 text-blue-700",
  success: "border-green-500/60 bg-green-50 text-green-700",
  warning: "border-amber-500/60 bg-amber-50 text-amber-700",
  info: "border-sky-500/60 bg-sky-50 text-sky-700",
};

/**
 * TableCards - reusable layout with a stats card row + table container
 */
export function TableCards<TData, TValue>({
  title,
  subtitle,
  action,
  stats,
  columns,
  data,
  isLoading = false,
  pageSize = 10,
  pageCount,
  rowCount,
  pagination,
  onPaginationChange,
  toolbarLeft,
  toolbarRight,
  emptyMessage = "No records found",
}: TableCardsProps<TData, TValue>) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, idx) => {
          const accent = stat.accent ? accentClasses[stat.accent] : "border-gray-200";
          return (
            <div
              key={`${stat.label}-${idx}`}
              className={`rounded-xl border bg-white p-5 shadow-sm ${accent}`}
            >
              <div className="flex items-center gap-3">
                {stat.icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70">
                    {stat.icon}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.helperText && (
                    <p className="text-xs text-gray-500">{stat.helperText}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {(toolbarLeft || toolbarRight) && (
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">{toolbarLeft}</div>
            <div className="flex items-center gap-3">{toolbarRight}</div>
          </div>
        )}

        <div className="p-4">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            pageSize={pageSize}
            pageCount={pageCount}
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
          />
          {!isLoading && data.length === 0 && (
            <p className="mt-4 text-center text-sm text-gray-500">{emptyMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
