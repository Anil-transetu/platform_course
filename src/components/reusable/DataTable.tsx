"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  width?: string;
  sortable?: boolean;
}

/**
 * Filter configuration type
 * Supports multiple filter types: select, multiselect, text, date range
 */
export interface FilterConfig {
  id: string;
  label: string;
  type: "select" | "multiselect" | "text" | "date-range";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  clearable?: boolean;
}

/**
 * Search configuration
 */
export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  /**
   * Array of data to display
   */
  data: T[];

  /**
   * Column definitions
   */
  columns: Column<T>[];

  /**
   * Custom row key selector (default: index)
   */
  rowKey?: (row: T, index: number) => string | number;

  /**
   * Action column content
   */
  actions?: (row: T) => ReactNode;

  /**
   * Row click handler (optional)
   */
  onRowClick?: (row: T) => void;

  /**
   * Height of the table body (default: "h-96")
   */
  bodyHeight?: string;

  /**
   * Rows per page
   */
  rowsPerPage: number;

  /**
   * Current page
   */
  currentPage: number;

  /**
   * Total pages
   */
  totalPages: number;

  /**
   * Pagination change handler
   */
  onPageChange: (page: number) => void;

  /**
   * Rows per page change handler
   */
  onRowsPerPageChange: (rows: number) => void;

  /**
   * Pagination info text (e.g., "1-5 of 10")
   */
  paginationInfo?: string;

  /**
   * Show/hide pagination footer
   */
  showPagination?: boolean;

  /**
   * Search configuration (optional)
   */
  search?: SearchConfig;

  /**
   * Filter configurations (optional)
   */
  filters?: FilterConfig[];

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Empty state message
   */
  emptyStateMessage?: string;
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
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      {/* SEARCH & FILTERS BAR */}
      {(search?.enabled || (filters && filters.length > 0)) && (
        <div className="bg-card p-4 rounded-lg border border-border flex gap-4 flex-shrink-0 flex-wrap">
          {/* SEARCH INPUT */}
          {search?.enabled && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={search.placeholder || "Search..."}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>
          )}

          {/* FILTER SELECTS */}
          {filters && filters.length > 0 && (
            <>
              {filters.map((filter) => (
                <div key={filter.id} className="relative">
                  {filter.type === "select" && (
                    <Select
                      value={Array.isArray(filter.value) ? "" : (filter.value || "")}
                      onValueChange={(val) => filter.onChange(val)}
                    >
                      <SelectTrigger className="w-[150px] bg-card border-border">
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
                      <SelectTrigger className="w-[150px] bg-card border-border">
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
                      className="w-[150px] bg-card border-border"
                    />
                  )}

                  {filter.type === "date-range" && (
                    <Input
                      type="date"
                      value={Array.isArray(filter.value) ? "" : filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="w-[150px] bg-card border-border"
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
            </>
          )}
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col h-full overflow-hidden flex-1 min-h-0">
        {/* TABLE */}
        <div className={`overflow-auto ${bodyHeight}`}>
          <Table className="border-collapse">
            <TableHeader className="sticky top-0 bg-muted border-b border-border">
              <TableRow className="border-b border-border hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={`font-semibold text-card-foreground bg-muted ${
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
                {actions && <TableHead className="text-center font-semibold text-card-foreground bg-muted">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="text-center py-8"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce"></div>
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((row, index) => {
                  const rowId = String(rowKey(row, index));
                  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if ((e.key === "Enter" || e.key === " ") && (actions || onRowClick)) {
                      e.preventDefault();
                      onRowClick?.(row);
                    }
                  };
                  return (
                    <TableRow
                      key={rowId}
                      className={`border-b border-gray-100 transition-colors ${
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
                        <TableCell key={String(column.key)} className="text-card-foreground">
                          {column.render
                            ? column.render(row[column.key], row)
                            : (row[column.key] as ReactNode)}
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell className="text-center">
                          {actions(row)}
                        </TableCell>
                      )}
                    </TableRow>
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

        {/* TABLE FOOTER - Fixed Pagination */}
        {showPagination && (
          <div className="flex-shrink-0 bg-card border-t border-border px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-card-foreground">Rows per page:</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(val) => onRowsPerPageChange(Number(val))}
              >
                <SelectTrigger className="w-[70px] bg-card border-border">
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
                <span className="text-sm text-muted-foreground ml-4">
                  {paginationInfo}
                </span>
              )}
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`text-sm ${currentPage === 1 ? "text-gray-300" : "text-card-foreground hover:underline"}`}
                aria-label="Previous page"
              >
                Previous
              </button>

              <nav aria-label="Pagination" className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // show first, last and neighbors of current; show 2 as well and use ellipsis gaps
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
                        className={`inline-flex items-center justify-center w-9 h-9 text-sm font-medium ${
                          isActive
                            ? "bg-blue-600 text-white rounded-md shadow"
                            : "text-card-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  // show ellipsis where appropriate
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
                className={`text-sm ${currentPage === totalPages ? "text-gray-300" : "text-card-foreground hover:underline"}`}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
