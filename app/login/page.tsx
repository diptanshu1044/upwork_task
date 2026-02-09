"use client";

import { FormEvent, useState } from "react";

interface LoginResponse {
  user?: {
    id: string;
    name: string;
    email?: string | null;
    role: string;
  };
  error?: string;
  message?: string;
}

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<LoginResponse["user"] | null>(
    null,
  );
  const [adminResponse, setAdminResponse] = useState<string | null>(null);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setStatus("Logging in...");
    setAdminResponse(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
        }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        setStatus(`Login failed: ${data.message ?? data.error ?? res.status}`);
        setCurrentUser(null);
        return;
      }

      setStatus("Logged in. Session cookie set.");
      setCurrentUser(data.user ?? null);
    } catch (error) {
      setStatus("Unexpected error during login.");
      setCurrentUser(null);
    }
  }

  async function callAdminApi() {
    setAdminResponse("Calling /api/admin...");
    try {
      const res = await fetch("/api/admin", {
        method: "GET",
      });
      const data = await res.json();
      setAdminResponse(
        `Status ${res.status}: ${JSON.stringify(data, null, 2)}`,
      );
    } catch {
      setAdminResponse("Failed to call /api/admin.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="w-full max-w-xl rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900">
          Login
        </h1>
        <p className="mb-4 text-sm text-zinc-700">
          This page demonstrates a minimal login flow without passwords. After a
          successful login, an httpOnly cookie is set on the response and used
          by the <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/api/admin</code>{" "}
          route to check your role.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-900">
              Email (preferred)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400"
              placeholder="alice@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900">
              Name (fallback lookup)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400"
              placeholder="Alice Admin"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            Log in
          </button>
        </form>

        {status && (
          <p className="mt-3 text-sm text-zinc-800">
            <strong>Status:</strong> {status}
          </p>
        )}

        {currentUser && (
          <div className="mt-4 rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            <p className="font-medium">Current user (client-side state)</p>
            <pre className="mt-1 overflow-x-auto text-xs">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>
        )}

        <hr className="my-5" />

        <section>
          <h2 className="mb-2 text-lg font-medium text-zinc-900">
            Test admin-only API
          </h2>
          <p className="mb-2 text-sm text-zinc-700">
            After logging in, click the button below to call{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/api/admin</code>. The
            server will read your session cookie and enforce RBAC (only{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">ADMIN</code> can access).
          </p>
          <button
            type="button"
            onClick={callAdminApi}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            Call /api/admin
          </button>

          {adminResponse && (
            <pre className="mt-3 max-h-64 overflow-auto rounded bg-zinc-950 p-3 text-xs text-zinc-50">
{adminResponse}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}

