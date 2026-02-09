import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { getUserById } from "./user";

const SESSION_COOKIE_NAME = "demo_session_user_id";

export async function setLoginSession(userId: string) {
  const cookieStore = await cookies();

  // In a real app, you would set `secure: true` and `sameSite: "lax"` or `"strict"`,
  // and consider using a short expiry with refresh logic.
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    path: "/",
  });
}

export async function clearLoginSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);
  return user ?? null;
}

