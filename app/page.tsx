export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900">
          Minimal auth + RBAC-backed Next.js API
        </h1>
        <p className="mb-6 text-sm text-zinc-700">
          This project focuses on backend structure: a PostgreSQL-backed User
          model via Prisma, a minimal signup/login flow, and role-based access
          control guarding an admin-only API route.
        </p>

        <div className="mb-6 flex gap-3">
          <a
            href="/signup"
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            Go to signup
          </a>
          <a
            href="/login"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900"
          >
            Go to login
          </a>
        </div>

        <section className="mb-4">
          <h2 className="mb-1 text-lg font-medium text-zinc-900">
            Auth flow
          </h2>
          <p className="text-sm text-zinc-700">
            The flow is intentionally simple:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-700">
            <li>
              Go to <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/signup</code> to create a user in
              PostgreSQL.
            </li>
            <li>
              Go to <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/login</code> to log in. On success, a
              session cookie containing your user ID is set.
            </li>
            <li>
              From the login page, call the protected{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/api/admin</code> route and inspect the
              response.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="mb-1 text-lg font-medium text-zinc-900">
            Protected admin endpoint
          </h2>
          <p className="text-sm text-zinc-700">
            The route <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/api/admin</code>{" "}
            requires:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-700">
            <li>an active login session cookie (set by POST <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">/api/auth/login</code>)</li>
            <li>the associated user to have role <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">ADMIN</code></li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="mb-1 text-lg font-medium text-zinc-900">
            Example curl commands (after login)
          </h2>
          <pre className="overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-50">
            <code>{`# Admin (allowed) – cookie-based session
curl -i http://localhost:3000/api/admin

# If not logged in
# → 401 Unauthenticated

# If logged in as non-admin
# → 403 Forbidden`}</code>
          </pre>
        </section>

        <section>
          <h2 className="mb-1 text-lg font-medium text-zinc-900">
            Where to look in the code
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-700">
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">prisma/schema.prisma</code> — Prisma + PostgreSQL `User` model</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">lib/db.ts</code> — Prisma client singleton</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">lib/user.ts</code> — User data access helpers</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">lib/auth.ts</code> — cookie-based authentication</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">lib/rbac.ts</code> — role-based access helpers</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">app/api/admin/route.ts</code> — protected admin API route</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">app/signup/page.tsx</code> — signup form</li>
            <li><code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">app/login/page.tsx</code> — login form and admin API tester</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
