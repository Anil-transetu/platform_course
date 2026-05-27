import { useState, useCallback } from "react";
import { PaginationState } from "@/types/common";

interface UseTableStateProps {
  initialPageSize?: number;
  initialPageIndex?: number;
}

/**
 * Hook for managing table state (pagination, filtering, sorting)
 * Can be used standalone or with server-side data
 */
export const useTableState = ({
  initialPageSize = 10,
  initialPageIndex = 0,
}: UseTableStateProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<
    Array<{ id: string; value: unknown }>
  >([]);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([]);

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination(newPagination);
  }, []);

  return {
    pagination,
    setPagination,
    handlePaginationChange,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    resetPagination,
  };
};
