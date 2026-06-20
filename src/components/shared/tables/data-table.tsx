"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  renderRowDetail?: (row: TData) => React.ReactNode;

  // Server pagination
  pageCount?: number;
  rowCount?: number;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;

  // Optional features
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

/**
 * Reusable DataTable component with TanStack Table
 * Supports both client-side and server-side pagination, sorting, filtering
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize: defaultPageSize = 10,
  onRowClick,
  renderRowDetail,
  pageCount,
  rowCount,
  pagination: controlledPagination,
  onPaginationChange,
  isLoading = false,
  emptyState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  // Handle pagination - controlled by parent or internal state
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: defaultPageSize,
    });

  const isServerPagination = pageCount !== undefined || rowCount !== undefined;
  const currentPagination = controlledPagination || internalPagination;

  const handlePaginationChange = (newPagination: PaginationState) => {
    if (onPaginationChange) {
      onPaginationChange(newPagination);
    } else {
      setInternalPagination(newPagination);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: !isServerPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: !isServerPagination ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: currentPagination,
    },
    pageCount: pageCount,
    manualPagination: isServerPagination,
    manualSorting: isServerPagination,
    manualFiltering: isServerPagination,
  });

  const handleRowClick = (row: TData, rowId: string) => {
    if (renderRowDetail) {
      setExpandedRows((prev) => ({
        ...prev,
        [rowId]: !prev[rowId],
      }));
    }

    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="rounded-none border-none flex-1 overflow-y-auto relative">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-6 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-blue-600" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group border-b border-slate-50 hover:bg-blue-50/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[400px] p-0"
                >
                  {emptyState ? emptyState : (
                    <div className="flex flex-col items-center justify-center space-y-3 h-full w-full">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-base font-bold text-foreground">No records found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Container */}
      <div className="sticky bottom-0 z-20 bg-card border-t border-slate-100 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span>Rows per page:</span>
          <Select
            value={currentPagination.pageSize.toString()}
            onValueChange={(value: string) => {
              handlePaginationChange({
                pageIndex: 0,
                pageSize: Number(value),
              });
            }}
          >
            <SelectTrigger className="h-10 w-[80px] rounded-xl bg-card border-border font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 bg-gray-100 dark:bg-muted shadow-xl">
              {[5, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()} className="rounded-lg">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ">
          <Button
            variant="ghost"
            className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground font-bold"
            onClick={() =>
              handlePaginationChange({
                pageIndex: Math.max(0, currentPagination.pageIndex - 1),
                pageSize: currentPagination.pageSize,
              })
            }
            disabled={currentPagination.pageIndex === 0}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={currentPagination.pageIndex + 1 === page ? "default" : "ghost"}
                className={cn(
                  "h-10 w-10 rounded-xl font-bold",
                  currentPagination.pageIndex + 1 === page ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => handlePaginationChange({ ...currentPagination, pageIndex: page - 1 })}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            className="h-10 px-4 rounded-lg border-border bg-gray-300 font-bold hover:bg-muted ml-2"
            onClick={() =>
              handlePaginationChange({
                pageIndex: currentPagination.pageIndex + 1,
                pageSize: currentPagination.pageSize,
              })
            }
            disabled={
              isServerPagination
                ? currentPagination.pageIndex >= (pageCount || 1) - 1
                : currentPagination.pageIndex >=
                  Math.ceil(data.length / currentPagination.pageSize) - 1
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
