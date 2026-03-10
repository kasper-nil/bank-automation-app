# Agent Guidelines

## Architecture Overview

This is a **Next.js App Router** application (TypeScript) with a **Neon serverless Postgres database** (via Drizzle ORM) and serves as a stateless frontend proxy to the SpareBank1 bank API. **Google OAuth via Better Auth** is the primary authentication method for app access.

**Package manager:** pnpm

### Key commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `pnpm dev`          | Start development server |
| `pnpm build`        | Production build         |
| `pnpm lint`         | Run ESLint               |
| `pnpm format`       | Prettier write           |
| `pnpm format:check` | Prettier check           |

There is no `test` script.

## Git / Version Control

**Never commit changes automatically.** Always prompt the user before creating any git commit, and wait for explicit confirmation before proceeding. Only commit when explicitly requested by the user.

### Directory structure

```
app/
  globals.css               # Tailwind v4 config + all CSS design tokens (no tailwind.config.ts)
  layout.tsx                # Root layout — JetBrains Mono font, ThemeProvider, Toaster
  page.tsx                  # Landing page — Sign in with Google button
  api/
    auth/
      [...all]/route.ts     # Better Auth catch-all handler
      sparebank/
        route.ts            # SpareBank OAuth callback → sets HttpOnly cookie
        token/route.ts      # Returns valid SpareBank access_token, auto-refreshes if expired
        refresh/route.ts    # Low-level SpareBank token refresh proxy
  dashboard/
    layout.tsx              # Dashboard shell with collapsible sidebar
    page.tsx                # Main dashboard
    _components/            # Route-private components (colocated, excluded from router)

components/
  ui/                       # shadcn CLI-generated — never hand-edit
  *.tsx                     # App-level shared components

hooks/                      # Custom React hooks

lib/
  utils.ts                  # cn() utility — shadcn-generated, never edit
  auth.ts                   # Better Auth server instance (Drizzle + Google OAuth)
  auth-client.ts            # Better Auth browser client (Client Components)
  api/sparebank/            # SpareBank1 bank data access API layer

db/
  index.ts                  # Neon serverless Postgres connection via Drizzle
  auth-schema.ts            # Better Auth Drizzle schema (user, session, account, verification)
  schema.ts                 # App-level Drizzle schema (future use)

middleware.ts              # Route protection — checks Better Auth session
```

### Database

Session persistence and user account management is handled by **Neon serverless Postgres** with **Drizzle ORM**.

**Connection:**

```ts
// db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./auth-schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });
```

**Schema:**

The `db/auth-schema.ts` file defines four tables for Better Auth:

- `user` — User account data (id, name, email, emailVerified, image, createdAt, updatedAt)
- `session` — Active sessions (id, token, expiresAt, userId, ipAddress, userAgent, createdAt, updatedAt)
- `account` — OAuth provider credentials (id, userId, providerId, accessToken, refreshToken, idToken, expiresAt timestamps, scope, password)
- `verification` — Email verification codes (id, identifier, value, expiresAt)

The `db/schema.ts` file is reserved for app-level schema (currently a stub; will be used for future domain models like transactions, accounts, etc.).

### Server vs. Client Component conventions

- Files are Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs).
- Route-private components live in `_components/` inside the route directory (Next.js convention).
- **Named exports everywhere** — only Next.js pages and layouts use default exports (required by the framework).
- No global state management library — state is local (`useState`/`useEffect`) with cross-session persistence via the database (Better Auth sessions) and `localStorage` for transient data.

### Import aliases (from `tsconfig.json`)

```ts
@/components  →  components/
@/lib         →  lib/
@/hooks       →  hooks/
@/db          →  db/
```

---

## shadcn Setup

This project uses **shadcn v4** with the `new-york` style variant, built on **Next.js App Router** with React Server Components (RSC) enabled. The package manager is **pnpm** and the project is written in **TypeScript**.

## Configuration Files

- **`components.json`** — The shadcn source of truth. Defines the style, aliases, icon library, and the path to the CSS file. Do not modify this file manually.
- **`app/globals.css`** — Tailwind v4 configuration and all theming. There is no `tailwind.config.ts`; all design tokens and theme customization live here as CSS variables.

## Protected Files — Never Modify Manually

### `components/ui/`

All files in this directory are generated and owned by the shadcn CLI. **Never manually edit any file in `components/ui/`.** If a component needs to be updated, re-run the CLI and allow it to fully overwrite the file:

