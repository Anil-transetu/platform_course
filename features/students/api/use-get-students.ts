import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "../api";

interface UseGetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: string;
  courseId?: string;
}

export function useGetStudents(params: UseGetStudentsParams = {}) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      const data = await fetchStudents(
        params.page || 1,
        params.limit || 50,
        params.search,
        params.statusFilter,
        params.courseId
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
