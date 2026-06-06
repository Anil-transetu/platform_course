import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api";

interface UseGetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roleFilter?: string;
}

export function useGetUsers(params: UseGetUsersParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const data = await fetchUsers(
        params.page || 1,
        params.limit || 50,
        params.search,
        params.roleFilter
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
