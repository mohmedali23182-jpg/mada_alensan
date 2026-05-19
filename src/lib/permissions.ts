export type CmsRole = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "CONTRIBUTOR" | "FIELD_REPORTER" | "VIEWER";

export type Permission =
  | "dashboard:read"
  | "posts:create"
  | "posts:update"
  | "posts:publish"
  | "posts:delete"
  | "categories:manage"
  | "contributors:manage"
  | "cases:manage"
  | "submissions:manage"
  | "media:manage"
  | "users:manage"
  | "settings:manage";

const rolePermissions: Record<CmsRole, Permission[]> = {
  OWNER: ["dashboard:read", "posts:create", "posts:update", "posts:publish", "posts:delete", "categories:manage", "contributors:manage", "cases:manage", "submissions:manage", "media:manage", "users:manage", "settings:manage"],
  ADMIN: ["dashboard:read", "posts:create", "posts:update", "posts:publish", "posts:delete", "categories:manage", "contributors:manage", "cases:manage", "submissions:manage", "media:manage", "users:manage", "settings:manage"],
  EDITOR: ["dashboard:read", "posts:create", "posts:update", "submissions:manage", "media:manage"],
  REVIEWER: ["dashboard:read", "posts:update", "posts:publish", "submissions:manage"],
  CONTRIBUTOR: ["dashboard:read", "posts:create"],
  FIELD_REPORTER: ["dashboard:read", "submissions:manage", "media:manage"],
  VIEWER: ["dashboard:read"],
};

export function hasPermission(role: CmsRole | string | undefined, permission: Permission) {
  if (!role) return false;
  return (rolePermissions[role as CmsRole] || []).includes(permission);
}

export function canAccessAdmin(role?: CmsRole | string) {
  return Boolean(role && role !== "VIEWER");
}