```bash
pnpm dlx shadcn@latest add <component>
```

If a component needs custom behavior or additional props, **wrap it** in a new component outside of `components/ui/` rather than editing the source file.

### `lib/utils.ts`

Contains the `cn()` utility function (combines `clsx` and `tailwind-merge`). This file is generated by shadcn and must not be modified or recreated manually.

## Adding Components

Always use the shadcn CLI. Never hand-write files into `components/ui/`:

```bash
pnpm dlx shadcn@latest add <component>
```

## Updating Components

Re-run the add command and allow it to overwrite:

```bash
pnpm dlx shadcn@latest add <component>
```

Since `components/ui/` files must never be manually modified, there is nothing to reconcile — the overwrite is always safe and correct.

## Do Not Use Radix UI Primitives Directly

This project uses `radix-ui` (the unified monolithic package) as a peer dependency of shadcn. **Never import from `radix-ui` directly in application code.** All UI primitives must be consumed through the shadcn components in `components/ui/`.

```ts
// Correct
import { Button } from "@/components/ui/button";

// Wrong
import { Root } from "radix-ui";
```

## Styling — Tailwind Tokens Only

All styling must use Tailwind utility classes that map to the design tokens defined in `app/globals.css` (e.g. `bg-primary`, `text-muted-foreground`, `border-border`).

**Never use:**

- Arbitrary color values (e.g. `bg-[#ff0000]`, `text-[oklch(0.5_0.2_180)]`)
- Hardcoded hex, rgb, hsl, or oklch values in class names or inline styles
- Custom CSS color properties outside of `app/globals.css`

```tsx
// Correct
<div className="bg-card text-card-foreground border-border">

// Wrong
<div style={{ backgroundColor: "#1a1a1a" }} className="text-[#fff]">
```

---

## Better Auth (Google OAuth)

**Better Auth v1.x** is the primary authentication method for app access. It uses **Google OAuth 2.0** and stores sessions in **Neon Postgres** via a Drizzle adapter.

### Relevant files

| File                             | Purpose                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `lib/auth.ts`                    | Better Auth server instance with Drizzle adapter and Google OAuth configuration       |
| `lib/auth-client.ts`             | Better Auth browser client for Client Components                                      |
| `app/api/auth/[...all]/route.ts` | Catch-all route handler — mounts all Better Auth endpoints (signup, signin, callback) |
| `db/auth-schema.ts`              | Drizzle schema for user, session, account, and verification tables                    |
| `middleware.ts`                  | Route protection — checks Better Auth session, redirects to `/` if unauthenticated    |

### Authentication flow

#### Step 1 — Landing page

The user lands on `app/page.tsx`, which displays a "Sign in with Google" button. Clicking it calls `authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })`.

#### Step 2 — Google OAuth consent

The browser navigates to Google's OAuth authorization endpoint. The user authenticates with their Google account and grants consent. Google redirects to `/api/auth/callback/google` with an authorization code.

#### Step 3 — Better Auth callback

`app/api/auth/[...all]/route.ts` receives the callback. Better Auth handles the exchange: it POSTs the authorization code to Google's token endpoint, receives an access token and ID token, and extracts the user identity from the ID token.

#### Step 4 — Session creation

Better Auth writes a new session to the database (`db/auth-schema.ts`):

- A `user` record (id, name, email, image) is created or updated
- A `session` record is created with a unique token and an expiry timestamp
- An `account` record links the Google provider credentials to the user

The session token is returned to the browser as an `HttpOnly` cookie (managed by Better Auth).

#### Step 5 — Redirect to dashboard

Better Auth redirects the browser to `/dashboard` (the `callbackURL` specified in Step 1).

### Route protection

`middleware.ts` protects all `/dashboard/*` routes:

```ts
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}
```

If no valid session is found, the user is redirected to `/`.

### Using the session in components

**Server Components / Route Handlers:**

```ts
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: request.headers });
// or
const session = await auth.api.getSession({ headers: await headers() });
```

**Client Components:**

Use the `authClient` to check session state and access user info:

```ts
import { authClient } from "@/lib/auth-client";

const { data: session } = await authClient.useSession();
// session.user.name, session.user.email, session.user.image
```

### Environment variables

