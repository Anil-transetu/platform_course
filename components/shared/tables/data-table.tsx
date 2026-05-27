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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => {
                const rowId = `${idx}`;
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      onClick={() => handleRowClick(row.original, rowId)}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {renderRowDetail && expandedRows[rowId] && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          {renderRowDetail(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isServerPagination
            ? `Showing ${currentPagination.pageIndex * currentPagination.pageSize + 1}–${Math.min((currentPagination.pageIndex + 1) * currentPagination.pageSize, rowCount || 0)} of ${rowCount || 0}`
            : `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of ${data.length}`}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select
              value={currentPagination.pageSize.toString()}
              onValueChange={(value: string) => {
                handlePaginationChange({
                  pageIndex: 0,
                  pageSize: Number(value),
                });
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  pageIndex: Math.max(0, currentPagination.pageIndex - 1),
                  pageSize: currentPagination.pageSize,
                })
              }
              disabled={currentPagination.pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600">
              Page {currentPagination.pageIndex + 1} of{" "}
              {pageCount || Math.ceil(data.length / currentPagination.pageSize)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  pageIndex: currentPagination.pageIndex + 1,
                  pageSize: currentPagination.pageSize,
                })
              }
              disabled={
                isServerPagination
                  ? currentPagination.pageIndex >= (pageCount || 0) - 1
                  : currentPagination.pageIndex >=
                    Math.ceil(data.length / currentPagination.pageSize) - 1
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
