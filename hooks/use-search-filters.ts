"use client";

import { useState, useCallback, useMemo } from "react";
import { SearchConfig, FilterConfig } from "@/components/reusable/DataTable";

/**
 * Custom hook for managing search and filter state
 * Simplifies using DataTable component with search & filters
 *
 * @example
 * const { search, filters, resetFilters } = useSearchFilters({
 *   searchable: true,
 *   filterConfigs: [
 *     {
 *       id: "status",
 *       label: "Status",
 *       type: "select",
 *       options: [
 *         { value: "active", label: "Active" },
 *         { value: "inactive", label: "Inactive" },
 *       ],
 *     },
 *   ],
 * });
 */

export interface UseSearchFiltersOptions {
  searchable?: boolean;
  searchPlaceholder?: string;
  filterConfigs?: Array<{
    id: string;
    label: string;
    type: "select" | "multiselect" | "text" | "date-range";
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    clearable?: boolean;
  }>;
}

export interface UseSearchFiltersReturn {
  search: SearchConfig;
  filters: FilterConfig[];
  searchValue: string;
  filterValues: Record<string, string | string[]>;
  resetFilters: () => void;
  resetSearch: () => void;
  resetAll: () => void;
}

export function useSearchFilters(
  options: UseSearchFiltersOptions = {}
): UseSearchFiltersReturn {
  const {
    searchable = true,
    searchPlaceholder = "Search...",
    filterConfigs = [],
  } = options;

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>(
    () => {
      const initial: Record<string, string | string[]> = {};
      filterConfigs.forEach((config) => {
        initial[config.id] = config.type === "multiselect" ? [] : "";
      });
      return initial;
    }
  );

  // Search object
  const search: SearchConfig = useMemo(
    () => ({
      enabled: searchable,
      placeholder: searchPlaceholder,
      value: searchValue,
      onChange: setSearchValue,
    }),
    [searchable, searchPlaceholder, searchValue]
  );

  // Filter objects
  const filters: FilterConfig[] = useMemo(
    () =>
      filterConfigs.map((config) => ({
        id: config.id,
        label: config.label,
        type: config.type,
        placeholder: config.placeholder,
        options: config.options,
        value: filterValues[config.id] || (config.type === "multiselect" ? [] : ""),
        onChange: (value: string | string[]) => {
          setFilterValues((prev) => ({
            ...prev,
            [config.id]: value,
          }));
        },
        clearable: config.clearable ?? true,
      })),
    [filterConfigs, filterValues]
  );

  // Reset functions
  const resetSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  const resetFilters = useCallback(() => {
    setFilterValues((prev) => {
      const reset: Record<string, string | string[]> = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = Array.isArray(prev[key]) ? [] : "";
      });
      return reset;
    });
  }, []);

  const resetAll = useCallback(() => {
    resetSearch();
    resetFilters();
  }, [resetSearch, resetFilters]);

  return {
    search,
    filters,
    searchValue,
    filterValues,
    resetFilters,
    resetSearch,
    resetAll,
  };
}