| Variable               | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `BETTER_AUTH_SECRET`   | Signing secret for Better Auth tokens       |
| `BETTER_AUTH_URL`      | Better Auth base URL (e.g., production URL) |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                  |
| `NEXT_PUBLIC_APP_URL`  | Public app URL (used by auth-client)        |
| `DATABASE_URL`         | Neon Postgres connection string             |

---

## SpareBank1 Bank Data Access (OAuth)

**SpareBank1 OAuth 2.0** is a separate, independent OAuth flow used to access the Norwegian bank API. It is **distinct from app authentication** — the SpareBank token is stored in an `HttpOnly` cookie (`sparebank_token`) and used only by API routes that fetch bank data (accounts, transactions, etc.). A user must first authenticate via Better Auth before accessing SpareBank features.

### Relevant files

| File                                      | Purpose                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| `app/page.tsx`                            | Landing page — includes SpareBank authorize button (only visible to authenticated users)     |
| `lib/api/sparebank/authorize.ts`          | Builds the SpareBank authorize URL                                                           |
| `lib/api/sparebank/token.server.ts`       | `getSparebankToken()` — reads the SpareBank cookie via `next/headers` (server-side only)     |
| `lib/api/sparebank/token.client.ts`       | `fetchSparebankToken()` — fetches SpareBank access token from the API (client-side only)     |
| `lib/api/sparebank/proxy.ts`              | `getSparebankToken(request)` — reads the SpareBank cookie from `NextRequest` (API routes)    |
| `lib/api/sparebank/index.ts`              | Re-exports `getAuthorizeUrl` and `SparebankToken` type                                       |
| `app/api/auth/sparebank/route.ts`         | OAuth callback — exchanges code for token, sets `HttpOnly` cookie, redirects to `/dashboard` |
| `app/api/auth/sparebank/token/route.ts`   | Returns a valid SpareBank access token; refreshes automatically if expired                   |
| `app/api/auth/sparebank/refresh/route.ts` | Low-level SpareBank token refresh endpoint (proxies to SpareBank1)                           |

### Step 1 — Authorize (get a code)

An authenticated user clicks "Connect to SpareBank" (only visible after Better Auth login), which calls `getAuthorizeUrl()` from `@/lib/api/sparebank` and navigates the browser to:

```
https://api.sparebank1.no/oauth/authorize
  ?client_id=NEXT_PUBLIC_SPAREBANK_CLIENT_ID
  &state=NEXT_PUBLIC_SPAREBANK_STATE
  &redirect_uri=NEXT_PUBLIC_SPAREBANK_REDIRECT_URL
  &finInst=fid-smn
  &response_type=code
```

SpareBank1 authenticates the user via BankID and redirects back to the `redirect_uri` with `?code=CODE&state=STATE`. The code is valid for **2 minutes** and can only be used once.

### Step 2 — Exchange code for token

`app/api/auth/sparebank/route.ts` (GET) receives the OAuth callback. It POSTs to `https://api.sparebank1.no/oauth/token` with `client_id`, `client_secret`, `code`, `grant_type=authorization_code`, `state`, and `redirect_uri`. On success, the response contains:

- `access_token` — valid for **10 minutes**
- `refresh_token` — valid for **365 days**

The full response plus an `issued_at` timestamp (ms) is stored in an `HttpOnly` cookie (`sparebank_token`), then the user is `307` redirected to `/dashboard`.

### Step 3 — Use the token

The SpareBank token is accessed only by API routes that need to fetch bank data. Choose the right helper based on context:

**Server Components, Route Handlers, Server Actions:**

```ts
import { getSparebankToken } from "@/lib/api/sparebank/token.server";

const token = await getSparebankToken();
// use token.access_token as: Authorization: Bearer ${token.access_token}
```

**Client Components:**

```ts
import { fetchSparebankToken } from "@/lib/api/sparebank/token.client";

const accessToken = await fetchSparebankToken();
// use as: Authorization: Bearer ${accessToken}
```

`fetchSparebankToken()` calls `GET /api/auth/sparebank/token`, which reads the cookie server-side, refreshes the token if expired, and returns the `access_token` string. The `client-only` and `server-only` guards will throw a build-time error if either helper is imported in the wrong context.

### Step 4 — Refresh

`app/api/auth/sparebank/token/route.ts` (GET) handles refresh automatically: if the stored token is expired, it exchanges the `refresh_token` with SpareBank1, updates the `HttpOnly` cookie, and returns the new `access_token`. The client secret is kept server-side only.
