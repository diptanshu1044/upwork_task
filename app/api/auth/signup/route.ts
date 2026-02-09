import { NextResponse } from "next/server";
import { createUser, countUsers, getUserByEmailOrName } from "@/lib/user";

/**
 * POST /api/auth/signup
 *
 * Minimal signup endpoint:
 * - Accepts JSON body: { name: string; email?: string }
 * - Creates a new user in PostgreSQL via Prisma.
 * - First user in the system is promoted to ADMIN, others default to USER.
 *
 * For simplicity, this endpoint does not handle passwords. In a real-world
 * application you would:
 * - require a strong password
 * - hash it using a slow hashing function (e.g. bcrypt, argon2)
 * - enforce uniqueness of email and handle sensitive error messages carefully
 */

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = (body?.name ?? "").trim();
  const emailRaw = (body?.email ?? "") as string;
  const email = emailRaw.trim() || undefined;
  const requestedRoleRaw = (body?.role ?? "") as string;
  const requestedRole =
    requestedRoleRaw === "ADMIN" || requestedRoleRaw === "USER"
      ? requestedRoleRaw
      : undefined;

  if (!name) {
    return NextResponse.json(
      { error: "InvalidInput", message: "Name is required." },
      { status: 400 },
    );
  }

  // Prevent duplicate accounts by email (if provided) or name (as a fallback).
  const existing = await getUserByEmailOrName({ email, name });
  if (existing) {
    return NextResponse.json(
      {
        error: "UserExists",
        message: "A user with this name or email already exists.",
      },
      { status: 409 },
    );
  }

  // Role selection:
  // - If there are no users yet, allow the first user to choose between
  //   ADMIN and USER (defaulting to ADMIN when not specified).
  // - Once at least one user exists, all subsequent signups are forced to USER
  //   to keep the example simple and avoid managing admin self-service.
  const totalUsers = await countUsers();
  let role: "ADMIN" | "USER";
  if (totalUsers === 0) {
    role = requestedRole ?? "ADMIN";
  } else {
    role = "USER";
  }

  const user = await createUser({ name, email, role });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 },
  );
}

