/**
 * Common types and interfaces used across the application
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface TableState {
  pagination: PaginationState;
  sorting?: Array<{ id: string; desc: boolean }>;
  columnFilters?: Array<{ id: string; value: unknown }>;
  globalFilter?: string;
}

export interface FormModalProps<T extends Record<string, unknown>> {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  initialData?: T | null;
  onSubmit: (payload: T) => Promise<void>;
  isLoading?: boolean;
}
