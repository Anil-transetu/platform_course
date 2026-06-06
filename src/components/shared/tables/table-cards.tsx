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
  title?: string;
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
  emptyState?: React.ReactNode;
}



/**
 * TableCards - reusable layout with a stats card row + table container
 */
export function TableCards<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageSize = 10,
  pageCount,
  rowCount,
  pagination,
  onPaginationChange,
  emptyState,
}: TableCardsProps<TData, TValue>) {
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        pageSize={pageSize}
        pageCount={pageCount}
        rowCount={rowCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        emptyState={emptyState}
      />
    </div>
  );
}
