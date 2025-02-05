export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  AUTHOR: "AUTHOR",
} as const;

export type RoleType = keyof typeof ROLES;
