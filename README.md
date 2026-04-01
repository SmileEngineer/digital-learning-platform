# Digital learning platform

Monorepo layout:

- **Frontend:** React 18 + [Next.js](https://nextjs.org/) (`apps/web`) — App Router, UI in `src/views` (this folder name avoids conflicting with Next’s legacy `src/pages` Pages Router).
- **Backend:** Node.js + [Express](https://expressjs.com/) (`apps/api`).
- **Database:** PostgreSQL on [Neon](https://neon.tech/) via `@neondatabase/serverless` and the `DATABASE_URL` connection string.

## Prerequisites

- Node.js 20+
- npm

## Setup

From the repository root:

```bash
npm install
```

Copy environment examples and fill in values:

- `apps/api/.env.example` → **`apps/api/.env`** or **repo root `.env`** — Neon `DATABASE_URL`, `JWT_SECRET` (required in production), optional `PORT`, `CORS_ORIGIN`. The API loads both paths so a single root `.env` works with the monorepo.
- `apps/web/.env.example` → `apps/web/.env.local` — **`API_URL`** (server-only, e.g. `http://localhost:4000`) so Next.js can proxy auth to Express; **`NEXT_PUBLIC_API_URL`** is optional for any direct client calls to the API

### Database (auth)

Apply migrations so the `users` table and seed data exist (requires `DATABASE_URL` in `apps/api/.env` or the repo root `.env`):

```bash
npm run db:migrate
```

### Test login (after migrate)

Seeded accounts use the same password for local testing:

| Email | Password |
|-------|----------|
| `demo@learnhub.local` | `demo12345` |
| `admin@learnhub.local` | `demo12345` |

Use these on `/login` with the web app and API running (`npm run dev` and `npm run dev:api`). Seeds are defined in `apps/api/db/migrations/002_seed.sql`.

### Auth behavior

- **Express:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me` — bcrypt passwords; JWT issued on register/login.
- **Next.js:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` proxy to Express and store the JWT in an **httpOnly, SameSite=Lax** cookie (`learnhub_session`). The browser never sees the token; use `credentials: 'include'` on auth fetches.
- **Dashboard:** `/dashboard` requires a valid session; unauthenticated users are sent to `/login?next=/dashboard`.

## Development

Start the Next.js app (default port 3000):

```bash
npm run dev
```

Start the API (default port 4000):

```bash
npm run dev:api
```

## Production

```bash
npm run build
npm run build:api
npm run start:web
npm run start:api
```

Health checks: `GET http://localhost:4000/health` and, when `DATABASE_URL` is set, `GET http://localhost:4000/db/health`.
