Minimal Next.js backend-focused example with:

- a PostgreSQL-backed `User` model via Prisma
- a minimal signup (`/signup`) and login (`/login`) flow
- cookie-based authentication
- role-based access control (RBAC) over a protected `admin` API route

The goal is to demonstrate clean backend structure and separation of concerns
rather than UI complexity.

---

## Project structure

Key files and folders:

- `app/`
  - `layout.tsx` — root layout
  - `page.tsx` — minimal landing page that documents the auth + RBAC flow
  - `login/page.tsx` — login form and admin API tester
  - `signup/page.tsx` — signup form
  - `api/`
    - `admin/route.ts` — **protected admin-only API route**
    - `auth/signup/route.ts` — **signup API**
    - `auth/login/route.ts` — **login API**
- `lib/`
  - `db.ts` — **Prisma client singleton**
  - `user.ts` — **User data access helpers (Prisma-backed)**
  - `auth.ts` — **cookie-based authentication helpers**
  - `rbac.ts` — **role-based access control helpers**
- `prisma/`
  - `schema.prisma` — **Prisma schema defining the `User` model and `Role` enum**

This keeps the Next.js layer thin and pushes domain logic (users, auth, RBAC)
into the `lib/` folder so it can be reused from other routes or server
functions.

---

## Data model (Prisma + PostgreSQL)

The application uses PostgreSQL via Prisma. The schema is defined in
`prisma/schema.prisma`:

- **User model**
  - `id: String` — primary key (`cuid()` generated)
  - `name: String`
  - `email: String?` — optional but unique when present
  - `role: Role` — enum (`ADMIN` or `USER`), defaults to `USER`
  - `createdAt: DateTime` — default `now()`
  - `updatedAt: DateTime` — automatically updated timestamp

- **Role enum**
  - `ADMIN`
  - `USER`

The `lib/user.ts` module wraps common Prisma queries:

- `getUserById(id)` — find by primary key
- `getUserByEmailOrName({ email, name })` — flexible lookup for login
- `createUser({ name, email, role })` — create a new user
- `countUsers()` — helper to detect if the first user is being created

---

## Authentication model (signup → login → cookie)

Authentication is intentionally minimal but more realistic than a header-based
mock.

### Signup (`POST /api/auth/signup` + `/signup` page)

- **Backend** (`app/api/auth/signup/route.ts`)
  - Accepts JSON body: `{ name: string; email?: string }`.
  - Validates the input.
  - Uses `getUserByEmailOrName` to prevent duplicate users.
  - Uses `countUsers()` to detect whether this is the first user:
    - first user → `role: ADMIN`
    - subsequent users → `role: USER`
  - Persists the user via `createUser`.
  - Returns the created user in JSON (no passwords).

- **Frontend** (`app/signup/page.tsx`)
  - Simple client-side form that POSTs to `/api/auth/signup`.
  - Displays the created user and status message.

### Login (`POST /api/auth/login` + `/login` page)

- **Backend** (`app/api/auth/login/route.ts`)
  - Accepts JSON body: `{ name?: string; email?: string }`.
  - Looks up the user using `getUserByEmailOrName`:
    - prefers `email` if provided, otherwise falls back to `name`.
  - On success:
    - Calls `setLoginSession(user.id)` from `lib/auth.ts` to set an httpOnly
      cookie containing the user ID.
    - Returns the user in the JSON response.
  - On failure:
    - Clears any existing session via `clearLoginSession()`.
    - Returns `401` with an appropriate error.

  > **Security note (tradeoffs)**:  
  > - For this demo, there are **no passwords** and the cookie stores a
  >   plaintext user ID.  
  > - In production you would:
  >   - require credentials (e.g. email + password)
  >   - store only a random, opaque session ID in the cookie
  >   - sign/encrypt the cookie and set appropriate flags (`secure`, `sameSite`)
  >   - associate it with server-side session state and expiry.

- **Frontend** (`app/login/page.tsx`)
  - Simple client-side form that POSTs to `/api/auth/login`.
  - Shows login status and the returned user (via client state).
  - Provides a button to call `/api/admin` and display its JSON response,
    demonstrating how the cookie-based session is used for protected routes.

### Session handling (`lib/auth.ts`)

