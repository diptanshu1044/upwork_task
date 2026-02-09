import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

/**
 * GET /api/admin
 *
 * Protected admin-only endpoint.
 *
 * Authentication:
 *   - Requires a valid login session cookie (set by POST /api/auth/login).
 *
 * Authorization (RBAC):
 *   - Only users with role `ADMIN` can access this route.
 *
 * Responses:
 *   - 401: unauthenticated (no valid session)
 *   - 403: authenticated but not an admin
 *   - 200: admin-only payload
 */
export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthenticated",
        message: "You must be logged in to access this resource.",
      },
      { status: 401 },
    );
  }

  try {
    assertRole(user, "ADMIN");
  } catch {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "You must be an admin to access this resource.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json(
    {
      message: "Welcome to the admin API.",
      currentUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      exampleAdminData: {
        systemStatus: "ok",
      },
    },
    { status: 200 },
  );
}
