# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (monorepo)
```bash
npm run dev:frontend      # Start frontend dev server
npm run dev:backend       # Start backend dev server with hot reload
```

### Backend (`apps/backend/`)
```bash
npm run dev               # ts-node-dev with hot reload
npm run build             # tsc compile to dist/
npm run start             # Run compiled dist/index.js

npx prisma migrate dev    # Run DB migrations
npx prisma studio         # Open Prisma GUI
npx prisma generate       # Regenerate Prisma client after schema changes
```

### Frontend (`apps/frontend/`)
```bash
npm run dev               # Vite dev server
npm run build             # tsc + vite build
npm run lint              # ESLint
npm run preview           # Preview production build
```

### Infrastructure
```bash
docker compose up -d      # Start PostgreSQL on port 5433
docker compose down       # Stop containers
```

## Architecture

**Monorepo** with two apps under `apps/`:
- `apps/backend/` — Express 5 + TypeScript + Prisma + PostgreSQL
- `apps/frontend/` — React 19 + Vite + TypeScript

### Backend

Entry point: [apps/backend/src/index.ts](apps/backend/src/index.ts)
- Runs on `PORT` (default 3000)
- Global middleware: CORS, `express.json()`
- `GET /health` health check
- `POST /auth/register` and `POST /auth/login` mounted at `/auth`

Auth routes: [apps/backend/src/routes/auth.ts](apps/backend/src/routes/auth.ts)
- Passwords hashed with bcryptjs
- JWTs signed with `JWT_SECRET` env var, 7-day expiry

Prisma client singleton: [apps/backend/src/lib/prisma.ts](apps/backend/src/lib/prisma.ts)

Schema: [apps/backend/prisma/schema.prisma](apps/backend/prisma/schema.prisma)
- `User` — id (UUID), email (unique), password, createdAt, snippets[]
- `Snippet` — id (UUID), title, content, language, tags (array), isPublic, shareToken (unique, optional), timestamps, userId

### Frontend

Currently a Vite + React template. No routing library or state management is installed yet. Entry point is [apps/frontend/src/main.tsx](apps/frontend/src/main.tsx).

## Environment Variables

Backend requires an `apps/backend/.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/snippet_manager
JWT_SECRET=<your-secret>
```

The Docker Compose database uses user `postgres`, password `postgres`, database `snippet_manager`, exposed on host port `5433`.
