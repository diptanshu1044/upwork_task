import type { User } from "@prisma/client";

export type Role = "ADMIN" | "USER";

export function hasRole(user: User, requiredRole: Role): boolean {
  return user.role === requiredRole;
}

export function assertRole(user: User, requiredRole: Role): void {
  if (!hasRole(user, requiredRole)) {
    throw new Error(
      `Forbidden: user "${user.name}" does not have required role "${requiredRole}".`,
    );
  }
}

