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

- `apps/api/.env.example` → `apps/api/.env` (Neon `DATABASE_URL`, optional `PORT`, `CORS_ORIGIN`)
- `apps/web/.env.example` → `apps/web/.env.local` (`NEXT_PUBLIC_API_URL` pointing at the API, e.g. `http://localhost:4000`)

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
