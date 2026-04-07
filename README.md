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

- `apps/api/.env.example` → `**apps/api/.env**` or **repo root `.env`** — Neon `DATABASE_URL`, `JWT_SECRET` (required in production), optional `PORT`, `CORS_ORIGIN`. The API loads both paths so a single root `.env` works with the monorepo.
- `apps/web/.env.example` → `apps/web/.env.local` — `**API_URL**` (server-only, e.g. `http://localhost:4000`) so Next.js can proxy auth to Express; `**NEXT_PUBLIC_API_URL**` is optional for any direct client calls to the API

### Database (auth)

Apply migrations so the `users` table and seed data exist (requires `DATABASE_URL` in `apps/api/.env` or the repo root `.env`):

```bash
npm run db:migrate
```

This applies all files in `apps/api/db/migrations/`, including password-reset tokens (`014_password_reset_tokens.sql`).

### Email, password reset, and payments (optional)

Configure these on the **API** (`apps/api/.env` or repo root `.env`):

- **`PUBLIC_SITE_URL`** — public site base URL used in password-reset links (e.g. `https://your-site.com`).
- **`RESEND_API_KEY`** + **`RESEND_FROM_EMAIL`** — when set, the API sends transactional mail via [Resend](https://resend.com/) (password reset, order confirmation, and the same copy as in-app notifications). If unset, emails are skipped (logged only).
- **`RAZORPAY_KEY_ID`** + **`RAZORPAY_KEY_SECRET`** — when both are set, `/checkout` can collect **INR** payments through Razorpay for catalog items priced in INR. Otherwise checkout stays on the **demo purchase** flow (immediate paid order for testing).

### Test login (after migrate)

Seeded accounts use the same password for local testing:


| Email                  | Password    |
| ---------------------- | ----------- |
| `demo@learnhub.local`  | `demo12345` |
| `admin@learnhub.local` | `demo12345` |


Use these on `/login` with the web app and API running (`npm run dev` and `npm run dev:api`). Seeds are defined in `apps/api/db/migrations/002_seed.sql`.

### Sample materials and checkout testing

Kantri Lawyer sample content is seeded by `apps/api/db/migrations/015_kantri_requirement_alignment.sql`.

Sample slugs you can use for manual testing:

| Type            | Slug                                 | Notes                    |
| --------------- | ------------------------------------ | ------------------------ |
| Course          | `law-of-contracts-i-ou-semester-1`   | Lifetime access with preview lecture |
| eBook           | `last-minute-exam-prep-guide-llb-first-semester-tg` | Watermarked reader/download |
| eBook           | `last-minute-exam-prep-guide-llb-first-semester-ap` | Watermarked reader/download |
| Physical book   | `last-minute-exam-prep-guide-llb-first-semester-tg-physical-book` | DTDC shipping flow |
| Live class      | `law-of-contracts-i-live-revision-class` | Google Meet gated join |
| Practice exam   | `law-of-contracts-i-practice-exam` | Limited attempts and hidden answers |
| Article         | `law-of-contracts-i-study-article` | Free read-only article |

Demo coupon for checkout testing:

| Coupon    | Who can use it          | Applies to                                 | Discount |
| --------- | ----------------------- | ------------------------------------------ | -------- |
| `DEMO25`  | `demo@learnhub.local`   | `course`, `ebook`, `live_class`, `practice_exam` | 25% off  |
| `WELCOME10` | Any seeded/local user | Most purchasable catalog items             | 10% off  |

Recommended manual test flow:

1. Sign in as `demo@learnhub.local`.
2. Open a course such as `/courses/cloud-devops-accelerator` and confirm only preview lectures are visible before purchase.
3. Click `Buy Now` to reach `/checkout?product=cloud-devops-accelerator`.
4. Apply `DEMO25` and complete the purchase.
5. Verify the course appears in `/dashboard/courses` and the full curriculum is unlocked.

### Auth behavior

- **Express:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me` — bcrypt passwords; JWT issued on register/login with a per-user active session id so a new login invalidates older sessions.
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

### Deploying the frontend (e.g. Netlify)

The Next.js app (`apps/web`) and the Express API (`apps/api`) are separate processes. **Netlify only runs the frontend** unless you add custom serverless work—so you must **deploy the API elsewhere** (Railway, Render, Fly.io, a VPS, etc.) and point the web app at it.

**Example (Render API + Netlify site):**


| Where                    | Variable       | Example value                                                                     |
| ------------------------ | -------------- | --------------------------------------------------------------------------------- |
| **Netlify**              | `API_URL`      | `https://digital-learning-platform-6931.onrender.com`                             |
| **Render** (API service) | `DATABASE_URL` | Your Neon connection string                                                       |
| **Render**               | `JWT_SECRET`   | Long random string (required in production; e.g. `openssl rand -base64 32`)       |
| **Render**               | `CORS_ORIGIN`  | `https://digital-learnhub.netlify.app` (comma-separated if you have more origins) |

#### CORS on Render (no separate “CORS” screen)

Render does **not** expose a CORS switch in the dashboard. This app enables CORS in Express using the **`CORS_ORIGIN`** environment variable.

1. In [Render Dashboard](https://dashboard.render.com) open your **Web Service** (the Express API).
2. Go to **Environment** (or **Environment → Environment Variables**).
3. **Add** (or edit) **`CORS_ORIGIN`** = your Netlify site origin exactly, e.g. `https://digital-learnhub.netlify.app` (scheme + host, no path; no trailing slash).
4. For multiple sites or previews, use commas: `https://digital-learnhub.netlify.app,https://deploy-preview-123--yoursite.netlify.app`.
5. **Save** and **Manual Deploy → Clear build cache & deploy** is usually not needed for env-only changes—Render restarts the service when you save env vars.

**Note:** Login from Netlify calls your API **from the Next.js server** (server-side `fetch`), not from the browser. So a broken login is usually **`API_URL` wrong or missing on Netlify**, the API down, or TLS/timeout—not CORS. CORS matters when the **browser** calls the API directly (e.g. future `fetch` to Render from `https://…netlify.app`).

1. Run `**npm run db:migrate`** locally (or from CI) with `DATABASE_URL` pointing at the **same** Neon DB your Render API uses, so the `users` table exists in production.
2. In **Netlify → Site configuration → Environment variables**, set `**API_URL`** to your Render API base URL (no trailing slash). **Redeploy** the site after saving—`API_URL` is read at runtime by the Next.js server, not baked into the client bundle.
3. Do **not** leave `API_URL` as `http://localhost:4000` on Netlify; login will fail.

**Checks:** Open `GET https://<your-api>/health` — you should see `authReady: true` when `DATABASE_URL` and (in production) `JWT_SECRET` are set. If `authReady` is false, fix Render env vars and redeploy the API.

**Render free tier:** The service may sleep; the first request after idle can take 30–60 seconds. Retry login, or hit `/health` once to wake the API. The web app waits up to 25 seconds for the upstream API before showing a timeout message.

If login still fails, test the API directly: `POST https://<your-api>/auth/login` with JSON `{ "email": "...", "password": "..." }` and `Content-Type: application/json`.
