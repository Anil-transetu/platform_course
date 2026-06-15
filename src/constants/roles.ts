export enum Role {
  ADMIN = "admin",
  TUTOR = "tutor",
  INSTITUTION = "institution",
  STUDENT = "student",
}

export const RoleDashboards: Record<Role | string, string> = {
  [Role.ADMIN]: "/admin/dashboard",
  [Role.TUTOR]: "/tutor/dashboard",
  [Role.INSTITUTION]: "/institutional-representative/dashboard", // Using the actual folder name observed
  [Role.STUDENT]: "/student/dashboard",
};

export const RoleRoutes: Record<Role | string, string[]> = {
  [Role.ADMIN]: ["/admin"],
  [Role.TUTOR]: ["/tutor"],
  [Role.INSTITUTION]: ["/institutional-representative"],
  [Role.STUDENT]: ["/student"],
};

export const DEFAULT_REDIRECT = "/login";
