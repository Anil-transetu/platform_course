import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface FreshStudentProfile {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  profile_image?: string;
}

export function useStudentProfiles(studentIds: (number | string)[]) {
  const cleanIds = studentIds
    .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
    .filter((id) => !isNaN(id) && id !== null && id !== undefined);

  return useQuery<FreshStudentProfile[]>({
    queryKey: ["supabase-student-profiles", cleanIds],
    queryFn: async () => {
      if (cleanIds.length === 0) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, profile_image")
        .in("id", cleanIds);
      if (error) throw error;
      return (data || []) as FreshStudentProfile[];
    },
    enabled: cleanIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStudentProfile(studentId: number | string) {
  const cleanId = typeof studentId === "string" ? parseInt(studentId, 10) : studentId;

  return useQuery<FreshStudentProfile | null>({
    queryKey: ["supabase-student-profile", cleanId],
    queryFn: async () => {
      if (!cleanId || isNaN(cleanId)) return null;
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, profile_image")
        .eq("id", cleanId)
        .single();
      if (error) throw error;
      return (data || null) as FreshStudentProfile | null;
    },
    enabled: !!cleanId && !isNaN(cleanId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Reusable utility to enrich a list of student records with their fresh profile data.
 * Merges name (combining first_name and last_name) and profile image.
 */
export function enrichStudentData<T extends Record<string, any>>(
  students: T[],
  freshProfiles?: FreshStudentProfile[]
): T[] {
  if (!freshProfiles || freshProfiles.length === 0) return students;

  const profileMap = new Map(freshProfiles.map((p) => [Number(p.id), p]));

  return students.map((s) => {
    // Standardize finding student_id or id from the student object
    const studentId = Number(s.student_id || s.id);
    const fresh = profileMap.get(studentId);
    if (fresh) {
      const fullName = `${fresh.first_name || ""} ${fresh.last_name || ""}`.trim();
      return {
        ...s,
        student_name: fullName || s.student_name,
        name: fullName || s.name,
        avatar_url: fresh.profile_image || s.avatar_url,
        profile_image: fresh.profile_image || s.profile_image,
      };
    }
    return s;
  });
}

/**
 * Reusable utility to enrich a single student record with fresh profile data.
 */
export function enrichSingleStudent<T extends Record<string, any>>(
  student: T | null | undefined,
  freshProfile?: FreshStudentProfile | null
): T | null | undefined {
  if (!student) return student;
  if (!freshProfile) return student;

  const fullName = `${freshProfile.first_name || ""} ${freshProfile.last_name || ""}`.trim();
  return {
    ...student,
    student_name: fullName || student.student_name,
    name: fullName || student.name,
    avatar_url: freshProfile.profile_image || student.avatar_url,
    profile_image: freshProfile.profile_image || student.profile_image,
  };
}
