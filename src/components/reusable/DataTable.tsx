"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T, isExpanded?: boolean, toggleExpand?: () => void) => ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: "select" | "multiselect" | "text" | "date-range";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  clearable?: boolean;
  className?: string;
}

export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T, index: number) => string | number;
  actions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  bodyHeight?: string;
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  paginationInfo?: string;
  showPagination?: boolean;
  search?: SearchConfig;
  filters?: FilterConfig[];
  loading?: boolean;
  emptyStateMessage?: string;
  renderExpandedRow?: (row: T) => ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey = (_, index) => index,
  actions,
  onRowClick,
  bodyHeight = "h-96",
  rowsPerPage,
  currentPage,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
  paginationInfo,
  showPagination = true,
  search,
  filters,
  loading = false,
  emptyStateMessage = "No data found",
  renderExpandedRow,
}: DataTableProps<T>) {
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<Set<string | number>>(new Set());

  const toggleExpand = (rowId: string | number) => {
    const newSet = new Set(expandedRowKeys);
    if (newSet.has(rowId)) newSet.delete(rowId);
    else newSet.add(rowId);
    setExpandedRowKeys(newSet);
  };
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col h-full overflow-hidden flex-1 min-h-0">
      {/* SEARCH & FILTERS BAR */}
      {(search?.enabled || (filters && filters.length > 0)) && (
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-card flex-shrink-0">
          {/* SEARCH INPUT — grows to fill all remaining space */}
          {search?.enabled && (
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={search.placeholder || "Search..."}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="pl-10 w-full bg-card border-border"
                />
              </div>
            </div>
          )}

          {/* FILTER SELECTS — fixed width, aligned right */}
          {filters && filters.length > 0 && (
            <div className="flex gap-2 sm:gap-3 flex-wrap items-center w-full md:w-auto md:ml-auto md:justify-end">
              {filters.map((filter) => (
                <div key={filter.id} className="relative flex-1 sm:flex-initial min-w-[120px] sm:min-w-0">
                  {filter.type === "select" && (
                    <Select
                      value={Array.isArray(filter.value) ? "" : (filter.value || "")}
                      onValueChange={(val) => filter.onChange(val)}
                    >
                      <SelectTrigger className={cn("w-full sm:w-[150px] bg-card border-border text-xs sm:text-sm", filter.className)}>
                        <SelectValue placeholder={filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "multiselect" && (
                    <Select
                      value={
                        Array.isArray(filter.value)
                          ? filter.value.join(",")
                          : ""
                      }
                      onValueChange={(val) =>
                        filter.onChange(val ? val.split(",") : [])
                      }
                    >
                      <SelectTrigger className={cn("w-full sm:w-[150px] bg-card border-border text-xs sm:text-sm", filter.className)}>
                        <SelectValue placeholder={filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "text" && (
                    <Input
                      type="text"
                      placeholder={filter.placeholder || filter.label}
                      value={Array.isArray(filter.value) ? "" : filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className={cn("w-full sm:w-[150px] bg-card border-border text-xs sm:text-sm", filter.className)}
                    />
                  )}

                  {filter.type === "date-range" && (
                    <Input
                      type="date"
                      value={Array.isArray(filter.value) ? "" : filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className={cn("w-full sm:w-[150px] bg-card border-border text-xs sm:text-sm", filter.className)}
                    />
                  )}

                  {/* Clear button */}
                  {filter.clearable && filter.value && (
                    <Button
                      onClick={() =>
                        filter.onChange(Array.isArray(filter.value) ? [] : "")
                      }
                      variant="ghost"
                      size="sm"
                      className="absolute -right-10 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      title="Clear filter"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className={`overflow-auto ${bodyHeight} w-full`}>
        <Table className="border-collapse w-full min-w-[600px] md:min-w-0">
          <TableHeader className="sticky top-0 bg-muted border-b border-border">
            <TableRow className="border-b border-border hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={`font-semibold text-card-foreground bg-muted text-xs sm:text-sm ${
                    column.width || ""
                  } ${column.sortable ? "cursor-pointer hover:bg-accent" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col gap-0.5">
                        <ChevronUp className="h-3 w-3" />
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && (
                <TableHead className="text-center font-semibold text-card-foreground bg-muted text-xs sm:text-sm">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-64"
                >
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((row, index) => {
                const rowId = String(rowKey(row, index));
                const isExpanded = expandedRowKeys.has(rowId);
                const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                  if ((e.key === "Enter" || e.key === " ") && (actions || onRowClick)) {
                    e.preventDefault();
                    onRowClick?.(row);
                  }
                };
                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      className={`border-b border-gray-100 dark:border-border/50 transition-colors text-xs sm:text-sm ${
                        actions || onRowClick
                          ? "cursor-pointer hover:bg-muted"
                          : ""
                      }`}
                      onClick={() => onRowClick?.(row)}
                      onKeyDown={handleKeyDown}
                      tabIndex={actions || onRowClick ? 0 : -1}
                      role={actions || onRowClick ? "button" : undefined}
                    >
                      {columns.map((column) => (
                        <TableCell key={String(column.key)} className="text-card-foreground py-3 px-4">
                          {column.render
                            ? column.render(row[column.key as keyof T], row, isExpanded, () => toggleExpand(rowId))
                            : (row[column.key as keyof T] as ReactNode)}
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell className="text-center py-3 px-4">
                          {actions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                    {isExpanded && renderExpandedRow && (
                      <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                        <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="p-0 border-b border-gray-100 dark:border-border/50">
                          {renderExpandedRow(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* TABLE FOOTER - Pagination */}
      {showPagination && (
        <div className="flex-shrink-0 bg-card border-t border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
            <span className="text-xs sm:text-sm font-medium text-card-foreground">Rows per page:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(val) => onRowsPerPageChange(Number(val))}
            >
              <SelectTrigger className="w-[60px] sm:w-[70px] bg-card border-border h-8 sm:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            {paginationInfo && (
              <span className="text-xs sm:text-sm text-muted-foreground ml-2 sm:ml-4">
                {paginationInfo}
              </span>
            )}
          </div>

          <div className="flex gap-3 sm:gap-4 items-center justify-between w-full sm:w-auto">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`text-xs sm:text-sm ${currentPage === 1 ? "text-gray-300" : "text-card-foreground hover:underline"}`}
              aria-label="Previous page"
            >
              Previous
            </button>

            <span className="text-xs sm:hidden font-medium text-card-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <nav aria-label="Pagination" className="hidden sm:flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                if (
                  p === 1 ||
                  p === totalPages ||
                  p === 2 ||
                  p === totalPages - 1 ||
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  const isActive = currentPage === p;
                  return (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex items-center justify-center w-9 h-9 text-xs sm:text-sm font-medium ${
                        isActive
                          ? "bg-blue-600 text-white rounded-md shadow"
                          : "text-card-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                }

                if (p === currentPage - 2 || p === currentPage + 2) {
                  return (
                    <span key={`e-${p}`} className="px-2 text-muted-foreground">
                      …
                    </span>
                  );
                }

                return null;
              })}
            </nav>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`text-xs sm:text-sm ${currentPage === totalPages ? "text-gray-300" : "text-card-foreground hover:underline"}`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}