- `setLoginSession(userId)`:
  - Uses the `cookies()` API to set an httpOnly cookie with the user ID.
- `clearLoginSession()`:
  - Deletes the cookie.
- `getAuthenticatedUser()`:
  - Reads the cookie.
  - Looks up the user via `getUserById` (Prisma).
  - Returns `User | null`.

---

## Authorization (RBAC)

Role-based access control is implemented in `lib/rbac.ts`:

- `hasRole(user, requiredRole)` — returns a boolean (uses the Prisma `User` model)
- `assertRole(user, requiredRole)` — throws if the user does not have the role

For this project, we care about a single rule:

- Only users with `role: ADMIN` may access the `/api/admin` route.

---

## Protected admin API route

The protected endpoint lives at:

- **Route**: `GET /api/admin`
- **File**: `app/api/admin/route.ts`

Behavior:

1. **Authenticate**
   - Calls `getAuthenticatedUser()` (reads the cookie and queries PostgreSQL).
   - If it returns `null`, responds with:
     - `401 Unauthenticated`
     - JSON body explaining that login is required.

2. **Authorize (RBAC)**
   - Calls `assertRole(user, "ADMIN")`.
   - If this throws, responds with:
     - `403 Forbidden`
     - JSON body explaining that the user must be an admin.

3. **Business logic**
   - Returns `200 OK` with an example JSON payload:
     - `message`: simple description
     - `currentUser`: the authenticated admin (id, name, email, role)
     - `exampleAdminData`: placeholder for real admin-only data

Because the business logic sits after both authentication and authorization,
it can assume that:

- there is a valid `user` object
- that user has the `"admin"` role

This keeps handler code simple and reduces defensive checks.

---

## Running the project

Install dependencies (already done if you used `create-next-app`):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Configure PostgreSQL / Prisma

1. Create a PostgreSQL database (Neon or any Postgres provider).
2. Set the `DATABASE_URL` in a local `.env` file at the project root:

```bash
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
```

3. Run Prisma migrations and generate the client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Testing the auth flow and protected API route

With the dev server running:

### 1. Sign up a user

Option A — via UI:

- Go to `http://localhost:3000/signup`.
- Fill in `name` (required) and `email` (optional).
- Submit the form.
- The first user created will have role `ADMIN`; subsequent users will be `USER`.

Option B — via API:

```bash
curl -i http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Admin","email":"alice@example.com"}'
```

### 2. Log in

Option A — via UI:

- Go to `http://localhost:3000/login`.
- Provide `email` (recommended) or `name`.
- Submit the form.
- On success, an httpOnly cookie is set and you will see your user in the UI.

Option B — via API:

```bash
curl -i http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'
```

To test cookie-based behavior via `curl`, you can use `-c` / `-b` for
cookie storage:

```bash
curl -c cookies.txt -i http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'

curl -b cookies.txt -i http://localhost:3000/api/admin
```

---

## Design decisions

- **App Router**  
  Uses the Next.js App Router (`app/` directory) to stay aligned with current
  best practices and keep routing/server components modern.

- **Prisma + PostgreSQL (Neon-ready)**  
  Prisma provides:
  - a type-safe client
  - a single source of truth for the schema (`schema.prisma`)
  - straightforward migrations

  PostgreSQL (e.g. Neon) is a solid general-purpose relational database that
  fits well with schema-driven development and RBAC.

- **Simplified, cookie-based auth (no external providers)**  
  Instead of NextAuth/Clerk/Auth0, this project implements:
  - explicit signup and login endpoints
  - a tiny authentication layer around cookies and Prisma

  This keeps the example small and makes it clear how auth and RBAC interact
  without hiding logic behind a library.

- **Separated concerns (`lib/` vs `app/`)**  
  - `lib/db.ts` — database connectivity and client lifecycle
  - `lib/user.ts` — user data access
  - `lib/auth.ts` — auth/session helpers
  - `lib/rbac.ts` — authorization logic
  - `app/api/*` — thin HTTP adapters that orchestrate these helpers

- **Minimal but illustrative UI**  
  The `/signup` and `/login` pages are intentionally simple. They:
  - demonstrate how the APIs are intended to be used
  - surface the key JSON responses
  - let you exercise the end-to-end flow without focusing on styling.


