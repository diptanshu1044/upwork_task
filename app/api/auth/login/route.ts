import { NextResponse } from "next/server";
import { getUserByEmailOrName } from "@/lib/user";
import { clearLoginSession, setLoginSession } from "@/lib/auth";

/**
 * POST /api/auth/login
 *
 * Minimal login endpoint:
 * - Accepts JSON body: { name?: string; email?: string }
 * - Looks up the user by email (preferred) or name.
 * - On success, sets an httpOnly cookie containing the user ID.
 *
 * This implementation intentionally skips passwords and hashing to keep
 * the example small and focused on structure. In a real system you would:
 * - require credentials (e.g. email + password)
 * - validate the password against a stored hash
 * - implement rate limiting and account lockouts for security
 */

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = (body?.name ?? "") as string;
  const email = (body?.email ?? "") as string;

  if (!email && !name) {
    return NextResponse.json(
      {
        error: "InvalidInput",
        message: "Provide at least a name or an email.",
      },
      { status: 400 },
    );
  }

  const user = await getUserByEmailOrName({
    email: email.trim() || undefined,
    name: name.trim() || undefined,
  });

  if (!user) {
    // For demo purposes, we return a clear error. In production you may prefer
    // a more generic message to avoid leaking which identifiers exist.
    await clearLoginSession();
    return NextResponse.json(
      {
        error: "InvalidCredentials",
        message: "No matching user found. Please sign up first.",
      },
      { status: 401 },
    );
  }

  await setLoginSession(user.id);

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 },
  );
}

