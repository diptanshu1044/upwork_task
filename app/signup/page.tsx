"use client";

import { FormEvent, useState } from "react";

interface SignupResponse {
  user?: {
    id: string;
    name: string;
    email?: string | null;
    role: string;
  };
  error?: string;
  message?: string;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [status, setStatus] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<SignupResponse["user"] | null>(
    null,
  );

  async function handleSignup(event: FormEvent) {
    event.preventDefault();
    setStatus("Signing up...");
    setCreatedUser(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: email || undefined,
          role,
        }),
      });

      const data: SignupResponse = await res.json();

      if (!res.ok) {
        setStatus(`Signup failed: ${data.message ?? data.error ?? res.status}`);
        return;
      }

      setStatus("User created successfully.");
      setCreatedUser(data.user ?? null);
    } catch {
      setStatus("Unexpected error during signup.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="w-full max-w-xl rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900">
          Signup
        </h1>
        <p className="mb-4 text-sm text-zinc-700">
          Create a user account in PostgreSQL via Prisma. The <strong>first</strong>{" "}
          user in the system can choose their role; all subsequent signups are
          stored as <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">USER</code> to keep the example simple.
        </p>

        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-900">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400"
              placeholder="Alice Admin"
              required
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-zinc-900">
              Desired role for this signup
            </span>
            <p className="mb-1 text-xs text-zinc-600">
              When the database is empty, choosing <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px]">ADMIN</code> makes the first
              user an admin. After that, the backend will always store new users
              as <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px]">USER</code>.
            </p>
            <div className="mt-1 flex gap-4 text-sm text-zinc-800">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={role === "USER"}
                  onChange={() => setRole("USER")}
                />
                <span>User</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === "ADMIN"}
                  onChange={() => setRole("ADMIN")}
                />
                <span>Admin</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900">
              Email (optional but recommended)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400"
              placeholder="alice@example.com"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            Sign up
          </button>
        </form>

        {status && (
          <p className="mt-3 text-sm text-zinc-800">
            <strong>Status:</strong> {status}
          </p>
        )}

        {createdUser && (
          <div className="mt-4 rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            <p className="font-medium">Newly created user</p>
            <pre className="mt-1 overflow-x-auto text-xs">
              {JSON.stringify(createdUser, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}

