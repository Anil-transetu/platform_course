export enum Role {
  ADMIN = "admin",
  TUTOR = "tutor",
  INSTITUTION = "institution",
  INSTITUTION_REPRESENTATIVE = "institution_representative",
  STUDENT = "student",
}

export const RoleDashboards: Record<Role | string, string> = {
  [Role.ADMIN]: "/admin/dashboard",
  [Role.TUTOR]: "/tutor/dashboard",
  [Role.INSTITUTION]: "/institutional-representative/dashboard",
  [Role.INSTITUTION_REPRESENTATIVE]: "/institutional-representative/dashboard",
  "institution representative": "/institutional-representative/dashboard",
  "institution_rep": "/institutional-representative/dashboard",
  [Role.STUDENT]: "/student/dashboard",
};

export const RoleRoutes: Record<Role | string, string[]> = {
  [Role.ADMIN]: ["/admin"],
  [Role.TUTOR]: ["/tutor"],
  [Role.INSTITUTION]: ["/institutional-representative"],
  [Role.INSTITUTION_REPRESENTATIVE]: ["/institutional-representative"],
  "institution representative": ["/institutional-representative"],
  "institution_rep": ["/institutional-representative"],
  [Role.STUDENT]: ["/student"],
};

export const DEFAULT_REDIRECT = "/login";

